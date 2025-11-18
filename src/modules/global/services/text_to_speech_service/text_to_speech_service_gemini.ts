import { Injectable } from '@nestjs/common';
import { TextToSpeechService } from '@/modules/global/services/text_to_speech_service/text_to_speech_service';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class TextToSpeechServiceGemini extends TextToSpeechService {
  async synthesize_speech(params: {
    text: string;
    language: string;
  }): Promise<{ audio: Buffer }> {
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GEMINI_API_KEY as string,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro-preview-tts',
      contents: [{ parts: [{ text: params.text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const data =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!data) {
      throw new Error('No audio data received from Gemini');
    }

    return { audio: Buffer.from(data as string, 'base64') };
  }
}

