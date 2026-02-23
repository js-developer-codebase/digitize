import UserType, { IUserType } from '../models/UserType';

export class UserTypeRepository {
    async findByType(type: string): Promise<IUserType | null> {
        return UserType.findOne({ type });
    }

    async create(userTypeData: Partial<IUserType>): Promise<IUserType> {
        const newUserType = new UserType(userTypeData);
        return newUserType.save();
    }

    async countDocuments(): Promise<number> {
        return UserType.countDocuments();
    }
}

export const userTypeRepository = new UserTypeRepository();
