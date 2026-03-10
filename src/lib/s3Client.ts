import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    forcePathStyle: true,
    region: "us-east-1",
    endpoint: process.env.SUPERBASE_URL || "",
    credentials: {
        accessKeyId: process.env.SUPERBASE_ACCESS_KEY || "",
        secretAccessKey: process.env.SUPERBASE_SECRET_KEY || "",
    },
});

export default s3Client;
