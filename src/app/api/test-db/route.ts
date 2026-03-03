import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import District from '@/models/District';
import RO from '@/models/RO';
import User from '@/models/User';

export async function GET() {
    await dbConnect();
    const dbName = mongoose.connection.db?.databaseName;
    const uri = process.env.MONGODB_URI;

    // Quick attempt to force initialization if empty
    let initializedNow = false;
    let setupError = null;
    const distCount = await District.countDocuments();

    if (distCount === 0) {
        try {
            const { setupService } = await import('@/services/SetupService');
            await setupService.initialize();
            initializedNow = true;
        } catch (e: any) {
            setupError = e.message;
        }
    }

    const d = await District.countDocuments();
    const r = await RO.countDocuments();
    const u = await User.find({}, { name: 1, email: 1, userType: 1, accessRO: 1 });

    return NextResponse.json({
        dbName,
        uriConfigured: uri ? 'Yes' : 'No',
        uriEndsWith: uri ? uri.split('/').pop() : 'none',
        districtCountBefore: distCount,
        districtCountAfter: d,
        roCount: r,
        userCount: u.length,
        users: u,
        initializedNow,
        setupError
    });
}
