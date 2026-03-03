import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

export const districtSchemaZod = z.object({
    districtCode: z.string().min(1, 'District Code is required'),
    districtName: z.string().min(1, 'District Name is required'),
});

export type IDistrict = z.infer<typeof districtSchemaZod> & Document;

const DistrictSchema = new Schema<IDistrict>(
    {
        districtCode: { type: String, required: true },
        districtName: { type: String, required: true },
    },
    { timestamps: true }
);


const District =
    mongoose.models.District || mongoose.model<IDistrict>('District', DistrictSchema);

export default District;
