import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import {ChangePassword, deleteUserAccount, getChannelProfile, getCurrentUser, getrefreshAccessToken, LoginUser, logoutUser, recoverPassword, RegisterUser, updateAavatar, UpdateCoverImage, updateProfile} from "../controllers/user.controler.js"
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
router.route("/logout").get(verifyJWT,logoutUser)
router.route("/refresh-token").get(getrefreshAccessToken)
router.route("/delete").delete(verifyJWT,deleteUserAccount)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateAavatar)
router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"), UpdateCoverImage);
router.route("/changePassword").patch(verifyJWT,upload.none(),ChangePassword);
router.route("/recoverPassword").patch(upload.none(),recoverPassword);
router.route("/updateProfile").patch(verifyJWT,upload.none(),updateProfile);
router.route("/channelProfile/:username").get(getChannelProfile)
  
export default router