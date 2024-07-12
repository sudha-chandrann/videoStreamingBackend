import {asyncHandler,ApiError,ApiResponse} from "../utils/index.js"
import {Like} from "../models/like.model.js"
import { isValidObjectId } from "mongoose"
import {Dislike} from "../models/dislike.model.js"
import {Video} from "../models/video.model.js"

const ToogleDislikeVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }

    const video= await Video.findById({isPublished:true,video:videoId});
    if(!video){
        throw new ApiError(404,"Video Not Found")
    }
    if(req.user?._id.toString() ===  video.owner.toString()){
        throw new ApiError(400," you can't dislike your own video")
    }


    const dislike=await Dislike.findOne({video:videoId,dislikedBy:req.user?._id})
   
    let toogledislike=""
    if(!dislike){
        const likevideo= await Like.findOne({video:videoId,likedBy:req.user?._id})
        if(likevideo){
            // console.log("liked video is removed ")
            await Like.findByIdAndDelete(likevideo._id)
        }
        toogledislike= await Dislike.create({video:videoId,dislikedBy:req.user?._id})
        // console.log("dislike is produced")
    }
    else{
        toogledislike= await Dislike.findByIdAndDelete(dislike._id)
    //    console.log("dislike is removed ")
    }
    if(!toogledislike){
        throw new ApiError(400,"Something went wrong")
    }
    return res.status(200).json ( new ApiResponse(200,toogledislike,"toogle dislike Video successfully"))
})

const ToogleDislikeTweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params
    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet Id")
    }
    const tweet= await Video.findById(tweetId);
    if(!tweet){
        throw new ApiError(404,"tweet Not Found")
    }
    if(req.user?._id.toString() ===  tweet.owner.toString()){
        throw new ApiError(400," you can't dislike your own tweet")
    }



    const dislike=await Dislike.findOne({tweet:tweetId,dislikedBy:req.user?._id})
   
    let toogledislike=""
    if(!dislike){
        const liketweet= await Like.findOne({tweet:tweetId,likedBy:req.user?._id})
        if(liketweet){
            // console.log("liked tweet is removed ")
            await Like.findByIdAndDelete(liketweet._id)
        }
        toogledislike= await Dislike.create({tweet:tweetId,dislikedBy:req.user?._id})
        // console.log("dislike is produced")
    }
    else{
        toogledislike= await Dislike.findByIdAndDelete(dislike._id)
    //    console.log("dislike is removed ")
    }
    if(!toogledislike){
        throw new ApiError(400,"Something went wrong")
    }
    return res.status(200).json ( new ApiResponse(200,toogledislike,"toogle Dislike tweet successfully"))
})

const ToogledislikeComment=asyncHandler(async(req,res)=>{
    const {CommentId}=req.params
    if(!CommentId || !isValidObjectId(CommentId)){
        throw new ApiError(400,"Invalid Comment Id")
    }
    const comment= await Video.findById(CommentId);
    if(!comment){
        throw new ApiError(404,"comment Not Found")
    }
    if(req.user?._id.toString() ===  comment.owner.toString()){
        throw new ApiError(400," you can't dislike your own comment")
    }


    const dislike=await Dislike.findOne({comment:CommentId,dislikedBy:req.user?._id})
   
    let toogledislike=""
    if(!dislike){
        const likeComment= await Like.findOne({comment:CommentId,likedBy:req.user?._id})
        if(likeComment){
            // console.log("liked Comment is found ")
            await Like.findByIdAndDelete(likeComment._id)
            // console.log("liked Comment is removed ")
        }
        toogledislike= await Dislike.create({comment:CommentId,dislikedBy:req.user?._id})
        // console.log("dislike is produced")
    }
    else{
        toogledislike= await Dislike.findByIdAndDelete(dislike._id)
    //    console.log("like is removed ")
    }
    if(!toogledislike){
        throw new ApiError(400,"Something went wrong")
    }
    return res.status(200).json ( new ApiResponse(200,toogledislike,"toogle disike Comment successfully"))
})

export {
    ToogleDislikeTweet,
    ToogledislikeComment,
    ToogleDislikeVideo
}