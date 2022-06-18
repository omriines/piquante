const Sauce = require('../models/sauce');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const sauce = require('../models/sauce');
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(400).json({ message : error.message }));
  }
  exports.getAllSauce = (req, res, next) => {
    Sauce.find()
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({ message : error.message }));
  }

  exports.modifySauce = (req, res, next) => {

    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        // sauce à mettre à jour 
        if(!sauce){
            res.status(404).json({ message : "Sauce introuvable !" });
        }
        else{
            // verifier que l'utilisateur qui à creer la sauce et celui qui est entrain de modifier
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
            const userId = decodedToken.userId;
            if(sauce.userId !== userId){
                res.status(403).json({ message : "Action non autorisée !" })
            }
            else {
                const sauceObject = req.file ?
                    {
                    ...JSON.parse(req.body.sauce),
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                    } : { ...req.body };
                // ca manque des reajustements
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Objet modifié !'}))
                .catch(error => res.status(400).json({ message : error.message }));
            }
        }
    })
    .catch(error => res.status(400).json({ message : error.message }));
  }

  
  exports.deleteSauce = (req, res, next) => {

    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        // sauce à mettre à jour 
        if(!sauce){
            res.status(404).json({ message : "Sauce introuvable !" });
        }
        else{
            // verifier que l'utilisateur qui à creer la sauce et celui qui est entrain de modifier
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
            const userId = decodedToken.userId;
            if(sauce.userId !== userId){
                res.status(403).json({ message : "Action non autorisée !" })
            }
            else {
                
                // ca manque des reajustements
                Sauce.findOne({ _id: req.params.id })
                .then(sauce => {
                  const filename = sauce.imageUrl.split('/images/')[1];
                  fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                      .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
                      .catch(error => res.status(400).json({ error }));
                  });
                })
                .catch(error => res.status(500).json({ error }));
            }
        }
    })
    .catch(error => res.status(400).json({ message : error.message }));
  }


exports.createSauce = (req, res, next) => {

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;

    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ message : error.message }));
  }

exports.rateSauce = (req, res, next) => {
  Sauce.findOne({_id : req.params.id})
  .then((sauce)=> {
    if(!sauce.userLiked.includes(req.body.userId)&& (req.body.like===1)){
     Sauce.updateOne({_id: req.params.id},{$inc : {likes:+1}, $push :{userLiked : req.body.userId}})
     .then(()=> res.status(200).json({message:" sauce likée"}))
     .catch(error => res.status(400).json({error}));
    } else if (sauce.userLiked.includes(req.body.userId) && req.body.like===0){
      Sauce.updateOne({_id: req.params.id},{$inc : {likes:-1}, $pull :{userLiked : req.body.userId}})
      .then(()=> res.status(200).json({message:" choix neutre"}))
      .catch(error => res.status(400).json({error}));
    } else if (!sauce.userDisliked.includes(req.body.userId)&& (req.body.like=== -1)){
      Sauce.updateOne({_id: req.params.id},{$inc : {dislikes:+1}, $push :{userDisliked : req.body.userId}})
      .then(()=> res.status(200).json({message:" sauce dislikée"}))
      .catch(error => res.status(400).json({error}));
    } else if (sauce.userDisliked.includes(req.body.userId) && req.body.like===0){
      Sauce.updateOne({_id: req.params.id},{$inc : {dislikes:-1}, $pull :{userDisliked : req.body.userId}})
      .then(()=> res.status(200).json({message:" choix neutre"}))
      .catch(error => res.status(400).json({error}));
    }
  })
  .catch(error => res.status(404).json({error}));
}


