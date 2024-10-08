import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteTweet, getAllthetweets, getTweetById, getUsertweet, postTweet, updatetweet } from "../controllers/tweet.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router=Router()
router.use(verifyJWT)

router.route("/post").post(upload.none(),postTweet)
router.route("/:tweetId").delete(deleteTweet)
router.route("/:tweetId").patch(upload.none(),updatetweet)
router.route("/:tweetId").get(getTweetById)
router.route("/user/tweet").get(getUsertweet);
router.route("/get/user/tweets").get(getAllthetweets)
export default router