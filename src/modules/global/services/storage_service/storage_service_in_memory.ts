import { Injectable } from '@nestjs/common';
import { StorageService } from '@/modules/global/services/storage_service/storage_service';

@Injectable()
export class StorageServiceInMemory extends StorageService {
  private readonly uploaded_files = new Set<string>();

  async upload_audio(params: {
    audio: Buffer;
    filename: string;
  }): Promise<{ url: string }> {
    // Track uploaded files for testing
    this.uploaded_files.add(params.filename);
    return {
      url: `https://mock-storage-url.com/audio/${params.filename}`,
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
        ? `https://mock-storage-url.com/audio/${params.filename}`
        : undefined,
    };
  }
}
