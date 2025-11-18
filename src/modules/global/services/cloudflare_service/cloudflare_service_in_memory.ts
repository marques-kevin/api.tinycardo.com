import { Injectable } from '@nestjs/common';
import { CloudflareService } from '@/modules/global/services/cloudflare_service/cloudflare_service';

@Injectable()
export class CloudflareServiceInMemory extends CloudflareService {
  private readonly uploaded_files = new Set<string>();

  async upload_audio(params: {
    audio: Buffer;
    filename: string;
  }): Promise<{ url: string }> {
    // Track uploaded files for testing
    this.uploaded_files.add(params.filename);
    return {
      url: `https://mock-cloudflare-url.com/audio/${params.filename}`,
    };
  }

  async file_exists(params: { filename: string }): Promise<{
    exists: boolean;
    url?: string;
  }> {
    const exists = this.uploaded_files.has(params.filename);
    return {
      exists,
      url: exists
        ? `https://mock-cloudflare-url.com/audio/${params.filename}`
        : undefined,
    };
  }
}

