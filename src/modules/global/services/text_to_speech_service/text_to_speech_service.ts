export abstract class TextToSpeechService {
  abstract synthesize_speech(params: {
    text: string;
    language: string;
  }): Promise<{
    audio: Buffer;
  }>;
}
