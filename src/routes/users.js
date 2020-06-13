const express = require("express")
const User = require("../models/users")
const { forwardAuth } = require("../middleware/auth")

const router = express.Router()


// //Register Page
// router.get('/register', (req, res) => res.render('register'));

// // Login Page
// router.get('/login', (req, res) => res.render('login'));

// // Login
// router.post('/login', (req, res, next) => {
//     passport.authenticate('local', {
//       successRedirect: '/dashboard',
//       failureRedirect: '/users/login',
//       failureFlash: true
//     })(req, res, next);
//   });
  

// Create Account
router.post("/register", async (req,res) => {
    const newUser = new User(req.body)
    try{
        console.log("Here1")
        await newUser.save()
        // const token = await newUser.generateToken()

        // res.cookie('auth_token', token)
        // res.sendFile(path.resolve(__dirname, '..', 'views', 'private.html'))

        res.status(201).send({newUser})
        // console.log("S")
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

// Login


module.exports = router