import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
   fullname:{
    type:String,
    required:true,
    trim:true,
   } ,
   email: {
    type:String,
    required:true,
    trim:true,
    unique:true,
    lowercase:true,
   },
   username:{
     type:String,
     unique:true,
     required:true,
     lowercase:true,
     trim:true,
     index:true
   },
   password:{
    type:String,
    required:[true ,"password is required"]
   },
   avatar:{
      type:String,
      required:true
   },
   coverImage:{
      type:String
   },
   refreshToken:{
           type:String
   },
   watchHistory:[
    {
        type:Schema.Types.ObjectId,
        ref:"Video"
    }
   ]
},{timestamps:true});

userSchema.pre("save", async function(next) {
    try {
      if (!this.isModified("password")) return next();
      const salt =await bcrypt.genSalt(10)
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  });
userSchema.methods.isPasswordCorrect = async function(password) {
    try{
        return await bcrypt.compare(password,this.password);
    }
    catch(error){
         console.log("something went wrong during comparing the password ",error)
         throw error;
    }
};
userSchema.methods.generateAccessToken = function() {
    return jwt.sign({
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname
    }, 
    process.env.ACCESS_TOKEN_SECRET,
     {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
};
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign({
      _id: this._id
    }, process.env.REFRESH_TOKEN_SECRET, 
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    });
};

export const User = mongoose.model('User', userSchema);