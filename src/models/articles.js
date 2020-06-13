const mongoose = require('mongoose');

const articleSchema = mongoose.Schema({
    atype:{
        type:String,
        required: true,
    },
    atitle:{
        type: String,
        required: true,
        maxlength: 100,
        trim: true
    },
    acontent:{
        type:String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},{
    timestamps: true
});



const Article = mongoose.model('Article', articleSchema);

module.exports = Article