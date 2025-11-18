import { Injectable } from '@nestjs/common';
import { TextToSpeechService } from '@/modules/global/services/text_to_speech_service/text_to_speech_service';
import { GoogleGenAI } from '@google/genai';

/**
 * Converts raw PCM audio data to WAV format
 * Gemini TTS always returns L16 PCM (16-bit, 24000 Hz, mono)
 * @param pcmData Raw PCM audio data
 * @returns WAV file as Buffer
 */
function pcmToWav(pcmData: Buffer): Buffer {
  const sampleRate = 24000;
  const channels = 1;
  const bitsPerSample = 16;
  const dataLength = pcmData.length;
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;

  // WAV header structure
  const header = Buffer.alloc(44);
  let offset = 0;

  // RIFF chunk descriptor
  header.write('RIFF', offset);
  offset += 4;
  header.writeUInt32LE(36 + dataLength, offset); // File size - 8
  offset += 4;
  header.write('WAVE', offset);
  offset += 4;

  // fmt sub-chunk
  header.write('fmt ', offset);
  offset += 4;
  header.writeUInt32LE(16, offset); // Sub-chunk size
  offset += 4;
  header.writeUInt16LE(1, offset); // Audio format (1 = PCM)
  offset += 2;
  header.writeUInt16LE(channels, offset);
  offset += 2;
  header.writeUInt32LE(sampleRate, offset);
  offset += 4;
  header.writeUInt32LE(byteRate, offset);
  offset += 4;
  header.writeUInt16LE(blockAlign, offset);
  offset += 2;
  header.writeUInt16LE(bitsPerSample, offset);
  offset += 2;

  // data sub-chunk
  header.write('data', offset);
  offset += 4;
  header.writeUInt32LE(dataLength, offset);

  // Combine header and PCM data
  return Buffer.concat([header, pcmData]);
}

@Injectable()
export class TextToSpeechServiceGemini extends TextToSpeechService {
  async synthesize_speech(params: {
    text: string;
    language: string;
  }): ReturnType<TextToSpeechService['synthesize_speech']> {
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GEMINI_API_KEY as string,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro-preview-tts',
      contents: [{ parts: [{ text: params.text }] }],
      config: {
        speechConfig: {
          languageCode: params.language,
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'achernar' },
          },
        },
        responseModalities: ['AUDIO'],
      },
    });

    const inlineData =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (!inlineData || !inlineData.data) {
      throw new Error('No audio data received from Gemini');
    }

    const rawPcmBuffer = Buffer.from(inlineData.data, 'base64');

    const audioBuffer = pcmToWav(rawPcmBuffer);

    return { audio: audioBuffer };
  }
}
