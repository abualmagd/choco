import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export class MyAws {
  constructor() {}

  private s3Client = new S3Client({
    region: process.env.STORAGE_REGION,
    endpoint: process.env.STORAGE_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.STORAGE_ACESS_KEY_ID as string,
      secretAccessKey: process.env.STORAGE_ACESS_KEY as string,
    },
  });

  /**
   * uploadFile
   */
  public async uploadFile(file: any, key: string, bucketName: string) {
    const input = {
      // PutObjectRequest
      Body: file, //
      Bucket: bucketName, // required
      Key: key, // required
    };
    const command = new PutObjectCommand(input);
    return await this.s3Client.send(command);
  }

  /**
   * create public url
   */
  public createPublicUrl(key: string) {
    // Construct the public URL
    const publicUrl = `https://${process.env.STORAGE_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    // Alternative if using CloudFront (recommended for CDN)
    // const publicUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`;
  }
}
