# GraceAI - Empowering Mental Resilience in Namibia

GraceAI is a modern, empathetic mental health support platform designed specifically for the unique cultural and professional landscape of Namibia. It provides steady, non-judgmental support through culturally-nuanced AI and secure digital tools.

## ✨ Features

- **Empathetic AI Chat**: A 24/7 wise companion that listens without judgment, helping you process feelings in real-time.
- **Wellness Dashboard**: Track your emotional trajectory with intuitive visual indicators and Bézier curves.
- **Private Journal**: A secure, encrypted space for thoughts, featuring guided prompts for anxiety and stress.
- **Guest Access**: Try the AI support chat instantly without logging in (limitations apply).
- **Stigma-Sensitive Support**: Educational and interactive resources focused on mental health awareness.
- **Corporate Resilience**: Tailored tools for organizations to foster a healthier work environment.

## 🚀 Tech Stack

- **Frontend**: React 18, Vite
- **Logic**: JavaScript (ESM)
- **Styling**: Vanilla CSS & Tailwind CSS (via CDN)
- **Backend/Auth**: Supabase
- **AI Models**: 
  - **Google Gemini**: Powering multimodal chat and complex reasoning.
  - **OpenAI GPT**: Empathetic conversational support.
  - **OpenAI Whisper**: High-accuracy voice-to-text dictation.

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aisod/GraceAI.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Create a `.env` file in the root directory.
   - Use `.env.example` as a template:
     ```bash
     cp .env.example .env
     ```
   - Fill in your Supabase, Gemini, and OpenAI API keys.

### Running the Project

1. **Start the development server:**
   ```bash
   npm run dev
   ```
2. **Open your browser:**
   Navigate to `http://localhost:5173` to see the application in action.

## 📂 Project Structure

- `src/components/`: Reusable UI components (SiteHeader, TypingChatCard, etc.)
- `src/pages/`: Main application views (Landing, Dashboard, Chat, etc.)
- `src/lib/`: Library configurations (Supabase, etc.)
- `src/index.css`: Global styles and custom animations.

## 🛡️ Privacy First

GraceAI is built with a "Privacy First" architecture. We ensure personal thoughts remain secure through:
- End-to-end encryption for journals and chats.
- Localized hosting compliance.
- Anonymous-by-default options.

---
Developed with ❤️ for the Namibian community.
