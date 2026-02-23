import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

export const userSchemaZod = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    userType: z.string().or(z.any()), // Can be ObjectId referencing UserType
    accessRO: z.array(z.string()).optional(), // Array of RO codes the user has permission for
    otp: z.string().optional(),
    otpExpires: z.date().optional(),
});

export type IUser = z.infer<typeof userSchemaZod> & Document;

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        userType: { type: Schema.Types.ObjectId, ref: 'UserType', required: true },
        accessRO: [{ type: String }], // Assuming access RO is a list of string codes
        otp: { type: String },
        otpExpires: { type: Date },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
