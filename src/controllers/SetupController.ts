import { NextResponse } from 'next/server';
import { setupService } from '../services/SetupService';

export class SetupController {
    async initialize() {
        try {
            const result = await setupService.initialize();
            return NextResponse.json(result, { status: 200 });
        } catch (error: any) {
            console.error("Initialization error:", error);
            return NextResponse.json(
                { error: error.message || 'Setup failed' },
                { status: 500 }
            );
        }
    }
}

export const setupController = new SetupController();
