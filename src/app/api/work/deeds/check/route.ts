import { NextResponse } from 'next/server';
import { deedRecordService } from '@/services/DeedRecordService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const status = await deedRecordService.checkDeedStatus(body);
        return NextResponse.json(status);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
