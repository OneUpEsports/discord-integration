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

        if (interaction.customId === "moderate-ticket") {

            // check if interaction.user has admin permissions
            if (!interaction.member.permissions.has("MANAGE_CHANNELS")) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true, });

            if (buttonCooldown.has(interaction.user.id)) return interaction.reply({ content: "You are on cooldown", ephemeral: true });
            buttonCooldown.add(interaction.user.id)
            setTimeout(() => buttonCooldown.delete(interaction.user.id), 120_000)

            //  if (!interaction.member.roles.cache.has(supportRole)) return interaction.reply({ content: `You are not allowed to do that`, ephemeral: true, })

            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setStyle("PRIMARY")
                    .setEmoji("🔒")
                    .setLabel("Close")
                    .setCustomId("close-ticket"),

                new MessageButton()
                    .setStyle("SECONDARY")
                    .setEmoji("📤")
                    .setLabel("Transcript")
                    .setCustomId("transcript-ticket"),

                new MessageButton()
                    .setStyle("DANGER")
                    .setLabel("Delete")
                    .setCustomId("delete-ticket"),

                new MessageButton()
                    .setStyle("SECONDARY")
                    .setEmoji("🗑️")
                    .setCustomId("delete-button")
            );

            const embed = new MessageEmbed()
                .setTitle(`${emojis.settings} Ticket Moderation`)
                .setDescription(
                    `Successfully entered Moderation mode, think before selecting something.`
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
        if (interaction.customId === "delete-button") {
            interaction.message.delete();
        }
    } catch (err) {
        console.error(err);
    }
};
