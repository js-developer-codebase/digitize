import { NextRequest, NextResponse } from 'next/server';
import { districtService } from '../services/DistrictService';

export class DistrictController {
    async getAllDistricts(req: NextRequest) {
        try {
            const result = await districtService.getAllDistricts();
            return NextResponse.json(result, { status: 200 });
        } catch (error: any) {
            return NextResponse.json(
                { error: error.message || 'Failed to fetch districts' },
                { status: 500 }
            );
        }
    }
}

export const districtController = new DistrictController();
