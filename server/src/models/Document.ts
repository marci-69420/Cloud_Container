import mongoose, { Document, Schema } from "mongoose";

//This file defines the Document schema and model.

interface IDocument extends Document {
    title: string;
    content: string;
    ownerId: mongoose.Types.ObjectId; // Reference to the User who owns the document
    sharedWith: mongoose.Types.ObjectId[];  // Array of user IDs that the document is shared with
    isEditing: boolean;  // Keep track of whether the document is currently being edited to prevent concurrent edits
}
//NOTE: The content is stored in a stringified Jaonn format to be compatible with normal string content and more advanced content created with EditorJS.

const DocumentSchema: Schema = new Schema({
    title : { type: String, required: true },
    content : { type: String, required: true },
    ownerId : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isEditing: { type: Boolean, default: false }
},
{ timestamps: true }
)

const DocumentModel = mongoose.model<IDocument>("Document", DocumentSchema)
export { DocumentModel, IDocument }