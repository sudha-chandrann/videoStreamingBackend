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
                $lookup:{
                    from:"likes",
                    localField:"_id",
                    foreignField:"tweet",
                    as:"likes"

                }
            },
            {
                $lookup:{
                    from:"dislikes",
                    localField:"_id",
                    foreignField:"tweet",
                    as:"dislikes"

                }
            },
            {
                $addFields:{
                    owner_name:{$arrayElemAt:["$owner.username",0]},
                    owner_avatar:{$arrayElemAt:["$owner.avatar",0]},
                    likescount:{
                        $size:"$likes"
                    },
                    dislikescount:{
                        $size:"$dislikes"
                    },
                    isliked:{
                        $cond:{
                            if:{$in:[req.user?._id,"$likes.likedBy"]},
                            then:true,
                            else:false
                        }
                    },
                    isdisliked:{
                        $cond:{
                            if:{$in:[req.user?._id,"$dislikes.dislikedBy"]},
                            then:true,
                            else:false
                        }
                    }

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
                    likescount:1,
                    dislikescount:1
                    


                }
            }
        ])
        if(!tweet){
            throw new ApiError(404,"Tweet not found")
        }
        return res.status(200).json(
            new ApiResponse(200,tweet[0],"tweet is fetched successfully "))
    }
    catch(error){
        return res.status(500).json(new ApiResponse(400,{},"something went wrong during getting the tweet"))
    }
})
const getUsertweet=asyncHandler(async(req,res)=>{
    try{
        const userId=req.user?._id;
        const tweets= await Tweet.aggregate([
            {
                $match:{
                    owner: new mongoose.Types.ObjectId(userId)
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
                $lookup:{
                    from:"likes",
                    localField:"_id",
                    foreignField:"tweet",
                    as:"likes"
                }
            },
            {
                $lookup:{
                    from:"dislikes",
                    localField:"_id",
                    foreignField:"tweet",
                    as:"dislikes"
                }
            },
            {
                $addFields:{
                    likesCount:{
                        $size:"$likes"
                    },
                    dislikesCount:{
                        $size:"$dislikes"
                    },
                    owner_avatar:{
                        $arrayElemAt:["$owner.avatar",0]
                    },
                    owner_username:{
                        $arrayElemAt:["$owner.username",0]
                    },
                    owner_id:{
                        $arrayElemAt:["$owner._id",0]
                    }
                }
            },
            {
                $project:{
                    content:1,
                    updatedAt:1,
                    createdAt:1,
                    likesCount:1,
                    dislikesCount:1,
                    owner_avatar:1,
                    owner_username:1,
                    owner_id:1,
                }
            }
        ])
        if(!tweets){
            throw new ApiError(500,"no tweets found ")
        }
        return res.status(200).json(new ApiResponse(200,tweets,"tweets are fetched successfully "))
    }
    catch(err){
        throw new ApiError(500,err.message||"something went wrong")
    }
})

const getAllthetweets=asyncHandler(async(req,res)=>{
    try{
        const tweets=await Tweet.aggregate([
            {
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"owner"
                }
            },
            {
                $lookup:{
                    from:"likes",
                    localField:"_id",
                    foreignField:"tweet",
                    as:"likes"
                }
            },
            {
                $lookup:{
                    from:"dislikes",
                    localField:"_id",
                    foreignField:"tweet",
                    as:"dislikes"
                }
            },
            {
                $addFields:{
                    owner_username:{
                        $arrayElemAt:["$owner.username",0]
                    },
                    owner_avatar:{
                        $arrayElemAt:["$owner.avatar",0]
                    },
                    likescount:{
                        $size:"$likes"
                    },
                    dislikescount:{
                        $size:"$dislikes"
                    },
                    isliked:{
                        $cond:{
                          if:{$in:[req.user?._id,"$likes.likedBy"]},
                          then:true,
                          else:false
                        }
                      },
                      isdisliked:{
                        $cond:{
                          if:{$in:[req.user?._id,"$dislikes.dislikedBy"]},
                          then:true,
                          else:false
                        }
                      },
                }
            },
            {
                $project:{
                    owner_username:1,
                    owner_avatar:1,
                    content:1,
                    likescount:1,
                    dislikescount:1,
                    isliked:1,
                    isdisliked:1,
                    updatedAt:1,
                    createdAt:1

                    
                }
            },
            {
                $sort:{
                    createdAt:-1
                }
            }
        ]) 

        if(!tweets){
          throw new ApiError(500,"something went wrong ")

        }
        return res.status(200).json(new ApiResponse(200,tweets,"tweets are fetched successfully"))

    }catch(err){
        throw new ApiError(500,err.message||"something went wrong")
    }
})

export {postTweet,
    deleteTweet,
    updatetweet,
    getTweetById,
    getUsertweet,
    getAllthetweets
}