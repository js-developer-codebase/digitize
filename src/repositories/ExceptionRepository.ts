import Exception, { IException } from '../models/Exception';

export class ExceptionRepository {
    async findAll(): Promise<IException[]> {
        return Exception.find().sort({ code: 1 });
    }

    async findByCode(code: string): Promise<IException | null> {
        return Exception.findOne({ code });
    }

    async create(data: Partial<IException>): Promise<IException> {
        const exception = new Exception(data);
        return exception.save();
    }
}

export const exceptionRepository = new ExceptionRepository();
