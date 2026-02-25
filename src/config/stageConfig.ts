export interface BatchStage {
    code: string;
    name: string;
    description: string;
    sequence: number;
}

export const StageConfig: Record<string, BatchStage> = {
    init: {
        code: 'INIT',
        name: 'Initialized',
        description: 'Batch has been created and is awaiting the first processing task.',
        sequence: 1,
    },
    deedcontroll: {
        code: 'DEED_CTRL',
        name: 'Deed Control',
        description: 'Verifying physical deed availability and metadata matching.',
        sequence: 2,
    },
    imageUpload: {
        code: 'IMG_UPL',
        name: 'Image Upload',
        description: 'Scanning and uploading deed images to the cloud for processing.',
        sequence: 3,
    },
    'image qc': {
        code: 'IMG_QC',
        name: 'Image QC',
        description: 'Quality checks on scanned images for clarity and completeness.',
        sequence: 4,
    },
    uat: {
        code: 'UAT',
        name: 'User Acceptance Testing',
        description: 'Final verification of scanned images by UAT Officer.',
        sequence: 5,
    },
    'digital sign': {
        code: 'DIG_SIG',
        name: 'Digital Signing',
        description: 'Applying digital signatures to verified deed documents.',
        sequence: 6,
    },
    'pdf export': {
        code: 'PDF_EXP',
        name: 'PDF Export',
        description: 'Generating final PDF documents for the archival system.',
        sequence: 7,
    },
    'exported': {
        code: 'EXP',
        name: 'Exported',
        description: 'Final PDF documents for the archival system has been exported.',
        sequence: 8,
    },
    'data entry': {
        code: 'DATA_ENT',
        name: 'Data Entry',
        description: 'Manually entering deed content into the digitization database.',
        sequence: 9,
    },
    'data qc': {
        code: 'DATA_QC',
        name: 'Data QC',
        description: 'Verifying accuracy of entered data against the original deed images.',
        sequence: 10,
    },
    'final data qc': {
        code: 'F_DATA_QC',
        name: 'Final Data QC',
        description: 'Secondary high-level quality check of all digitized data.',
        sequence: 11,
    },
    'data uat': {
        code: 'D_UAT',
        name: 'Data UAT',
        description: 'Official verification of the digitized records by client representatives.',
        sequence: 12,
    },
    'deed export': {
        code: 'DEED_EXP',
        name: 'Deed Export',
        description: 'Completion of the digitization process and delivery of the final product.',
        sequence: 13,
    },
};

export const getStageByCode = (code: string): BatchStage | undefined => {
    return Object.values(StageConfig).find(s => s.code === code);
};

export const getStageByKey = (key: string): BatchStage | undefined => {
    return StageConfig[key];
};
