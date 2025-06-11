import { asyncHandler } from "../utils/asyncHandler.js";
import { apiErrorResponse } from "../utils/apiErrorResponse.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from '../models/user.models.js';
import jwt from "jsonwebtoken";

const jwtVerify = asyncHandler(async (req, res, next) => {
    const accessToken = req?.cookies?.accessToken;

    if (!accessToken) {
        throw new apiErrorResponse(401, "Invalid or missing access token");
    }

    try {
        const decodedJwt = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedJwt._id).select("-refreshToken");

        if (!user) {
            throw new apiErrorResponse(404, "User not found");
        }

        req.user = user;
        next();

    } catch (error) {
        throw new apiErrorResponse(401, "Invalid or expired access token");
    }
});

export { jwtVerify };
