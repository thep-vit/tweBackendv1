const User = require('../models/User');

exports.onboarding = async (req, res) => {
    const user = req.user;
    try {
        const foundUser = await User.findOne({ email: user.email });

        if(foundUser){
            foundUser.onboarding = true;
            await foundUser.save();

            res.send(foundUser).status(200);
        }

        res.status(404).send({"error": "Oops! No user is associated with that email address!"});
    } catch (error) {
        res.status(500).send(error)
    }
}

exports.isOnboarded = async (req, res) => {
    const user = req.user;

    try {
        const foundUser = await User.findOne({email: user.email})
        
        if(foundUser){
            res.status(200).send(foundUser.onboarding)
        }
        res.status(404).send({"error": "Oops! No user with that email address was found! Please try again with a different email address."});
    } catch (error) {
        res.status(500).send(error)
    }
}