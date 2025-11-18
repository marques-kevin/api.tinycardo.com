import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { StorageService } from '@/modules/global/services/storage_service/storage_service';

@Injectable()
export class StorageServiceS3 extends StorageService {
  private readonly s3_client: S3Client;
  private readonly bucket_name: string;
  private readonly public_url: string;

  constructor() {
    super();
    const endpoint = process.env.S3_ENDPOINT as string;
    const access_key_id = process.env.S3_ACCESS_KEY_ID as string;
    const secret_access_key = process.env.S3_SECRET_ACCESS_KEY as string;
    this.bucket_name = process.env.S3_BUCKET_NAME as string;
    this.public_url = process.env.S3_PUBLIC_URL as string;

    if (
      !endpoint ||
      !access_key_id ||
      !secret_access_key ||
      !this.bucket_name
    ) {
      throw new Error(
        'S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_BUCKET_NAME environment variables are required',
      );
    }

    this.s3_client = new S3Client({
      endpoint,
      region: process.env.S3_REGION || 'auto',
      credentials: {
        accessKeyId: access_key_id,
        secretAccessKey: secret_access_key,
      },
      forcePathStyle: true, // Required for Cloudflare R2 and MinIO
    });
  }

  private async ensure_bucket_exists(): Promise<void> {
    try {
      await this.s3_client.send(
        new HeadBucketCommand({ Bucket: this.bucket_name }),
      );
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        // Bucket doesn't exist, create it
        try {
          await this.s3_client.send(
            new CreateBucketCommand({ Bucket: this.bucket_name }),
          );
          console.log(`Created bucket: ${this.bucket_name}`);
        } catch (createError) {
          console.error(
            `Failed to create bucket ${this.bucket_name}:`,
            createError,
          );
          // Don't throw, let it fail on first upload if needed
        }
      }
    }
  }

  async upload_audio(params: {
    audio: Buffer;
    filename: string;
  }): Promise<{ url: string }> {
    try {
      // Ensure bucket exists before uploading
      await this.ensure_bucket_exists();

      const command = new PutObjectCommand({
        Bucket: this.bucket_name,
        Key: params.filename,
        Body: params.audio,
        ContentType: 'audio/wav',
      });

      await this.s3_client.send(command);

      return {
        url: this.public_url
          ? `${this.public_url}/${params.filename}`
          : `${process.env.S3_ENDPOINT}/${this.bucket_name}/${params.filename}`,
      };
    } catch (error) {
      console.error('Error uploading audio to S3:', error);
      throw error;
    }
  }

  async file_exists(params: { filename: string }): Promise<{
    exists: boolean;
    url?: string;
  }> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket_name,
        Key: params.filename,
      });

      await this.s3_client.send(command);

      return {
        exists: true,
        url: this.public_url
          ? `${this.public_url}/${params.filename}`
          : `${process.env.S3_ENDPOINT}/${this.bucket_name}/${params.filename}`,
      };
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return { exists: false };
      }

      console.error('Error checking file existence in S3:', error);
      // On error, assume file doesn't exist
      return { exists: false };
    }
  }
}
