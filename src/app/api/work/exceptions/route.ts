import { NextResponse } from 'next/server';
import { exceptionService } from '@/services/ExceptionService';

export async function GET() {
    try {
        await exceptionService.seedExceptions(); // Ensure exceptions are seeded
        const exceptions = await exceptionService.getAllExceptions();
        return NextResponse.json(exceptions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
