const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const { ObjectID } = require('mongodb')

const User = require("../models/users")
const {auth, adminAuth } = require("../middleware/auth")

router.patch('/', auth, async (req, res) => {
    const user = req.user

    try {
        const foundUser = await User.findOne({email: user.email})
        
        if(foundUser){
            foundUser.onboarding = true
            await foundUser.save()

            res.send(foundUser).status(200)
        }
        res.status(404).send({"error": "Oops! No user with that email address was found! Please try again with a different email address."});

    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/isOnboarded', auth, async (req,res) => {
    const user = req.user

    try {
        const foundUser = await User.findOne({email: user.email})
        
        if(foundUser){
            res.status(200).send(foundUser.onboarding)
        }
        res.status(404).send({"error": "Oops! No user with that email address was found! Please try again with a different email address."});

    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router