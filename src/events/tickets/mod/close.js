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

// database
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

        if (interaction.customId === "close-ticket") {

            // check if interaction.user has admin permissions
            if (!interaction.member.permissions.has("MANAGE_CHANNELS")) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true, });

            if (buttonCooldown.has(interaction.user.id)) return interaction.reply({ content: "You are on cooldown", ephemeral: true });
            buttonCooldown.add(interaction.user.id)
            setTimeout(() => buttonCooldown.delete(interaction.user.id), 600_000)

            //  if (!interaction.member.roles.cache.has(supportRole)) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true, })

            const member = interaction.guild.members.cache.get(interaction.channel.topic);

            interaction.message.channel.permissionOverwrites.edit(member, {
                VIEW_CHANNEL: false,
            });

            // update channel name 
            interaction.channel.setName(`closed-${member.user.username}`);

            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setStyle("SECONDARY")
                    .setEmoji("🔓")
                    .setLabel("Reopen")
                    .setCustomId("reopen-ticket")
            );

            const embed = new MessageEmbed()
                .setDescription(`${emojis.success} | Successfully closed ticket.`)
                .setColor("GREEN")
                .setFooter({
                    text: `${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                });

            interaction.reply({ content: "Done", ephemeral: true });
            await interaction.channel.send({
                embeds: [embed],
                components: [row],
            });
        }

        if (interaction.customId === "reopen-ticket") {

            // check if interaction.user has admin permissions
            if (!interaction.member.permissions.has("MANAGE_CHANNELS")) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true, });

            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setStyle("SECONDARY")
                    .setEmoji("🗑️")
                    .setCustomId("delete-button"),
            );


            if (buttonCooldown.has(interaction.user.id)) return interaction.reply({ content: "You are on cooldown", ephemeral: true });
            buttonCooldown.add(interaction.user.id)
            setTimeout(() => buttonCooldown.delete(interaction.user.id), 600_000)

            const member = interaction.guild.members.cache.get(interaction.channel.topic);

            interaction.channel.setName(`ticket-${member.user.username}`);

            const embed = new MessageEmbed()
                .setDescription(`${emojis.success} | Successfully reopened ticket.`)
                .setColor("GREEN")

            interaction.reply({ embeds: [embed], components: [row] });
        }

        if (interaction.customId === "delete-ticket") {
            if (buttonCooldown.has(interaction.user.id)) return interaction.reply({ content: "You are on cooldown", ephemeral: true });
            buttonCooldown.add(interaction.user.id)
            setTimeout(() => buttonCooldown.delete(interaction.user.id), 600_000)

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
            }, 4000);
        }
    } catch (err) {
        console.error(err);
    }
};
