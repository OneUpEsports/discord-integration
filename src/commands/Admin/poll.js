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
    .setName("poll")
    .setDescription("Create a poll")
    .addStringOption((option) => option.setName("msg").setDescription("The message for the poll").setRequired(true))
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

        const embed = new MessageEmbed()
            .setTitle(`${emojis.notify} New Poll`)
            .setDescription(`${msg}?\n\nClick ${emojis.success} to upvote.\nClick ${emojis.error} to downvote.`)
            .setTimestamp()
            .setFooter({
                text: `From: ${interaction.guild.name}`,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
            })
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setColor("#36393F");

        try {
            const message = await channel.send({ embeds: [embed] });
            await message.react(`${emojis.success}`);
            await message.react(`${emojis.error}`);

        } catch (error) {
            interaction.reply({ content: "Failed to send poll, maybe I don't have permissions?", ephemeral: true });
            console.log(error);
            return;
        }
        await interaction.reply({ content: `Done sending poll to ${channel}`, ephemeral: true });
    }
    catch (err) {
        return Promise.reject(err);
    }
};

module.exports.permissions = {
    clientPermissions: [Permissions.FLAGS.SEND_MESSAGES],
    userPermissions: [Permissions.FLAGS.MANAGE_MESSAGES]
};



