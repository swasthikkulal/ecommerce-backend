const mongoose = require("mongoose")

const feedbackSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
    name: { type: String, require: true },
    email: { type: String, require: true },
    description: { type: String, require: true }
})

module.exports = mongoose.model("feedback", feedbackSchema)