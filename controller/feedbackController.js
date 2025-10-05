const feedbackModel = require("../models/feedback")

const setFeedBack = async (req, res) => {
    try {
        console.log(req.body)
        let { name, email, description } = req.body;
        const setFeedBackData = await feedbackModel.create({
            user: req.user.userId,
            name,
            email,
            description
        })
        if (!setFeedBackData) {
            return res.json({ success: false, message: "no data found" })
        }
        const savedata = await setFeedBackData.save()
        return res.json({ success: true, data: savedata })

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

module.exports = { setFeedBack }