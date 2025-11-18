export abstract class StorageService {
  abstract upload_audio(params: {
    audio: Buffer;
    filename: string;
    contentType: string;
  }): Promise<{
    url: string;
  }>;

  abstract file_exists(params: { filename: string }): Promise<{
    exists: boolean;
    url?: string;
  }>;
}
