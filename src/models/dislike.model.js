import mongoose, { Schema } from "mongoose";
const dislikeSchema= new Schema({
    dislikedBy: { 
        type: Schema.Types.ObjectId,
        ref: "User" 
    },
    video:{
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    comment:{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    tweet:{
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    }

})
export const Dislike= mongoose.model("Dislike", dislikeSchema);