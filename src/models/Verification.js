const { Schema, Types, model } = require("mongoose");

const VerificationSchema = new Schema({
    guildID:
    {
        type: String,
    },
    verificationrole: 
    {
        type: String
    },
}, { timestamps: true });

const Verification = model("verification", VerificationSchema);

module.exports = Verification;