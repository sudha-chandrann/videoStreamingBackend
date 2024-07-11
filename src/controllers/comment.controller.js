import {asyncHandler,ApiError,ApiResponse} from "../utils/index.js"
import {Comment} from "../models/comment.model.js"
import { isValidObjectId } from "mongoose";
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
const postComment=asyncHandler(async(req,res)=>{
    const {content}=req.body
    const {videoId}=req.params;
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id",)
    }
    if(!content){
        throw new ApiError(400,"Content is required",)
    }
    const video= await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found",)
    }
    const comment= await Comment.create({
        owner:req.user?._id,
        video:video._id,
        content:content
    })
    if(!comment){
        throw new ApiError(500,"something went wrong during producing the comment ")
    }
    return res.status(200).json(
        new ApiResponse(200,comment,"comment is posted successfully")
    )
})
const updatecomment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params
    const {content}=req.body
    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment id",)
    }
    if(!content){
        throw new ApiError(400,"Content is required",)
    }
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404,"Comment not found",)
    }
    if(comment.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(400,"you are not eligible to change the comment ");
    }
    comment.content=content
    await comment.save({
        validateBeforeSave:false
    })
    return res.status(200).json(
        new ApiResponse(200,comment,"comment is updated successfully")
    )

})
const deletecomment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params
    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment id",)
    }
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404,"Comment not found",)
    }
    if(comment.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(400,"you are not eligible to delete the comment ");
    }
    const deleted= await comment.deleteOne();
    if(!deleted){
        throw new ApiError(500,"something went wrong during deleting the comment ")
    }
    return res.status(200).json(
        new ApiResponse(200,deleted,"comment is deleted successfully")
    )

})

export {
    postComment,
    updatecomment,
    deletecomment
}