import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { userRepository } from '../repositories/UserRepository';
import { districtRepository } from '../repositories/DistrictRepository';
import { roRepository } from '../repositories/RORepository';
import { userTypeRepository } from '../repositories/UserTypeRepository';
import * as defaultData from '../config/defaultData';
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

        // 1.5 Migrate Existing RO data from Districts if embedded
        try {
            console.log('Checking for legacy RO data in Districts...');
            const District = mongoose.models.District || mongoose.model('District');
            const districtsRaw = await District.collection.find({
                ros: { $exists: true, $not: { $size: 0 } }
            }).toArray();

            console.log(`Found ${districtsRaw.length} districts with legacy RO data.`);

            for (const dist of districtsRaw) {
                console.log(`Migrating ROs for District: ${dist.districtName} (${dist.districtCode})`);
                if (dist.ros && Array.isArray(dist.ros)) {
                    for (const ro of dist.ros) {
                        try {
                            const existingRO = await roRepository.findByCode(ro.roCode);
                            if (!existingRO) {
                                await roRepository.create({
                                    roName: ro.roName,
                                    roCode: ro.roCode,
                                    districtCode: dist.districtCode,
                                    districtId: dist._id,
                                });
                                console.log(`  Migrated RO: ${ro.roName}`);
                            }
                        } catch (roErr: any) {
                            console.error(`  Error migrating RO ${ro.roCode}:`, roErr.message);
                        }
                    }
                }
                // Clear the ros field from the district document after migration
                await District.collection.updateOne(
                    { _id: dist._id },
                    { $unset: { ros: "" } }
                );
            }
        } catch (migErr: any) {
            console.error('Migration error:', migErr.message);
        }



        // 2. Seed Default Example Districts and ROs
        const districtCount = await districtRepository.countDocuments();
        if (districtCount === 0) {
            for (const dist of defaultDistricts) {
                // District model no longer has 'ros' field, so we omit it
                const { ros, ...distData } = dist;
                await districtRepository.create(distData);

                // Seed ROs separately
                for (const ro of ros) {
                    await roRepository.create({
                        ...ro,
                        districtCode: dist.districtCode,
                        districtId: (await districtRepository.findByCode(dist.districtCode))?._id,
                    });
                }
            }
            console.log('Seeded default districts and ROs.');
        }

        // 3. Seed Default WTL User and Developer User
        const usersToSeed = [
            { config: defaultAdminUser, type: 'WTL' },
            { config: (defaultData as any).defaultDeveloperUser, type: 'developer' }
        ];

        for (const { config, type } of usersToSeed) {
            if (!config) continue;

            const typeDoc = await userTypeRepository.findByType(type);
            let user = await userRepository.findByEmail(config.email);

            // Convert RO codes to IDs
            const roIds = [];
            if (config.accessRO && config.accessRO.length > 0) {
                for (const code of config.accessRO) {
                    const roDoc = await roRepository.findByCode(code);
                    if (roDoc) roIds.push(roDoc._id);
                }
            }

            if (!user) {
                const hashedPassword = await bcrypt.hash(config.password, 10);
                await userRepository.create({
                    name: config.name,
                    email: config.email,
                    password: hashedPassword,
                    userType: typeDoc?._id,
                    accessRO: roIds,
                });
                console.log(`Created default ${type} user: ${config.email}`);
            } else {
                user.userType = typeDoc?._id;
                user.accessRO = roIds as any;
                await user.save();
                console.log(`Updated default ${type} user: ${config.email}`);
            }
        }

        return { message: 'Initialization completed.' };

    }
}

export const setupService = new SetupService();
