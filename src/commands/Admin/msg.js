"use strict";
const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandInteraction, Permissions, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

// configs
const emojis = require("../../../Controller/emojis/emojis");

module.exports.cooldown = {
    length: 10000, /* in ms */
    users: new Set()
};

module.exports.ownerOnly = {
    ownerOnly: true
}

module.exports.data = new SlashCommandBuilder()
    .setName("msg")
    .setDescription("Sends a message to a channel")
    .addStringOption((option) => option.setName("msg").setDescription("The message to send").setRequired(true))
    .addChannelOption((option) => option.setName("channel").setDescription("The channel to send the message to").setRequired(false))

/**
 * Runs args command.
 * @param {CommandInteraction} interaction The Command Interaciton
 * @param {any} utils Additional util
 */
module.exports.run = async (interaction, utils) => {
    try {
        const msg = interaction.options.getString("msg");
        const channel = interaction.options.getChannel("channel") || interaction.channel;
        
        try {
            channel.send({ content: msg });
        } catch(error) {
            interaction.reply({ content: "Failed to send message, maybe I don't have permissions?", ephemeral: true });
            console.log(error);
            return;
        }
        interaction.reply({ content: `Done sending content to ${channel}`, ephemeral: true });
    }
    catch (err) {
        return Promise.reject(err);
    }
};

module.exports.permissions = {
    clientPermissions: [Permissions.FLAGS.SEND_MESSAGES],
    userPermissions: [Permissions.FLAGS.MANAGE_MESSAGES]
};



