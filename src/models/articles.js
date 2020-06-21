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
<<<<<<< HEAD
        type: Buffer,
=======
        type: Buffer
        // require:true
>>>>>>> b73568c955769938b322d78551120ea38586aa4c
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