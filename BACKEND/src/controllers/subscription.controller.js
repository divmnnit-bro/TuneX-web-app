import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponses.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId?.trim()) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (channelId.toString() === req.user?._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const channelExists = await User.findById(channelId);
    if (!channelExists) {
        throw new ApiError(404, "Channel not found");
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    });

    if (isSubscribed) {
        await Subscription.findByIdAndDelete(isSubscribed._id);
        return res
            .status(200)
            .json(new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully"));
    }

    await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { subscribed: true }, "Subscribed successfully"));
});

export { toggleSubscription };