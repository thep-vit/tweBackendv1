const express = require("express")
const User = require("../models/users")
const auth = require("../middleware/auth")
const path = require("path")

const router = express.Router()

// Create Account
router.post("/register", async (req,res) => {

    const newUser = new User(req.body)
    try{
        console.log("Register Route")
        await newUser.save()
        const token = await newUser.generateToken()

        // store the jwt after validatoin in a browser cookie
        res.cookie('auth_token', token)
        res.sendFile(path.resolve(__dirname,"..", 'templates/views', 'private-dashboard.html'))

        // res.status(201).send({newUser})
        // redirect to dashboard
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

// Login
router.post("/login", async (req,res) => {
    try{
        // console.log("befoe")
        const userFound = await User.findByCredentials(req.body.email, req.body.password)
        // console.log(userFound)
        const token = await userFound.generateToken()
        console.log("token")

        // store the jwt after validatoin in a browser cookie
        res.cookie('auth_token', token)
        res.sendFile(path.resolve(__dirname,"..", 'templates/views', 'private-dashboard.html'))

        // res.send({userFound,token})

    } catch (e) {
        // console.log(e)
        res.status(400).send(e)
    }
})

// Logout User
router.post("/logout", auth, async (req,res)=>{
    try {
        console.log(req.user)
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token!==req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Logout User from all devices
router.post("/logoutAll", auth, async (req,res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
        
    } catch (e){
        res.status(500).send()
    }
})

// Update User Data
router.patch("/me",auth, async (req,res) => {
    const updateFieldsReq = Object.keys(req.body)


    const validFields = ["name", "email", "age","password"]
    const isValidateFields = updateFieldsReq.every((field) => validFields.includes(field)) // automaticly returns based on ES6
    
    if (!isValidateFields){
        return res.status(400).send({ "error" : "Invalid Update Requested!"})
    }
    try {
        updateFieldsReq.forEach((updateField) => req.user[updateField] = req.body[updateField])
        await req.user.save()
        // const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators: true })
        res.send(req.user)
    } catch (e) {
        send.status(400).send(e)
    }
})

router.delete("/me", auth, async (req,res) => {
    try {
        await req.user.remove()
        res.send()
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

module.exports = router