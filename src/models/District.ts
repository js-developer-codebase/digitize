import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

export const roSchemaZod = z.object({
    roName: z.string().min(1, 'RO Name is required'),
    roCode: z.string().min(1, 'RO Code is required'),
});

export const districtSchemaZod = z.object({
    districtCode: z.string().min(1, 'District Code is required'),
    districtName: z.string().min(1, 'District Name is required'),
    ros: z.array(roSchemaZod).default([]),
});

export type IRO = z.infer<typeof roSchemaZod> & { _id?: mongoose.Types.ObjectId };
export type IDistrict = z.infer<typeof districtSchemaZod> & Document;

const ROSchema = new Schema<IRO>({
    roName: { type: String, required: true },
    roCode: { type: String, required: true, unique: true },
});

const DistrictSchema = new Schema<IDistrict>(
    {
        districtCode: { type: String, required: true, unique: true },
        districtName: { type: String, required: true },
        ros: [ROSchema], // Embedded array of ROs
    },
    { timestamps: true }
);

const District =
    mongoose.models.District || mongoose.model<IDistrict>('District', DistrictSchema);

export default District;
