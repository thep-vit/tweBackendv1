const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const { ObjectID } = require('mongodb')

const User = require("../models/users")
const {auth, adminAuth } = require("../middleware/auth")

router.patch('/onboard', auth, async (req, res) => {
    const user = req.user

    try {
        const foundUser = await User.findOne({email: user.email})
        
        if(foundUser){
            foundUser.onboarding = true
            await foundUser.save()

            res.send(foundUser).status(200)
        }
        res.send({"error": "Oops! No user with that email address was found! Please try again with a different email address."}).status(404);

    } catch (error) {
        res.send(error).status(500)
    }
})

router.get('/isOnboarded', auth, async (req,res) => {
    const user = req.user

    try {
        const foundUser = await User.findOne({email: user.email})
        
        if(foundUser){
            res.send(foundUser.onboarding).status(200)
        }
        res.send({"error": "Oops! No user with that email address was found! Please try again with a different email address."}).status(404);

    } catch (error) {
        res.send(error).status(500)
    }
})

module.exports = router