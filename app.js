const express = require ('express')
const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors')

const helmet = require("helmet");
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const sauceRoutes = require('./routes/sauce')
const userRoutes = require('./routes/user')
const path = require('path');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:100
})

const app = express()

mongoose.connect(`${process.env.DATABASE}`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

mongoose.plugin(mongodbErrorHandler)

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(helmet.permittedCrossDomainPolicies({
  permittedPolicies: "all",
}));
app.use(limiter)
app.use('/api/sauces', sauceRoutes)
app.use('/api/auth', userRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app