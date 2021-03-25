const sharp = require("sharp");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const {check } = require('express-validator');
const bcrypt = require('bcryptjs');
const { ObjectID } = require('mongodb');

const User = require("../models/User");
const Article = require("../models/Article");

exports.postArticle = async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer).png().toBuffer()

        const { collabEmail } = req.body;

        if(collabEmail){
            const collabAuthObj = await User.findOne({email: collabEmail });
            const collabAuth = ObjectID(collabAuthObj._id)
            
            const newArticle = new Article({
                ...req.body,
                author: req.user._id,
                collabAuth,
                picture: buffer
            })

            console.log(collabAuthObj._id)

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

            await newArticle.save()
            res.locals.message = req.body.message
            res.status(201).send(newArticle)
        }else{
            const newArticle = new Article({
                ...req.body,
                author: req.user._id,
                picture: buffer
            })

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

            await newArticle.save()
        
            res.locals.message = req.body.message
            res.status(201).send(newArticle)
        }
    } catch (e) {
        console.log(e)
        res.status(400).send({"message":"Oops! Article submission failed! Please check if you have filled in all fields before trying again."})
    }
}

exports.postComment = async (req, res) => {
    try{
        const foundArticle = await Article.findOne({_id: req.params.id})
        if(!foundArticle){
            return res.status(404).send()
        }

        const newComment = req.body.comment

        createdBy = req.user.name

        const comment = {
            comment: newComment, 
            createdBy
        }

        foundArticle.comments.push(comment);
        await foundArticle.save()
        res.send(foundArticle)
    } catch (e){
      
        res.status(400).send({"message":`Oops! Comment coudld not be posted. Article with ID ${req.params.id} not found.`})
      
    }
}

exports.getComments = async (req, res) => {
    try {
        const allComments = await Article.find().select("comments")

        if(!allComments){
            res.status(404).send({"message": "Oops! looks like no one commented on any of the articles!"})
        }else{
            res.status(200).send(allComments)
        }
    } catch (error) {
        res.status(500).send(error)
    }
}

exports.getArticleComment = async (req, res) => {
    const foundArticle = await Article.findOne({_id: req.params.id})

    res.status(200).send(foundArticle.comments)
}

exports.getArticlePicture = async (req, res) => {
    try{

        const article = await Article.findById(req.params.id)

        if(!article || !article.picture) {
            throw new Error("Article or Picture doesn't exist")
        }

        res.set("Content-Type","image/png")
        res.send(article.picture)
    } catch (e) {
        console.log(e)
        res.status(404).send({"message":`Oops! No picture found for article with id ${article.id}.`})
    }
}

exports.getArticleList = async (req, res) => {
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
            return res.status(404).send({"message":`Invalid user ID. Please login with a different account and try again.`})
        }
        console.log(req.user.articles)
        res.send(req.user.articles)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
}

exports.getArticleFromID = async (req, res) => {
    const _id = req.params.id

    try {
        const foundArticle = await Article.findOne( { _id } )
        if (!foundArticle){
            return res.status(404).send({"message":`Sorry. No article with ID ${req.params.id} was found.`})
        }
        res.send(foundArticle)
    } catch (e) {
        console.log(e)
        res.status(500).send({"message":`Sorry. No article with ID ${req.params.id} was found.`})
    }
}

exports.getApproved = async (req, res) => {
    const approved = "approved"
    const approvedArticles = await Article.find({approved, createdAt: { $gte: new Date((new Date().getTime() - (20 * 24 * 60 * 60 * 1000)))} }).select('atitle atype author collabAuth approved editionNumber')
        if (!approvedArticles){
            throw new Error()
        }
        var approvedArticlesWithName = new Array();

        for (i=0;i<approvedArticles.length;i++){
            currentAuthorID = approvedArticles[i].author
            collabAuthorID = approvedArticles[i].collabAuth
            currentAuthorName = await User.findById(currentAuthorID).select("name")
            if(collabAuthorID){
                collabAuthorName = await User.findById(collabAuthorID).select("name")
                console.log(currentAuthorName.name, collabAuthorName.name)
                let currentArticle = approvedArticles[i].toObject()
                currentArticle["authorName"] = currentAuthorName.name
                currentArticle["collabAuthorName"] = collabAuthorName.name
                approvedArticlesWithName.push(currentArticle)
            }else{
                console.log(currentAuthorName.name)
                let currentArticle = approvedArticles[i].toObject()
                currentArticle["authorName"] = currentAuthorName.name
                approvedArticlesWithName.push(currentArticle)
            }
        }

    if(!approvedArticlesWithName){
        res.status(404).send({"message":"Sorry, no approved articles could be found at this moment."})
    }

    res.status(200).send(approvedArticlesWithName)
}

exports.patchArticle = async (req, res) => {
    const updateFieldsReq = Object.keys(req.body)
    const validFields = ["atype", "atitle","acontent", "approved"]
    const isValidateFields = updateFieldsReq.every((field) => validFields.includes(field))

    if (!isValidateFields){
        return res.status(400).send({ "error":"Invalid Update Requested"})
    }

    try{
        if(req.user.isAdmin){
            const foundArticle = await Article.findOne({_id: req.params.id})
            updateFieldsReq.forEach((updateField) => foundArticle[updateField] = req.body[updateField])
            console.log(req.body)
            
            foundArticle.approved = req.body.approved

            if (!foundArticle){
                return res.status(404).send({"message":`Sorry. No article with ID ${req.params.id} was found.`})
            }
                    
            await foundArticle.save()
            res.send(foundArticle)
        }else{
            const foundArticle = await Article.findOne({_id: req.params.id, author: req.user._id})
            updateFieldsReq.forEach((updateField) => foundArticle[updateField] = req.body[updateField])
            console.log(req.body)
            
            foundArticle.approved = req.body.approved

            if (!foundArticle){
                return res.status(404).send({"message":`Sorry. No article with ID ${req.params.id} was found.`})
            }
                    
            await foundArticle.save()
            res.send(foundArticle)
        }   
    } catch (e) {
        console.log(e)
        res.status(400).send({"message":`Sorry. No article with ID ${req.params.id} was found.`})
    }
}

exports.deleteArticle = async (req, res) => {
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
        res.status(500).send({"message":`Sorry. No article with ID ${req.params.id} was found.`})
    }
}

exports.selectEdition = async (req, res) => {
    try {

        const edition = await Edition.findOne({enumber:req.body.edition})
        if (!edition){
            return res.status(404).send("Edition Not Found")
        }

        var article = await Article.findOne({_id:req.params.id})
        
        if(!article){
            return res.status(404).send({"message":`Sorry. No article with ID ${req.params.id} was found.`})
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
        res.status(400).send({"message":"Article approved can only be 'pending' or 'approved' or 'rejected' "})
    }
}