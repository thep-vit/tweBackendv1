const express = require("express")
const User = require("../models/users")
const passport = require("passport")

const router = express.Router()

// Create Account
router.post("/register", async (req,res) => {
    const newUser = new User(req.body)
    try{
        console.log("Here1")
        await newUser.save()
        // const token = await newUser.generateToken()

        // res.cookie('auth_token', token)
        // res.sendFile(path.resolve(__dirname, '..', 'views', 'private.html'))

        res.status(201).send({newUser})
        // console.log("S")
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

// Login

router.post("/login", passport.authenticate('local'), (req,res) => {
    console.log("Login Success")
    res.send()
})
module.exports = router