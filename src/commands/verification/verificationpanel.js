"use strict";
const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandInteraction, Permissions, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

// configs
const emojis = require("../../../Controller/emojis/emojis");

// database
const Guild = require("../../models/Verification");

module.exports.cooldown = {
    length: 10000, /* in ms */
    users: new Set()
};

module.exports.ownerOnly = {
    ownerOnly: true
}

module.exports.data = new SlashCommandBuilder()
    .setName("verificationpanel")
    .setDescription("Sends the verification panel")
    .addRoleOption((option) => option.setName("role").setDescription("The role the users should receive").setRequired(true))
    .addChannelOption((option) => option.setName("channel").setDescription("The channel for the panel").setRequired(false))

/**
 * Runs args command.
 * @param {CommandInteraction} interaction The Command Interaciton
 * @param {any} utils Additional util
 */
module.exports.run = async (interaction, utils) => {
    try {
        const role = interaction.options.getRole("role");
        const channel = interaction.options.getChannel("channel") || interaction.channel;

        const embed = new MessageEmbed()
            .setDescription(`Welcome to **${interaction.guild.name}**!\n\nPlease click on the Button below to verify yourself for the server!`)
            .setColor("GREEN")
            .setFooter({ text: `OneUpGaming`, iconURL: interaction.guild.iconURL({ dynamic: true }) });

        const row = new MessageActionRow().setComponents(
            new MessageButton()
                .setStyle("PRIMARY")
                .setLabel("Verify")
                .setEmoji(`${emojis.users}`)
                .setCustomId("verification-button")
        )

        const guildQuery = await Guild.findOne({ guildID: interaction.guild.id });
        if (!guildQuery) {
            const newGuild = new Guild({
                guildID: interaction.guild.id,
                verificationrole: role.id
            })
            newGuild.save();

            interaction.reply({ content: `Setup done, users can now verify!`, ephemeral: true });
            await channel.send({ embeds: [embed], components: [row] });
        }

        await Guild.findOneAndUpdate({
            guildID: interaction.guild.id,
            verificationrole: role.id
        })
        interaction.reply({ content: "Updated setup!", ephemeral: true });
        await channel.send({ embeds: [embed], components: [row] });

    }
    catch (err) {
        return Promise.reject(err);
    }
};

module.exports.permissions = {
    clientPermissions: [Permissions.FLAGS.SEND_MESSAGES],
    userPermissions: [Permissions.FLAGS.MANAGE_ROLES]
};



