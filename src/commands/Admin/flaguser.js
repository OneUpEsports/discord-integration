"use strict";

const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandInteraction, MessageEmbed, Permissions } = require("discord.js");

// Database queries
const User = require("../../models/UserFlags");

// Configs
const emojis = require("../../../Controller/emojis/emojis");

module.exports.cooldown = {
    length: 10000, /* in ms */
    users: new Set()
};

module.exports.cooldown = {
    length: 10000,
    users: new Set(),
};

module.exports.data = new SlashCommandBuilder()
    .setName("flaguser")
    .setDescription("Black/Whitelist a user")
    .addSubcommand((sub) =>
        sub
            .setName("blacklist")
            .setDescription("Blacklist an user from the bot")
            .addStringOption((option) =>
                option
                    .setName("userid")
                    .setDescription(
                        "The ID of the user"
                    )
                    .setRequired(true)
            )

    )
    .addSubcommand((sub) =>
        sub.setName("whitelist").setDescription("Whitelist a user")
            .addStringOption((option) =>
                option
                    .setName("userid")
                    .setDescription(
                        "The ID of the user"
                    )
                    .setRequired(true)
            )
    );

/**
 * @param {CommandInteraction} interaction
 */

module.exports.run = async (interaction) => {
    await interaction.deferReply();
    const sub = interaction.options.getSubcommand();

    if (sub === "blacklist") {

        const userID = interaction.options.getString("userid");

        if (userID.length < 18) return interaction.followUp({
            content: `${emojis.error} | This is not a valid user id.`,
            ephemeral: true,
        });

        const isFlagged = await User.findOne({ userID: userID });
        if (isFlagged) return interaction.followUp({ content: `${emojis.error} | User is already blacklisted.`, ephemeral: true });

        const newUser = new User({
            guildID: interaction.guild.id,
            userID: userID
        });
        newUser.save();

        interaction.followUp({
            content: `${emojis.success} | Successfully blacklisted <@${userID}>`,
            ephemeral: true,
        });

    } else if (sub === "whitelist") {
        const userID = interaction.options.getString("userid");
        if (userID.length < 18) return interaction.followUp({
            content: `${emojis.error} | This is not a valid user id.`,
            ephemeral: true,
        });
        const isFlagged = await User.findOne({ userID: userID });
        if (!isFlagged)
            return interaction.followUp({
                content: `${emojis.error} | User is not blacklisted.`,
                ephemeral: true,
            });

        isFlagged.delete();
        interaction.followUp({
            content: `${emojis.success} | Successfully whitelisted <@${userID}>`,
            ephemeral: true,
        });
    }
};

module.exports.permissions = {
    clientPermissions: [Permissions.FLAGS.SEND_MESSAGES],
    userPermissions: [Permissions.FLAGS.ADMINISTRATOR]
};

