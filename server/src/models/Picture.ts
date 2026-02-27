import mongoose, { Document, Schema } from "mongoose";

// This file defines the Picture schema and model.

interface IPicture extends Document {
    url: string;
    ownerId: mongoose.Types.ObjectId;
}

const PictureSchema: Schema = new Schema({
    url: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
},
{ timestamps: true }
)

const Picture = mongoose.model<IPicture>("Picture", PictureSchema)
export { Picture, IPicture }
