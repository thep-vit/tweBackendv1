const express = require('express');
const router = express.Router();
const multer = require('multer');

const { auth, adminAuth } = require('../middleware/auth');
const article = require('../controllers/articleController');

const upload = multer({
    limits: {
        fileSize: 5000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)){
            return cb(new Error("Upload proper file!"));
        }
        cb(undefined, true);
    }
})

router.post('/articles', auth, upload.single("picture"), article.postArticle);

router.post('/articles/comment/:id', auth, article.postComment);

router.get('/articles/comment/', article.getComments);

router.get('/articles/getComment/:id', article.getArticleComment);

router.get('/aricles/:id/picture', article.getArticlePicture);

// GET /tasks?limit=2&skip=2
// GET /tasks?sortBy=createdAt:asc
// GET all existing articles or query in the above format to sort results according to attributes.
router.get("/articles/list", auth, article.getArticleList);

router.get("/articles/:id", article.getArticleFromID);

router.get('/approvedArticles', article.getApproved);

// PATCH update an article content in the database
router.patch("/articles/:id", auth, article.patchArticle);

// DELETE existing article
router.delete("/articles/:id", auth, article.deleteArticle);

// select edition for article
router.patch("/articles/select/edition/:id", auth, adminAuth, article.selectEdition);

module.exports = router;