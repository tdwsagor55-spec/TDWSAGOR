import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase JSON payload limit for base64 images
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Initialize GoogleGenAI server client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: Check AI service status
app.get('/api/ai/status', (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: 'ok',
    hasKey,
    models: {
      image: 'gemini-3.1-flash-lite-image',
      text: 'gemini-3.8-flash',
    },
  });
});

// API: Enhance prompt with AI
app.post('/api/ai/enhance-prompt', async (req, res) => {
  try {
    const { prompt, style = 'cinematic', language = 'en' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      // Enhanced local fallback
      const enhanced = `${prompt}, ${style} style, ultra-detailed 8k resolution, dramatic lighting, sharp focus, masterwork`;
      return res.json({ enhancedPrompt: enhanced });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an expert AI photo and video prompt engineer. Enhance this prompt for image/video generation: "${prompt}". Style: ${style}. Output ONLY the enhanced prompt in 1-2 rich descriptive sentences, nothing else.`,
    });

    const enhanced = response.text?.trim() || prompt;
    res.json({ enhancedPrompt: enhanced });
  } catch (error: any) {
    console.error('Enhance prompt error:', error);
    res.status(500).json({ error: error.message || 'Failed to enhance prompt' });
  }
});

// API: Generate Image using Gemini
app.post('/api/ai/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1', style = 'digital_art' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'API key is not configured. Please verify your GEMINI_API_KEY in Settings > Secrets.',
      });
    }

    const fullPrompt = `${prompt}, ${style} aesthetic, professional digital art, high quality, vibrant colors, detailed`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            text: fullPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    let imageUrl: string | null = null;
    let description = '';

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        description += part.text;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: 'Image generation model did not return image data.',
        description,
      });
    }

    res.json({
      imageUrl,
      description,
      prompt: fullPrompt,
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    res.status(500).json({
      error: error.message || 'Image generation failed',
    });
  }
});

// API: Edit Image using Gemini (Face, hair, cartoon, background, object modification)
app.post('/api/ai/edit-image', async (req, res) => {
  try {
    const { imageBase64, prompt, mode } = req.body;
    if (!imageBase64 || !prompt) {
      return res.status(400).json({ error: 'imageBase64 and prompt are required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'API key is not configured. Please verify your GEMINI_API_KEY in Settings > Secrets.',
      });
    }

    // Clean base64 string
    let cleanData = imageBase64;
    let mimeType = 'image/png';
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      mimeType = parts[0].replace('data:', '') || 'image/png';
      cleanData = parts[1];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanData,
              mimeType,
            },
          },
          {
            text: `Edit this image: ${prompt}. Maintain subject identity where appropriate, high quality result.`,
          },
        ],
      },
    });

    let imageUrl: string | null = null;
    let feedback = '';

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        feedback += part.text;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: 'Image editing model did not return modified image bytes.',
        feedback,
      });
    }

    res.json({
      imageUrl,
      feedback,
    });
  } catch (error: any) {
    console.error('Image edit error:', error);
    res.status(500).json({
      error: error.message || 'Image edit failed',
    });
  }
});

// API: AI Video Storyboard & Script Generator
app.post('/api/ai/generate-video-story', async (req, res) => {
  try {
    const { prompt, duration = 10, theme = 'cinematic' } = req.body;
    const ai = getAiClient();

    if (!ai) {
      // High quality structured mock video storyboard scenes
      const scenes = [
        {
          id: 1,
          title: 'Opening Shot',
          duration: 3,
          description: `Establishing shot of ${prompt} with soft morning mist and neon accents`,
          cameraMotion: 'Slow Zoom In',
          subtitle: `In a world where ${prompt.slice(0, 30)}...`,
          colorGradient: ['#7c3aed', '#2563eb'],
        },
        {
          id: 2,
          title: 'Dynamic Action',
          duration: 4,
          description: `Dramatic angle showing vibrant energy and dynamic light trails`,
          cameraMotion: 'Pan Right',
          subtitle: 'The magic unfolds with cinematic intensity',
          colorGradient: ['#ec4899', '#8b5cf6'],
        },
        {
          id: 3,
          title: 'Climax & Finale',
          duration: 3,
          description: `Ultra-high definition crescendo with glowing particle burst`,
          cameraMotion: 'Subtle Tilt Up',
          subtitle: 'Experience the future of AI video',
          colorGradient: ['#3b82f6', '#06b6d4'],
        },
      ];
      return res.json({ scenes, musicTrack: 'Cyberpunk Odyssey' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Create a 3-scene video storyboard for this prompt: "${prompt}". Theme: ${theme}. Total duration: ${duration}s.
Respond in valid JSON format only:
{
  "title": "Short title",
  "musicStyle": "Electronic / Lo-Fi / Cinematic / Ambient",
  "scenes": [
    {
      "id": 1,
      "title": "Scene 1 title",
      "duration": 3,
      "description": "Visual visual description",
      "cameraMotion": "Slow Zoom In / Pan Left / Pan Right / Tilt Up",
      "subtitle": "Voiceover / subtitle line",
      "colorGradient": ["#hex1", "#hex2"]
    }
  ]
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Video story error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate video story' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
