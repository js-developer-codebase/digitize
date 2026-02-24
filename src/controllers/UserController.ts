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

        if (!isDeveloper) {
            const manageableTypes = await userTypeRepository.findManyByTypes(creatorType.canManage);
            const typeIds = manageableTypes.map(t => t._id);
            filter.userType = { $in: typeIds };
        }

        if (roId) {
            const requesterROs = reqUser.accessRO.map((id: any) => id.toString());
            if (!isDeveloper && !requesterROs.includes(roId)) {
                throw new Error('Unauthorized: You do not have access to this RO');
            }
            filter.accessRO = roId;
        } else if (!isDeveloper) {
            filter.accessRO = { $in: reqUser.accessRO };
        }

        return userRepository.find(filter);
    }

    async getUserById(reqUser: any, targetUserId: string) {
        const creatorType = await userTypeRepository.findById(reqUser.userType);
        if (!creatorType) throw new Error('Unauthorized');

        const targetUser = await userRepository.findById(targetUserId);
        if (!targetUser) throw new Error('User not found');

        const isDeveloper = creatorType.type === 'developer';
        if (!isDeveloper) {
            const isSelf = reqUser._id.toString() === targetUserId;
            if (!isSelf) {
                const targetType = (targetUser.userType as any).type;
                if (!creatorType.canManage.includes(targetType)) {
                    throw new Error('Unauthorized: You cannot view this type of user');
                }

                const requesterROs = reqUser.accessRO.map((id: any) => id.toString());
                const targetROs = (targetUser.accessRO || []).map((id: any) => id.toString());
                const overlap = targetROs.some((id: string) => requesterROs.includes(id));
                if (!overlap) {
                    throw new Error('Unauthorized: This user is not in your permitted ROs');
                }
            }
        }

        return targetUser;
    }

    async updateUser(reqUser: any, targetUserId: string, updateData: any) {
        const creatorType = await userTypeRepository.findById(reqUser.userType);
        if (!creatorType) throw new Error('Unauthorized');

        const targetUser = await userRepository.findById(targetUserId);
        if (!targetUser) throw new Error('User not found');

        const isDeveloper = creatorType.type === 'developer';
        const isSelf = reqUser._id.toString() === targetUserId;

        // Password Reset Restriction: Only self or developer
        if (updateData.password) {
            if (!isDeveloper && !isSelf) {
                throw new Error('Unauthorized: Only the user or a developer can reset the password');
            }
            updateData.password = await bcrypt.hash(updateData.password, 10);
        } else {
            delete updateData.password;
        }

        if (!isDeveloper) {
            const targetType = (targetUser.userType as any).type;

            if (!isSelf && !creatorType.canManage.includes(targetType)) {
                throw new Error('Unauthorized: You cannot edit this type of user');
            }

            if (!isSelf) {
                const requesterROs = reqUser.accessRO.map((id: any) => id.toString());
                const targetROs = (targetUser.accessRO || []).map((id: any) => id.toString());
                const overlap = targetROs.some((id: string) => requesterROs.includes(id));
                if (!overlap) {
                    throw new Error('Unauthorized: This user is not in your permitted ROs');
                }
            }

            if (updateData.userType) {
                const newTypeDoc = await userTypeRepository.findByType(updateData.userType);
                if (!newTypeDoc) throw new Error('Invalid User Type');
                if (!creatorType.canCreate.includes(newTypeDoc.type) && !isSelf) {
                    throw new Error('Unauthorized: Invalid role assignment');
                }
                updateData.userType = newTypeDoc._id;
            }

            if (updateData.accessRO && !isSelf) {
                const requesterROs = reqUser.accessRO.map((id: any) => id.toString());
                const hasAllROs = updateData.accessRO.every((roId: string) => requesterROs.includes(roId));
                if (!hasAllROs) {
                    throw new Error('Unauthorized: RO assignment restriction');
                }
            }
        } else if (updateData.userType) {
            const newTypeDoc = await userTypeRepository.findByType(updateData.userType);
            if (newTypeDoc) updateData.userType = newTypeDoc._id;
        }

        return userRepository.update(targetUserId, updateData);
    }

    async deleteUser(reqUser: any, targetUserId: string) {
        const creatorType = await userTypeRepository.findById(reqUser.userType);
        if (!creatorType) throw new Error('Unauthorized');

        const targetUser = await userRepository.findById(targetUserId);
        if (!targetUser) throw new Error('User not found');

        if (creatorType.type !== 'developer') {
            const targetType = (targetUser.userType as any).type;
            if (!creatorType.canManage.includes(targetType)) {
                throw new Error('Unauthorized: You cannot delete this type of user');
            }

            const requesterROs = reqUser.accessRO.map((id: any) => id.toString());
            const targetROs = (targetUser.accessRO || []).map((id: any) => id.toString());
            const overlap = targetROs.some((id: string) => requesterROs.includes(id));
            if (!overlap) {
                throw new Error('Unauthorized: User not in permitted ROs');
            }
        }

        return userRepository.softDelete(targetUserId);
    }
}

export const userController = new UserController();
