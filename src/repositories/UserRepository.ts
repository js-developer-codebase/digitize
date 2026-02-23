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

    // Helper method for setup script
    async countDocuments(): Promise<number> {
        return User.countDocuments();
    }
}

export const userRepository = new UserRepository();
