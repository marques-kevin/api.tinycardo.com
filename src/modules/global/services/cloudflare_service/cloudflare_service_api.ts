import { Injectable } from '@nestjs/common';
import { CloudflareService } from '@/modules/global/services/cloudflare_service/cloudflare_service';

@Injectable()
export class CloudflareServiceApi extends CloudflareService {
  private readonly account_id: string;
  private readonly api_token: string;
  private readonly bucket_name: string;
  private readonly r2_endpoint: string;

  constructor() {
    super();
    this.account_id = process.env.CLOUDFLARE_ACCOUNT_ID as string;
    this.api_token = process.env.CLOUDFLARE_API_TOKEN as string;
    this.bucket_name = process.env.CLOUDFLARE_R2_BUCKET_NAME as string;
    this.r2_endpoint = process.env.CLOUDFLARE_R2_ENDPOINT as string;

    if (!this.account_id || !this.api_token || !this.bucket_name) {
      throw new Error(
        'CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and CLOUDFLARE_R2_BUCKET_NAME environment variables are required',
      );
    }
  }

  async upload_audio(params: {
    audio: Buffer;
    filename: string;
  }): Promise<{ url: string }> {
    try {
      const url = this.r2_endpoint
        ? `${this.r2_endpoint}/${this.bucket_name}/${params.filename}`
        : `https://${this.account_id}.r2.cloudflarestorage.com/${this.bucket_name}/${params.filename}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.api_token}`,
          'Content-Type': 'audio/mpeg',
        },
        body: params.audio,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(
          `Cloudflare R2 upload error: ${response.status} - ${error}`,
        );
      }

      // Return the public URL (assuming you have a public domain configured)
      const public_url = process.env.CLOUDFLARE_R2_PUBLIC_URL;
      if (public_url) {
        return {
          url: `${public_url}/${params.filename}`,
        };
      }

      // Fallback to the R2 endpoint URL
      return {
        url: this.r2_endpoint
          ? `${this.r2_endpoint}/${this.bucket_name}/${params.filename}`
          : `https://${this.account_id}.r2.cloudflarestorage.com/${this.bucket_name}/${params.filename}`,
      };
    } catch (error) {
      console.error('Error uploading audio to Cloudflare:', error);
      throw error;
    }
  }

  async file_exists(params: { filename: string }): Promise<{
    exists: boolean;
    url?: string;
  }> {
    try {
      const url = this.r2_endpoint
        ? `${this.r2_endpoint}/${this.bucket_name}/${params.filename}`
        : `https://${this.account_id}.r2.cloudflarestorage.com/${this.bucket_name}/${params.filename}`;

      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          Authorization: `Bearer ${this.api_token}`,
        },
      });

      if (response.status === 404) {
        return { exists: false };
      }

      if (response.ok) {
        // File exists, return the public URL
        const public_url = process.env.CLOUDFLARE_R2_PUBLIC_URL;
        if (public_url) {
          return {
            exists: true,
            url: `${public_url}/${params.filename}`,
          };
        }

        // Fallback to the R2 endpoint URL
        return {
          exists: true,
          url: this.r2_endpoint
            ? `${this.r2_endpoint}/${this.bucket_name}/${params.filename}`
            : `https://${this.account_id}.r2.cloudflarestorage.com/${this.bucket_name}/${params.filename}`,
        };
      }

      // For other status codes, assume file doesn't exist
      return { exists: false };
    } catch (error) {
      console.error('Error checking file existence on Cloudflare:', error);
      // On error, assume file doesn't exist
      return { exists: false };
    }
  }
}

