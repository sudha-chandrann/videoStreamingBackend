import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import { addviewsonvideo, deleteVideo, getallUservideos, getVideosPreviewById, publishAVideo, tooglePublishVideo, updateVideoDetails, updateVideoThumbnail} from "../controllers/video.controler.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router()
router.use(verifyJWT)
router.route("/upload").post(
    upload.fields([
        { name : "videofile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    publishAVideo)

router.route("/:videoId").patch(upload.single("thumbnail"),updateVideoThumbnail)
router.route("/update/:videoId").patch(upload.none(),updateVideoDetails)
router.route("/:videoId").delete(deleteVideo)
router.route("/upload/:videoId").get(tooglePublishVideo);
router.route("/view/:videoId").get(addviewsonvideo);
router.route("/:videoId").get(getVideosPreviewById)    
router.route("/username/:username").get(getallUservideos);
export default router




