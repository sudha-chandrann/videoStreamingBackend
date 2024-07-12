import {asyncHandler,ApiError,ApiResponse} from "../utils/index.js"
import {Like} from "../models/like.model.js"
import mongoose, { isValidObjectId } from "mongoose"
import {Dislike} from "../models/dislike.model.js"
import {Video} from "../models/video.model.js"

const ToogleLikeVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }
    const video= await Video.findById({video:videoId,isPublished:true});
    if(!video){
        throw new ApiError(404,"Video Not Found")
    }
    if(req.user?._id.toString() ===  video.owner.toString()){
        throw new ApiError(400," you can't like your own video")
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
    const tweet= await Video.findById(tweetId);
    if(!tweet){
        throw new ApiError(404,"tweet Not Found")
    }
    if(req.user?._id.toString() ===  tweet.owner.toString()){
        throw new ApiError(400," you can't like your own tweet")
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
    const comment= await Video.findById(CommentId);
    if(!comment){
        throw new ApiError(404,"comment Not Found")
    }
    if(req.user?._id.toString() ===  comment.owner.toString()){
        throw new ApiError(400," you can't like your own comment")
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
const getlikesvideos=asyncHandler(async(req,res)=>{
    try{
     
    const likedvideos=await Like.aggregate([
        {
          $match: {
            likedBy:new mongoose.Types.ObjectId(req.user?._id)
          }
        },
        
        {
          $lookup: {
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "likedvideos",
            pipeline:[
                {
                 $lookup:{
                   from:"users",
                   localField: "owner",
                   foreignField: "_id",
                   as: "channel",
                 }
               },
               {
                 $addFields:{
                   owner_username:{
                     $arrayElemAt:["$channel.username",0]
                   },
                 
                 }
               }
             ]

          }
        },
        {
          $addFields: {
            likedVideosSize: {
              $size:"$likedvideos"
            },
            ispublished:{
                $arrayElemAt:["$likedvideos.isPublished",0]
             }
          }
        },
        {
          $match: {
            likedVideosSize:1
          }
        },
        {
            $match: {
                ispublished :true
            }
          },
        {
          $addFields: {
            videofile:{
              $arrayElemAt:["$likedvideos.videofile",0]
            },
            thumbnail:{
             $arrayElemAt:["$likedvideos.thumbnail",0]
            },
            duration:{
               $arrayElemAt:["$likedvideos.duration",0]
            },
            views:{
            $arrayElemAt:["$likedvideos.views",0]
            },
            updatedAt:{
                $arrayElemAt:["$likedvideos.updatedAt",0]
            },
            title:{   
              $arrayElemAt:["$likedvideos.title",0]
            },
            channel_name:{
              $arrayElemAt:["$likedvideos.owner_username",0]
            },
            channel_id:{
              $arrayElemAt:["$likedvideos.owner",0]
            },
            postCount: { $size: '$likedvideos' }
          }
        },
        {
          $project: {
            videofile:1,
            thumbnail:1,
            duration:1,
            views:1,
            updatedAt:1,
            title:1,
            video:1,
            channel_name:1,
            channel_id:1,
            postCount:1
            
          }
        }
      ])
    const nooflikedvideos=await Like.aggregate([
        {
          $match: {
            likedBy: new mongoose.Types.ObjectId(req.user?._id)
          }
        },
        {
          $match: {
            video:{$exists:true}
          }
        },
        {
          $lookup: {
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "likedvideos",
          }
        },
        {
          $addFields: {
            ispublished:{
               $arrayElemAt:["$likedvideos.isPublished",0]
            }
          }
        },
        {
          $match: {
            ispublished:true
          }
        },
        {
          $count: 'likedvideosCount'
        }
        
        
      ])
     if(!likedvideos){
        throw new ApiError(500,"something went wrong during fetching the liked videos")
     }
     return res.status(200).json(
        new ApiResponse(200,{likedVideosCount:nooflikedvideos[0].likedvideosCount,likedVideos:likedvideos},"liked videos fetched Successfully")
     )
    }catch(err){
        throw new ApiError(400,err.message ||"Something went wrong")
    }
})

export {
    ToogleLikeVideo,
    ToogleLikeTweet,
    ToogleLikeComment,
    getlikesvideos
}