const mongoose = require("mongoose")

const editionSchema = mongoose.Schema({
    ename:{
        type:String,
        required: true,
        trim: true
    },
    enumber: {
        type: Number,
        required:true,
        unique:true,
        validate(value){
            if (value<0){
                throw new Error("Edition Number cannot be negetive")
            }
        }
    },
    hov: [{
        // type: mongoose.SchemaTypes.URL
        type:String
    }]
    // earticles:[{
    //     earticle: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'Article'
    //     }
    // }]
},{
    timestamps: true
})


//establishing a relationshipt between edition and articles

editionSchema.virtual( "articles", {  
    ref: "Article",
    localField: "_id",
    foreignField : "edition"
})

const Edition = mongoose.model('Edition',editionSchema)

module.exports = Edition