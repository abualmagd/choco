"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyAws = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
class MyAws {
    constructor() {
        this.s3Client = new client_s3_1.S3Client({
            region: process.env.STORAGE_REGION,
            endpoint: process.env.STORAGE_ENDPOINT,
            forcePathStyle: true,
            credentials: {
                accessKeyId: process.env.STORAGE_ACESS_KEY_ID,
                secretAccessKey: process.env.STORAGE_ACESS_KEY,
            },
        });
    }
    /**
     * uploadFile
     */
    async uploadFile(file, key, bucketName) {
        const input = {
            // PutObjectRequest
            Body: file, //
            Bucket: bucketName, // required
            Key: key, // required
        };
        const command = new client_s3_1.PutObjectCommand(input);
        return await this.s3Client.send(command);
    }
    /**
     * create public url
     */
    createPublicUrl(key) {
        // Construct the public URL
        const publicUrl = `https://${process.env.STORAGE_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        // Alternative if using CloudFront (recommended for CDN)
        // const publicUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`;
    }
}
exports.MyAws = MyAws;
