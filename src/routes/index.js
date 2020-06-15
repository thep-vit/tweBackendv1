const express = require("express")
const router = express.Router()

// Dynamic Rendering with EJS Templating Engine 
// GET requests that render the pages

router.get("", (req,res)=> {
    res.render("index",{
        title: "TWE Application"
    })
})


module.exports = router