const { Schema, Types, model } = require("mongoose");

const TicketSchema = new Schema({
    guildID:
    {
        type: String,
    },
    category: 
    { 
        type: String, 
        
    },
    transcripts:
    {
        type: String,
    },
    ticketrole: 
    {
        type: String,
    }
}, { timestamps: true });

const Tickets = model("tickets", TicketSchema);

module.exports = Tickets;