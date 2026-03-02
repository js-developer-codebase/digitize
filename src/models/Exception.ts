import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

export const exceptionTypeEnum = ['classic', 'mistake'] as const;

export const exceptionSchemaZod = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    code: z.string().length(3, 'Code must be 3 digits'),
    type: z.enum(exceptionTypeEnum),
});

export type IException = z.infer<typeof exceptionSchemaZod> & Document;

const ExceptionSchema = new Schema<IException>(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        type: { type: String, enum: exceptionTypeEnum, required: true },
    },
    { timestamps: true }
);

const Exception = mongoose.models.Exception || mongoose.model<IException>('Exception', ExceptionSchema);

export default Exception;
