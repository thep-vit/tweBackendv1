const mongoose = require('mongoose');

const editionSchema = mongoose.Schema({
    ename:{
        type: String,
        required: true,
        trim: true
    },
    enumber: {
        type:Number,
        required: true,
        unique: true,
        validate(value) {
            if(value < 0){
                throw new Error("Edition number can't be negative.")
            }
        }
    },
    edesc: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if(value.length > 5000){
                throw new Error("Edition description cannot be longer than 5000 characters.");
            }
        }
    },
    hov: [{
        type: String,
    }],
    earticles: [{
        earticle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article'
        }
    }]
}, {
    timestamps: true
})

//Relationship betwen Article and Edition schema

editionSchema.virtual("articles", {
    ref: "Article",
    localField: "_id",
    foreignField: "edition"
})

const Edition = mongoose.model("Edition", editionSchema);

module.exports = Edition;