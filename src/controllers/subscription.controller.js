import { asyncHandler,ApiError,ApiResponse } from "../utils/index.js";
import{Subscription} from "../models/Subscription.model.js"
import mongoose, { isValidObjectId } from "mongoose";

const toggleSubscription=asyncHandler(async(req,res)=>{
    const {channelId}=req.params;
    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Channel Id");
    }
    const subscription=await Subscription.findOne({channel:channelId,subscriber:req.user._id})
    if(!subscription){
        const subscribed=await Subscription.create({
            channel:channelId,
            subscriber:req.user._id
        })
        if(!subscribed){
            throw new ApiError(400,"Something went wrong during subscription")
        }
        return res.status(200).json(
            new ApiResponse(200,subscribed,"Subscribed Successfully")
        )
    }
    else{
      const deleted=  await Subscription.deleteOne({channel:channelId,subscriber:req.user._id})
      if(!deleted){
        throw new ApiError(400,"Something went wrong during unsubscription")
      }
      return res.status(200).json(
        new ApiResponse(200,deleted,"Unsubscribed Successfully")
      )
    }
})
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const ChannelSubscriber=await Subscription.aggregate([
      {
         $match: {channel:new mongoose.Types.ObjectId(req.user?._id)},
      },
      {
         $lookup:{
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "subscribers"
         }
      },
      {
        $addFields:{
           subscriber_name:{
            $arrayElemAt:["$subscribers.username",0]
           },
           subscriber_avatar:{
            $arrayElemAt:["$subscribers.avatar",0]
           },
           
        }  
      },
      {
        $project: {
            subscriber_name:1,
            subscriber_avatar:1,
            createdAt:1,
            subscriber:1


        }
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ])
    if(!ChannelSubscriber){
      throw new ApiError(400,"Something went wrong during fetching subscribers")
    }
    return res.status(200).json(
      new ApiResponse(200,ChannelSubscriber,"Subscribers fetched successfully")
    )
    
})

const getUserSubscribedChannels = asyncHandler(async (req, res) => {
    
    
 const subscribedChannels= await Subscription.aggregate(
        [ 
             {
            $match: { subscriber: new mongoose.Types.ObjectId(req.user?._id) }
           },
            {
            $lookup: {
              from: "users",
              localField: "channel",
              foreignField: "_id",
              as: "channels",
            }
          },
           {
            $addFields: {
              channel_name: { $arrayElemAt: ["$channels.username", 0] },
              channel_avatar: { $arrayElemAt: ["$channels.avatar", 0] }
            
            
            }
          },{
             $project:{
               channel:1,
               channel_avatar:1,
              channel_id:1,
               _id:0,
               createdAt:1
            
             }
          },{
            $sort:{
              createdAt:-1
            }
          }
          
          ]
    )

if(!subscribedChannels){
    throw new ApiError(400,"No channels found")
}

return res.status(200).json(
    new ApiResponse(200,subscribedChannels,"subscribed channels are fetched successfully")
)

})


export {
    toggleSubscription,
    getUserSubscribedChannels,
    getUserChannelSubscribers
}