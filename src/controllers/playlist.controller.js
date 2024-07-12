import {asyncHandler,ApiError,ApiResponse} from "../utils/index.js"
import {Playlist} from "../models/playlist.model.js"
import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    try{
        const {name, description} = req.body
    if([name ,description].some((field)=>{
       return field?.trim() ===""
    })){
        throw new ApiError(400,"All fields are required")
    }
    const existingPlaylist = await Playlist.findOne({name:name,owner:req.user?._i})
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
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id")
    }
    const playlists=await Playlist.aggregate([
        {
          $match: {
            owner:new mongoose.Types.ObjectId(userId)
          }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "viewsno",
                pipeline:[
                  { $match: { isPublished: true } }, 
                  { $group: { _id: null, totalViews: { $sum: '$views' } } }, 
                ]
            
            }
          },
        {
          $lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videosno",
            pipeline:[
              {
                $match:{
                  isPublished:true
                }
              },
              {
                $count:"videosno"
              }
            ]
          }
        },
         {
          $lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videos",
            pipeline:[
              {
                $match:{
                  isPublished:true
                }
              },
              
            ]
          }
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
          $addFields: {
            videosno:{
              $arrayElemAt:["$videosno.videosno",0]
            },
            thumbnail:{
              $arrayElemAt:["$videos.thumbnail",0]
            },
            owner_username:{
              $arrayElemAt:["$owner.username",0]
            },
            owner_avatar:{
              $arrayElemAt:["$owner.avatar",0]
            },
            owner_id:{
              $arrayElemAt:["$owner._id",0]
            },
            views:{
                $arrayElemAt:["$viewsno.totalViews",0]
            }
          }
        },
        {
            $project:{
                _id:1,
                name:1,
                owner_avatar:1,
                owner_id:1,
                owner_username:1,
                videosno:1,
                thumbnail:1,
                updatedAt:1,
                createdAt:1,
                views:1
            }
        }
        
      ])
    if(!playlists){
       throw new ApiError(500,"no playlist  is found ")
    }
    return res.status(200).json(
        new ApiResponse(200,playlists,"playlsists are fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId ||!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }
    const playlist= await Playlist.aggregate([
        {
          $match: {
            _id:new mongoose.Types.ObjectId(playlistId)
          }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "viewsno",
                pipeline:[
                  { $match: { isPublished: true } }, 
                  { $group: { _id: null, totalViews: { $sum: '$views' } } }, 
                ]
            
            }
          },
        {
          $lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videosno",
            pipeline:[
              {
                $match:{
                  isPublished:true
                }
              },
              {
                $count:"videosno"
              }
            ]
          }
        },
        {
          $lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videos",
            pipeline:[
             {
                $match:{
                  isPublished:true
                }
              },
              {
                $project:{
                  duration:1,
                  views:1,
                  title:1,
                  thumbnail:1,
                  isPublished:1,
                  createdAt:1,
                  updatedAt:1
                }
              },
            ]
          }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"user"

            }
        },
      
        {
          $addFields: {
            videosno:{
              $arrayElemAt:["$videosno.videosno",0]
            },
            owner_username:{
                $arrayElemAt:["$user.username",0]
            },
            owner_id:{
                $arrayElemAt:["$user._id",0]
            },
            viewsNo:{
                $arrayElemAt:["$viewsno.totalViews",0]
            }
          }
        },
        {
             $project:{
                videosno:1,
             owner_username:1,
             videos:1,
             owner_id:1,
             name:1,
             description:1,
             createdAt:1,
             updatedAt:1,
             viewsNo:1
             }

        }
      ])
    return res.status(200).json(
        new ApiResponse(200,playlist[0],"playlist is found")
    )
})



const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    // console.log(video.owner.toString() === req.user?._id.toString())
    if(playlist.owner.toString() !== req.user?._id.toString() || video.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400," you are not eligible to add this video in this playlist")
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $addToSet: { videos: videoId } },
        { new: true, useFindAndModify: false }
      );
    if(!updatedPlaylist){
        throw new ApiError(400,"Playlist not found")
    }  
    return res.status(200).json(
        new ApiResponse(200,updatedPlaylist,"video is added to playlist ")
    )
})



const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    } 
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid playlist id")
    } 
    const playlist = await Playlist.findOne({_id:playlistId,owner:req.user?._id})
    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }
    const video = await Video.findOne({_id:videoId,owner:req.user?._id})
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },
        { new: true, useFindAndModify: false }
    )
    if(!updatedPlaylist){
        throw new ApiError(400,"Playlist not found")
    }
    return res.status(200).json(
        new ApiResponse(200,updatedPlaylist,"video is removed from playlist ")
    )

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
     if(!name && !description){
        throw new ApiError(400,"name and description are required")
     }
     const playlist = await Playlist.findOne({_id:playlistId,owner:req.user?._id})
     if(!playlist){
        throw new ApiError(400,"Playlist not found")
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