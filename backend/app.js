const express = require('express');
const app = express();
const bodyparser = require('body-parser');
app.use(express.json());
const mongoose = require('mongoose');
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
mongoose.connect('mongodb+srv://ines:Anis.omri@cluster0.ebwhiej.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });
  app.use(bodyparser.json());
  app.use('/api/sauces', sauceRoutes);
  app.use('/api/auth', userRoutes);
module.exports = app;