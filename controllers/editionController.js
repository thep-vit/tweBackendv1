const Edition = require('../models/Edition');

exports.createEdition = async (req, res) => {
    try{

        const { ename, enumber, edesc, hov, articles } = req.body
        const newEdition = new Edition({ename, enumber, edesc, hov})

        await newEdition.save()

        for (let index = 0; index < articles.length; index++) {
            const _id = ObjectID(articles[index])
            const article = await Article.findOne({ _id })
            
            article.editionNumber = enumber
            article.edition = newEdition._id
            await article.save()
        }

        console.log(newEdition._id)
        res.status(201).send(newEdition)
    } catch (e){
        console.log(e)
        res.status(400).send({"message": `We are facing an issue in creating a new edition at this moment. Please try again later.`})
    }
}

exports.getEditionByNum = async (req, res) => {
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
            return res.status(404).send({"message":`Oops! Edition number ${req.params.number} not found! Please try again with a valid edition number!`})
        }
        res.send(editionWithAuthorNames)
    } catch(e){
        console.log(e)
        res.status(500).send({"message": `Editoin number ${req.params.number} cannot be accessed at this moment! Try again later.`})
    }
}

exports.getEditionList = async (req, res) => {
    try{
        const editionList = await Edition.find({}).sort('-createdAt')

        if(!editionList){
            return res.status(404).send({"message":"No Editions Found"})
        }

        res.send(editionList)
    } catch(e){
        console.log(e)
        res.status(400).send(e)
    }
}

exports.postHOVLink = async (req, res) => {
    try{
        const redundantEditionsCheck = await Edition.countDocuments({enumber:req.params.number})
        // console.log(redundantEditionsCheck)
        if (redundantEditionsCheck>1){
            return res.status(400).send("More than one edition's with enumber:"+req.params.enumber)
        }
        const edition = await Edition.findOne({enumber:req.params.number})
        if (!edition){
            return res.status(404).send({"message":`Edition number ${req.params.number} not found. Try again with a valid edition number.`})
        }else if(!req.body.hov){
            return res.status(420).send({"message":"No HoV link found in your response. PLease submit the form again with a valid HoV link."})
        }

        edition.hov.push(req.body.hov)
        await edition.save()
        res.send(edition)
    } catch (e){
        console.log(e)
        res.status(400).send({"message":"We are facing problems with this route at the moment. Please try again later!"})
    }
}

exports.updateEdition = async (req, res) => {
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
}