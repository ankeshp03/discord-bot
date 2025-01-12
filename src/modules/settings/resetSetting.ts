import { defaultServer } from "../../config/database/defaultServer";
import { ServerModelInt } from "../../database/models/ServerModel";
import { BeccaInt } from "../../interfaces/BeccaInt";
import { SettingsTypes } from "../../interfaces/settings/SettingsTypes";
import { beccaErrorHandler } from "../../utils/beccaErrorHandler";

/**
 * This will reset the given setting to the default value.
 *
 * @param {BeccaInt} Becca Becca's Discord instance.
 * @param {string} serverID Discord ID of the server to modify settings for.
 * @param {string} serverName Name of that server.
 * @param {SettingsTypes} key The name of the setting to modify.
 * @param {ServerModelInt} server The server configuration entry from the database.
 * @returns {ServerModelInt | null} The server setting object, or null on error.
 */
export const resetSetting = async (
  Becca: BeccaInt,
  serverID: string,
  serverName: string,
  key: SettingsTypes,
  server: ServerModelInt
): Promise<ServerModelInt | null> => {
  try {
    server.set(key, defaultServer[key]);
    server.markModified(key);
    await server.save();
    return server;
  } catch (err) {
    beccaErrorHandler(Becca, "reset setting module", err, serverName);
    return null;
  }
};
