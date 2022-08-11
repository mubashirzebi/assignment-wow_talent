const postModel = require('../Models/postModel');

const userModel = require('../Models/userModel')

const { uploadFile } = require('../Controllers/awsUpload');

const { isValid, isValidPassword, isValidRequestBody, isValidMobileNumber, isValidEmail, isValidProfile, isValidGender, isValidObjectId } = require('../Validations/validation')


const createPost = async function (req, res) {

    try {

        let data = req.body;
        let user_id = req.params.userId
        const files = req.files
        const {status} = req.body

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please Provide Input Data for Creating Post" });
        }

        if(!isValidObjectId(user_id)){
            return res.status(400).send({ status: false, message: "Please Provide valid user id" });
     
        }

        if(!isValidProfile(status)){
            return res.status(400).send({ status: false, message: "status required , Private or Public" });
        }

        str = []

        for (let i = 0; i < files.length; i++) {
            let media = await uploadFile(files[i]);
            str.push(media)
        }
        data.imagesOrVideos = str;
        data.userId = user_id;

        const create = await postModel.create(data);

        if (create) {
            const add_post_in_user = await userModel.findByIdAndUpdate(
                { _id: user_id },
                {
                    $push: { post_created: { postId: create._id.toString() } },
                    $inc: { post_count: 1 }
                }
            )
        }

        res.status(201).send({ status: true, messsge: "Post Created", data: create });

    }

    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, error: error.message });
    }
}

///////////////////////////////////////////////////////////////////////////////////////
const like_removeLike = async function (req, res) {

    try {

        const user_id = req.params.userId;
        const post_id = req.params.postId;

        const userIsExist = await userModel.findOne({ _id: user_id })

        if (!userIsExist) {
            return res.status(404).send({ status: false, message: `User does not exist` });

        };

        const postIsExist = await postModel.findOne({ _id: post_id , status : "public"});
        if (!postIsExist) {
            return res.status(404).send({ status: false, message: `Post does not exist` });
        }

        const { like } = postIsExist;

        for (let i = 0; i < like.length; i++) {

            if (like[i].userId.toString() == user_id) {
                const removeLike = await postModel.findByIdAndUpdate(
                    { _id: post_id },
                    {
                        $pull: { like: { userId: user_id } },
                        $inc: { like_count: -1 }
                    },
                    { new: true }
                );

                const remove_like_from_user = await userModel.findByIdAndUpdate(
                    { _id: user_id },
                    {
                        $pull: { post_Liked: { postId: post_id } }
                    },
                    { new: true }
                )

                return res.status(200).send({ status: true, message: 'sucessfully Remove Like', data: removeLike })
            }
        }


        const liked = await postModel.findByIdAndUpdate(
            { _id: post_id },
            {
                $push: { like: { userId: user_id } },
                $inc: { like_count: 1 }
            },
            { new: true }
        );

        const add_likePost_in_user = await userModel.findByIdAndUpdate(
            { _id: user_id },
            {
                $push: { post_Liked: { postId: post_id } }
            }
        );

        return res.status(200).send({ status: true, message: 'Successfully Liked the post', data: liked })

    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, error: error.message });
    }
}

///////////////////////////////////////////////////////////////////////////////

const deletePost = async function (req, res) {

    try {


        const post_id = req.params.postId;

        const isPostExist = await postModel.findOne({ _id: post_id });

        if (!isPostExist) {
            return res.status(404).send({ status: false, message: `Post does not exist` });

        }

        const user_id = isPostExist?.userId.toString()
        const softDelete = await postModel.findByIdAndUpdate(
            { _id: post_id },
            { $set: { isDeleted: true } },
            { new: true }
        );

        const userDetails = await userModel.findById({ _id: user_id });
        const { post_created, post_count } = userDetails;

        for (let i = 0; i < post_created.length; i++) {

            if (post_created[i].postId == post_id) {

                const delete_post_from_user = await userModel.findByIdAndUpdate(
                    { _id: user_id },
                    {
                        $pull: { post_created: { postId: post_id } },
                        $inc: { post_count: -1 }
                    }
                )

            }
        }


        return res.status(200).send({ status: true, message: 'Successfully Deleted the post', data: softDelete })
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, error: error.message });
    }


}

/////////////////////////////////////////////////////////////////////////////////////////

const latestIploadedPost = async function (req, res) {
    try {

        const page_no = req.query.page_no
        const post = await postModel.find({status:"public"}).sort({ createdAt: -1 }).skip(10 * page_no).limit(10)

        return res.status(200).send({ status: true, message: 'Successfully get all post', data: post })

    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, error: error.message });
    }

}

////////////////////////////////////////////////////////////////////////////////

const getPostLikedByUser = async function (req, res) {
    try {

        const user_id = req.params.userId;
        const page_no = req.query.page_no;
         
        const post_liked_by_user = await postModel.find({"like.userId":user_id, status:"public", $not:{userId: user_id}}).sort({ createdAt: -1 }).skip(10 * page_no).limit(10)

        if(post_liked_by_user.length == 0){
            return res.status(200).send({ status: true, message: 'No post is liked by this User', data: post_liked_by_user })
        }

        return res.status(200).send({ status: true, message: 'Successfully get all post liked by user', data: post_liked_by_user })
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, error: error.message });
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

const updatePost = async function(req, res){
    try{
        const user_id = req.params.userId;
        const post_id = req.params.postId;
        const {text, status} = req.body
        if(!isValidObjectId(post_id)){
            return res.status(400).send({ status: false, message: "Please Provide valid post id" });   
        }

        if(!isValidRequestBody(req.body)){
            return res.status(400).send({ status: false, message: "Body can not be empty while updation" });
        }

        if(text && !isValid(text)){
            return res.status(400).send({ status: false, message: "Please Provide valid string" });
        }

        if(status && !isValidProfile(status)){
            return res.status(400).send({ status: false, message: "Please Provide valid status, private or public" });
        }

        const postExist = await postModel.findOne({_id: post_id, isDeleted :false});

        if(!postExist){
            return res.status(404).send({ status: false, message: "Post does not exist" });
     
        }
        if(postExist.userId.toString() !== user_id){
            return res.status(403).send({ status: false, message: "Unauthorised Access" });
        }

        const update_post = await postModel.findByIdAndUpdate(
            {_id : post_id},
            {
                $set : {status:status, text:text}
            },
            {new : true}
        );

        return res.status(200).send({status : true, data : update_post});

    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, error: error.message });
    }
}

module.exports = { createPost, like_removeLike, deletePost, latestIploadedPost, getPostLikedByUser, updatePost }

