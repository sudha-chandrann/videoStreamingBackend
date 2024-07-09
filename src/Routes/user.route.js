import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import {getCurrentUser, LoginUser, RegisterUser} from "../controllers/user.controler.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

router.route("/login").post(upload.none(),LoginUser)
router.route("/currentuser").get(verifyJWT,getCurrentUser)
export default router