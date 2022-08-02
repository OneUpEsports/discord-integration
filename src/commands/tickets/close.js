"use strict";
const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandInteraction, Permissions, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

// configs
const emojis = require("../../../Controller/emojis/emojis");
const sourcebin = require("sourcebin_js");

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
    .setName("close")
    .setDescription("Close the ticket directly")

/**
 * Runs args command.
 * @param {CommandInteraction} interaction The Command Interaciton
 * @param {any} utils Additional util
 */
module.exports.run = async (interaction, utils) => {
    try {

        const guildQuery = await Guild.findOne({ guildID: interaction.guild.id });
        const transcriptChannel = interaction.guild.channels.cache.get(guildQuery.transcripts);

        const member = interaction.guild.members.cache.get(interaction.channel.topic);
        const channel = interaction.channel;

        const fetchingembed = new MessageEmbed()
            .setDescription(`Fetching messages ...`)
            .setColor("GREEN")

        await interaction.reply({
            embeds: [fetchingembed],
            ephemeral: true,
        });

        channel.messages.fetch().then(async (messages) => {
            const content = messages
                .reverse()
                .map(
                    (m) =>
                        `${new Date(m.createdAt).toLocaleString("en-US")} - ${m.author.tag
                        }: ${m.attachments.size > 0
                            ? m.attachments.first().proxyURL
                            : m.content
                        }`
                )
                .join("\n");

            let transcript = await sourcebin.create(
                [{ name: `${channel.name}`, content: content, languageId: "text" }],
                {
                    title: `Ticket transcript: ${channel.name}`,
                    description: " ",
                }
            );

            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setStyle("LINK")
                    .setEmoji("📑")
                    .setLabel("Transcript")
                    .setURL(`${transcript.url}`)
            );

            const embed = new MessageEmbed()
                .setTitle("Ticket Transcript")
                .addFields(
                    { name: "Channel", value: `${interaction.channel.name}` },
                    {
                        name: "Ticket Owner",
                        value: `Ping: <@!${member.id}>\nTag: ${member.user.tag}\nID: ${member.user.id}`,
                    },
                    {
                        name: "Transcript",
                        value: `[Direct Link](${transcript.url})`,
                    }
                )
                .setColor("GREEN")
                .setFooter({
                    text: `Guild: ${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                });
            await transcriptChannel.send({ embeds: [embed], components: [row] });
        });

        const doneembed = new MessageEmbed()
            .setDescription(`Successfully created transcript for ${channel.name}.\nNow deleting ticket ...`)
            .setColor("GREEN")

        await interaction.editReply({
            embeds: [doneembed],
            ephemeral: true,
        });

        setTimeout(() => {
            channel.delete();
        }, 3000);
    }
    catch (err) {
        return Promise.reject(err);
    }
};

module.exports.permissions = {
    clientPermissions: [Permissions.FLAGS.SEND_MESSAGES],
    userPermissions: [Permissions.FLAGS.MANAGE_CHANNELS]
};



