import {asyncHandler,ApiError,ApiResponse} from "../utils/index.js"
import {Like} from "../models/like.model.js"
import { isValidObjectId } from "mongoose"
import {Dislike} from "../models/dislike.model.js"

const ToogleLikeVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }
    const like=await Like.findOne({video:videoId,likedBy:req.user?._id})
   
    let tooglelike=""
    if(!like){
        const dislikevideo= await Dislike.findOne({video:videoId,dislikedBy:req.user?._id})
        if(dislikevideo){
            // console.log("disliked video is removed ")
            await Dislike.findByIdAndDelete(dislikevideo._id)
        }
        tooglelike= await Like.create({video:videoId,likedBy:req.user?._id})
        // console.log("like is produced")
    }
    else{
        tooglelike= await Like.findByIdAndDelete(like._id)
    //    console.log("like is removed ")
    }
    if(!tooglelike){
        throw new ApiError(400,"Something went wrong")
    }
    return res.status(200).json ( new ApiResponse(200,tooglelike,"toogle Like Video successfully"))
})
const ToogleLikeTweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params
    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet Id")
    }
    const like=await Like.findOne({tweet:tweetId,likedBy:req.user?._id})
   
    let tooglelike=""
    if(!like){
        const disliketweet= await Dislike.findOne({tweet:tweetId,dislikedBy:req.user?._id})
        if(disliketweet){
           
            await Dislike.findByIdAndDelete(disliketweet._id)
           
        }
        tooglelike= await Like.create({tweet:tweetId,likedBy:req.user?._id})
        
    }
    else{
        tooglelike= await Like.findByIdAndDelete(like._id)
    
    }
    if(!tooglelike){
        throw new ApiError(400,"Something went wrong")
    }
    return res.status(200).json ( new ApiResponse(200,tooglelike,"toogle Like tweet successfully"))
})
const ToogleLikeComment=asyncHandler(async(req,res)=>{
    const {CommentId}=req.params
    if(!CommentId || !isValidObjectId(CommentId)){
        throw new ApiError(400,"Invalid Comment Id")
    }
    const like=await Like.findOne({comment:CommentId,likedBy:req.user?._id})
   
    let tooglelike=""
    if(!like){
        const dislikeComment= await Dislike.findOne({comment:CommentId,dislikedBy:req.user?._id})
        if(dislikeComment){
            // console.log("disliked Comment is removed ")
            await Dislike.findByIdAndDelete(dislikeComment._id)
        }
        tooglelike= await Like.create({comment:CommentId,likedBy:req.user?._id})
        // console.log("like is produced")
    }
    else{
        tooglelike= await Like.findByIdAndDelete(like._id)
    //    console.log("like is removed ")
    }
    if(!tooglelike){
        throw new ApiError(400,"Something went wrong")
    }
    return res.status(200).json ( new ApiResponse(200,tooglelike,"toogle Like Comment successfully"))
})

export {
    ToogleLikeVideo,
    ToogleLikeTweet,
    ToogleLikeComment
}