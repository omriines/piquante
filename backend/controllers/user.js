const User = require('../models/user');
const bcrypt= require('bcrypt');
const jwt = require('jsonwebtoken');

const { encrypt, decrypt } = require('../utils/emailCrypto');
exports.signup = (req, res, next) => {
   
  const emailCryptoJs = encrypt(req.body.email);
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: emailCryptoJs,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ message : error.message }));
      })
      .catch(error => res.status(500).json({ message : error.message }));
  };

  exports.login = (req, res, next) => {

    const emailCryptoJs = encrypt(req.body.email);
    User.findOne({ email: emailCryptoJs })
      .then(user => {
        if (!user) {
          return res.status(401).json({ message: 'Utilisateur non trouvé !' });
        }
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ message: 'Mot de passe incorrect !' });
            }
            res.status(200).json({
              userId: user._id,
              email: decrypt(user.email),
              token: jwt.sign(
                { userId: user._id },
                process.env.JWT_TOKEN_KEY,
                { expiresIn: '24h' }
              )
            });
          })
          .catch(error => res.status(500).json({ message : error.message }));
      })
      .catch(error => res.status(500).json({ message : error.message }));
  };