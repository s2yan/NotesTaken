import {User} from '../models/user.models.js';
import { Note } from '../models/note.model.js'
import { apiErrorResponse } from '../utils/apiErrorResponse.js';
import { apiResponse } from '../utils/apiResponse.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const isPasswordStrong = function(password){
        if( password.length < 8 ){
            throw new apiErrorResponse(400, "Password must be at least 8 character long")
        }

        if( password.length > 16 ){
            throw new apiErrorResponse(400, "Password must be at most 16 character long")
        }

        let isUppercase = false;
        let isLowerCase = false;
        let isDigit = false;
        let isSpecilachar = false;


        for(let char of password){
            if( char >= 'A' && char <= 'Z' ){
                isUppercase = true;
            }
            else if( char >= 'a' && char <= 'z' ){
                isLowerCase = true;
            }
            else if( char >= '0' && char <= '9' ){
                isDigit = true;
            }
            else if(/[!@#$%&]/.test(char)){
                isSpecilachar = true;
            }
        }

        if(!( isUppercase && isLowerCase && isDigit && isSpecilachar )){
            throw new apiErrorResponse(400, "Password must contain at least one uppercase letter, one lowercase letter, one digit and one special character")
        }
        return true;
}

const generateRefreshAndAccessToken = async function(userId){
    const user = await User.findById(userId)

    const refreshToken = user.generateRefreshToken(user._id)
    const accessToken = user.generateAccessToken(user._id)

    user.refreshToken = refreshToken
    user.save({validateBeforeSave: false})

    return { refreshToken, accessToken }
}

const registerUser = asyncHandler( async( req, res) => {
    const { username, fullname, email, password } = req.body;

    if( [username, fullname, email, password].some(field => field.trim() === "") ){
        return new apiErrorResponse(400, "All fields are required")
    }

    //check password stength
    isPasswordStrong(password)

    //Check user exists or not.
    const user = await User.findOne({
        $or: [ {username}, {email} ]
    })

    if( user ){
        throw new apiErrorResponse(400, "User already exists with this username or email")
    }

    //get the images from the request
    const avatar = req?.file?.path;
    if( !avatar){
        throw new apiErrorResponse(400, "Avatar is required")
    }

    //uplaod the image to cloudinary
    const avatarPath = await uploadToCloudinary(avatar)

    //create the user
    const newUser = await User.create({
        username,
        fullname,
        email,
        password,
        avatar: avatarPath.url
    })

    if( !newUser ){
        throw new apiErrorResponse(400, "Something went wrong while creating the user")
    }

    return res
        .status(200)
        .json(new apiResponse(
            200,
            "User created succesfully",
            {
                newUser
            }
    ))
})

const loginUser = asyncHandler ( async ( req, res ) => {
    const { email, password } = req?.body

    if( [email, password ].some(field => field.trim() === "")){
        throw new apiErrorResponse(400, "All the fields are required")
    }

    //Check if user exists
    const user = await User.findOne({email})

    if( !user ){
        throw new apiErrorResponse(401, "No user exists with the Email Id")
    }

    //validate password
    const validatePassword = await user.isPasswordMatched(password)

    if( !validatePassword ){
        throw new apiErrorResponse(401, "Invalid password")
    }

    const { refreshToken, accessToken } = await generateRefreshAndAccessToken(user._id)
    const loggedUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json( new apiResponse(
            200,
            "User logged in succesfully",
             { loggedUser}
        ))
})

const logoutUser = asyncHandler(async (req, res) => {

    console.log(req.user)
    console.log(req.cookies)
    const user = req.user;

    const options = {
        httpOnly: true,
        secure: true
    };

    try {
        if (!user) {
            res.clearCookie("refreshToken", options)
               .clearCookie("accessToken", options);
            throw new apiErrorResponse(404, "User not found");
        }

        await User.findByIdAndUpdate(user._id, {
            $set: { refreshToken: null }
        });

        return res
            .clearCookie("refreshToken", options)
            .clearCookie("accessToken", options)
            .status(200)
            .json(new apiResponse(200, "User logged out successfully"));
    } catch (error) {
        // Optional: log error if needed
        console.error("Logout Error:", error);

        // Wrap any internal error in a standardized error response
        throw new apiErrorResponse(500, "Something went wrong during logout");
    }
});

const changePassword = asyncHandler( async(req, res) =>{
    const  user = req.user;
    //console.log(user)
    const { oldPassword, newPassword } = req.body;
    //console.log(oldPassword, newPassword)
    if([oldPassword, newPassword].some(field => field.trim() === "")){
        throw new apiErrorResponse(401, "All fields are required")
    }

    //match the old password if matched then change the password
    const isPasswordMatching = await user.isPasswordMatched(oldPassword)
    if( !isPasswordMatching ){
        throw new apiErrorResponse(401, "Old password is incorrect")
    }

    //check the new password strength
    isPasswordStrong(newPassword)
    //update the password

    try{
        user.pasword = newPassword;
        await user.save({validateBeforeSave: false})

        return res
            .status(200)
            .json(new apiResponse(
                200,
                "Password changed successfully"
            ))   
    }catch(error){
        throw new apiErrorResponse(500, "Something went wrong while changing the password")
    }
})

const changeAvatar = asyncHandler( async(req,res) => {
    const user = req.user
    const avatar = req?.file?.path;

    if(!avatar){
        throw new apiErrorResponse(400, "New avatar is required ")
    }

    try{

        //uplaod the avatar to cloudinary
        const avatarPath = await uploadToCloudinary(avatar)
        //Todo: Delete the old avatar from cloudinary

        //Update the user avatar url
        user.avatar = avatarPath.url;
        user.save({validateBeforeSave: false})

        return res
            .status(200)
            .json( new apiResponse(
                200, 
                "Avatar updated successfully",
                {avatar: avatarPath.url}
            ))

    }catch(error){
        console.log("Error while changing avatar");
        throw new apiErrorResponse(500, "Something went wrong while changing the avatar")
    }
})

const changeUserDetails = asyncHandler( async(req, res) => {
    const { newfullName, newEmail } = req?.body;
    const user = req?.user;
    //Todo: Check if the user email is valid email or not, make sure users cannot change their email to any invalid email.
    
    //Todo: Change the logic if user only wants to change email or full name
    if( !newfullName ){
        throw new apiErrorResponse(400, "New full name is required")
    }

    if( !newEmail ){
        throw new apiErrorResponse(400, "New email is required")
    }

    //Check if the new Email already exists in the user database or not.
    const userExists = await User.findOne({ newEmail })
    if( userExists ){
        throw new apiErrorResponse(401, "User already exists with this email Id please enter a different email Id")
    }

    //Update the user details
    try{
        user.fullname = newfullName;
        user.email = newEmail;

        await user.save({ validateBeforeSave: false })
        const updatedUser = await User.findById(user._id).select("-password -refreshToken");


        return res
            .status(200)
            .json( new apiResponse(200, {updatedUser}, "User details updated successfully"))


    }catch(error){
        console.log("Error while changing user details");
        throw new apiErrorResponse(500, "Something went wrong while changing the user details")
    }
})

const getUser = asyncHandler( async(req, res) => {
    return res 
        .status(200)
        .json( new apiResponse(
            200,
            "User fetched successfully",
            { user: req?.user}
        ))
})

const getUserNotes = asyncHandler(async (req, res) => {
    const user = req.user;

    // Fetch notes where user is the owner
    const notes = await Note.find({ owner: user._id });

    return res
        .status(200)
        .json(new apiResponse(
            200,
            { notes },
            "User notes fetched successfully"
        ));
});


export { registerUser, loginUser, logoutUser, changePassword,
    changeAvatar, changeUserDetails, getUser, getUserNotes }