
const express = require('express');
const router = express.Router();

const {createUser, loginUser, follow_unfollow, getProfile, updateProfile} = require('../Controllers/userController');
const {createPost,like_removeLike, deletePost, latestIploadedPost, getPostLikedByUser, updatePost} = require('../Controllers/postController')

const { authentication, authorization } = require('../middleware/auth')

// Users APi
router.post('/user',createUser);

router.post('/login',loginUser);

router.get('/user/:userId', authentication, authorization, getProfile);

router.put('/user/:userId', authentication, authorization, updateProfile);

router.post('/user/follow_unfollow/:userId/:other_userId', authentication, authorization, follow_unfollow);



// Post Api
router.post('/post/:userId', authentication, authorization, createPost);

router.post('/post/like_removeLike/:postId/:userId', authentication, authorization, like_removeLike)

router.delete('/post/:postId/:userId', authentication, authorization, deletePost)

router.get('/post/latest_upload', authentication, latestIploadedPost);

router.get('/post/liked_by_user/:userId', authentication, authorization, getPostLikedByUser);

router.put('/post/:postId/:userId', authentication, authorization, updatePost)













//if api is invalid OR wrong URL
router.all("/*", function (req, res) {
    res.status(404).send({ status: false, msg: "The api you requested is not found" });
  });
  








module.exports = router;