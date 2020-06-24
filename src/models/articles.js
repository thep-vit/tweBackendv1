const mongoose = require('mongoose')
const User = require("./users")

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
        type: Number,
        default: 0
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

// Update Contributions Before Each article is saved
articleSchema.pre("save", async function(next) {
    const article = this
    const user = await User.findOne({_id:this.author})
    user.contributions.myTotalContribution +=1
    console.log("This prints before saving, after user is updated:",user.contributions.myTotalContribution)
    switch(article.atype){
        case "satire":
            user.contributions.myTotalSatireContribution +=1
            break
        case "news":
            user.contributions.myTotalNewsContribution +=1
            break
        case "editorial":
            user.contributions.myTotalEditorialContribution +=1
            break
        case "facts":
            user.contributions.myTotalFactsContribution +=1
            break
    }
    await user.save()

    next()
})

// Update contributions when a article is deleted
// Hook not working - Mongoose Problem - Delete Handled in the route  (middleware on deleteOne and other queries on docs dont work and 
//  queries with model are irrelevent here)

// articleSchema.pre("findOneAndDelete", async function(next) {

//     console.log("pre test - article is : ",this)

//         next()
// })

const Article = mongoose.model('Article', articleSchema);

module.exports = Article