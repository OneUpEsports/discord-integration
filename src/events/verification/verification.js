"use strict";

const {
  CommandInteraction,
  MessageEmbed,
} = require("discord.js");

// configs
const emojis = require("../../../Controller/emojis/emojis");
const config = require("../../../Controller/config");
const buttonCooldown = new Set();

const Guild = require("../../models/Verification");

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
    const role = guildQuery.verificationrole;

    if (interaction.customId === "verification-button") {
      // cooldown
      if (buttonCooldown.has(interaction.user.id)) return interaction.reply({ content: "You are on cooldown", ephemeral: true });
      buttonCooldown.add(interaction.user.id);
      setTimeout(() => buttonCooldown.delete(interaction.user.id), 90_000);

      // check if the user has the role
      if (interaction.member.roles.cache.has(role)) {
        return interaction.reply({ content: "You are already verified!", ephemeral: true });
      }
      // add the role
      await interaction.member.roles.add(role);
      interaction.reply({ content: `${emojis.success} | Successfully verified for **${interaction.guild.name}**`, ephemeral: true });
    }
  } catch (err) {
    console.error(err);
  }
};
