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

const buttonCooldown = new Set();

/**
 * Handle the clients interactionCreate event.
 * @param {CommandInteraction} interaction The interaction that triggered the event.
 */
module.exports.run = async (interaction) => {
  try {
    if (!interaction.isButton()) return;

    const guildQuery = await Guild.findOne({ guildID: interaction.guild.id });
    const supportRole = interaction.guild.roles.cache.get(guildQuery.ticketrole);

    if (interaction.customId === "config-ticket") {

      if(buttonCooldown.has(interaction.user.id)) return interaction.reply({ content: "You are on cooldown.", ephemeral: true });
      buttonCooldown.add(interaction.user.id)
      setTimeout(() => buttonCooldown.delete(interaction.user.id), 30_000)

    //  if (!interaction.member.roles.cache.has(supportRole)) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true, })

      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setStyle("SECONDARY")
          .setEmoji("⏸️")
          .setLabel("Mute")
          .setCustomId("mute-ticket"),

        new MessageButton()
          .setStyle("SECONDARY")
          .setEmoji("⏩")
          .setLabel("Resume")
          .setCustomId("resume-ticket"),

        new MessageButton()
          .setStyle("DANGER")
          .setEmoji("🛠️")
          .setLabel("Moderate")
          .setCustomId("moderate-ticket"),

          new MessageButton()
          .setStyle("SECONDARY")
          .setEmoji("🗑️")
          .setCustomId("delete-button"),
      );

      const embed = new MessageEmbed()
        .setTitle(`${emojis.settings} Ticket Settings`)
        .setDescription(
          `Configurate your ticket here, remember only Ticket Staff members can do this.`
        )
        .setColor("RANDOM")
        .setFooter({
          text: `${interaction.guild.name}`,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        });

      await interaction.reply({
        embeds: [embed],
        components: [row],
      });
    }

    if (interaction.customId === "claim-ticket" && interaction.channel.name.includes("ticket")) {

      if(buttonCooldown.has(interaction.user.id)) return interaction.reply({ content: "You are on cooldown.", ephemeral: true });
      buttonCooldown.add(interaction.user.id)
      setTimeout(() => buttonCooldown.delete(interaction.user.id), 360_000)

      const binButton = new MessageActionRow().addComponents(
        new MessageButton()
            .setStyle("SECONDARY")
            .setEmoji("🗑️")
            .setCustomId("delete-button"),
    );

      const channel = interaction.channel;
      const userThatClaimed = interaction.user;
      const member = await interaction.guild.members.fetch(channel.topic); // fetch the member ID from the channel topic
      const supportRole = await interaction.guild.roles.fetch(guildQuery.ticketrole);

      const embed = new MessageEmbed()
        .setTitle("Claimed ticket!")
        .setDescription(`Ticket claimed from <@!${interaction.user.id}>!`)
        .setColor("RED")
        .setFooter({
          text: `${interaction.guild.name}`,
          iconURL: `${interaction.client.user.displayAvatarURL()}`,
        });

      //  if (!interaction.member.roles.cache.has(supportRole)) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true,});

      // check if interaction.user has admin permissions
      if (!interaction.member.permissions.has("MANAGE_CHANNELS")) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true, });

      // disable the claim-button once its clicked
      let row = interaction.message.components[0];
      row.components.map((component) => component.setDisabled(false));
      interaction.update({ components: [row] });

      // Supporters cant type anymore
      interaction.message.channel.permissionOverwrites.edit(supportRole, {
        SEND_MESSAGES: false,
      });

      // The user that claimed the ticket is allowed to send messages
      interaction.message.channel.permissionOverwrites.edit(userThatClaimed, {
        SEND_MESSAGES: true,
      });

      await channel.send({
        content: `<@${member.id}> your ticket got claimed!`,
        components: [binButton],
        embeds: [embed],
      });
    }
  } catch (err) {
    console.error(err);
  }
};
