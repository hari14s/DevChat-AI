<<<<<<< HEAD
# DevChat AI - Your VS Code Coding Assistant

DevChat AI is an intelligent, lightweight AI assistant built as a Visual Studio Code extension. It understands your code, answers your questions, helps with refactoring, and even analyzes files in your workspace — all within your editor!

> Tech Stack & Tools Used: 
> - LLM APIs Groq(LLaMA3-70B)
> - React + TypeScript (Webview frontend): ReactMarkdown + Rehype-highlight + Highlight.js to parse and render Markdown responses from the AI model and syntax-highlights code blocks.
> - Node.js + VS Code Extension API (Backend logic)

---

## Features

- Chat interface right inside VS Code
- Contextual awareness from the VS Code workspace, can upload file via `@filename` mentions.
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
```bash
GROQ_API_KEY=your_groq_key
```

### 4. Run in VS Code
- Open this project in VS Code
- Press F5 to launch the extension in a new Extension Development Host window
- Open the command palette (Ctrl + Shift + P), and run: Open DevChat AI
=======
# devchat-ai README

This is the README for your extension "devchat-ai". After writing up a brief description, we recommend including the following sections.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Working with Markdown

You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
>>>>>>> 256efd4 (intial commit)
