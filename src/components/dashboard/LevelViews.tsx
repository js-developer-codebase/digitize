'use client';

import React, { useEffect, useState } from 'react';
import { useNavigationStore } from '@/store/navigationStore';
import { MenuConfig } from '@/config/menuConfig';
import DataCard from './DataCard';

interface Props {
    userPermissions: string[];
    districts: any[];
    accessRO: string[]; // codes the user has permission on
}

export const LevelViews: React.FC<Props> = ({ userPermissions, districts, accessRO }) => {
    const { currentLevel, path, pushToPath } = useNavigationStore();

    // Level 0: Work Cards
    if (currentLevel === 0) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {userPermissions.map((code) => {
                    const config = MenuConfig[code];
                    if (!config) return null;
                    return (
                        <DataCard
                            key={code}
                            title={config.name}
                            iconName={config.icon}
                            color="blue"
                            onClick={() => pushToPath({ id: code, name: config.name, type: 'WORK' })}
                        />
                    );
                })}
            </div>
        );
    }

    // Level 1: District Cards
    if (currentLevel === 1) {
        const selectedWork = path[0];
        // Filter districts that have ROs the user has access to
        const filteredDistricts = districts.filter(d =>
            d.ros.some((ro: any) => accessRO.includes(ro.roCode))
        );

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredDistricts.map((d) => (
                    <DataCard
                        key={d.districtCode}
                        title={d.districtName}
                        subtitle={`Code: ${d.districtCode} | ${d.ros.length} ROs`}
                        iconName="MapPin"
                        color="green"
                        onClick={() => pushToPath({ id: d.districtCode, name: d.districtName, type: 'DISTRICT', data: d })}
                    />
                ))}
            </div>
        );
    }

    // Level 2: RO Cards
    if (currentLevel === 2) {
        const selectedDistrict = path[1]?.data;
        if (!selectedDistrict) return <div>Error: District not found</div>;

        // Filter ROs that the user has specific permission for
        const allowedROs = selectedDistrict.ros.filter((ro: any) => accessRO.includes(ro.roCode));

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {allowedROs.map((ro: any) => (
                    <DataCard
                        key={ro.roCode}
                        title={ro.roName}
                        subtitle={`RO Code: ${ro.roCode}`}
                        iconName="Building2"
                        color="purple"
                        onClick={() => {
                            // Final level reached - could navigate to a specific page or show more details
                            const workCode = path[0].id;
                            const config = MenuConfig[workCode];
                            const finalPath = `${config.path}?district=${selectedDistrict.districtCode}&ro=${ro.roCode}`;
                            window.location.href = finalPath;
                        }}
                    />
                ))}
            </div>
        );
    }

    return null;
};
