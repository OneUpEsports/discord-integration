"use strict";

const {
    CommandInteraction,
    Permissions,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
} = require("discord.js");

// configs
const emojis = require("../../../../Controller/emojis/emojis");
const config = require("../../../../Controller/config");
const sourcebin = require("sourcebin_js");

const Guild = require("../../../models/TicketPanel");

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
        const transcriptChannel = interaction.guild.channels.cache.get(guildQuery.transcripts);

        const member = interaction.guild.members.cache.get(interaction.channel.topic);
        const channel = interaction.channel;

        if (interaction.customId === "transcript-ticket") {

            // check if interaction.user has admin permissions
            if (!interaction.member.permissions.has("MANAGE_CHANNELS")) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true, });

            if (buttonCooldown.has(interaction.user.id)) return interaction.reply({ content: "You are on cooldown", ephemeral: true });
            buttonCooldown.add(interaction.user.id)
            setTimeout(() => buttonCooldown.delete(interaction.user.id), 600_000)

            //  if (!interaction.member.roles.cache.has(supportRole)) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true, })

            const fetchingembed = new MessageEmbed()
                .setDescription(`Fetching messages for ${channel.name} ...`)
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
                .setDescription(`Successfully created transcript for ${channel.name}`)
                .setColor("GREEN")

            await interaction.editReply({
                embeds: [doneembed],
                ephemeral: true,
            });
        }
    } catch (err) {
        console.error(err);
    }
};
