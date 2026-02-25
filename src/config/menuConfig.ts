export interface MenuItem {
    name: string;
    path: string;
    icon?: string;
}

export const MenuConfig: Record<string, MenuItem> = {
    'ANALYTICS': {
        name: 'Analytics',
        path: '/analytics',
        icon: 'BarChart3',
    },
    'IMAGE_UPLOAD': {
        name: 'Image Upload',
        path: '/work/image-upload',
        icon: 'Upload',
    },
    'IMAGE_QC': {
        name: 'Image QC',
        path: '/work/image-qc',
        icon: 'Search',
    },
    'DATA_ENTRY': {
        name: 'Data Entry',
        path: '/work/data-entry',
        icon: 'FileText',
    },
    'DATA_QC': {
        name: 'Data QC',
        path: '/work/data-qc',
        icon: 'CheckSquare',
    },
    'DEED_CONTROLL': {
        name: 'Deed Control',
        path: '/work/deed-control',
        icon: 'ShieldCheck',
    },
    'USER_MANAGEMENT': {
        name: 'User Management',
        path: '/user-management',
        icon: 'Users',
    },

    // Add more mappings as per stageEnumChoices if needed
};
