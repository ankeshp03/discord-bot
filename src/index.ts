import * as Sentry from "@sentry/node";
import { RewriteFrames } from "@sentry/integrations";
import { beccaLogHandler } from "./utils/beccaLogHandler";
import Spinnies from "spinnies";
import { Client, WebhookClient } from "discord.js";
import { BeccaInt } from "./interfaces/BeccaInt";
import { validateEnv } from "./modules/validateEnv";
import { connectDatabase } from "./database/connectDatabase";
import { beccaErrorHandler } from "./utils/beccaErrorHandler";
import { handleEvents } from "./events/handleEvents";
import { loadCommands } from "./commands/loadCommands";
import { createServer } from "./server/serve";
import { IntentOptions } from "./config/IntentOptions";
import { loadSlash } from "./slash/loadSlash";
import { registerSlash } from "./slash/registerSlash";

/**
 * This block initialises the Sentry plugin.
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  integrations: [
    new RewriteFrames({
      root: global.__dirname,
    }),
  ],
});

/**
 * Initialise spinner for logging
 * @property add(name, {color, text}) Add a new spinner
 * @property update(name, {color, text}) Update an existing spinner
 * @property fail(name, {text}) Set a spinner to fail state
 * @property succeed(name, {text}) Set a spinner to success state
 */
const spinnies = new Spinnies();

/**
 * Function to initialise the bot application.
 */
const initialiseBecca = async () => {
  beccaLogHandler.log("debug", "Starting process...");

  const Becca = new Client({
    shards: "auto",
    intents: IntentOptions,
  }) as BeccaInt;

  spinnies.add("validate-env", {
    color: "magenta",
    text: "Validating Environment Variables",
  });
  const validatedEnvironment = validateEnv(Becca);
  if (!validatedEnvironment.valid) {
    spinnies.fail("validate-env", {
      text: validatedEnvironment.message,
    });
    return;
  }
  spinnies.succeed("validate-env", {
    text: validatedEnvironment.message,
  });

  Becca.debugHook = new WebhookClient({ url: Becca.configs.whUrl });

  spinnies.add("server", { color: "magenta", text: "Initialising server" });
  const server = await createServer(Becca);
  if (!server) {
    spinnies.fail("server", { text: "Failed to boot the server." });
    return;
  }
  spinnies.succeed("server", { text: "Server initialised." });

  spinnies.add("load-commands", {
    color: "magenta",
    text: "Importing Commands",
  });
  const commands = await loadCommands(Becca);
  Becca.commands = commands;
  if (!commands.length) {
    spinnies.fail("load-commands", { text: "Error loading commands." });
    return;
  }
  spinnies.succeed("load-commands", {
    text: `${Becca.commands.length} commands loaded!`,
  });

  spinnies.add("load-slash", {
    color: "magenta",
    text: "Importing slash commands",
  });

  const slash = await loadSlash(Becca);
  Becca.slash = slash;
  if (!slash.length) {
    spinnies.fail("load-slash", { text: "Error loading slash commands." });
    return;
  }

  spinnies.update("load-slash", { text: "Registering slash commands" });

  const registered = await registerSlash(Becca);

  if (!registered) {
    spinnies.fail("load-slash", { text: "Failed to register slash commands" });
    return;
  }

  spinnies.succeed("load-slash", { text: "Slash commands registered!" });

  spinnies.add("connect-db", {
    color: "magenta",
    text: "Loading Database",
  });
  const databaseConnection = await connectDatabase(Becca);
  if (!databaseConnection) {
    spinnies.fail("connect-db", {
      text: "The database connection has failed.",
    });
    return;
  }
  spinnies.succeed("connect-db", {
    text: "Database loaded!",
  });

  spinnies.add("events", {
    color: "magenta",
    text: "Attaching event listeners",
  });
  await handleEvents(Becca);
  spinnies.succeed("events", {
    text: "Event listeners loaded!",
  });

  spinnies.add("discord", {
    color: "magenta",
    text: "Connecting to Discord",
  });
  await Becca.login(Becca.configs.token);
  spinnies.update("discord", {
    text: "Setting activity",
  });
  await Becca.user?.setActivity("for people who need my help~!", {
    type: "WATCHING",
  });
  spinnies.succeed("discord", {
    text: "Discord ready!",
  });

  /**
   * Fallthrough error handlers. These fire in rare cases where something throws
   * in a way that our standard catch block cannot see it.
   */
  process.on("unhandledRejection", async (error: Error) => {
    await beccaErrorHandler(Becca, "Unhandled Rejection Error", error);
  });

  process.on("uncaughtException", async (error) => {
    await beccaErrorHandler(Becca, "Uncaught Exception Error", error);
  });
};

initialiseBecca();
