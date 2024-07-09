import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import { getallUservideos, getVideosPreviewById, publishAVideo} from "../controllers/video.controler.js"
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
router.route("/:videoId").get(getVideosPreviewById)    
router.route("/username/:username").get(getallUservideos);
export default router




