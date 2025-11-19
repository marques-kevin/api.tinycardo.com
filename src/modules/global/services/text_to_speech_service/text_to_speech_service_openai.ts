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

  async synthesize_speech(params: {
    text: string;
    language: string;
  }): ReturnType<TextToSpeechService['synthesize_speech']> {
    // OpenAI TTS auto-detects the language from the input text
    // The language parameter is kept for interface compatibility but not used in the API call

    const response = await this.openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova', // Options: alloy, echo, fable, onyx, nova, shimmer
      input: params.text,
      instructions:
        'Speak clearly and naturally, as you would in a friendly conversation. Make the speech sound authentic and easy to understand, like helping someone learn from a flashcard.',
      response_format: 'mp3',
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('No audio data received from OpenAI');
    }

    return { audio: audioBuffer };
  }
}
