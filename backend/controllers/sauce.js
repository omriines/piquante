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
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      userId : userId
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ message : error.message }));
  }

exports.rateSauce = (req, res, next) => {

  let like = req.body.like;
  let userId = req.body.userId;
  let sauceId = req.params.id;

  switch(like){
    case 1:
    // liker 

    Sauce.updateOne({_id: sauceId},{$inc : {likes:+1}, $push :{usersLiked : userId}})
    .then(()=> res.status(200).json({message:" sauce likée"}))
    .catch(error => res.status(400).json({message : error.message}));

    break;
    case 0:
    // neutre

    Sauce.findOne({_id : sauceId})
    .then((sauce)=> {
     
      if (sauce.usersLiked.includes(userId)){
        Sauce.updateOne({_id: sauceId},{$inc : {likes:-1}, $pull :{usersLiked : userId}})
        .then(()=> res.status(200).json({message:" choix neutre"}))
        .catch(error => res.status(400).json({message: error.message}));
      }
      if (sauce.usersDisliked.includes(userId)){
        Sauce.updateOne({_id: sauceId},{$inc : {dislikes:-1}, $pull :{usersDisliked : userId}})
        .then(()=> res.status(200).json({message:" choix neutre"}))
        .catch(error => res.status(400).json({message: error.message}));
      }
    })
    .catch(error => res.status(404).json({message: error.messag}));

    break;
    case -1:
    // disliker

    Sauce.updateOne({_id: sauceId},{$inc : {dislikes:+1}, $push :{usersDisliked : userId}})
    .then(()=> res.status(200).json({message:" sauce dislikée"}))
    .catch(error => res.status(400).json({message: error.message}));

    break;
  }



}


