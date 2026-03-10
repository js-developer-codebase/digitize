import { NextRequest, NextResponse } from "next/server";
import S3Service from "@/services/S3Service";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const bucket = formData.get("bucket") as string || "doc";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const folder = formData.get("folder") as string;
        const key = folder ? `${folder}/${Date.now()}-${file.name}` : `${Date.now()}-${file.name}`;

        const result = await S3Service.uploadFile(bucket, key, buffer, file.type);
        const publicUrl = S3Service.getPublicUrl(bucket, key);

        return NextResponse.json({
            success: true,
            message: "File uploaded successfully",
            data: {
                ...result,
                url: publicUrl,
            },
        });
    } catch (error: any) {
        console.error("Upload API Error:", error);
        return NextResponse.json(
            { error: "Failed to upload file", details: error.message },
            { status: 500 }
        );
    }
}
