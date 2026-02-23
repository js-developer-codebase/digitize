import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

export const UserTypeEnum = z.enum([
    'WTL',
    'Vendor',
    'Supervisor',
    'Image Upload User',
    'Image QC User',
    'Image UAT User',
    'Data QC User',
    'Data UAT User',
]);

export const userTypeSchemaZod = z.object({
    type: UserTypeEnum,
    permissions: z.array(z.string()).describe("General tasks like 'View Analytics'"),
    canCreate: z.array(UserTypeEnum).describe("User types this role can create"),
    canManage: z.array(UserTypeEnum).describe("User types this role can manage"),
});

export type IUserType = z.infer<typeof userTypeSchemaZod> & Document;

const UserTypeSchema = new Schema<IUserType>(
    {
        type: {
            type: String,
            enum: UserTypeEnum.options,
            required: true,
            unique: true,
        },
        permissions: [{ type: String }],
        canCreate: [{ type: String, enum: UserTypeEnum.options }],
        canManage: [{ type: String, enum: UserTypeEnum.options }],
    },
    { timestamps: true }
);

const UserType =
    mongoose.models.UserType || mongoose.model<IUserType>('UserType', UserTypeSchema);

export default UserType;
