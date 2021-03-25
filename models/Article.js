const mongoose = require('mongoose');

const articleSchema = mongoose.Schema({
    atype: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if(!(value === "editorial" || value === "news" || value === "facts" || value === "facts" || value == "movie")){
                throw new Error("Allowed article types are: Editorial, news, movie and facts. ");
            }
        }
    },
    atitle: {
        type: String,
        required: true,
        maxlength: 140,
        trim: true
    },
    acontent: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    collabAuth: {
        type: mongoose.Schema.Types.ObjectId
    },
    picture: {
        type: Buffer
    },
    comments: [
        {
            comment: {
                type: String
            },
            createdBy: {
                type: String
            }
        }
    ],
    approved: {
        type: String,
        default: "pending",
        trim: true,
        validate(value){
            if(!(value === "pending" || value === "rejected" || value === "approved")){
                throw new Error("Invalid approved state!");
            }
        }
    },
    edition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Edition'
    },
    editionNumber: {
        type: Number,
        validate(value){
            if(value < 0){
                throw new Error("Edition number must be positive!");
            }
        }
    }
}, {
    timestamps: true
});

//Return article without picture when specified
articleSchema.method.toJSON = function(){
    const article = this;
    const articleObject = article.toObject();

    delete articleObject.picture;

    return articleObject;
}

const Article = mongoose.model("Article", articleSchema);
module.exports = Article;