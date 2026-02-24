import { NextResponse } from 'next/server';
import { userController } from '@/controllers/UserController';
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

    const { searchParams } = new URL(req.url);
    const roId = searchParams.get('roId');
    const userId = searchParams.get('id');

    try {
        if (userId) {
            const userDetail = await userController.getUserById(user, userId);
            return NextResponse.json(userDetail);
        }
        const users = await userController.getUsers(user, roId || undefined);
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 403 });
    }
}

export async function POST(req: Request) {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const newUser = await userController.createUser(user, body);
        return NextResponse.json(newUser);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 403 });
    }
}

export async function PUT(req: Request) {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });

    try {
        const body = await req.json();
        const updatedUser = await userController.updateUser(user, userId, body);
        return NextResponse.json(updatedUser);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 403 });
    }
}

export async function DELETE(req: Request) {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });

    try {
        const deletedUser = await userController.deleteUser(user, userId);
        return NextResponse.json(deletedUser);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 403 });
    }
}
