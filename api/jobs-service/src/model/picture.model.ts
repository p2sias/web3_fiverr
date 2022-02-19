import mongoose, { Schema, Document } from  'mongoose';

export interface PictureDocument extends Document {
    image: String,
    job: Schema.Types.ObjectId
}

const pictureSchema = new Schema<PictureDocument>({
    image: { type: Buffer },
    job: {type: Schema.Types.ObjectId}
})

const Picture = mongoose.model('Picture', pictureSchema);

export default Picture;