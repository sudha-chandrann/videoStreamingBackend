import { v2 as cloudinary} from "cloudinary";
import  fs from "fs"


 // Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_API_SECRET
});



const uploadOnCloundinary= async (localFilePath)=>{
    try{
        if(localFilePath){
            const uploadResult = await cloudinary.uploader
            .upload(
                localFilePath, {
                    resource_type:"auto"
                }
            )
            
           
            fs.unlinkSync(localFilePath) 
           return  uploadResult;
        }else{
            return null
        }

    }
    catch(error){
       
        fs.unlinkSync(localFilePath)    //remove the locally saved temorary file as the upload operation got failed 
        console.log(" upload file  error  ",error)
        return null;
    }
}

const DeleteImageFromCloudinary=async(fileurl)=>{
    try{
        if(fileurl){
            const deleteResult = await cloudinary.uploader
            .destroy(fileurl, { invalidate: true, resource_type:"image" })
            
        }

    }catch(error){
        console.log("delete file error ",error)
        throw error
    }
}
const DeleteVideoFromCloudinary=async(fileurl)=>{
    try{
        if(fileurl){
            const deleteResult = await cloudinary.uploader
            .destroy(fileurl, { invalidate: true, resource_type:"video" })
          
        }

    }catch(error){
        console.log("delete file error ",error)
        throw error
    }
}
export{uploadOnCloundinary,
    DeleteImageFromCloudinary,
    DeleteVideoFromCloudinary
}