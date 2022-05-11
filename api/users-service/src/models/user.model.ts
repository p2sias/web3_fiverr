import mongoose, { Schema, Document } from  'mongoose';
import { string } from 'yup';

export interface UserDocument extends Document {
    polygon_address: string,
    pseudo: string,
    mail: string,
    jobs: Array<Schema.Types.ObjectId>,
    avatar: Schema.Types.ObjectId | null,
    bio: string | null
}

const userSchema = new Schema<UserDocument>({
    polygon_address: { type: String, required: true },
    mail: { type: String },
    pseudo: { type: String },
    jobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
    avatar: {type: Schema.Types.ObjectId, ref: 'Avatar'},
    bio: {type: String}
},
    {
        timestamps: true
    })

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;