import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/UserRepository';
import { districtRepository } from '../repositories/DistrictRepository';
import { userTypeRepository } from '../repositories/UserTypeRepository';
import {
    defaultUserTypeConfigs,
    defaultDistricts,
    defaultAdminUser,
} from '../config/defaultData';

export class SetupService {
    async initialize() {
        console.log('Starting DB initialization...');

        // 1. Seed User Types
        let wtlTypeDoc: any = null;
        for (const config of defaultUserTypeConfigs) {
            let userTypeDoc = await userTypeRepository.findByType(config.type);
            if (!userTypeDoc) {
                userTypeDoc = await userTypeRepository.create(config as any);
                console.log(`Created ${config.type} UserType.`);
            } else {
                // Update existing to ensure latest permissions/canCreate/canManage
                Object.assign(userTypeDoc, config as any);
                await userTypeDoc.save();
                console.log(`Updated ${config.type} UserType.`);
            }
            if (config.type === 'WTL') {
                wtlTypeDoc = userTypeDoc;
            }
        }

        // 2. Seed Default Example Districts
        const districtCount = await districtRepository.countDocuments();
        if (districtCount === 0) {
            for (const dist of defaultDistricts) {
                await districtRepository.create(dist);
            }
            console.log('Seeded default districts.');
        }

        // 3. Seed Default WTL User
        let wtlUser = await userRepository.findByEmail(defaultAdminUser.email);
        if (!wtlUser) {
            const hashedPassword = await bcrypt.hash(defaultAdminUser.password, 10);
            await userRepository.create({
                name: defaultAdminUser.name,
                email: defaultAdminUser.email,
                password: hashedPassword,
                userType: wtlTypeDoc._id,
                accessRO: defaultAdminUser.accessRO,
            });
            console.log(`Created default WTL user: ${defaultAdminUser.email}`);
        } else {
            // Update existing user properties if needed (e.g. accessRO)
            wtlUser.userType = wtlTypeDoc._id;
            wtlUser.accessRO = defaultAdminUser.accessRO;
            await wtlUser.save();
            console.log(`Updated default WTL user: ${defaultAdminUser.email}`);
        }

        return { message: 'Initialization completed.' };
    }
}

export const setupService = new SetupService();
