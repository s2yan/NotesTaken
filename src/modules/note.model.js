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
        tags:{
            type: [String],
            default: [],
            trim: true
        }
    },
    {
        timestamps: true
    }
)