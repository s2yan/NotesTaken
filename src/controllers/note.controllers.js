import { Note } from '../models/note.model.js';
import { User } from '../models/user.models.js';
import { Tag } from "../models/tag.model.js";
import { apiErrorResponse } from '../utils/apiErrorResponse.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';


//Secure
const createNote = asyncHandler(async (req, res) => {
    let { title, content, tags } = req.body;

    if ([title, content, tags].some(field => field.trim() === "")) {
        throw new apiErrorResponse(400, "Title, content and tags cannot be empty");
    }

    title = title.trim();
    content = content.trim();
    tags = tags.trim();

    console.log("tags: ", tags)

    try {
        const tagsArray = tags.split(",");
        console.log(tagsArray)
        const userTags = (
            await Promise.all(
                tagsArray.map(async (tag) => {
                    const trimmed = tag.trim().toLowerCase();
                    if (!trimmed) return null;
                    console.log(trimmed)
                    try {
                        const tagDoc = await Tag.create({ name: trimmed });
                        console.log("tagDoc: ", tagDoc)
                        return tagDoc._id;
                    } catch (e) {
                        if (e.code === 11000) {
                            const existingTag = await Tag.findOne({ name: trimmed });
                            console.log("existingTag: ",existingTag)
                            return existingTag?._id || null;
                        }
                        throw e;
                    }
                })
            )
        ).filter(Boolean); // remove nulls

        console.log(userTags)
        const note = await Note.create({
            title,
            content,
            tags: userTags,
            owner: req.user._id
        });

        await User.findByIdAndUpdate(
            req.user._id,
            { $push: { notes: note._id } },
            { new: true }
        );

        return res.status(200).json(
            new apiResponse(200, { note }, "Note created successfully")
        );

    } catch (error) {
        console.log(error.message);
        throw new apiErrorResponse(500, "Something went wrong while creating the note");
    }
});


const editNote = asyncHandler( async (req, res) => {
    const { noteId } = req.params;
    const { title, content } = req.body;
    const user = req.user;

    if( !noteId ){
        throw new apiErrorResponse(401, "Note ID is require");
    }

    if([title, content].come(field => field.trim() === "")){
        throw new apiErrorResponse(401, "Tiitle and content cannot be empty");
    }

 try {
        // Update the Note document
        const updatedNote = await Note.findByIdAndUpdate(
            noteId,
            { $set: { title, content } },
            { new: true }
        );

        if (!updatedNote) {
            throw new apiErrorResponse(404, "Note not found");
        }

        // Optional: Ensure the user's notes array only contains valid note IDs (in case of duplicates or corruption)
        // Here, we remove the old entry (in case it's being duplicated) and re-add the updated one
        user.notes = user.notes.filter(note => note.toString() !== noteId.toString());
        user.notes.push(updatedNote._id);
        await user.save({ validateBeforeSave: false });

        return res.status(200).json(
            new apiResponse(200, { note: updatedNote }, "Note edited successfully")
        );
    }catch( error ){
        console.log(error.message);
        throw new apiErrorResponse(500, "Something went wrong while editing the note");
    }
})

const deleteNote = asyncHandler( async( req, res ) =>{
    const { noteId } = req.params;
    const user = req.user;

    if( !noteId ){
        throw new apiErrorResponse(401, "Note Id is required");
    }

    try{

        //find the note by Id and delete it from the database
        const deletedNote = await Note.findByIdAndDelete(
            noteId,
            { new: true }
        )

        //find the noteId in the user's array of notes and remove it.
        user.notes = user.notes.filter(note => note.toString() !== noteId.toString());
        await user.save({ validateBeforeSave: false });

        return res
            .status(200)
            .json(
                new apiResponse(
                    200, 
                    {
                        note: deletedNote
                    },
                    "Note deleted successfully"
                )
            )
    }catch(error){
        console.log(error.message);
        throw new apiErrorResponse(500, "Something went wrong while deleting the note");
    }

})

export { createNote, editNote, deleteNote, }