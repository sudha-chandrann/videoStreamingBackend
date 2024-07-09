import {asyncHandler,ApiError,ApiResponse,uploadOnCloundinary} from "../utils"
import {User} from "../models/user.model"

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
      const coverImagelocalpath="";
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
        ApiResponse(200,{username :user.username},"User created successfully")
      )

    }
    catch(error){
        throw new ApiError(400,error.message)
    }
})


export {
    RegisterUser
}