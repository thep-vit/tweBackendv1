const Message = require('../models/Message');

exports.postMessage = async (req, res) => {
    const { message } = req.body;
    const user = req.user;

    const createdBy = {
        _id: user._id,
        name: user.name
    }

    const newMessage = new Message({ createdBy, message });

    await newMessage.save();

    res.status(200).send(newMessage);
}

exports.getAllMessages = async (req, res) => {
    const allMessages = await Message.find().sort('-createdAt')

    if(!allMessages){
        res.status(404).send({"message":"Oops! No messages found!"})
    }
    res.status(200).send(allMessages)
}