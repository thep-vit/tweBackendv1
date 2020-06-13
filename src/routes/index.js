const express = require("express")
const router = express.Router()

// Get Home Page

router.get("/", (req,res)=> {
    res.render("index")
})

router.get("/signup", (req,res)=> {
    res.render("signup")
})

router.get("/login", (req,res)=> {
    res.render("login")
})

module.exports = router