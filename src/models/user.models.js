import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
        },
        fullname:{
            type: String,
            required: true
        },
        email:{
            type: String,
            required: true,
            unique: [true, "Email already exists"],
            trim: true
        },
        password:{
            type: String,
            required: [true, "Password cannot be empty"]

        },
        notes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Note'
            }
        ],
        
        avatar:{
            type: String, //Cloudinary URL
            required: true,
        },
        refreshToken:{
            type: String,
        }

    },
    {
        timestamps: true
    }
)


userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

userSchema.methods.isPasswordMatched = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            password: this.password   
        },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY}
    )
}




export const User = mongoose.model('User', userSchema)