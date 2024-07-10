import {asyncHandler,ApiError,ApiResponse} from "../utils/index.js"
import { Tweet } from "../models/tweet.model.js"
import mongoose, { isValidObjectId } from "mongoose"

const postTweet=asyncHandler(async(req,res)=>{
    try{
        const {content}=req.body
    if(!content){
        throw new ApiError(400,"Please provide a content")
    }
    const tweet=await Tweet.create({
        content,
        owner:req.user?._id
    })
    if(!tweet){
        throw new ApiError(500,"Unable to create tweet")
    }
    return res.status(201).json(
         new ApiResponse(201,{_id:tweet._id},"Tweet created successfully")
    )
    }
    catch(error){
        return res.status(500).json(new ApiResponse(400,{},"something went wrong during posting the tweet"))
    }

})
const deleteTweet=asyncHandler(async(req,res)=>{
    try{
          const {tweetId}=req.params;
          if(!tweetId){
            throw new ApiError(400,"Please provide a tweet id")
          }
          if(!isValidObjectId(tweetId)){
            throw new ApiError(400,"Invalid tweet id")
          }
          const tweet=await Tweet.findById(tweetId)
          if(!tweet){
            throw new ApiError(404,"Tweet not found")
          }
          if(tweet.owner.toString()!==req.user?._id.toString()){
             throw new ApiError(403,"You are not authorized to delete this tweet")
          }
          await tweet.deleteOne()
          return res.status(200).json(new ApiResponse(200,{},"Tweet deleted successfully"))
    }
    catch(error){
        return res.status(500).json(new ApiResponse(400,{},"something went wrong during deleting"))
    }
})
const updatetweet=asyncHandler(async(req,res)=>{
    try{
        const {tweetId}=req.params;
        const {content}=req.body;
        if(!content){
            throw new ApiError(400,"Please provide a content")
        }
        if(!tweetId){
            throw new ApiError(400,"Please provide a tweet id")
        }
        if(!isValidObjectId(tweetId)){
            throw new ApiError(400,"Invalid tweet id")
        }
        const tweet= await Tweet.findById(tweetId)
        if(!tweet){
            throw new ApiError(404,"Tweet not found")
        }
        if(tweet.owner.toString()!==req.user?._id.toString()){
            throw new ApiError(403,"You are not authorized to update this tweet")
        }
        tweet.content=content;
        await tweet.save({
              validateBeforeSave:false
            })
        return res.status(200).json(
            new ApiResponse(200,{content : tweet.content ,updatedAt:tweet.updatedAt},"Tweet updated successfully")
        )    
    }
    catch(error){
        return res.status(500).json(new ApiResponse(400,{},"something went wrong during updating"))
    }
})
const getTweetById=asyncHandler(async(req,res)=>{
    try{
        const {tweetId}=req.params;
        if(!tweetId){
            throw new ApiError(400,"Please provide a tweet id")
        }
        if(!isValidObjectId(tweetId)){
            throw new ApiError(400,"Invalid tweet id")
        }
        const tweet= await Tweet.aggregate([
            {
                $match:{
                    _id: new mongoose.Types.ObjectId(tweetId)
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"owner"
                }
               
            },
            {
                $addFields:{
                    owner_name:{$arrayElemAt:["$owner.username",0]},
                    owner_avatar:{$arrayElemAt:["$owner.avatar",0]}
                  

            }
        },
            {
                $project:{
                    _id:1,
                    content:1,
                    updatedAt:1,
                    createdAt:1,
                    owner_name:1,
                    owner_avatar:1,
                    isliked:1,
                    isdisliked:1,
                    


                }
            }
        ])
        if(!tweet){
            throw new ApiError(404,"Tweet not found")
        }
        return res.status(200).json(
            new ApiResponse(200,tweet,"tweet is fetched successfully "))
    }
    catch(error){
        return res.status(500).json(new ApiResponse(400,{},"something went wrong during getting the tweet"))
    }
})

export {postTweet,
    deleteTweet,
    updatetweet,
    getTweetById
}