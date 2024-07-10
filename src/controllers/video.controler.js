import {ApiError,ApiResponse,asyncHandler,uploadOnCloundinary,DeleteImageFromCloudinary,DeleteVideoFromCloudinary} from "../utils/index.js"
import {Video} from "../models/video.model.js"
import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if(!title){
        throw new ApiError(400,'Title is required',)
    }
    if(!description){
        throw new ApiError(400,'Description is required',)
    }
    const thumbnaillocalpath= req.files?.thumbnail[0]?.path;
    const videolocalpath= req.files?.videofile[0]?.path;
    if(!thumbnaillocalpath){
        throw new ApiError(400,"thumbnail file is required")
    }
    if(!videolocalpath){
        throw new ApiError(400,"Video file is required")
    }
    const thumbnail=  await uploadOnCloundinary(thumbnaillocalpath)
    const videofile= await uploadOnCloundinary(videolocalpath);
    
    if(!thumbnail?.url){
        throw new ApiError(500,"somethng went wrong during uploading the thumbnail")
    }
    if(!videofile?.url){
        throw new ApiError(500,"somethng went wrong during uploading the videofile")
    }
    
    const video=await Video.create({
        title,
        description,
        thumbnail: thumbnail.url,
        videofile: videofile.url,
        duration :videofile?.duration,
        isPublished:true,
        owner:req.user?._id
    }) 
    if(!video){
        throw new ApiError(500,"somethng went wrong during creating the video")
    }
    return  res.status(201).json(
        new ApiResponse(200,{_id:video._id},"Video is published successfully")
     )
    
})
const updateVideoThumbnail=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    if(!videoId){
        throw new ApiError(400,"videoId is required")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId is invalid")
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"video not found")
    }
    if(video.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(400,"you are not eligible to change the thumbnail ")
    }
    const thumbnaillocalpath=req.file?.path;
    if(!thumbnaillocalpath){
        throw new ApiError(400,"thumbnail file is required")
    }
    const thumbnail= await uploadOnCloundinary(thumbnaillocalpath);
    if(!thumbnail){
        throw new ApiError(500,"somethng went wrong during uploading the thumbnail")
    }
    await DeleteImageFromCloudinary(video.thumbnail);
    const updatedVideo=await Video.findByIdAndUpdate(videoId,{
        thumbnail:thumbnail.url
        },{new:true})
    if(!updatedVideo){
        throw new ApiError(500,"somethng went wrong during updating the video")
    } 
    return  res.status(201).json(
        new ApiResponse(200,{thumbnail:updatedVideo.thumbnail},"Video thumbnail is updated successfully")
    )

})
const updateVideoDetails=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    const {title,description}=req.body;
    if(!videoId){
        throw new ApiError(400,"videoId is required")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId is invalid")
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"video not found")
    }
    if(video.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(404,"you are not eligible to change the details of this video ")
    }
    if(!title && !description){
        throw new ApiError(400,"title and description are required")
    }
    const updatedVideo=await Video.findByIdAndUpdate(videoId,{
        title:title,
        description:description
        },{new:true})
    
    if(!updatedVideo){
        throw new ApiError(500,"somethng went wrong during updating the video")
    }
    return  res.status(201).json(
        new ApiResponse(200,{title:updatedVideo.title,description:updatedVideo.description},"Video details are updated successfully"))

})
const deleteVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    if(!videoId){
        throw new ApiError(400,"videoId is required")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId is invalid")
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"video not found")
    }
    if(video.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(404,"you are not eligible to delete this video ")
    }
    await DeleteImageFromCloudinary(video.thumbnail);
    await DeleteVideoFromCloudinary(video.videofile);
    const deletedVideo= await Video.findByIdAndDelete(videoId)
    if(!deletedVideo){
        throw new ApiError(500,"something went wrong during deleting the video")
    }
    return res.status(200).json(
        new ApiResponse(200,deletedVideo,"video deleted successfully")
    )
})
const tooglePublishVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    if(!videoId){
        throw new ApiError(400,"videoId is required")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId is invalid")
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"video not found")
    }
    if(video.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(404,"you are not eligible to publish or unpublish this video ")
    }
    video.isPublished=!video.isPublished;
    await video.save({
        validateBeforeSave:false
    });
    return res.status(200).json(
        new ApiResponse(200,{isPublished:video.isPublished},"video published successfully")
    )
})
const addviewsonvideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    if(!videoId){
        throw new ApiError(400,"videoId is required")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId is invalid")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"video not found")
    }
    video.views+=1;
    await video.save({
        validateBeforeSave:false
    })
    return res.status(200).json(
        new ApiResponse(200,{views:video.views},"video views updated successfully")
        )
})

const getVideosPreviewById=asyncHandler(async(req,res)=>{
     const {videoId}=req.params;
     if(!videoId){
        throw new ApiError(400,"Video Id is required")
     }
     if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
     }
     const video=await Video.findById(videoId)
     if(!video){
        throw new ApiError(404,"Video not found")
     }
     const videopreview=await Video.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(videoId)
            },
        },{
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },
        {
             $addFields:{
                video_owner:{$arrayElemAt:["$owner.username",0]},
                owner_avatar:{$arrayElemAt:["$owner.coverImage",0]}
                
             }
        },
        
        {
            $project:{
                title:1,
                thumbnail:1,
                _id:1,
                video_owner:1,
                views:1,
                updatedAt:1,
                owner_avatar:1,
                videofile:1,
                duration:1,
                description:1

            }
        }
     ])
     if(!videopreview){
        throw new ApiError(404,"Video not found")
     }
     res.status(200).json(new ApiResponse(200,videopreview,"Video Preview"))
})
const getallUservideos=asyncHandler(async(req,res)=>{
    const{username}=req.params;
    if(!username){
        throw new ApiError(404,"Username not found")
    }
    const user=await User.findOne({username:username})
    if(!user){
        throw new ApiError(404,"Userchannel is not found")
    }
    // const videos=await Video.find({owner:user._id,isPublished:true}).populate(
    //     {path:"owner",
    //         select:"username avatar"
    //     }
    // ).select("-isPublished").sort({"createdAt":-1})
    const videos=await User.aggregate([
        {
            $match:{username:username}
        },{
            $lookup:{
                from:"videos",
                localField:"_id",
                foreignField:"owner",
                as:"videos",
                pipeline:[
                    {
                        $match:{isPublished:true}
                    },
                    {
                         $sort:{
                            createdAt:-1
                         }
                    },
                    {
                        $project:{
                            title:1,
                            thumbnail:1,
                            _id:1,
                            videofile:1,
                            duration:1,
                            description:1,
                            views:1,
                            createdAt:1,
                        }
                    }
                ]
            }
        },{
            $project:{
                username:1,
                avatar:1,
                videos:1

            }
        }
    ])
    if(!videos){
        throw new ApiError(404,"videos are not found")
    }
    res.status(200).json(new ApiResponse(200,videos[0],"User Videos"))

})
export {
    publishAVideo,
    getVideosPreviewById,
    getallUservideos,
    updateVideoThumbnail,
    updateVideoDetails,
    deleteVideo,
    tooglePublishVideo,
    addviewsonvideo
}