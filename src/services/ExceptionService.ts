import { exceptionRepository } from '../repositories/ExceptionRepository';
import dbConnect from '../lib/dbConnect';
import { IException } from '../models/Exception';

export class ExceptionService {
    async getAllExceptions() {
        await dbConnect();
        return await exceptionRepository.findAll();
    }

    async seedExceptions() {
        await dbConnect();
        const count = await (await exceptionRepository.findAll()).length;
        if (count > 0) return;

        const initialExceptions = [
            { name: 'Torn Page', description: 'The page is physically torn', code: '101', type: 'classic' },
            { name: 'Missing Page', description: 'A page is missing from the volume', code: '102', type: 'classic' },
            { name: 'Wrong Pagination', description: 'Incorrect page numbering', code: '103', type: 'classic' },
            { name: 'Low Quality Scan', description: 'Image is blurry or unreadable', code: '201', type: 'mistake' },
            { name: 'Image Size Mismatch', description: 'Image dimensions are incorrect', code: '202', type: 'mistake' },
            { name: 'Other Image Problem', description: 'General image quality issues', code: '203', type: 'mistake' },
            { name: 'Wrong PDF Generation', description: 'Error during PDF creation', code: '204', type: 'mistake' },
        ] as const;

        for (const ex of initialExceptions) {
            await exceptionRepository.create(ex);
        }
    }
}

export const exceptionService = new ExceptionService();
