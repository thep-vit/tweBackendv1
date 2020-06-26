const mongoose = require('mongoose')

const articleSchema = mongoose.Schema({
    atype:{
        type:String,
        required: true,
        lowercase: true,
        trim:true,
        validate(value){
            if (!(value==="editorial" || value==="satire" || value==="news" || value==="facts")) {
                throw new Error("article allowed types: editorial, satire, news, facts")
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
        type: Buffer
        // require:true
    },
    comments: [
        {
            type:String,
            trim: true
        }
    ],
    approved:{
        type: Boolean,
        default: false,
        trim:true
    },
    edition: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Edition'
    },
    editionNumber: {
        type: Number,
        validate(value){
            if (value<0){
                throw error("Edition Number is to be positive")
            }
        }
    }
},{
    timestamps: true
});

// return article without picture when asked

articleSchema.methods.toJSON = function () {
    const article = this
    const articleObject = article.toObject()

    delete articleObject.picture

    return articleObject
}


const Article = mongoose.model('Article', articleSchema);

module.exports = Article