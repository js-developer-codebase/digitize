import { NextResponse } from 'next/server';
import { deedRecordService } from '@/services/DeedRecordService';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ deedId: string }> }
) {
    try {
        const { deedId } = await params;
        await deedRecordService.deleteDeed(deedId);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
