import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import s3Client from "@/lib/s3Client";

export class S3Service {
    /**
     * Uploads a file to Supabase Storage using S3 compatible API.
     * @param bucket Name of the bucket
     * @param key File path in the bucket
     * @param body Buffer, ReadableStream, or Blob
     * @param contentType MIME type of the file
     */
    async uploadFile(
        bucket: string,
        key: string,
        body: Buffer | Uint8Array | Blob | ReadableStream,
        contentType: string
    ) {
        try {
            const parallelUploads3 = new Upload({
                client: s3Client,
                params: {
                    Bucket: bucket,
                    Key: key,
                    Body: body,
                    ContentType: contentType,
                },
                queueSize: 4, // optional concurrency configuration
                partSize: 1024 * 1024 * 5, // optional size of each part, in bytes (5MB)
                leavePartsOnError: false, // optional manually handle dropped parts
            });

            parallelUploads3.on("httpUploadProgress", (progress) => {
                console.log(`Upload progress: ${progress.loaded}/${progress.total}`);
            });

            const result = await parallelUploads3.done();
            return result;
        } catch (error) {
            console.error("Error uploading file to S3:", error);
            throw error;
        }
    }
    getPublicUrl(bucket: string, key: string) {
        let baseUrl = process.env.SUPERBASE_URL || "";
        baseUrl = baseUrl.replace(".storage.supabase.co", ".supabase.co");
        baseUrl = baseUrl.replace("/storage/v1/s3", "/storage/v1/object/public");

        return `${baseUrl}/${bucket}/${key}`;
    }
}

export default new S3Service();
