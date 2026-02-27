import mongoose, {Document, Schema} from "mongoose";

//This file is the user model and schema.

interface IUser extends Document {
    email: string
    password: string
    username: string
}

const UserSchema: Schema = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    },
    {timestamps: true}
)

const User = mongoose.model<IUser>("User", UserSchema)
export { User, IUser }