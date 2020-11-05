const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const keys = require('../config/keys');
const User = mongoose.model("User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config/keys');
const requiredLogin = require('../middleWare/requireLogin')


router.post('/signUp',(req, res) => {
    const {fullName, userName, email, password} = req.body;
    if(!email || !password || !fullName || !userName ){
        return res.json({error: "ADD ALL FIELDS PLZ"})
    }
   User.findOne({email: email})
    .then((emailUser) => {
        if(emailUser){
            return res.json({error: "Email exists"})
        }
        User.findOne({userName: userName})
            .then((nameUser) => {
                if(nameUser){
                    return res.json({error: "Username Exists"})
                }
                bcrypt.hash(password,12)
                    .then(hashedPassword => {
                        const user = new User({
                            fullName,
                            userName,
                            email,
                            password: hashedPassword
                        })
                        user.save()
                            .then(() => {
                                res.json({message: "User Added Successfully"})
                            })
                            .catch(err => {
                                res.json({error: "Sorry We got into sum problem"})
                            })
                    })
                

            })
            .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

router.post('/logIn', (req, res) => {
    const {id, password} = req.body;
    if(!id){
        res.json({error: `Please enter email or username ${id}`})
    }
    if(!password){
        res.json({error: "Please enter Password"})
    }
    User.findOne({email: id})
        .then((emailUser) => {
            if(!emailUser){
                User.findOne({userName: id})
                    .then((nameUser) => {
                        if(nameUser){
                            bcrypt.compare(password, nameUser.password)
                                .then((doMatch) => {
                                    if(doMatch){
                                        const token = jwt.sign({_id: nameUser._id}, JWT_SECRET)
                                        const {fullName,userName, email, password, _id, followers, followings} = nameUser
                                        res.json({token,user:{fullName,userName, email, password, _id, followers, followings}, message:"User logged in successfully" })
                                        // res.json({message: "User logged in successfully", Tokem: token})
                                    } else {
                                        res.json({error: "Password enterrd is wrong"})
                                    }
                                })
                                .catch((err) => {
                                    res.json({error: err})
                                })
                        } else {
                            res.json({error: "Sorry, we can't find any account with this username and password"})
                        }
                    })
                    .catch(err => res.json({error:" err"}))
            } else {
                bcrypt.compare(password, emailUser.password)
                    .then((doMatch) => {
                        if(doMatch){
                            const token = jwt.sign({_id: emailUser._id}, JWT_SECRET)
                            const {fullName,userName, email, password, _id, followers, followings} = emailUser
                            res.json({token,user:{fullName,userName, email, password, _id, followers, followings}, message: "User logged in successfully"})
                        } else {
                            res.json({error: "Password enterrd is wrong"})
                        }
                    })
                    .catch(err => {
                        res.json({error: err})
                    })
            }
        }) 
        .catch(err => res.json({error: err}))
})

router.get('/protected', requiredLogin, (req, res) => {
    res.send("Hello World");
})
module.exports = router;