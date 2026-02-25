import { NextResponse } from 'next/server';
import { userTypeRepository } from '@/repositories/UserTypeRepository';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-jwt';
const secret = new TextEncoder().encode(JWT_SECRET);

async function getSessionUser(req: Request) {
    const cookie = req.headers.get('cookie');
    const token = cookie?.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1];
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, secret);
        await dbConnect();
        return await User.findById(payload.id).populate('userType');
    } catch (e) {
        return null;
    }
}

export async function GET(req: Request) {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const userType = (user.userType as any);
        let allowedTypes: string[] = [];

        if (userType.type === 'developer') {
            // Developers can create all types except developer (or even developer if needed, but usually not)
            // For now, let's fetch all types
            const allTypes = await userTypeRepository.findAll();
            return NextResponse.json(allTypes);
        } else {
            // Others can only create types in their canCreate list
            allowedTypes = userType.canCreate || [];
            const types = await userTypeRepository.findManyByTypes(allowedTypes);
            return NextResponse.json(types);
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
