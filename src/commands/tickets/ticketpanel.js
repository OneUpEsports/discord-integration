"use strict";
const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandInteraction, Permissions, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

// configs
const emojis = require("../../../Controller/emojis/emojis");

// database
const Guild = require("../../models/TicketPanel");

module.exports.cooldown = {
    length: 10000, /* in ms */
    users: new Set()
};

module.exports.ownerOnly = {
    ownerOnly: true
}

module.exports.data = new SlashCommandBuilder()
    .setName("ticketpanel")
    .setDescription("Sends the Ticket panel")
    .addChannelOption((option) => option.setName("category").setDescription("The category for the tickets").setRequired(true))
    .addChannelOption((option) => option.setName("transcripts").setDescription("The transcript channel").setRequired(true))
    .addRoleOption((option) => option.setName("role").setDescription("The support role that have access to the tickets").setRequired(true))

/**
 * Runs args command.
 * @param {CommandInteraction} interaction The Command Interaciton
 * @param {any} utils Additional util
 */
module.exports.run = async (interaction, utils) => {
    try {
        const channel = interaction.channel;

        const guildQuery = await Guild.findOne({ guildID: interaction.guild.id });

        const category = interaction.options.getChannel("category");
        const transcriptChannel = interaction.options.getChannel("transcripts");
        const role = interaction.options.getRole("role");

        if(category.type != "GUILD_CATEGORY") return interaction.reply({ content: "Please set a category channel for the tickets.", ephemeral: true });
        if(transcriptChannel.type != "GUILD_TEXT") return interaction.reply({ content: "Please set a text channel for the transcripts.", ephemeral: true });

        if (!guildQuery) {
            const guild = new Guild({
                guildID: interaction.guild.id,
                category: category.id,
                transcripts: transcriptChannel.id,
                ticketrole: role.id
            })
            guild.save();
        } else {
            await Guild.findOneAndUpdate({
                guildID: interaction.guild.id,
                category: category.id,
                transcripts: transcriptChannel.id,
                ticketrole: role.id
            })
        }
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle("PRIMARY")
                    .setEmoji(`${emojis.saphire}`)
                    .setCustomId("server-support")
                    .setLabel("Server Support"),

                new MessageButton()
                    .setStyle("SECONDARY")
                    .setEmoji(`${emojis.review}`)
                    .setCustomId("service-ticket")
                    .setLabel("Service Support"),

                new MessageButton()
                    .setStyle("DANGER")
                    .setEmoji(`${emojis.blacklist}`)
                    .setCustomId("report-ticket")
                    .setLabel("Member Reports")
            );
        const embed = new MessageEmbed()
            .setDescription(`
        **Welcome to the ticket support!**
        Before you click any of the buttons below, read this carefully.

        - Please choose the correct category for your question.
        - Only speak in English, no other language is supported.
        - Opening tickets without response will lead to a temp. mute.

        Opening tickets for trolling will lead to a permanent ban.

        Thanks!
        `)
            .setColor("GREEN")
            .setFooter({ text: `By: ${interaction.guild.name}` })

        interaction.reply({ content: `Ticket panel deployed in: ${channel}!`, ephemeral: true });
        return channel.send({ embeds: [embed], components: [row] });
    }
    catch (err) {
        return Promise.reject(err);
    }
};

module.exports.permissions = {
    clientPermissions: [Permissions.FLAGS.SEND_MESSAGES],
    userPermissions: [Permissions.FLAGS.MANAGE_CHANNELS]
};



