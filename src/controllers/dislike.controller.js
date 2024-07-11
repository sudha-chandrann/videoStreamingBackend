import {asyncHandler,ApiError,ApiResponse} from "../utils/index.js"
import {Like} from "../models/like.model.js"
import { isValidObjectId } from "mongoose"
import {Dislike} from "../models/dislike.model.js"

const ToogleDislikeVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
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
    const dislike=await dislike.findOne({comment:CommentId,dislikedBy:req.user?._id})
   
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
        toogledislike= await dislike.findByIdAndDelete(dislike._id)
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