# DevChat AI - Your VS Code Coding Assistant

DevChat AI is an intelligent, lightweight AI assistant built as a Visual Studio Code extension. It understands your code, answers your questions, helps with refactoring, and even analyzes files in your workspace — all within your editor!

> Built using:  
> - LLM APIs (Groq/OpenAI/Gemini - plug & play)  
> - React + TypeScript (Webview frontend)  
> - Node.js + VS Code Extension API (Backend logic)

---

## Features

- Chat interface right inside VS Code
- Context-aware: Reads mentioned files like `@main.cpp`
- Powered by LLM - Groq (LLaMA 3)
- Markdown + syntax-highlighted code responses
- Clean, dark-themed UI with scrolling and formatting

---

## ⚙️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/your-username/devchat-ai.git
cd devchat-ai
```

### 2. Install Dependencies

```bash
cd media/chat-ui
npm install
npm run build
```

### 3. Add your .env file (inside root)
GROQ_API_KEY=your_groq_key

### 4. Run in VS Code
- Open this project in VS Code
- Press F5 to launch the extension in a new Extension Development Host window
- Open the command palette (Ctrl + Shift + P), and run: DevChat AI: Open Chat
