import {asyncHandler,ApiError,ApiResponse,uploadOnCloundinary, DeleteImageFromCloudinary} from "../utils/index.js"
import {User} from "../models/user.model.js"
import jwt from 'jsonwebtoken'

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
        .json(new ApiResponse(200,{username:updatedUser.username,email:updatedUser.email},"password updated successfully"))

    }
    catch(error){
        throw new ApiError(500,"Something went wrong during updating the password")
    }
})
const recoverPassword=asyncHandler(async(req,res)=>{
    try{
        const{email,username, newpassword}=req.body;
        const user=await User.findOne({$or:[{username:username},{email:email}]})
        if(!user){
            throw new ApiError(404,"user not found")
        }
        const updatedUser=await User.findByIdAndUpdate(user._id,{password:newpassword},{new:true})
        if(!updatedUser){
            throw new ApiError(500,"Something went wrong during updating the password")
        }
        return res.status(200)
        .json(new ApiResponse(200,{username:updatedUser.username,email:updatedUser.email},"password is changed successfully"))
    }
    catch{
        throw new ApiError(500,"Something went wrong during updating the password")
    }
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
    recoverPassword
}