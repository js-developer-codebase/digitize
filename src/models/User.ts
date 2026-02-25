import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

export const userSchemaZod = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    userType: z.string().or(z.any()), // Can be ObjectId referencing UserType
    accessRO: z.array(z.string().or(z.any())).optional(), // Array of RO IDs
    otp: z.string().optional(),
    otpExpires: z.date().optional(),
    isDeleted: z.boolean().default(false).optional(),
});

export type IUser = z.infer<typeof userSchemaZod> & Document;

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        userType: { type: Schema.Types.ObjectId, ref: 'UserType', required: true },
        accessRO: [{ type: Schema.Types.ObjectId, ref: 'RO' }], // Use RO IDs
        otp: { type: String },
        otpExpires: { type: Date },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);


const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
