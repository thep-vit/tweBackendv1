const express = require("express")
const router = express.Router()
const sharp = require("sharp")
const multer = require("multer")
const jwt = require("jsonwebtoken")
const {check } = require('express-validator')
const nodemailer = require('nodemailer')
const User = require("../models/users")
const {auth, adminAuth } = require("../middleware/auth")
const Article = require("../models/articles")
const Edition = require("../models/edition")


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'abhinavgorantla0613@gmail.com',
      pass: 'kjvebhnpgijovmpt'
    }
  });


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
        const token = await userFound.generateToken()
        
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
        res.send(req.user)
    } catch (e) {
        send.status(400).send(e)
    }
})

//Deletes user
router.delete("/users/me", auth, async (req,res) => {
    try {
        await req.user.remove()
        res.send()
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.post('/user/securityQuestion/add', auth, async (req, res) => {
    const { securityQuestion, securityAnswer } = req.body;

    const userID = req.user._id;
    try {
        const foundUser = await User.findOne({_id: userID})

        if(!foundUser) {
            res.status(404).send({"message":`Oops! User with ID ${userID} not found.`})
        }

        foundUser.securityQuestion = securityQuestion
        foundUser.securityAnswer = await bcrypt.hash(securityAnswer, 8)

        res.status(200).send({"message": `Security question ${securityQuestion} for user ${foundUser.name} was successfully created. You can use it to reset your password.`})
    } catch (error) {
        throw  new Error(error.message)
    }
})

router.post('/user/securityQuestion/verify', async (req, res) => {
    const foundUser = await User.findOne({email: req.body.email})
    const { securityAnswer } = req.body

    if(!foundUser){ 
        res.status(404).send({"message": "User not found."})
    }

    const isCorrect = await bcrypt.compare(securityAnswer, foundUser.securityAnswer)

    if(isCorrect) {
        foundUser.generatePasswordReset();
        await foundUser.save()

        resetLink = "http://" + req.headers.host + "/api/users/recover/" + foundUser.resetPasswordToken

        res.send(200).send({"resetLink": `${resetLink}`})
    }else{
        res.status(500).send({"message":`Security answer for the user ${foundUser.name} is not correct. Please try again.`})
    }
})

router.post('/user/securityQuestion/request', async (req, res) => {
    const foundUser = await User.findOne({email: req.body.email})

    res.status(200).send({"securityQuestion": `${foundUser.securityQuestion}`})
})

// @route POST api/users/recover
// @desc Recover Password - Generates token and Sends password reset email
// @access Public
router.post('/users/recover',  async (req, res) => {
    try {
        foundUser = await User.findOne({email: req.body.email})
        
        if (!foundUser) {
            return res.status(401).json({message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.'});
        }

        // Generate and set password reset token
        foundUser.generatePasswordReset();

        // Save the Updated User
        resetTokenUser = await foundUser.save();

        let link = "http://" + req.headers.host + "/api/users/recover/" + resetTokenUser.resetPasswordToken;
                    const mailOptions = {
                        to: resetTokenUser.email,
                        from: process.env.SENDER_EMAIL,
                        subject: "Password change request",
                        text: `Hi ${resetTokenUser.name} \n 
                    Please click on the following link ${link} to reset your password. \n\n 
                    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
                    }

                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            console.log(error);
                        }else{
                          console.log('Email sent: ' + info.response);
                          res.status(200).send('Email sent successfully.')
                        }

                      })


    } catch (e) {
        res.status(500).json({message: err.message})
    }
});


// @route POST api/users/recover/:token
// @desc    Resets password from the link sent to user email
// @access Public
router.post('/users/recover/:token', check('password').not().isEmpty().isLength({min: 6}).withMessage('Must be at least 6 chars long'),
check('confirmPassword', 'Passwords do not match').custom((value, {req}) => (value === req.body.password)), async (req, res) =>{
    
    try {

        const foundUser = await User.findOne({resetPasswordToken: req.params.token})
        if(!foundUser){
            return res.status(401).json({message: 'Password reset token is invalid or has expired.'})
        }

        //Set the new password
        foundUser.password = req.body.password;
        foundUser.resetPasswordToken = undefined;
        foundUser.resetPasswordExpires = undefined;

        await foundUser.save()

        const mailOptions = {
            to: foundUser.email,
            from: process.env.FROM_EMAIL,
            subject: "Your password has been changed",
            text: `Hi ${foundUser.name} \n 
            This is a confirmation that the password for your account ${foundUser.email} has just been changed.\n`
        };

        transporter.sendMail(mailOptions, (error, result) => {
            if (error) return res.status(500).json({message: error.message});
            res.send(`Password reset successfully for ${foundUser.name}.`)
        })


    } catch (e) {
        res.status(500).json({message: err.message})
    }

    

});

// @route   POST api/users/confirmed
// @desc    Comfirms email for user.
// @access Public
router.post('/users/confirmed/:id', (req, res) => {
    const id = req.params.id;
    
})

// Contributions
router.get("/users/me/contribution", auth, async (req,res)=>{
    try{
        const contributionList = await User.find({}).select("contributions name")
        res.send(contributionList)
    } catch (e){
        console.log(e)
        res.status(404).send(e)
    }
})



// ------------------------------------------- ARTICLE ROUTES ----------------------------------------------------
const upload = multer({
    limits: {
        fileSize: 5000000
    },
    fileFilter(req,file,cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|JPG|PNG|JPEG)$/)) {
            return cb(new Error("Upload Proper File"))
        }
        cb(undefined,true)
    }
})

// POST new article
// create article
router.post("/articles",auth, upload.single("picture"), async(req,res)=>{    
    try {
        const buffer = await sharp(req.file.buffer).png().toBuffer()
    
        const newArticle = new Article({
            ...req.body,
            author: req.user._id,
            picture: buffer
        })
    
        await newArticle.save()
        
        const user = req.user
        user.contributions.myTotalContribution +=1
        console.log("This prints before saving, after user is updated:",user.contributions.myTotalContribution)
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
            case "movie":
            user.contributions.myTotalMovieContribution +=1
            break
        }
        await user.save()
        res.locals.message = req.body.message
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
        res.send(article.picture)
    } catch (e) {
        console.log(e)
        res.status(404).send(e)
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
router.get("/articles/:id", async (req,res) => {
    const _id = req.params.id

    try {
        const foundArticle = await Article.findOne( { _id } )
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
    const isValidateFields = updateFieldsReq.every((field) => validFields.includes(field))

    if (!isValidateFields){
        return res.status(400).send({ "error":"Invalid Update Requested"})
    }

    try{
        const foundArticle = await Article.findOne({_id: req.params.id, author: req.user._id})
        updateFieldsReq.forEach((updateField) => foundArticle[updateField] = req.body[updateField])
    
        if (!foundArticle){
            return res.status(404).send()
        }
                
        await foundArticle.save()
        res.send(foundArticle)
    } catch (e) {
        // console.log(e)
        res.status(400).send()
    }

})

// DELETE existing article
router.delete("/articles/:id", auth, async (req,res) => {
    try {
        const deletedArticle = await Article.findOneAndDelete({_id:req.params.id, author: req.user._id})
        
        if (!deletedArticle){
            return res.status(404).send()
        }

        // Update User Contribution
        const user = await User.findOne({_id:deletedArticle.author})
        user.contributions.myTotalContribution -=1
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
            case "movie":
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
        if (!edition){
            return res.status(404).send("Edition Not Found")
        }

        var article = await Article.findOne({_id:req.params.id})
        
        if(!article){
            return res.status(404).send("Article Not Found")
        }
        article = article
        article.approved = req.body.approved
        
        if (article.approved==="approved"){
            article["edition"] = edition._id
            article["editionNumber"] = edition.enumber
            await article.save()
            res.send(article)
        } else if(article.approved === "rejected") {
            
            article.edition = undefined
            article.editionNumber = undefined
            
            await article.save()
            res.send("article rejected")
        } else {
            res.send("article approved can only be 'pending' or 'approved' or 'rejected' ")
        }   

    } catch (e){
        console.log(e)
        res.status(400).send()
    }
})


// ------------------------------------------- Admin Routes -------------------------------------------

// Get all existing articles
router.get("/admin/allarticles",auth, async (req,res)=>{
    try{
        const allarticles = await Article.find({createdAt: { $gte: new Date((new Date().getTime() - (20 * 24 * 60 * 60 * 1000)))} }).select("-picture")
        if (!allarticles){
            throw new Error()
        }
        var allarticlesWithName = new Array()
        for (i=0;i<allarticles.length;i++){
            currentAuthorID = allarticles[i].author
            currentAuthorName = await User.findById(currentAuthorID).select("name")
            console.log(currentAuthorName.name)
            let currentArticle = allarticles[i].toObject()
            currentArticle["authorName"] = currentAuthorName.name
            allarticlesWithName.push(currentArticle)
        }
        res.send(allarticlesWithName)
    } catch (e){
        console.log(e)
        res.status(400).send(e)
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

// create edition
router.post("/edition/create",auth,adminAuth, async (req,res)=> {
    try{

        const { ename, enumber, edesc, hov, articles } = req.body
        const newEdition = new Edition({ename, enumber, edesc, hov})

        await newEdition.save()

        for (let index = 0; index < articles.length; index++) {
            const article = await Article.findOne({ _id: articles[index]})
            article.editionNumber = enumber
            article.edition = newEdition._id
            await article.save()
        }

        console.log(newEdition._id)
        res.status(201).send(newEdition)
    } catch (e){
        console.log(e)
        res.status(400).send(e)
    }
})


// get edition details by number
router.get("/edition/:number", async (req,res)=> {
    try{
        const edition = await Edition.findOne({enumber:req.params.number});
        console.log("Befire pop")
        console.log(edition)
        await edition.populate("articles", "atitle acontent atype author").execPopulate()

        console.log("After pop")
        // await edition.articles.populate({path: "author"})
        console.log(edition.articles)

        var editionWithAuthorNames = edition.toObject()
        var allarticlesWithName = new Array()
        for (i=0;i<edition.articles.length;i++){
            tempArticle = edition.articles[i]
            await tempArticle.populate("author", "name").execPopulate()
            edition.articles[i] = tempArticle
            allarticlesWithName.push(tempArticle)
        }
        editionWithAuthorNames.articles = allarticlesWithName
        

        if (!edition){
            return res.status(404).send()
        }
        res.send(editionWithAuthorNames)
    } catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})


// all editions list without content
router.get("/edition", async (req,res)=> {
    try{
        const editionList = await Edition.find({}).sort('-createdAt')

        if(!editionList){
            return res.status(404).send("No Editions Found")
        }

        res.send(editionList)
    } catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})



// POST HOV link
router.patch("/edition/adminhovpost/:number",auth,adminAuth, async(req,res)=> {
    try{
        const redundantEditionsCheck = await Edition.countDocuments({enumber:req.params.number})
        // console.log(redundantEditionsCheck)
        if (redundantEditionsCheck>1){
            return res.status(400).send("More than one edition's with enumber:"+req.params.enumber)
        }
        const edition = await Edition.findOne({enumber:req.params.number})
        if (!edition || !req.body.hov){
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