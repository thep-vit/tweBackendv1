const express = require("express");
const Article = require("../models/articles");
const fs = require('fs');
const auth = require("../middleware/auth");
const flash = require('connect-flash');


const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const multer = require("multer");
const path = require('path');
const mongoose = require('mongoose');
const { route } = require("./users");

//Init gfs
const mongoURI = 'mongodb://127.0.0.1:27017/twe';

const conn = mongoose.createConnection(mongoURI,{useNewUrlParser:true});


let gfs;

conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  console.log("connection made successfully");
});


const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

const router = new express.Router()

// POST new article
router.post("/",auth, upload.single('file'), async(req,res)=>{
    // console.log("Before Post Article")
    // console.log("req body",req.body)
    const newArticle = new Article({
        ...req.body,
        author: req.user._id
    })
    
    try {
        await newArticle.save();
        res.locals.message = req.body.message;
        res.redirect("/users/dashboard").json( { message: 'your message' });
        // res.status(201).send(newArticle)
    } catch (e) {
        res.status(400).send()
    }

})


//@route GET /articles/files
//@desc Display details of all files 
router.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        //Check if files
        if(!files || files.length === 0){
            res.status(404).json({
                err: 'No files exist'
            });
        }

        //Files exist
        return res.json(files);
    })
})

// //@route GET /articles/files/:filename
// //@desc Display single file 
// router.get('/files/:filename', (req, res) =>{
//     gfs.files.findOne({ filename: req.params.filename}, (err, file) => {
//         //check if file
//         if(!file || file.length === 0){
//             return res.status(404).json({
//                 err: 'No file found'
//             });
//         }
//         //File exists
//         return res.json(file);
//     });
// });

//@route GET /articles/image/:filename
//@desc Display image with filename 
router.get('/files/:filename', (req, res) =>{

    gfs.files.findOne({ filename: req.params.filename}, (err, file) => {
        //check if file
        if(!file || file.length === 0){
            return res.status(404).json({
                err: 'No file found'
            });
        }
        //File exists
        if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
            
            // res.set('Content-Type', file.contentType);
            // res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');

            const readstream = gfs.createReadStream(file.filename);
            readstream.on('error', function (err) {
                console.error('Read error', err);
                res.end();
              });
            readstream.pipe(res);
        }else{
            res.status(404).json({
                err: 'File not found'
            })
        }
    });
});

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