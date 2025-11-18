import { Injectable } from '@nestjs/common';
import { TextToSpeechService } from '@/modules/global/services/text_to_speech_service/text_to_speech_service';

@Injectable()
export class TextToSpeechServiceInMemory extends TextToSpeechService {
  public history: { text: string; language: string }[] = [];

  async synthesize_speech(params: {
    text: string;
    language: string;
  }): Promise<{ audio: Buffer }> {
    this.history.push({
      text: params.text,
      language: params.language,
    });

    return {
      audio: Buffer.from([]),
    };
  }
}

