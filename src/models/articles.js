const mongoose = require('mongoose');

const articleSchema = mongoose.Schema({
    atype:{
        type:String,
        required: true,
        lowercase: true,
        trim:true,
        validate(value){
            if (!(value==="editorial" || value==="irony" || value==="news" || value==="facts")) {
                throw new Error("article allowed types: editorial, irony, news, facts")
            }
        }
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
    },
    picture: {
        type: Buffer,
        require:true
    }
},{
    timestamps: true
});



const Article = mongoose.model('Article', articleSchema);

module.exports = Article