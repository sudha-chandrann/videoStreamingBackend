import {asyncHandler,ApiError,ApiResponse,uploadOnCloundinary, DeleteImageFromCloudinary} from "../utils/index.js"
import {User} from "../models/user.model.js"
import jwt from 'jsonwebtoken'
import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";

const RegisterUser= asyncHandler(async(req,res)=>{
    try{
       const{fullname , email, password , username}=req.body;
       if(
        [fullname,email , username ,password].some((field)=>{
            return field?.trim() ===""
        })
      ){
             throw new ApiError(400 ,"All fields are required ")
      }
      const existinguser=await User.findOne({$or:[{email:email},{username:username}]})
      if(existinguser){
        throw new ApiError(400,"User with same email or username already exists")
      }
      const avatarlocalpath=req.files?.avatar[0]?.path;
      if(!avatarlocalpath){
        throw new ApiError(400,"Avatar is required")
      }
      let coverImagelocalpath="";
      if(req.files && Array.isArray(req.files.coverImage) &&req.files.coverImage.length>0){
        coverImagelocalpath=req.files.coverImage[0].path;
      }
      const avatar=await uploadOnCloundinary(avatarlocalpath);
      if(!avatar){
        throw new ApiError(500,"Avatar upload failed")
      }
      const coverImage=await uploadOnCloundinary(coverImagelocalpath);
      const user=await User.create({
        fullname,
        email,
        username,
        password,
        avatar:avatar?.url,
        coverImage:coverImage?.url||""

      })
      if(!user){
        throw new ApiError(500,"User creation failed")
      }
      return res.status(200).json(
        new  ApiResponse(200,{username :username,
            email:email
        },"User created successfully")
      )

    }
    catch(error){
        throw new ApiError(400,error.message)
    }
})
const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
    
        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
const LoginUser= asyncHandler(async(req,res)=>{
    try{
      const {username,email,password}=req.body;
      if(!username && !email){
        throw new ApiError(400,"Username or email is required")
      }
      if(!password){
        throw new ApiError(400,"Password is required")
      }
      const user=await User.findOne({$or:[{email:email},{username:username}]})
      if(!user){
        throw new ApiError(400,"User not found")
      }
      const iscorrectPassword=await user.isPasswordCorrect(password)
      if(!iscorrectPassword){
        throw new ApiError(400,"Password is incorrect")
      }
      const {refreshToken , accessToken }=await generateAccessAndRefereshTokens(user._id);
      const logedUser=await User.findById(user._id).select("-password -refreshToken");
      if(!logedUser){
         throw new ApiError(500," login failed ")
      }
      const options = {
        httpOnly: true,
        secure: true
      }
      return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200,logedUser,"Login successful")
        )
      

    }
    catch(error){
        throw new ApiError(400,error.message)
    }
})
const getCurrentUser=asyncHandler(async(req,res)=>{
    try{
        const user=await User.findById(req.user._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(400,"User not found")
        }
        return res.status(200).json(new ApiResponse(200,user,"User found"))

    }catch(error){
        throw new ApiError(500,"Something went wrong")
    }
})

const logoutUser=asyncHandler(async(req,res)=>{
    try{
        await User.findByIdAndUpdate(
            req.user._id,
            {
               $unset:{
                 refreshToken:1
               } 
            },
            {
                new:true
            }
         )
        const options={
            httpOnly:true,
            secure:true
        }
        return res.status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"user Logged Out "))
    }
    catch(error){
        throw new ApiError(500,"Something went wrong ")
    }
})
const getrefreshAccessToken=asyncHandler(async(req,res)=>{
   
    try{
        const incomingRefreshToken=   req.cookies.refreshToken || req.body.refreshToken
        if(!incomingRefreshToken){
            throw new ApiError(401,"unauthorized request")
        }
    
         const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
         )
       const user=await User.findById(decodedToken?._id)
       if(!user){
        throw new ApiError(401,"invalid refresh token")
       }
    
       if(incomingRefreshToken !== user.refreshToken){
        throw new ApiError(401," refresh token is expired or used ")
       }
        const {refreshToken,accessToken}=generateAccessAndRefereshTokens(user._id)
        const options={
            httpOnly:true,
            secure:true
        }
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(200,{},"Refresh Token Generated"))
    
    }catch(error){

    }
        
  
   
}

)
const deleteUserAccount=asyncHandler(async(req,res)=>{
    try{
        const user=await User.findById(req.user?._id)
        if(!user){
            throw new ApiError(404,"user not found")
        }
         const deletedAccount=await User.findByIdAndDelete(req.user?._id)
         if(!deletedAccount){
            throw new ApiError(404," account delete process failed")
         }
         return res.status(200)
         .cookie("accessToken",null,{httpOnly:true,secure:true})
         .cookie("refreshToken",null,{httpOnly:true,secure:true})
         .json(new ApiResponse(200,{},"account deleted successfully"))
    }
    catch(error){
        throw new ApiError(500,"Something went wrong during deleting the user")
    }
})
const updateAavatar=asyncHandler(async(req,res)=>{
       try{
      
        const user=await User.findById(req.user?._id)
        if(!user){
            throw new ApiError(404,"user not found")
        }
        const avatarLocalPath=req.file?.path
        if(!avatarLocalPath){
            throw new ApiError(400,"avatar is required")
        }
        const avatar=await uploadOnCloundinary(avatarLocalPath)
        if(!avatar.url){
            throw new ApiError(500,"avatar upload failed")
        }
        await DeleteImageFromCloudinary(user.avatar)
        const updatedUser=await User.findByIdAndUpdate(req.user?._id,{avatar:avatar.url},{new:true})
        return res.status(200)
        .json(new ApiResponse(200,{avatar:updatedUser.avatar},"avatar updated successfully"))
       }
       catch(error){
        throw new ApiError(500,"Something went wrong during updating the avatar")
       }
})

const UpdateCoverImage=asyncHandler(async(req,res)=>{
    try{
        const user=await User.findById(req.user?._id)
        if(!user){
            throw new ApiError(404,"user not found")
        }
        const coverImageLocalPath=req.file?.path
        if(!coverImageLocalPath){
            throw new ApiError(400,"coverImage is required")
        }
        const coverImage=await uploadOnCloundinary(coverImageLocalPath)
        if(!coverImage.url){
            throw new ApiError(500,"coverImage upload failed")
        }
        await DeleteImageFromCloudinary(user.coverImage)
        const updatedUser=await User.findByIdAndUpdate(req.user?._id,{coverImage:coverImage.url},{new:true})
        return res.status(200)
        .json(new ApiResponse(200,{coverImage:updatedUser.coverImage},"coverImage updated successfully"))
       }
       catch(error){
        throw new ApiError(500,"Something went wrong during updating the coverImage")
       }
})
const ChangePassword=asyncHandler(async(req,res)=>{
    try{
        const {oldPassword , newpassword}=req.body;
        if(!oldPassword || !newpassword){
            throw new ApiError(400," both oldPassword and newpassword are required")
        }
        const user=await User.findById(req.user?._id)

        if(!user){
            throw new ApiError(404,"user not found")
        }
        const isMatch=await user.isPasswordCorrect(oldPassword);
        if(!isMatch){
            throw new ApiError(400,"old password is incorrect")
        }
        const updatedUser=await User.findByIdAndUpdate(req.user?._id,{password:newpassword},{new:true})
        if(!updatedUser){
            throw new ApiError(500,"Something went wrong during updating the password")
        }
        return res.status(200)
        .json(new ApiResponse(200,{},"password updated successfully"))

    }
    catch(error){
        throw new ApiError(500,"Something went wrong during updating the password")
    }
})
const recoverPassword=asyncHandler(async(req,res)=>{
    try{
        const{email,username, newpassword}=req.body;
        if(!email || !username){
            throw new ApiError(400,"email or username are required")
        }
        const user=await User.findOne({email:email,username:username})
        if(!user){
            throw new ApiError(404,"user not found")
        }
        if(!newpassword){
            throw new ApiError(400,"new password is required")
        }
        const updatedUser=await User.findByIdAndUpdate(user._id,{password:newpassword},{new:true})
        if(!updatedUser){
            throw new ApiError(500,"Something went wrong during updating the password")
        }
        return res.status(200)
        .json(new ApiResponse(200,{},"password is changed successfully"))
    }
    catch{
        throw new ApiError(500,"Something went wrong during updating the password")
    }
})
const updateProfile=asyncHandler(async(req,res)=>{
    try{
        const {username,email}=req.body;
        if(!username && !email){
            throw new ApiError(400,"username or email are required")
        }
        const user=await User.findById(req.user?._id)
        if(!user){
            throw new ApiError(404,"user not found")
        }
        const updatedUser=await User.findByIdAndUpdate(req.user?._id,{username,email},{new:true})
        if(!updatedUser){
            throw new ApiError(500,"Something went wrong during updating the profile")
            }
            return res.status(200)
            .json(new ApiResponse(200,{username:updatedUser.username,email:updatedUser.email},
                "profile updated successfully"))
                

    }
    catch(error){
        throw new ApiError(500,"Something went wrong during updating the profile")
    }
})
const getChannelProfile=asyncHandler(async(req,res)=>{
    try{
        const {username}=req.params;
        
        // console.log(req.user?._id)
        if(!username){
            throw new ApiError(400,"username is required")
        }
        const user=await User.findOne({username:username})
        if(!user){
            throw new ApiError(404,"user not found")
        }
        const Channel=await User.aggregate([
            {
                $match:{username:username}
            },
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"subscriber",
                    as:"subscribedto"
                }
            },
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"channel",
                    as:"subscribers"
                }
            },
            {
                $lookup:{
                    from:"videos",
                    localField:"_id",
                    foreignField:"owner",
                    as:"videos"
                }
            },
            {
                $addFields:{
                    ChannelsubscribedtoCount:{$size:"$subscribedto"},
                    subscribersCount:{$size:"$subscribers"},
                    isSubscribed:{
                        $cond: {
                            if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                            then: true,
                            else: false
                        }
                    },
                    videosCount:{$size:"$videos"},
                }
            },
            {
                $project: {
                    username:1,
                    subscribersCount:1,
                    ChannelsubscribedtoCount:1,
                    isSubscribed:1,
                    avatar:1,
                    coverImage:1,
                    videosCount:1,

                }
            }

        ])
        if(!Channel){
            return res.status(404).send("Channel not found")
        }
        return res.status(200).json(
        new ApiResponse(200,Channel,"channel profile is fetched successfuly ")
        )

    }
    catch(error){
        throw new ApiError(500,error.message||"Something went wrong during getting the profile")
    }
})
const getUserWatchhistory=asyncHandler(async(req,res)=>{
    try{
        const watchhistory=await User.aggregate([
            {
                $match:{
                    _id:req.user?._id
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchhistoryvideos",
                    pipeline:[
                        {
                            $lookup:{
                                from:"users",
                                localField:"owner",
                                foreignField:"_id",
                                as:"channel"
                            }
                        },
                        {
                            $addFields:{
                                channel_name:{
                                    $arrayElemAt:["$channel.username",0]
                                },
                                channel_avatar:{
                                    $arrayElemAt:["$channel.avatar",0]
                                },
                                channel_id:{
                                    $arrayElemAt:["$channel._id",0]
                                }
                            }
                        },
                        {
                            $project:{
                                channel_avatar:1,
                                channel_name:1,
                                channel_id:1,
                                title:1,
                                description:1,
                                thumbnail:1,
                                views:1,
                                duration:1,
                                videofile:1
                            }
                        }
                    ]
                }
            },
            { 
                $project:{
                    watchhistoryvideos:1
                }
               
            }
        ])
        if(!watchhistory){
            watchhistory = []
        }
        return res.status(200).json(
            new ApiResponse(200,watchhistory[0].watchhistoryvideos,"watch history is fetched succesfully ")
        )
    }
    catch(err){
        throw new ApiError(500,err.message||"Something went wrong during getting the profile")
    }
})
const addvideotoWatchHistory=asyncHandler(async(req,res)=>{

     const {videoId}=req.params;
     if(!videoId||!isValidObjectId(videoId)){
         throw new ApiError(400,"invalid video id")
     }
     const video=await Video.findById(videoId)
     if(!video){
        throw new ApiError(404,"video not found")
     }

    await User.findByIdAndUpdate(req.user?._id,{$pull:{watchHistory:videoId}},{new:true})
    const watchhistory= await User.findByIdAndUpdate(req.user?._id,{$push:{watchHistory:videoId}},
    {new:true})
    return res.status(200).json(
        new ApiResponse(200,{},"video added to watch history")
    )
})
const deleteVideofromwatchhistory=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    if(!videoId||!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid video id")
    }
    const video=await Video.findById(videoId)
    if(!video){
       throw new ApiError(404,"video not found")
    }

   await User.findByIdAndUpdate(req.user?._id,{$pull:{watchHistory:videoId}},{new:true})
   return res.status(200).json(new ApiResponse(200,{},"delete the video from the watch history"))
})

const deletewatchhistory=asyncHandler(async(req,res)=>{
   const updatedwatchhistory= await User.findByIdAndUpdate(req.user?._id,{$set:{watchHistory:[]}},{new:true})
   if(!updatedwatchhistory){
         throw new ApiError(404,"watch history not found")
   }
    return res.status(200).json(new ApiResponse(200,updatedwatchhistory.watchHistory,"watch history is deleted"))


})
export {
    RegisterUser,
    LoginUser,
    getCurrentUser,
    logoutUser,
    getrefreshAccessToken,
    deleteUserAccount,
    updateAavatar,
    UpdateCoverImage,
    ChangePassword,
    recoverPassword,
    updateProfile,
    getChannelProfile,
    getUserWatchhistory,
    addvideotoWatchHistory,
    deleteVideofromwatchhistory,
    deletewatchhistory
}