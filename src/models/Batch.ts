import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

export const stageEnumChoices = [
    'init',
    'deedcontroll',
    'imageUpload',
    'image qc',
    'uat',
    'digital sign',
    'pdf export',
    'data entry',
    'data qc',
    'final data qc',
    'data uat',
    'deed export',
] as const;

export const batchSchemaZod = z.object({
    batchCode: z.string().min(1, 'Batch code is required'), // 2 digit district + 2 digit RO + 1 digit booktype + deed year + 3 digit volume
    districtId: z.string().or(z.any()), // ObjectId ref District
    roId: z.string().or(z.any()), // ObjectId ref RO
    roCode: z.string().min(1, 'RO Code is required'),
    bookType: z.string().min(1, 'Book type is required'),
    volumeYear: z.string().min(1, 'Volume year is required'),
    volumeCode: z.string().min(1, 'Volume code is required'),
    createdBy: z.string().or(z.any()), // ObjectId ref User
    stage: z.enum(stageEnumChoices).default('init'),
    lockedBy: z.string().optional().or(z.null()),
    lockedAt: z.date().optional().or(z.null()),
    isDeleted: z.boolean().default(false),
});

export type IBatch = z.infer<typeof batchSchemaZod> & Document;

const BatchSchema = new Schema<IBatch>(
    {
        batchCode: { type: String, required: true, unique: true },
        districtId: { type: Schema.Types.ObjectId, ref: 'District', required: true },
        roId: { type: Schema.Types.ObjectId, ref: 'RO', required: true },
        roCode: { type: String, required: true },
        bookType: { type: String, required: true },
        volumeYear: { type: String, required: true },
        volumeCode: { type: String, required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        stage: {
            type: String,
            enum: stageEnumChoices,
            default: 'init',
            required: true,
        },
        lockedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        lockedAt: { type: Date, default: null },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Batch;
}
const Batch = mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);

export default Batch;
