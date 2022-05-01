import mongoose, { Schema, Document } from 'mongoose';
import { string } from 'yup';

export interface JobPlan {
    type: string,
    price: number,
    plan_desc: string,
    max_delivery_day: number
}

export interface JobDocument extends Document {
    title: string,
    about: string,
    photos?: Array<Schema.Types.ObjectId>,
    user: Schema.Types.ObjectId,
    user_address: string,
    plans: Array<JobPlan>,
    category: Schema.Types.ObjectId
}

const planSchema = new Schema<JobPlan>({
    type: { type: String, enum: ['Basic', 'Standard', 'Premium'], default: 'Basic' },
    price: { type: Number, required: true },
    plan_desc: { type: String, required: true },
    max_delivery_day: { type: Number, required: true }
})

const jobSchema = new Schema<JobDocument>({
    title: { type: String, required: true },
    about: { type: String, required: true },
    photos: [{ type: Schema.Types.ObjectId, ref: 'Picture' }],
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user_address: {type: String},
    plans: [planSchema],
    category: { type: Schema.Types.ObjectId, required: true, ref: 'Category' },
    
})

const Job = mongoose.model<JobDocument>('Job', jobSchema);

export default Job;