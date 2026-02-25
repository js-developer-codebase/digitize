export const defaultUserTypeConfigs = [
    {
        type: 'developer',
        permissions: ['USER_MANAGEMENT', 'ANALYTICS', 'IMAGE_UPLOAD', 'IMAGE_QC', 'DATA_ENTRY', 'DATA_QC', 'DEED_CONTROLL'],
        canCreate: ['WTL', 'Vendor', 'Supervisor', 'Image Upload User', 'Image QC User', 'Image UAT User', 'Data QC User', 'Data UAT User'],
        canManage: ['WTL', 'Vendor', 'Supervisor', 'Image Upload User', 'Image QC User', 'Image UAT User', 'Data QC User', 'Data UAT User'],
    },
    {
        type: 'WTL',
        permissions: ['ANALYTICS'],
        canCreate: ['Vendor'],
        canManage: ['Vendor'],
    },
    {
        type: 'Vendor',
        permissions: ['ANALYTICS'],
        canCreate: ['Supervisor'],
        canManage: ['Supervisor'],
    },
    {
        type: 'Supervisor',
        permissions: ['ANALYTICS'],
        canCreate: [
            'Image Upload User',
            'Image QC User',
            'Image UAT User',
            'Data QC User',
            'Data UAT User',
        ],
        canManage: [
            'Image Upload User',
            'Image QC User',
            'Image UAT User',
            'Data QC User',
            'Data UAT User',
        ],
    },
    {
        type: 'Image Upload User',
        permissions: ['IMAGE_UPLOAD'],
        canCreate: [],
        canManage: [],
    },
    {
        type: 'Image QC User',
        permissions: ['IMAGE_QC'],
        canCreate: [],
        canManage: [],
    },
    {
        type: 'Image UAT User',
        permissions: [],
        canCreate: [],
        canManage: [],
    },
    {
        type: 'Data QC User',
        permissions: ['DATA_QC'],
        canCreate: [],
        canManage: [],
    },
    {
        type: 'Data UAT User',
        permissions: [],
        canCreate: [],
        canManage: [],
    },
];


export const defaultDistricts = [
    {
        districtCode: '01',
        districtName: 'Kolkata',
        ros: [
            { roCode: '01', roName: 'Kolkata North' },
            { roCode: '02', roName: 'Kolkata South' },
        ],
    },
    {
        districtCode: '02',
        districtName: 'Hooghly',
        ros: [
            { roCode: '03', roName: 'Chinsurah' },
            { roCode: '04', roName: 'Serampore' },
        ],
    },
    {
        districtCode: '03',
        districtName: 'Howrah',
        ros: [
            { roCode: '05', roName: 'Howrah Sadar' },
            { roCode: '06', roName: 'Uluberia' },
        ],
    },
];

export const defaultAdminUser = {
    name: 'Admin WTL',
    email: 'sabuj.code27@gmail.com',
    password: 'password123',
    accessRO: ['01', '02', '03', '04', '05', '06'],
};

export const defaultDeveloperUser = {
    name: 'JS Developer',
    email: process.env.DEVMAIL,
    password: process.env.DEVPASS,
    accessRO: ['01', '02', '03', '04', '05', '06'],
};

