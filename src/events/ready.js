"use strict";

const { Client } = require("discord.js");
const { red, green, blue, yellow, cyan } = require("chalk");
const { connect, mongoose } = require("mongoose");

// Configs
const client = require("../util/bot");
const emojis = require("../../Controller/emojis/emojis");

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

module.exports.data = {
  name: "ready",
  once: true,
};

/**
 * Handle the clients event.
 * @param {Client} client The client that triggered the event.
 */
module.exports.run = async (client) => {
  // client.user.setPresence({ activities: [{ name: `Status` }], status: "dnd" });

  // connect to database
  mongoose.connect(process.env.MONGO_TOKEN)
    .then(() => {
      console.log(cyan("Successfully connected to database."));
    })
    .catch((err) => console.error(red(err)));

    console.log(`${client.user.tag} online!`);
};
