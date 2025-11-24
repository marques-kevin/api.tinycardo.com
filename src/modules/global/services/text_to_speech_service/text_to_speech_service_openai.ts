import { Injectable } from '@nestjs/common';
import { TextToSpeechService } from '@/modules/global/services/text_to_speech_service/text_to_speech_service';
import OpenAI from 'openai';

@Injectable()
export class TextToSpeechServiceOpenAI extends TextToSpeechService {
  private readonly openai: OpenAI;

  constructor() {
    super();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY as string,
    });
  }

  private get_voice_for_language(): string {
    return 'nova';
  }

  async synthesize_speech(params: {
    text: string;
    language: string;
  }): ReturnType<TextToSpeechService['synthesize_speech']> {
    const response = await this.openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: this.get_voice_for_language(),
      input: params.text,
      instructions: `Speak in ${params.language} language. Speak clearly and naturally, as you would in a friendly conversation. Make the speech sound authentic. You can speak like in a real conversation but a bit more slowly.`,
      response_format: 'mp3',
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('No audio data received from OpenAI');
    }

    return { audio: audioBuffer };
  }
}
