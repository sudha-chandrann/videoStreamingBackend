import {asyncHandler,ApiError,ApiResponse,uploadOnCloundinary} from "../utils/index.js"
import {User} from "../models/user.model.js"

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


export {
    RegisterUser,
    LoginUser,
    getCurrentUser
}