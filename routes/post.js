const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin  = require('../middleware/requireLogin')
const Post =  mongoose.model("Post")

router.post('/createpost',requireLogin, (req,res)=>{
    const {heading,place,body,pic} = req.body 
    if(!heading || !body || !place || !pic){
      return  res.json({error:"Plase add all the fields"})
    }
    // req.user.password = undefined
    const post = new Post({
        heading,
        place,
        body,
        pic,
        postedBy:req.user,
        postedOn: new Date()
    })
    post.save().then(result=>{
        res.json({post:result})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get('/allPosts',requireLogin, (req, res) => {
    Post.find()
        .populate("postedBy")
        .populate("comments.postedBy")
        .then((posts) => {
            res.json({"all_posts": posts})
        })
        .catch(err => {
            res.json({Error: err})
        })
})

router.get('/myPosts',requireLogin,(req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("postedBy")
    .populate("comments.postedBy")
    .then(mypost=>{
        res.json({"my_posts":mypost})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.put('/comments',requireLogin,(req, res) => {
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
        $push: {comments: comment}
    }, {
        new: true,
    })
    .populate("comments.postedBy")
    .exec((err, result) => {
        if(err){
            return err.status(422).json({Error: err})
        } else {
            res.json(result);
        }
    })
    
})

router.get('/post/:postId',(req, res)=>{
    Post.find({_id:req.params.postId})
    .populate("postedBy")
    .populate("comments.postedBy")
    .then(mypost=>{
        res.json({"this_post":mypost})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.put('/reaction', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: {disagreed: req.user._id, neutral: req.user._id, agreed: req.user._id},
    }, {
        new: true
    }).exec();
    if(req.body.reaction === 'agree'){
        
        Post.findByIdAndUpdate(req.body.postId, {
            $pull: {disagreed: req.user._id, neutral: req.user._id},
            $push: {agreed: req.user._id},
        }, {
            new: true
        }).populate("postedBy")
        .exec((err, result) => {
            if(err){
                return res.status(422).json({error: err})
            } else {
                res.json(result);
            }
        })
    } else if(req.body.reaction === 'disagree'){
        Post.findByIdAndUpdate(req.body.postId, {
            $pull: {neutral: req.user._id, agreed: req.user._id},
            $push: {disagreed: req.user._id},
        }, {
            new: true
        }).populate("postedBy")
        .exec((err, result) => {
            if(err){
                return res.status(422).json({error: err})
            } else {
                res.json(result);
            }
        })
    } else if(req.body.reaction === 'neutral'){
        Post.findByIdAndUpdate(req.body.postId, {
            $pull: {disagreed: req.user._id, agreed: req.user._id},
            $push: {neutral: req.user._id},
        }, {
            new: true
        }).populate("postedBy")
        .exec((err, result) => {
            if(err){
                return res.status(422).json({error: err})
            } else {
                res.json(result);
            }
        })
    } else {
        return res.json({Error: `errrrror ${req.body.postId}`})
    }
    
})

router.delete('/deletepost/:postId', requireLogin, (req, res) => {
    Post.findByIdAndRemove(req.params.postId, {
        new: true
    })
    .populate("postedBy")
    .exec((err, result) => {
        if(err){
            return res.status(422).json({error: err})
        } else {
            res.json(result);
        }
    })
})

router.put('/deleteComment/:commentId', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: {comments: {_id: req.body.commentId}}
    }, {
        new: true
    }).populate("comments.postedBy")
    .exec((err, result) => {
        if(err){
            return res.status(422).json({error: err})
        } else {
            res.json(result);
        }
    })
})

router.get('/getsubpost',requireLogin,(req,res)=>{

    // if postedBy in following
    Post.find({postedBy:{$in:req.user.following}})
    .populate("postedBy")
    .populate("comments.postedBy")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get('/related/:place', (req, res) => {
    Post.find({place: req.params.place})
    .populate("postedBy", "_id userName")
    .limit(3)
    .then(posts=>{
        res.json({"related":posts})
    })
    .catch(err=>{
        res.json({Error: err})
    })
})
module.exports = router