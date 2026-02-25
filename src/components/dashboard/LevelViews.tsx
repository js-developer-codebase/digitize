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
                            iconName={config.icon || 'Box'}
                            color="blue"
                            onClick={() => pushToPath({ id: code, name: config.name, type: 'WORK' })}
                        />
                    );
                })}
            </div>
        );
    }

    // Level 1: Sub-options OR Districts
    if (currentLevel === 1) {
        const selectedWork = path[0];

        // Special handling for User Management sub-menu
        if (selectedWork.id === 'USER_MANAGEMENT') {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    <DataCard
                        title="Create User"
                        iconName="UserPlus"
                        color="indigo"
                        onClick={() => {
                            window.location.href = '/user-management/create';
                        }}
                    />
                    <DataCard
                        title="Manage User"
                        iconName="Users"
                        color="teal"
                        onClick={() => {
                            pushToPath({ id: 'MANAGE_USER_LIST', name: 'Manage User', type: 'MANAGEMENT' });
                        }}
                    />
                </div>
            );
        }

        // Standard District Selection (Level 1)
        const filteredDistricts = districts.filter(d =>
            d.ros.some((ro: any) => accessRO.includes(ro._id) || accessRO.includes(ro.roCode))
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

    // Level 2: Sub-option District Selection OR RO Selection
    if (currentLevel === 2) {
        const rootWork = path[0];
        const subWorkOrDistrict = path[1];

        // If the first level was a sub-menu (like User Management), then Level 2 is District Selection
        if (rootWork.id === 'USER_MANAGEMENT') {
            const filteredDistricts = districts.filter(d =>
                d.ros.some((ro: any) => accessRO.includes(ro._id) || accessRO.includes(ro.roCode))
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

        // Otherwise, Level 1 was District Selection, so Level 2 should be RO Selection
        const selectedDistrict = subWorkOrDistrict.data;
        if (!selectedDistrict) return <div>Error: District data missing</div>;

        const allowedROs = selectedDistrict.ros.filter((ro: any) => accessRO.includes(ro._id) || accessRO.includes(ro.roCode));

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
                            const workCode = rootWork.id;
                            const config = MenuConfig[workCode];
                            const finalPath = `${config.path}?district=${selectedDistrict.districtCode}&ro=${ro.roCode}`;
                            window.location.href = finalPath;
                        }}
                    />
                ))}
            </div>
        );
    }

    // Level 3: RO Selection
    if (currentLevel === 3) {
        const selectedDistrict = path[2]?.data;
        if (!selectedDistrict) return <div>Error: District not found</div>;

        const allowedROs = selectedDistrict.ros.filter((ro: any) => accessRO.includes(ro._id) || accessRO.includes(ro.roCode));

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
                            const isManageFlow = path[1]?.id === 'MANAGE_USER_LIST';
                            if (isManageFlow) {
                                window.location.href = `/user-management/list?roId=${ro._id}&roName=${ro.roName}`;
                            } else {
                                const workCode = path[0].id;
                                const config = MenuConfig[workCode];
                                const finalPath = `${config.path}?district=${selectedDistrict.districtCode}&ro=${ro.roCode}`;
                                window.location.href = finalPath;
                            }
                        }}
                    />
                ))}
            </div>
        );
    }


    return null;
};

