const Sauce = require ('../models/Sauce')
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id
    delete sauceObject.userId
    delete sauceObject.likes
    delete sauceObject.dislikes
    delete sauceObject.usersLiked
    delete sauceObject.usersDisliked

    const sauce = new Sauce({
        ...sauceObject,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    sauce.save()
    .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
    .then(sauce => {
        if (sauce.userId != req.auth.userId) {
            res.status(403).json({message: 'Non autorisé'});
        } else {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                .catch(error => res.status(400).json({ error }));
            });
        }
    })
    .catch( error => {
        res.status(500).json({ error });
    });
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body}

    delete sauceObject._userId
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
        if (sauce.userId != req.auth.userId) {
            res.status(403).json({ message: 'Non autorisé'})
        } else {
            const filename = sauce.imageUrl.split('/images/')[1]
            fs.unlink(`images/${filename}`, () => {
                Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
                .then(() => res.status(200).json({ message: 'Objet modifié'}))
                .catch(error => res.status(400).json({ error }))
            })
        }
    })
    .catch((error) => {res.status(400).json({ error })})
}

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }))
}

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }))
}

exports.likeSauce = (req, res, next) => {

    let like = JSON.parse(req.body.like)
    Sauce.findOne({_id: req.params.id})

    .then((sauce) => {

        let likeArray = sauce.usersLiked
        let dislikeArray = sauce.usersDisliked

        if (like === 1) {
            if (likeArray.includes(req.auth.userId))  {
                res.status(400).json({message : 'Vous ne pouvez liker qu\'une fois par sauce'})
            
            } else {
                likeArray.push(req.auth.userId)
                sauce.likes = likeArray.length

                sauce.save()
                .then(() => { res.status(201).json({message: 'Sauce liked'})})
                .catch(error => { res.status(400).json( { error })})
            }
        }

        if (like === -1) {

            if (dislikeArray.includes(req.auth.userId))  {
                res.status(400).json({message : 'Vous ne pouvez disliker qu\'une fois par sauce'})
            
            } else {

                dislikeArray.push(req.auth.userId)
                sauce.dislikes = dislikeArray.length

                sauce.save()
                .then(() => { res.status(201).json({message: 'Sauce disliked'})})
                .catch(error => { res.status(400).json( { error })})
            }
        }
    

        if (like === 0) {
            let checkArray = likeArray.includes(req.auth.userId)

            if (checkArray === true) {

                let likeIndex = likeArray.indexOf(req.auth.userId)
                likeArray.splice(likeIndex,1)
                sauce.likes = likeArray.length
                
                sauce.save()
                .then(() => { res.status(201).json({message: 'Sauce unliked'})})
                .catch(error => { res.status(400).json( { error })})

            } else {

                let dislikeIndex = dislikeArray.indexOf(req.auth.userId)
                dislikeArray.splice(dislikeIndex,1)
                sauce.dislikes = dislikeArray.length

                sauce.save()
                .then(() => { res.status(201).json({message: 'Sauce unliked'})})
                .catch(error => { res.status(400).json( { error })})
            }        
        }
    })

    .catch(error => res.status(400).json({ error }))
}