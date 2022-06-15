const Sauce = require('../models/sauce');
const jwt = require('jsonwebtoken');

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
                
                // ca manque des reajustements
                Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
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
                Sauce.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
                .catch(error => res.status(400).json({ message : error.message }));
            }
        }
    })
    .catch(error => res.status(400).json({ message : error.message }));
  }


exports.createSauce = (req, res, next) => {
    delete req.body._id;

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;

    const sauce = new Sauce({
      ...req.body,
      userId: userId
      
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ message : error.message }));
  }


