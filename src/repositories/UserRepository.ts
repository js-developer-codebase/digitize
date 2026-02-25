import User, { IUser } from '../models/User';
import UserType from '../models/UserType';

export class UserRepository {
    async findByEmail(email: string): Promise<IUser | null> {
        return User.findOne({ email }).populate('userType');
    }

    async findById(id: string): Promise<IUser | null> {
        return User.findById(id).populate('userType');
    }

    async create(userData: Partial<IUser>): Promise<IUser> {
        const newUser = new User(userData);
        return newUser.save();
    }

    async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        return User.findByIdAndUpdate(id, updateData, { new: true });
    }

    async findAll(): Promise<IUser[]> {
        return User.find({ isDeleted: { $ne: true } }).populate('userType');
    }

    async find(filter: any, limit: number = 20, skip: number = 0): Promise<IUser[]> {
        return User.find({ ...filter, isDeleted: { $ne: true } })
            .populate('userType')
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 }); // Sort by newest first
    }

    async softDelete(id: string): Promise<IUser | null> {
        return User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }

    async countDocuments(): Promise<number> {
        return User.countDocuments();
    }
}

export const userRepository = new UserRepository();

