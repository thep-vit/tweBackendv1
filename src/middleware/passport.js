const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../models/User');

passportFunction = function(passport) {
  passport.use(
    new LocalStrategy(async (email, password, done) => {
    
        try{

            const foundUser = await User.findOne( { email })

            if(!foundUser){
                console.log("Passport Auth Failed: No Such User Email Registered")
                return done(null, false, { message: 'That email is not registered' });
            }

            const isMatch = bcrypt.compare(password,foundUser.password)

            if(!isMatch) {
                return done(null, false, { message: 'Password incorrect' })
            }

            return done(null, foundUser)



        } catch (e) {
            console.log("Passport Auth Failed! : ",e)
        }

    })
  );
  
  // console.log("user before serialise:",user)
  passport.serializeUser(function(foundUser, done) {
    done(null, foundUser._id);
  });

  passport.deserializeUser(async function(id, done) {
    try {
        foundUser = await User.findOne({ _id:id })
        done(err, foundUser);
    } catch (e) {
        console.log("Passport Auth Failed: De-serialize Failed")
    }

  });
};

module.exports = passportFunction