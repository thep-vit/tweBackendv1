const Edition = require('../models/edition');

exports.getEditionBasic = async (req, res) => {
    const foundEditions = await Edition.find();

    if(foundEditions){
        res.status(200).send(foundEditions);
    }
}

