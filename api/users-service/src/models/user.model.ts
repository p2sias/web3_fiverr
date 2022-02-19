import mongoose, { Schema, Document } from  'mongoose';

export interface UserDocument extends Document {
    polygon_address: string,
    pseudo: string,
    mail: string,
    jobs: Array<Schema.Types.ObjectId>
}

const userSchema = new Schema<UserDocument>({
    polygon_address: { type: String, required: true },
    mail: { type: String, required: true },
    pseudo: { type: String, required: true },
    jobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }]
})

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;