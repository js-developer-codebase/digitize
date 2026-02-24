import { NextResponse } from 'next/server';
import { roRepository } from '@/repositories/RORepository';
import dbConnect from '@/lib/dbConnect';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const districtCode = searchParams.get('district');
        const ids = searchParams.get('ids')?.split(',');

        if (ids) {
            const ros = await roRepository.findByIds(ids);
            return NextResponse.json(ros);
        }

        if (districtCode) {
            const ros = await roRepository.findByDistrictCode(districtCode);
            return NextResponse.json(ros);
        }

        const allRos = await roRepository.findAll();
        return NextResponse.json(allRos);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
