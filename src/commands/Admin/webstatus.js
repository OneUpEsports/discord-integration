"use strict";
const { SlashCommandBuilder } = require("@discordjs/builders");
const { CommandInteraction, Permissions, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

// configs
const emojis = require("../../../Controller/emojis/emojis");
const ping = require('ping');

const hosts = ['https://oneupgaming.io'];

module.exports.cooldown = {
    length: 10000, /* in ms */
    users: new Set()
};

module.exports.ownerOnly = {
    ownerOnly: true
}

module.exports.data = new SlashCommandBuilder()
    .setName("webstatus")
    .setDescription("Check the status of the webpanel")

/**
 * Runs args command.
 * @param {CommandInteraction} interaction The Command Interaciton
 * @param {any} utils Additional util
 */
module.exports.run = async (interaction, utils) => {
    try {
        hosts.forEach(function(host){
            ping.sys.probe(host, function(isAlive){
                let msg = isAlive ? 'host ' + ' is online' : 'host ' + host + ' is offline';
                interaction.reply({ content: `OneUpGaming ${msg}`, ephemeral: true });
        });
    });
    }
    catch (err) {
        return Promise.reject(err);
    }
};

module.exports.permissions = {
    clientPermissions: [Permissions.FLAGS.SEND_MESSAGES],
    userPermissions: [Permissions.FLAGS.MANAGE_ROLES]
};



