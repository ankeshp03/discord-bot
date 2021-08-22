import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { CommandInt } from "../interfaces/commands/CommandInt";
import { errorEmbedGenerator } from "../modules/commands/errorEmbedGenerator";
import { handleFact } from "../modules/commands/subcommands/games/handleFact";
import { handleJoke } from "../modules/commands/subcommands/games/handleJoke";
import { handleMtg } from "../modules/commands/subcommands/games/handleMtg";
import { handleSus } from "../modules/commands/subcommands/games/handleSus";
import { handleTrivia } from "../modules/commands/subcommands/games/handleTrivia";
import { beccaErrorHandler } from "../utils/beccaErrorHandler";

export const games: CommandInt = {
  data: new SlashCommandBuilder()
    .setName("games")
    .setDescription("Fun and silly commands!")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("fact")
        .setDescription("Provides a random fun fact.")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("joke")
        .setDescription("Tells a random joke.")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("mtg")
        .setDescription(
          "Searches for information on a Magic: The Gathering card."
        )
        .addStringOption((option) =>
          option
            .setName("card")
            .setDescription("The name of the card you want to search for")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("sus")
        .setDescription("Identifies the next impostor")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("trivia")
        .setDescription("Plays a quick trivia game with you!")
    ),
  run: async (Becca, interaction, config) => {
    try {
      await interaction.deferReply();

      const subCommand = interaction.options.getSubcommand();
      switch (subCommand) {
        case "fact":
          await handleFact(Becca, interaction, config);
          break;
        case "joke":
          await handleJoke(Becca, interaction, config);
          break;
        case "mtg":
          await handleMtg(Becca, interaction, config);
          break;
        case "sus":
          await handleSus(Becca, interaction, config);
          break;
        case "trivia":
          await handleTrivia(Becca, interaction, config);
          break;
        default:
          await interaction.editReply({
            content: Becca.responses.invalid_command,
          });
          break;
      }
    } catch (err) {
      const errorId = await beccaErrorHandler(
        Becca,
        "games group command",
        err,
        interaction.guild?.name
      );
      await interaction
        .reply({
          embeds: [errorEmbedGenerator(Becca, "games group", errorId)],
          ephemeral: true,
        })
        .catch(async () =>
          interaction.editReply({
            embeds: [errorEmbedGenerator(Becca, "games group", errorId)],
          })
        );
    }
  },
};