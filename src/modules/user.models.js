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
        firstName:{
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

userSchema.mothods.generateRefreshToken = function(){
    jwt.sign(
        {
            _id: this._id,
            username: this.username,
            password: this.password   
        },
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRY}
    )
}




export const User = mongoose.model('User', userSchema)