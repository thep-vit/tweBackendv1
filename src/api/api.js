const express = require("express")
const router = express.Router()
const sharp = require("sharp")
const multer = require("multer")
const User = require("../models/users")
const auth = require("../middleware/auth")
const Article = require("../models/articles")
const jwt = require("jsonwebtoken")



// Dynamic Rendering with EJS Templating Engine 
// GET requests that render the pages

router.get("", (req,res)=> {
    // res.render("index",{
    //     title: "TWE Application"
    // })
    res.send()
})


// ------------------------------------------- USER ROUTES ----------------------------------------------------

router.get("/users/signup", (req,res)=> {
    // res.render("signup", {
    //     title: "Register"
    // })
    res.send()
})

router.get("/users/login", (req,res)=> {
    // res.render("login", {
    //     title: "Login"
    // })
    res.send()
})

// Create Account
router.post("/users/signup", async (req,res) => {

    const newUser = new User(req.body)
    try{
        console.log(req.body)
        console.log("Register Route")
        await newUser.save()
        const token = await newUser.generateToken()

        // store the jwt after validatoin in a browser cookie
        res.cookie('auth_token', token);
        req.flash(
            'success_msg',
            'You are now registered and can log in'
          );
        res.status(201).send({newUser})
        // redirect to dashboard
        // res.redirect("/api/users/dashboard")
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

// Login
router.post("/users/login", async (req,res) => {
    try{
        const userFound = await User.findByCredentials(req.body.email, req.body.password)
        // console.log(userFound)
        const token = await userFound.generateToken()
        // console.log("token")

        // store the jwt after validatoin in a browser cookie
        // res.cookie('auth_token', token)
        // res.sendFile(path.resolve(__dirname,"..", 'templates/views', 'private-dashboard.hbs'))
        // res.redirect("/users/dashboard")

        res.send({userFound,token})

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

// Logout User
router.post("/users/logout", auth, async (req,res)=>{
    try {
        // console.log(req.user)
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token!==req.token
        })
        await req.user.save();
        
        res.send()
        // res.redirect('/users/login');
    } catch (e) {
        res.status(500).send()
    }
})

// Logout User from all devices
router.post("/users/logoutAll", auth, async (req,res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
        
    } catch (e){
        res.status(500).send()
    }
})

// Private User Dashboard

router.get("/users/dashboard",auth, (req,res)=> {
    // var resMessage = "Test Message"
    // res.render("private-dashboard", {
    //     title: "Dashboard", 
    //     message: resMessage
    // });
    res.send()
})

// Update User Data
router.patch("/users/me",auth, async (req,res) => {
    const updateFieldsReq = Object.keys(req.body)


    const validFields = ["name", "email", "age","password","department"]
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

router.delete("/users/me", auth, async (req,res) => {
    try {
        await req.user.remove()
        res.send()
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})


// ------------------------------------------- ARTICLE ROUTES ----------------------------------------------------


const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Upload Proper File"))
        }
        cb(undefined,true)
    }
})

// POST new article
router.post("/articles",auth, upload.single("picture"), async(req,res)=>{
    // console.log("Before Post Article")
    // console.log("req body",req.body)
    // const buffer = await sharp(req.file.buffer).resize({ height: 250, width: 250}).png().toBuffer()
    
    const newArticle = new Article({
        ...req.body,
        author: req.user._id,
        // picture: buffer
    })
    
    try {
        await newArticle.save();
        res.locals.message = req.body.message;
        // res.redirect("/users/dashboard").json( { message: 'your message' });
        res.status(201).send(newArticle)
    } catch (e) {
        res.status(400).send(e)
    }
    
})

// GET picture
router.get("/articles/:id/picture", async (req,res) => {
    try{

        const article = await Article.findById(req.params.id)

        if(!article || !article.picture) {
            throw new Error("Article or Picture doesn't exist")
        }

        res.set("Content-Type","image/png")
        // console.log(user.avatar)
        res.send(article.picture)
    } catch (e) {
        res.status(404).send()
    }
})



// GET /tasks?limit=2&skip=2
// GET /tasks?sortBy=createdAt:asc

// GET all existing articles or query in the above format to sort results according to attributes.
router.get("/articles/list", auth, async (req,res) => {


    const sort = {}

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] === "asc" ? 1: -1
    }

    try {

        // const allTasks = await Task.find({owner: req.user._id}) (alternate to the following line)
        await req.user.populate({
            path : "articles",
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        if (!req.user){
            return res.status(404).send()
        }
        res.send(req.user.articles)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})


// GET articles according to ID
router.get("/articles/:id",auth, async (req,res) => {
    const _id = req.params.id

    try {
        // const foundTask = await Task.findById(_id)
        const foundArticle = await Article.findOne( { _id,author:req.user._id } )
        if (!foundArticle){
            return res.status(404).send()
        }
        res.send(foundArticle)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

// PATCH update an article content in the database
router.patch("/articles/:id", auth, async (req,res) => {
    const updateFieldsReq = Object.keys(req.body)
    const validFields = ["atype", "atitle","acontent"]
    const isValidateFields = updateFieldsReq.every( (field) => validFields.includes(field))

    if (!isValidateFields){
        return res.status(400).send({ "error":"Invalid Update Requested"})
    }

    try{
        const foundArticle = await Article.findOne({_id: req.params.id, author: req.user._id})
        updateFieldsReq.forEach((updateField) => foundArticle[updateField] = req.body[updateField])

        // const updatedTask = await Task.findByIdAndUpdate(req.params.id,req.body,{ new: true, runValidators: true})
        if (!foundArticle){
            return res.status(404).send()
        }
                
        await foundArticle.save()
        res.send(foundArticle)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }

})

// DELETE existing article
router.delete("/articles/:id", auth, async (req,res) => {
    try {
        const deletedArticle = await Article.findOneAndDelete({_id:req.params.id, author: req.user._id})
        if (!deletedArticle){
            return res.status(404).send()
        }
        res.send(deletedArticle)
    } catch (e) {
        res.status(500).send()
    }
})


// Dashboard Auth for Client

router.post("/check/auth", async (req,res)=>{
    try{
        const token = req.header("Authorization").replace("Bearer ","") 
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await User.findOne( { _id: decoded._id, "tokens.token":token })
        
        if(!user) {
            throw new Error()
        }

        if (user.isAdmin===true){
            return res.send({"admin":true})
        }
        res.send({"admin":false})
    } catch (e) {
        console.log(e)
        res.status(401).send("Please authenticate")
    }
})



module.exports = router