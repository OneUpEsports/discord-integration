const { Schema, Types, model } = require("mongoose");

const UserFlagSchema = new Schema({
    guildID:
    {
        type: String,
    },
    userID: 
    { 
        type: String, 
        
    },
}, { timestamps: true });

const FlaggedUser = model("flagged-users", UserFlagSchema);

module.exports = FlaggedUser;