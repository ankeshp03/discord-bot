import { MessageEmbed } from "discord.js";
import { artList } from "../../../config/commands/artList";
import { SlashHandlerType } from "../../../interfaces/slash/SlashHandlerType";
import { beccaErrorHandler } from "../../../utils/beccaErrorHandler";
import { errorEmbedGenerator } from "../../commands/errorEmbedGenerator";

export const handleArt: SlashHandlerType = async (Becca, interaction) => {
  try {
    const random = Math.floor(Math.random() * artList.length);
    const { fileName, artName, artist, artistUrl } = artList[random];

    const artEmbed = new MessageEmbed();
    artEmbed.setTitle(artName);
    artEmbed.setColor(Becca.colours.default);
    artEmbed.setDescription(
      `This portrait of me was done by [${artist}](${artistUrl})`
    );
    artEmbed.setImage(
      `https://www.beccalyria.com/assets/art/${fileName.replace(/\s/g, "%20")}`
    );
    artEmbed.setFooter("Would you like to paint my portrait too?");

    await interaction.editReply({ embeds: [artEmbed] });
  } catch (err) {
    const errorId = await beccaErrorHandler(
      Becca,
      "about command",
      err,
      interaction.guild?.name
    );
    await interaction
      .reply({
        embeds: [errorEmbedGenerator(Becca, "about", errorId)],
        ephemeral: true,
      })
      .catch(async () =>
        interaction.editReply({
          embeds: [errorEmbedGenerator(Becca, "about", errorId)],
        })
      );
  }
};