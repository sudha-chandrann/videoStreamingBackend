import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deletecomment, postComment, updatecomment } from "../controllers/comment.controller.js";
const router=Router()
router.use(verifyJWT)

router.route("/post/:videoId").post(upload.none(),postComment)
router.route("/update/:commentId").patch(upload.none(),updatecomment)
router.route("/delete/:commentId").delete(deletecomment)
export default router