const express = require("express")
const Article = require("../models/articles")
const auth = require("../middleware/auth")

const router = new express.Router()

// POST new article
router.post("/",auth, async(req,res)=>{
    console.log("Before Post Article")
    console.log("req body",req.body)
    const newArticle = new Article({
        ...req.body,
        author: req.user._id
    })
    
    try {
        await newArticle.save()
        res.redirect("/users/dashboard")
        // res.status(201).send(newArticle)
    } catch (e) {
        res.status(400).send()
    }
})


// GET /tasks?limit=2&skip=2
// GET /tasks?sortBy=createdAt:asc

// GET all existing articles or query in the above format to sort results according to attributes.
router.get("/list", auth, async (req,res) => {


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
router.get("/:id",auth, async (req,res) => {
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
router.patch("/:id", auth, async (req,res) => {
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
router.delete("/:id", auth, async (req,res) => {
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

module.exports = router