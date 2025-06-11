import mongoose, { Schema } from 'mongoose';

const noteSchema = new Schema(
    {
        title:{
            type: String,
            required: [true, "Title cannot be empty"],
            trim: true
        },
        content:{
            type: String,
            requried: [true, "Content cannot be empty"],
            trim: true
        },
        tags:[{
            type: Schema.Types.ObjectId,
            ref: 'Tag'
        }],
        
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

export const Note = mongoose.model('Note', noteSchema)