const express = require("express")
const router = express.Router()

// Dynamic Rendering with EJS Templating Engine 
// GET requests that render the pages

router.get("", (req,res)=> {
    res.render("index",{
        title: "TWE Application"
    })
})

router.get("/signup", (req,res)=> {
    res.render("signup", {
        title: "Register"
    })
})

router.get("/login", (req,res)=> {
    res.render("login", {
        title: "Login"
    })
})

module.exports = router