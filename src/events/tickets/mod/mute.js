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
const moment = require("moment");

// database query
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
        const member = interaction.guild.members.cache.get(interaction.channel.topic);

        if (interaction.customId === "mute-ticket") {

            // check if interaction.user has admin permissions
            if (!interaction.member.permissions.has("MANAGE_CHANNELS")) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true, });

            if (buttonCooldown.has(interaction.user.id)) return interaction.reply({ content: "You are on cooldown", ephemeral: true });
            buttonCooldown.add(interaction.user.id)
            setTimeout(() => buttonCooldown.delete(interaction.user.id), 120_000)

            //  if (!interaction.member.roles.cache.has(supportRole)) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true, })

            interaction.message.channel.permissionOverwrites.edit(member, {
                SEND_MESSAGES: false,
            });

            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setStyle("SECONDARY")
                    .setEmoji("🗑️")
                    .setCustomId("delete-button"),
            );

            const embed = new MessageEmbed()
                .setTitle(`${emojis.users} User Information`)
                .setDescription(`The ticket from ${member.user.tag} has been muted.`)
                .setColor("RED")
                .setFooter({
                    text: `${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                });

            await interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: false,
            });
        }

        if (interaction.customId === "resume-ticket") {

            // check if interaction.user has admin permissions
            if (!interaction.member.permissions.has("MANAGE_CHANNELS")) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true, });

            if (member.permissions.has("SEND_MESSAGES")) return interaction.reply({ content: `The ticket is already resumed`, ephemeral: true, });

            if (buttonCooldown.has(interaction.user.id)) return interaction.reply({ content: "You are on cooldown", ephemeral: true });
            buttonCooldown.add(interaction.user.id)
            setTimeout(() => buttonCooldown.delete(interaction.user.id), 120_000)

            //  if (!interaction.member.roles.cache.has(supportRole)) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true, })

            interaction.message.channel.permissionOverwrites.edit(member, {
                SEND_MESSAGES: true,
            });

            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setStyle("SECONDARY")
                    .setEmoji("🗑️")
                    .setCustomId("delete-button"),
            );

            const embed = new MessageEmbed()
                .setTitle(`${emojis.users} User Information`)
                .setDescription(`The ticket from ${member.user.tag} has been unmuted. Get back to work.`)
                .setColor("GREEN")
                .setFooter({
                    text: `${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                });

            await interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: false,
            });
        }

        if (interaction.customId === "info-ticket") {

            // check if interaction.user has admin permissions
            if (!interaction.member.permissions.has("MANAGE_CHANNELS")) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true, });

            if (buttonCooldown.has(interaction.user.id)) return interaction.reply({ content: "You are on cooldown.", ephemeral: true });
            buttonCooldown.add(interaction.user.id)
            setTimeout(() => buttonCooldown.delete(interaction.user.id), 30_000)

            //  if (!interaction.member.roles.cache.has(supportRole)) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true, })

            const joinedServerAt = `${Math.floor(member.joinedAt / 1000)}`;

            const createdAccount = `${Math.floor(member.user.createdAt / 1000)}`;

            const channelCreated = `${Math.floor(interaction.channel.createdAt / 1000)}`;

            const embed = new MessageEmbed()
                .setTitle(`${emojis.users} User Information`)
                .addFields(
                    { name: "User", value: `${member.user.tag}`, inline: true },
                    { name: "ID", value: `${member.id}`, inline: true },
                    { name: "Tag", value: `<@${member.id}>`, inline: true },
                    { name: "Joined", value: `📅 <t:${joinedServerAt}:R>`, inline: true },
                    { name: "Created", value: `📝 <t:${createdAccount}:R>`, inline: true },
                )
                .addFields(
                    { name: "Channel Created", value: `📺 <t:${channelCreated}:R>`, inline: true },
                )
                .setColor("RANDOM")
                .setFooter({
                    text: `${interaction.guild.name}`,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                });

            await interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        }
    } catch (err) {
        console.error(err);
    }
};
