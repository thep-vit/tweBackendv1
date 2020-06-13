const express = require("express")
const router = express.Router()
const User = require("../models/users")

// GET Home Page


module.exports = function (passport) {
    router.get("/signup", async (req,res)=> {
        
        const body = req.body,
        email = body.email,
        password = body.password

        // try{
        //     doc = await User.findOne({ email })
        //     if (doc) {
        //         return res.status(500).send("Email Already Registered")
        //     }
            
        //     const newUser = new User(req.body)
        //     await newUser.save()

        // }catch (e) {
        //     return res.status(500).send("Auth Error")
        // }

        const foundUser = User.findByCredentials(email,password)
        res.send(foundUser)
        
        
    })
    
    return router
}