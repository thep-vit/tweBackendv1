const mongoose = require('mongoose');
const validator = require("validator")
const bcrypt = require("bcryptjs")

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate(value){
        if (!validator.isEmail(value)){
            throw new Error("Invalid Email")
        }
    }
  },
  password: {
    type: String,
    required: true,
    trim:true,
    minlength: 7,
  },

  department: {
      type: String,
      required: true,
      trim:true,
      lowercase:true,
      validate(value){
          if(value!="twe" && value!="editorial") {
              throw new Error("department can be only twe or editorial")
          }
      }
  },

  avatar: {
      type: Buffer
  }
},{
    timestamps: true
});

//establishing a relationshipt between user and articles

userSchema.virtual( "articles", {  
    ref: "Article",
    localField: "_id",
    foreignField : "author"
})


//find and login users

userSchema.statics.findByCredentials = async (email, password) => {
    const findUser = await User.findOne({ email })
    // console.log(findUser)
    if(!findUser) {
        throw new Error ("Unable to Login!")
    }
    const isMatch = await bcrypt.compare(password, findUser.password)

    if(!isMatch) {
        throw new Error("Unable to Login!")
    }
    return findUser

}

//hash plain text password before save
userSchema.pre("save", async function(next) {
    const user = this
    // console.log("this prints before saving")

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    
    next()

})



const User = mongoose.model('User', userSchema);

module.exports = User;