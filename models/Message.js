const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    message: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    createdBy: {
        _id: {
            type: String
        },
        name:{
            type: String
        }
    }
})

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;