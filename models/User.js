const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { default: validator } = require('validator');
require('dotenv').config()

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
            if(!validator.isEmail(value)){
                throw new Error("Invalid email!");
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7
    },
    department:{
        type: String,
        trim: true,
        lowercase: true,
        validate(value){
            if(value !== 'twe' && value !== 'editorial'){
                throw new Error("Invalid department! Department can only be TWE or editorial!");
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
            //Add functionality to remove expired tokens
        }
    }],
    resetpasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    avatar: {
        type: Buffer
    },
    isAdmin: {//Replace this with a "userType"
        type: Boolean,
        required: true,
        default: false
    },
    onboarding: {
        type: Boolean,
        default: false
    },
    securityQuestion: {
        type: String
    },
    securityAnswer: {
        type: String
    },
    contributions:{
        myTotalContribution: {
            type: Number,
            default:0
        },
        myTotalNewsContibution: {
            type: Number,
            default:0
        },
        myTotalSatireContribution: {
            type: Number,
            default:0
        },
        myTotalFactsContribution: {
            type: Number,
            default:0
        },
        myTotalEditorialContribution: {
            type: Number,
            default:0
        },
        myTotalMovieContribution: {
            type: Number,
            default:0
        }
      }
}, {
    timestamps: true
});

userSchema.findByCredentials = async (email,password) => {
    const foundUser = await User.findOne({ email });
    if(!foundUser){
        throw new Error("Unable to login!");
    }
    const isMatch = await bcrypt.compare(password, foundUser.password)

    if(!isMatch){
        throw new Error("Unable to login!");
    }

    return foundUser;
}

//Hash plain text password before saving the user.
userSchema.pre("save", async (next) => {
    const user = this;
    if(user.isModified("password")){
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

userSchema.methods.toJSON = function (){
    const user = this;
    const userObject = user.toObject();

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//Generate token and append in user model
userSchema.methods.generateToken = async () => {
    const foundUser = this;
    const token = jwt.sign({ _id: founduser._id.toString(), isAdmin: foundUser.isAdmin.toString() }, process.env.JWT_SECRET)

    foundUser.tokens = foundUser.tokens.concat({token});

    await foundUser.save();

    return token;
}

//Password reset token generation
userSchema.methods.generatePasswordResetToken = () => {
    this.resetpasswordToken = jwt.sign({ _id: this._id.toString()}, process.env.JWT_SECRET);
    this.resetPasswordExpires = Date.now() + 3600000;
};


module.exports = mongoose.model('User', userSchema);

