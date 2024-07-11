import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserChannelSubscribers, getUserSubscribedChannels, toggleSubscription } from "../controllers/subscription.controller.js";
const router=Router()
router.use(verifyJWT)

router.route("/subscribe/:channelId").get(toggleSubscription)
router.route("/subscribechannel").get(getUserSubscribedChannels)
router.route("/subscriber").get(getUserChannelSubscribers)

export default router