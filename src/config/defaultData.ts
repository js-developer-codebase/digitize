export const defaultUserTypeConfigs = [
    {
        type: 'WTL',
        permissions: ['View Analytics Dashboard'],
        canCreate: ['Vendor'],
        canManage: ['Vendor'],
    },
    {
        type: 'Vendor',
        permissions: ['View Analytics Dashboard'],
        canCreate: ['Supervisor'],
        canManage: ['Supervisor'],
    },
    {
        type: 'Supervisor',
        permissions: ['View Analytics Dashboard'],
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
        permissions: [],
        canCreate: [],
        canManage: [],
    },
    {
        type: 'Image QC User',
        permissions: [],
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
        permissions: [],
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
