import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import {RegisterUser} from "../controllers/user.controler.js"

const router=Router()
router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),RegisterUser);

export default router