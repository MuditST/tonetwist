# Tone Twist 🎙✨

_Craft your voice into unique characters with AI magic._

---

## Overview

**Tone Twist** is a fun and innovative AI-powered application where users can upload or record their voice, select a character persona, and transform their speech into a completely new voice style.

Under the hood, the app combines cutting-edge technologies:

- **Google Cloud Speech-to-Text** for accurate transcription
- **Gemini Flash 2.0 (Google AI)** for enhancing the text according to the chosen character's speaking style
- **ElevenLabs AI** for ultra-realistic, expressive voice synthesis based on the persona

---

## Features

- 🎙 **Upload or record your voice** easily from the browser.
- 🎭 **Choose your character** (pirate, anime villain, robot assistant, etc.)
- ✨ **Transform your voice** through 3 stages: Transcription → Text Enhancement → Voice Synthesis
- 🔥 **Live demo** for each character with speaker previews.
- 🎧 **Play and download** your transformed voice instantly.
- 📈 **Seamless progress tracking** through interactive UI stages.

---

## Tech Stack

- **Next.js 14** (App Router + Server Actions)
- **Shadcn/UI** for components
- **TailwindCSS** for styling
- **Google Cloud Speech-to-Text API** (Transcription)
- **Gemini Flash 2.0 API** (Text enhancement by persona)
- **ElevenLabs Text-to-Speech API** (Realistic voice generation)
- **Vercel** for hosting

---

## How It Works

1. **Step 1: Add Your Voice**  
   Upload an audio file (or record directly in-browser).

2. **Step 2: Choose Your Character**  
   Select a pre-made persona that defines the emotion, accent, and style.

3. **Start Cookin'**  
   The system:

   - Transcribes your speech into text
   - Enhances the text based on the chosen character’s style
   - Synthesizes natural-sounding audio using ElevenLabs voices

4. **Enjoy Your Creation!**  
   Listen, download, or share your newly twisted voice!

---

## Installation & Setup (for development)

```bash
git clone https://github.com/MuditST/tonetwist.git
cd tone-twist
npm install
```

Create a `.env.local` file with:

```env
GOOGLE_APPLICATION_CREDENTIALS=your-google-credentials.json
ELEVENLABS_API_KEY=your-elevenlabs-api-key
OPENAI_API_KEY=your-openai-or-gemini-api-key
```

Then run locally:

```bash
npm run dev
```

---

## Notes

- Maximum input audio length: **60 seconds** (to avoid Google API timeout)
- Input audio is automatically downsampled to **16kHz mono WAV** for best transcription performance
- User audio is processed securely and is not stored permanently
- Project optimized for **modern browsers** (Chrome, Edge, Safari)

---

## Future Enhancements

- 🔒 User authentication (Clerk integration)
- 📦 Cloud history for saving previous transformations
- 🌐 Public sharing links for generated audios
- 🧠 Personalized AI voice personas in the future

---

## License

This project is licensed under the **MIT License**.

---

## Credits

- Built with ❤️ by Mudit Tushir
- Powered by OpenAI, Google Cloud, ElevenLabs, Vercel
