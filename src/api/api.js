const express = require("express")
const router = express.Router()
const sharp = require("sharp")
const multer = require("multer")
const jwt = require("jsonwebtoken")
const User = require("../models/users")
const {auth, adminAuth } = require("../middleware/auth")
const Article = require("../models/articles")
const Edition = require("../models/edition")




// Dynamic Rendering with EJS Templating Engine 
// GET requests that render the pages

router.get("", (req,res)=> {
    // res.render("index",{
    //     title: "TWE Application"
    // })
    res.send()
})


// ------------------------------------------- USER ROUTES ----------------------------------------------------

// Create Account
router.post("/users/signup", async (req,res) => {

    const newUser = new User(req.body)
    try{
        // console.log(req.body)
        // console.log("Register Route")
        await newUser.save()
        const token = await newUser.generateToken()


        res.status(201).send({newUser,token})
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
        res.send({userFound,token})

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

// Returns currently logged in user whos making the request. 'My User Object'
router.get("/users/me",auth,async (req,res)=> {
    try{
        if (!req.user){
            throw new Error()
        }
        res.send(req.user)
    } catch(e){
        res.send(404)
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
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
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

// Get Name of Author
router.get("/users/name/:id", async (req,res)=> {
    try {
        const userName = await User.findById(req.params.id).select("name")
        if (!userName){
            return res.status(404).send
        }
        res.send(userName.name)
        
        
    } catch (e){
        res.status(400).send()
    }
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


// Contributions

router.get("/users/me/contribution", auth, async (req,res)=>{
    try{
        // const myTotalContributionCount = await Article.countDocuments({ author:req.user._id})
        // const mysatireContributionCount = await Article.countDocuments({ author:req.user._id, atype:"satire"})
        // const myNewsContributionCount = await Article.countDocuments({ author:req.user._id, atype:"news"})
        // const myFactsContributionCount = await Article.countDocuments({ author:req.user._id, atype:"facts"})
        // const myEditorialContributionCount = await Article.countDocuments({ author:req.user._id, atype:"editorial"})

        // const totalContributionCount = await Article.countDocuments({})
        // const totalSatireContributions = await Article.countDocuments({ atype:"editorial"})
        // const totalNewsContributionCount = await Article.countDocuments({ atype:"news"})
        // const totalFactsContributionCount = await Article.countDocuments({ atype:"facts"})
        // const totaleEitorialContributionCount = await Article.countDocuments({ atype:"editorial"})

        const contributionList = await User.find({}).select("contributions name")
        // console.log(allNames)
        res.send(contributionList)

        // res.send({
        //     totalContributionCount,
        //     totalSatireContributions,
        //     totalNewsContributionCount,
        //     totalFactsContributionCount,
        //     totaleEitorialContributionCount,
        //     myTotalContributionCount,
        //     mysatireContributionCount,
        //     myNewsContributionCount,
        //     myFactsContributionCount,
        //     myEditorialContributionCount
        // })
    } catch (e){
        console.log(e)
        res.status(404).send(e)
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
// create article
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
        await newArticle.save()
        
        const user = req.user
        user.contributions.myTotalContribution +=1
        // console.log("This prints before saving, after user is updated:",user.contributions.myTotalContribution)
        switch(newArticle.atype){
            case "satire":
                user.contributions.myTotalSatireContribution +=1
                break
            case "news":
                user.contributions.myTotalNewsContribution +=1
                break
            case "editorial":
                user.contributions.myTotalEditorialContribution +=1
                break
            case "facts":
                user.contributions.myTotalFactsContribution +=1
                break
        }
        await user.save()
        // res.locals.message = req.body.message
        // res.redirect("/users/dashboard").json( { message: 'your message' });
        res.status(201).send(newArticle)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
    
})

//@route   /api/articles/comment/:id
//@method  POST
//@desc    Allows Admin to POST a comment to a particular post
//@todo    Add admin auth
router.post("/articles/comment/:id", auth, async(req, res) =>{

    try{
        const foundArticle = await Article.findOne({_id: req.params.id})
        if(!foundArticle){
            return res.status(404).send()
        }
        foundArticle.comments.push(req.body.comment);
        await foundArticle.save()
        res.send(foundArticle)
    } catch (e){
        res.status(400).send()
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
        console.log(req.user.articles)
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
        // console.log(deletedArticle)
        
        if (!deletedArticle){
            return res.status(404).send()
        }

        // Update User Contribution
        const user = await User.findOne({_id:deletedArticle.author})
        user.contributions.myTotalContribution -=1
        // console.log("This prints before deleting, after user is updated:",user.contributions.myTotalContribution)
        switch(deletedArticle.atype){
            case "satire":
                user.contributions.myTotalSatireContribution -=1
                break
            case "news":
                user.contributions.myTotalNewsContribution -=1
                break
            case "editorial":
                user.contributions.myTotalEditorialContribution -=1
                break
            case "facts":
                user.contributions.myTotalFactsContribution -=1
                break
        }
        await user.save()

        res.send(deletedArticle)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

// select edition for article

router.patch("/articles/select/edition/:id", auth, adminAuth, async(req,res)=>{
    try {

        const edition = await Edition.findOne({enumber:req.body.edition})
        // console.log(edition)
        if (!edition){
            return res.status(404).send("Edition Not Found")
        }

        var article = await Article.findOne({_id:req.params.id})
        // console.log(article)
        if(!article){
            return res.status(404).send("Article Not Found")
        }

        article.approved = req.body.approved
        // console.log("before",article)
        // console.log("edition:",edition._id)
        article["edition"] = edition._id
        article["editionNumber"] = edition.enumber
        // console.log("after",article)

        await article.save()
        res.send(article)

    } catch (e){
        console.log(e)
        res.status(400).send()
    }
})


// ------------------------------------------- Admin Routes -------------------------------------------

// Get all existing articles
router.get("/admin/allarticles",auth,adminAuth, async (req,res)=>{
    try{
        const allarticles = await Article.find({})
        if (!allarticles){
            throw new Error()
        }

        res.send(allarticles)
    } catch (e){
        res.status(400).send()
    }
})

// 

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

// ------------------------------------------- Admin Routes -------------------------------------------


// create edition
router.post("/edition/create",auth,adminAuth, async (req,res)=> {
    const newEdition = new Edition(req.body)
    try{
        await newEdition.save()
        res.status(201).send(newEdition)
    } catch (e){
        console.log(e)
        res.status(400).send(e)
    }
})


// get edition details by number
router.get("/edition/:number", async (req,res)=> {
    try{
        const edition = await Edition.findOne({enumber:req.params.number})
        // console.log(edition)
        await edition.populate({
            path: "articles"
        }).execPopulate()

        if (!edition){
            return res.status(404).send()
        }
        res.send(edition.toObject({virtuals: true}))

    } catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})


// POST HOV link

router.patch("/edition/adminhovpost/:id",auth,adminAuth, async(req,res)=> {
    try{
        const edition = await Edition.findById(req.params.id)
        if (!edition){
            return res.status(404).send()
        }

        edition.hov.push(req.body.hov)
        await edition.save()
        res.send(edition)
    } catch (e){
        console.log(e)
        res.status(400).send(e)
    }
})

// update edition
router.patch("/edition/update/:id",auth,adminAuth,async (req,res)=>{
    const updateFieldsReq = Object.keys(req.body)
    const validFields = ["ename", "enumber"]
    const isValidateFields = updateFieldsReq.every( (field) => validFields.includes(field))

    if (!isValidateFields){
        return res.status(400).send({ "error":"Invalid Update Requested"})
    }

    try{
        const edition = await Edition.findOne({_id: req.params.id})
        updateFieldsReq.forEach((updateField) => edition[updateField] = req.body[updateField])

        // const updatedTask = await Task.findByIdAndUpdate(req.params.id,req.body,{ new: true, runValidators: true})
        if (!edition){
            return res.status(404).send()
        }
                
        await edition.save()
        res.send(edition)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }

})

module.exports = router