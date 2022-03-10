import mongoose, { Schema, Document } from  'mongoose';

export interface AvatarDocument extends Document {
    avatar: String,
    user: Schema.Types.ObjectId
}

const avatarSchema = new Schema<AvatarDocument>({
    avatar: { type: Buffer },
    user: {type: Schema.Types.ObjectId, ref: 'User'}
})

const Avatar = mongoose.model('Avatar', avatarSchema);

export default Avatar;