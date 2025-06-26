import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

declare function fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;

async function findFilePath(filename: string): Promise<string | null> {
  const files = await vscode.workspace.findFiles(`**/${filename}`, '**/node_modules/**');
  if (files.length > 0) {
    console.log(`Found file: ${files[0].fsPath}`);
    return files[0].fsPath;
  }
  console.warn(`File not found: ${filename}`);
  return null;
}

let lastActiveEditor: vscode.TextEditor | undefined;

const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("GROQ_API_KEY =", process.env.GROQ_API_KEY);
} else {
  console.error(".env file not found at", envPath);
}

export function activate(context: vscode.ExtensionContext) {
  console.log("DevChat AI activated!");

  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor && editor.document && editor.document.languageId !== 'plaintext') {
        lastActiveEditor = editor;
        console.log("Updated lastActiveEditor:", editor.document.fileName);
      }
    });

  context.subscriptions.push(
    vscode.commands.registerCommand('devchat-ai.openChat', () => {
      const panel = vscode.window.createWebviewPanel(
        'devchat-ai',
        'DevChat AI',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, 'media', 'chat-ui', 'build')
          ]
        }
      );

      console.log("Active editor at panel creation:", vscode.window.activeTextEditor?.document?.fileName);

      const buildPath = vscode.Uri.joinPath(
        context.extensionUri,
        'media',
        'chat-ui',
        'build'
      );

      const indexPath = vscode.Uri.joinPath(buildPath, 'index.html');
      let html = fs.readFileSync(indexPath.fsPath, 'utf8');

      // Fix script & link paths to work in WebView
      html = html.replace(/(src|href)="(.+?)"/g, (_, attr, file) => {
        const filePath = vscode.Uri.joinPath(buildPath, file);
        const webviewUri = panel.webview.asWebviewUri(filePath);
        return `${attr}="${webviewUri}"`;
      });

      panel.webview.html = html;

      panel.webview.onDidReceiveMessage(async (message) => {
        console.log("Received message from webview", message);
        try{
          if(message.type === 'WithFiles') {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
             if (!workspaceFolder) {
              console.error("No workspace folder found.");
              panel.webview.postMessage({
                type: "error",
                error: "No workspace folder found. Open a folder in VS Code."
              });
              return;
            }
            console.log("Workspace folders full dump:", vscode.workspace.workspaceFolders);
           
            const fileContents: string[] = [];
            console.log("Workspace folder:", workspaceFolder);
            console.log("Looking for files:", message.files);

            for (const filename of message.files) {
              const filePath = await findFilePath(filename);
              if (filePath) {
                try {
                  const content = fs.readFileSync(filePath, 'utf8');
                  fileContents.push(`${filename}:\n\n${content}`);
                } catch (err) {
                  console.error(`Failed to read ${filePath}:`, err);
                }
              } else {
                console.warn(`File not found: ${filename}`);
              }
            }

            const aiResponse = await getAIResponse(message.message, fileContents);
            console.log("Sending AI response back to webview withfiles:", aiResponse);

            panel.webview.postMessage({
              type: 'aiResponse',
              content: aiResponse
            });
          }

          if(message.type === "TextOnly"){
            let fileContents: string[] = [];
            const prompt = message.message.toLowerCase().trim();
            // const isGeneralGreeting = ["hi", "hello", "hey", "how are you", "help", "thanks", "thank you", "cool"].includes(prompt);
            const shouldSendCode = await needsCodeContext(prompt);

            if (shouldSendCode) {
              // const activeEditor = vscode.window.activeTextEditor;
              const activeEditor = vscode.window.activeTextEditor || lastActiveEditor;
              
              if (activeEditor) {
                const selectedText = activeEditor.document.getText(activeEditor.selection);
                const fullText = activeEditor.document.getText();
                const fileName = path.basename(activeEditor.document.fileName);
                const content = selectedText || fullText;
                console.log("Selected or full content for", fileName, "=>", content.length, "chars");

                fileContents.push(`${fileName}:\n${content}`);
              }else {
                console.warn("No active text editor found.");
              }
            }
            try {
              const reply = await getAIResponse(message.message, fileContents);
              console.log("Sending AI response back to webview textonly:", reply);
              panel.webview.postMessage({ type: "aiResponse", content: reply });
              
            }catch (error) {
              if (error instanceof Error) {
                panel.webview.postMessage({ type: "error", error: error.message });
                
              } else {
                panel.webview.postMessage({ type: "error", error: "Unknown error" });
              }
            }
          }
        }catch (error: any) {
          console.error("Error handling message:", error);
          panel.webview.postMessage({
            type: "error",
            error: `Error fetching response: ${error.message || "Unknown error"}`
          });
        }
      });
    })
  );
}

async function getAIResponse(userPrompt: string, fileContent: string[] | []) {
  const formattedFiles = fileContent.length > 0 ? fileContent.map((f, i) => `File ${i + 1}:\n${f}`).join('\n\n') : "";

  const prompt = fileContent.length > 0
    ? `${userPrompt}\nAttached files:\n${formattedFiles}`
    : userPrompt;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY is undefined. Set it in your .env file.");
    return "Error: Missing API key.";
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama3-70b-8192", // also try: "mixtral-8x7b-32768"
      messages: [
        { role: "system", content: "You are a helpful assistant. If the user gives code, help explain or refactor it. Otherwise, reply naturally." },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "No response from Groq AI.";
}


async function needsCodeContext(message: string): Promise<boolean> {
  const prompt = `
You're an intent classifier for a code assistant.

Decide if this user message is asking something that needs the actual code file to be included. 
Only respond with "yes" or "no".

User message: "${message}"
`;

  const response = await getAIResponse(prompt, []);
  return response.trim().toLowerCase().includes("yes");
}


// async function getAIResponse(userPrompt: string, fileContent: string | null): Promise<string> {
//   const apiKey = process.env.GEMINI_API_KEY;
//   if (!apiKey) {
//     console.error("GEMINI_API_KEY is undefined. Check your .env file or dotenv setup.");
//     return "Error: Missing API key.";

//   }

//   const prompt = fileContent
//     ? `${userPrompt}\n\nHere is the file content:\n${fileContent}`
//     : userPrompt;

//   try {
//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contents: [
//             {
//               role: "user",
//               parts: [{ text: prompt }],
//             },
//           ],
//         }),
//       }
//     );

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`Gemini API error: ${errorText}`);
//     }

//     const data = await response.json();
//     return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Gemini gave no response.";
//   } catch (err: any) {
//     console.error("Gemini fetch error:", err);
//     return `Error fetching response: ${err.message || "unknown error"}`;
//   }
// }



