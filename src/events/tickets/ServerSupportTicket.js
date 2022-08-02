"use strict";

const {
  CommandInteraction,
  Permissions,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");

// configs
const emojis = require("../../../Controller/emojis/emojis");
const config = require("../../../Controller/config");

const Guild = require("../../models/TicketPanel");

module.exports.data = {
  name: "interactionCreate",
  once: false,
};

/**
 * Handle the clients interactionCreate event.
 * @param {CommandInteraction} interaction The interaction that triggered the event.
 */
module.exports.run = async (interaction) => {
  try {
    if (!interaction.isButton()) return;

    const guildQuery = await Guild.findOne({ guildID: interaction.guild.id });

    const category = interaction.guild.channels.cache.get(guildQuery.category);
    const transcriptChannel = interaction.guild.channels.cache.get(guildQuery.transcripts);
    const supportRole = interaction.guild.roles.cache.get(guildQuery.ticketrole);

    if (interaction.customId === "server-support") {
      let ticketName = `ticket-${interaction.user.username}`.toLowerCase();
      // let supportRoles = await config.supportRole.map((x) => {
      //   return {
      //     id: x,
      //     allow: [
      //       "VIEW_CHANNEL",
      //       "SEND_MESSAGES",
      //       "ATTACH_FILES",
      //       "EMBED_LINKS",
      //       "MANAGE_MESSAGES",
      //     ],
      //   };
      // });

      await interaction.reply({
        content: `Creating ticket ...`,
        ephemeral: true,
      });

      if (
        interaction.guild.channels.cache.find(
          (c) => c.topic == interaction.user.id && c.name.includes("ticket")
        )
      )
        return interaction.editReply({
          content: `:x: | You already have an active ticket.`,
          ephemeral: true,
        });

      const createdChannel = await interaction.guild.channels.create(
        ticketName,
        {
          type: "text",
          topic: `${interaction.user.id}`,
          parent: category,
          permissionOverwrites: [
            {
              allow: [
                "VIEW_CHANNEL",
                "SEND_MESSAGES",
                "ATTACH_FILES",
                "EMBED_LINKS",
              ],
              id: interaction.user.id,
            },
            {
              deny: "VIEW_CHANNEL",
              id: interaction.guild.id,
            },
            //  ...supportRoles,
          ],
        }
      );

      await interaction.editReply({
        content: `Ticket opened: ${createdChannel}!`,
        ephemeral: true,
      });

      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setStyle("PRIMARY")
          .setEmoji("✋")
          .setLabel("Claim")
          .setCustomId("claim-ticket"),

        new MessageButton()
          .setStyle("SECONDARY")
          .setEmoji("📥")
          .setLabel("Fetch Information")
          .setCustomId("info-ticket"),

        new MessageButton()
          .setStyle("SECONDARY")
          .setEmoji("⚙️")
          .setLabel("Settings")
          .setCustomId("config-ticket")
      );

      const embed = new MessageEmbed()
        .setTitle(`${emojis.notify} New Ticket`)
        .setDescription(
          `Hello <@!${interaction.user.id}>\nHere is your ticket about **Server Support** ...`
        )
        .setColor("RANDOM")
        .setFooter({
          text: `Guild: ${interaction.guild.name}`,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        });

      const msg = await createdChannel.send({
        content: `${supportRole}. ${emojis.notify}`,
        embeds: [embed],
        components: [row],
      });
      msg.pin();
    }
  } catch (err) {
    console.error(err);
  }
};
