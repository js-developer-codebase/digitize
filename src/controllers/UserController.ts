import { userRepository } from '../repositories/UserRepository';
import { userTypeRepository } from '../repositories/UserTypeRepository';
import { roRepository } from '../repositories/RORepository';
import bcrypt from 'bcryptjs';

export class UserController {
    async createUser(reqUser: any, userData: any) {
        // 1. Check if the requester has permission to create users
        const creatorType = await userTypeRepository.findById(reqUser.userType);
        if (!creatorType) {
            throw new Error('Unauthorized: User type not found');
        }

        const isDeveloper = creatorType.type === 'developer';

        // 2. Validate Target User Type
        const targetTypeDoc = await userTypeRepository.findByType(userData.userType);
        if (!targetTypeDoc) {
            throw new Error('Invalid User Type');
        }

        if (!isDeveloper) {
            // Non-developers can only create types defined in their canCreate list
            if (!creatorType.canCreate.includes(targetTypeDoc.type)) {
                throw new Error(`Unauthorized: You cannot create users of type ${targetTypeDoc.type}`);
            }

            // 3. Location Permission Check (Forward/Reduce)
            // Non-developers can only assign ROs they have permission for
            const requestedROs = userData.accessRO || [];
            const creatorROs = reqUser.accessRO.map((id: any) => id.toString());

            const hasAllROs = requestedROs.every((roId: string) => creatorROs.includes(roId));
            if (!hasAllROs) {
                throw new Error('Unauthorized: You cannot assign ROs that you do not have access to');
            }
        }

        // 4. Hash Password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // 5. Create User
        const newUser = await userRepository.create({
            ...userData,
            password: hashedPassword,
            userType: targetTypeDoc._id,
            accessRO: userData.accessRO || [],
        });

        return newUser;
    }

    async getUsers(reqUser: any, roId?: string) {
        const creatorType = await userTypeRepository.findById(reqUser.userType);
        if (!creatorType) {
            throw new Error('Unauthorized');
        }

        const isDeveloper = creatorType.type === 'developer';
        const filter: any = {};

        // 1. Type filter: Only show types the current user can manage
        if (!isDeveloper) {
            const manageableTypes = await userTypeRepository.findManyByTypes(creatorType.canManage);
            const typeIds = manageableTypes.map(t => t._id);
            filter.userType = { $in: typeIds };
        }

        // 2. RO filter: If provided, filter by it. Ensure the requester has access to it.
        if (roId) {
            const requesterROs = reqUser.accessRO.map((id: any) => id.toString());
            if (!isDeveloper && !requesterROs.includes(roId)) {
                throw new Error('Unauthorized: You do not have access to this RO');
            }
            filter.accessRO = roId;
        } else if (!isDeveloper) {
            // If no specific RO is requested, only show users in ROs the requester has access to
            filter.accessRO = { $in: reqUser.accessRO };
        }

        return userRepository.find(filter);
    }

    async deleteUser(reqUser: any, targetUserId: string) {
        // 1. Permission Check
        const creatorType = await userTypeRepository.findById(reqUser.userType);
        if (!creatorType) throw new Error('Unauthorized');

        const targetUser = await userRepository.findById(targetUserId);
        if (!targetUser) throw new Error('User not found');

        if (creatorType.type !== 'developer') {
            const targetType = (targetUser.userType as any).type;
            if (!creatorType.canManage.includes(targetType)) {
                throw new Error('Unauthorized: You cannot delete this type of user');
            }

            // Optional: location check - ensure target user is within requester's ROs
            const requesterROs = reqUser.accessRO.map((id: any) => id.toString());
            const targetROs = (targetUser.accessRO || []).map((id: any) => id.toString());
            const overlap = targetROs.some((id: string) => requesterROs.includes(id));
            if (!overlap) {
                throw new Error('Unauthorized: This user is not in your permitted ROs');
            }
        }

        return userRepository.softDelete(targetUserId);
    }
}


export const userController = new UserController();
