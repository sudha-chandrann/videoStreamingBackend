import {asyncHandler,ApiError,ApiResponse} from "../utils/index.js"
import {Playlist} from "../models/playlist.model.js"
import mongoose, { isValidObjectId } from "mongoose"


const createPlaylist = asyncHandler(async (req, res) => {
    try{
        const {name, description} = req.body
    if([name ,description].some((field)=>{
       return field?.trim() ===""
    })){
        throw new ApiError(400,"All fields are required")
    }
    const existingPlaylist = await Playlist.findOne({name:name})
    if(existingPlaylist){
        throw new ApiError(400,"Playlist already exists")
    }
    const playlist = await Playlist.create({name,description,owner:req.user?._id})
    if(!playlist){
        throw new ApiError(400,"Playlist could not be created")
    }
    return res.status(201).json(
       new ApiResponse(201,playlist,"Playlist created successfully")
    )
    }
    catch(err){
        throw new ApiError(500,err.message||"something went wrong during creating the playlist ")
    }

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlist ||!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }
    const playlist= await Playlist.aggregate([
        {
            $match: { $and:[{_id:new mongoose.Types.ObjectId(playlistId)},
                {ispublished:true}
            ]}
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields:{
                owner_name:{$arrayElemAt:["$owner.username",0]},
            }
        },
        {
            $project:{
                name:1,
                description:1,
                updatedAt:1,
                owner_name:1,
                videos:1,
            }
        }
    ])
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
   try{
    const {playlistId} = req.params
    if(!playlistId||!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"Playlist not found")
    }
    if(playlist.owner.toString() !==req.user?._id.toString()){
        throw new ApiError(400,"you are not eligible to delete this playlist")
    }
    const deleted=await playlist.deleteOne();
    if(!deleted){
        throw new ApiError(400,"Playlist could not be deleted")
    }
    return res.status(200).json(
        new ApiResponse(200,deleted,"Playlist deleted successfully")
    )
   }catch(err){
    throw new ApiError(500,err.message||"something went wrong during deleting the playlist ")
   }
    
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
     if(!name || !description){
        throw new ApiError(400,"name and description are required")
     }
     const playlist = await Playlist.findById(playlistId)
     if(!playlist){
        throw new ApiError(400,"Playlist not found")
     }
     if(playlist.owner.toString() !==req.user?._id.toString()){
        throw new ApiError(400,"you are not eligible to update this playlist ")
     }
     if(name){
        playlist.name=name
     }
     if(description){
        playlist.description=description
     }
     const updatedPlaylist = await playlist.save({
        validateBeforeSave:false
     })
     if(!updatePlaylist){
        throw new ApiError(400,"Playlist could not be updated")
     }
     return res.status(200).json(
        new ApiResponse(200,updatedPlaylist,"Playlist updated successfully")
     )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}