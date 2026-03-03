import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

export const documentImageSchemaZod = z.object({
    imageUrl: z.string().url('Invalid image URL'),
    imagePosition: z.string(),
});

export const deedRecordSchemaZod = z.object({
    deedCode: z.string().min(1, 'Deed code is required'), // 2 district + 2 RO + 1 booktype + year + 5 deed no
    batchId: z.string().or(z.any()), // ObjectId ref Batch
    pageFrom: z.number().int().min(1),
    pageTo: z.number().int().min(1),
    sequence: z.number().int().default(1),
    exceptionCodes: z.array(z.string()).default([]),
    districtId: z.string().or(z.any()), // ObjectId ref District
    roId: z.string().or(z.any()), // ObjectId ref RO
    bookType: z.string().length(1).optional(),
    volumeYear: z.string().length(4).optional(),
    document: z.array(documentImageSchemaZod).default([]),
    pdfUrl: z.string().url('Invalid PDF URL').optional().or(z.literal('')),
});

export type IDeedRecord = z.infer<typeof deedRecordSchemaZod> & Document;

const DocumentImageSchema = new Schema(
    {
        imageUrl: { type: String, required: true },
        imagePosition: { type: String, required: true },
    },
    { _id: false } // No need for separate ObjectIds for each image embedded doc
);

const DeedRecordSchema = new Schema<IDeedRecord>(
    {
        deedCode: { type: String, required: true },
        batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
        pageFrom: { type: Number, required: true },
        pageTo: { type: Number, required: true },
        sequence: { type: Number, default: 1 },
        exceptionCodes: { type: [String], default: [] },
        districtId: { type: Schema.Types.ObjectId, ref: 'District' },
        roId: { type: Schema.Types.ObjectId, ref: 'RO' },
        bookType: { type: String },
        volumeYear: { type: String },
        document: [DocumentImageSchema],
        pdfUrl: { type: String, default: '' },
    },
    { timestamps: true }
);

DeedRecordSchema.index({ deedCode: 1, sequence: 1 }, { unique: true });

const DeedRecord =
    mongoose.models.DeedRecord ||
    mongoose.model<IDeedRecord>('DeedRecord', DeedRecordSchema);

export default DeedRecord;
