import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

export const roSchemaZod = z.object({
    roName: z.string().min(1, 'RO Name is required'),
    roCode: z.string().min(1, 'RO Code is required'),
    districtCode: z.string().min(1, 'District Code is required'),
});

export type IRO = z.infer<typeof roSchemaZod> & Document;

const ROSchema = new Schema<IRO>(
    {
        roName: { type: String, required: true },
        roCode: { type: String, required: true, unique: true },
        districtCode: { type: String, required: true },
    },
    { timestamps: true }
);

const RO = mongoose.models.RO || mongoose.model<IRO>('RO', ROSchema);

export default RO;
