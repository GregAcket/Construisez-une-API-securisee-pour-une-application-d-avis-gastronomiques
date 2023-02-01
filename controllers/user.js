const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const passwordValidator = require('password-validator');
const validator = require('validator');

const User = require('../models/User')

exports.signup = (req, res, next) => {

    let schema = new passwordValidator ()
            .is().min(8)
            .has().uppercase()
            .has().lowercase()
            .has().digits()

    let validPassword = schema.validate(req.body.password)
    let validMail = validator.isEmail(req.body.email)

        if (validMail == true && validPassword == true) {

            bcrypt.hash(req.body.password, 10)
            .then(hash => {
                const user = new User({
                    email: req.body.email,
                    password: hash
                })
                user.save()
                    .then(() => res.status(201).json({ message: 'Utilisateur crée'}))
                    .catch(error => res.status(400).json({ error }))
            })
            .catch(error => res.status(500).json({ error }))

        } else {
            res.status(400).json({ message : 'email ou mot de passe invalides' })
        }
}

exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})
    .then(user => {
        if (user === null) {
            res.status(401).json({ message: 'Identifiant ou mot de passe incorrect'})
        } else {
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid) {
                    res.status(401).json({ message: 'Identifiant ou mot de passe incorrect'})
                } else {
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            {userId: user._id},
                            process.env.TOKEN,
                            { expiresIn: '24h'}
                        )
                    })
                }
            })
            .catch(error => res.status(500).json({ error }))
        }
    })
    .catch(error => res.status(500).json({ error }))
}