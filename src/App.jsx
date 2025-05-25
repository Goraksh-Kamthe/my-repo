
import { useState } from "react";
import { Url } from "./Constants/Constant";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import './App.css'
function App() {
  const [query, setQuery] = useState("");
  const [sections, setSections] = useState([]);

  const parseContent = (rawText) => {
    const lines = rawText.split("\n");
    const output = [];
    let buffer = "";
    let isCodeBlock = false;

    lines.forEach((line) => {
      if (line.startsWith("```")) {
        if (isCodeBlock) {
          output.push({ type: "code", content: buffer });
        } else if (buffer.trim()) {
          output.push({ type: "text", content: buffer });
        }
        isCodeBlock = !isCodeBlock;
        buffer = "";
      } else {
        buffer += line + "\n";
      }
    });

    if (buffer.trim()) {
      output.push({ type: isCodeBlock ? "code" : "text", content: buffer });
    }

    return output.flatMap(({ type, content }) => {
      if (type === "text") {
        return content.split("\n").filter(Boolean).map(line => {
          const match = line.match(/\*\*(.*?)\*\*/);
          if (match) {
            return { type: "heading", content: match[1] };
          }
          return { type: "paragraph", content: line };
        });
      }
      return [{ type: "code", content }];
    });
  };

  const handleAskQuestion = async () => {
    if (!query.trim()) return;

    setSections([]);
    const payload = {
      contents: [{ parts: [{ text: query }] }],
    };

    const geminiApikey = "AIzaSyARmDV2kZyCO1JUK4YCxuimAs1BXuZVtjQ";
    let response = await fetch(Url + geminiApikey, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    response = await response.json();
    const rawText = response.candidates[0].content.parts[0].text;
    setSections(parseContent(rawText));
    setQuery("");
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") handleAskQuestion();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent mb-8">
          🤖 Ask Me Anything
        </h1>

        <div className="bg-zinc-800 rounded-lg shadow-lg p-6 overflow-y-auto h-125 mb-6 space-y-4">
          {sections.length > 0 ? (
            sections.map((block, index) => {
              switch (block.type) {
                case "heading":
                  return (
                    <h3 key={index} className="text-lg font-bold text-white">
                      {block.content}
                    </h3>
                  );
                case "paragraph":
                  return (
                    <p key={index} className="text-zinc-200 leading-relaxed">
                      {block.content}
                    </p>
                  );
                case "code":
                  return (
                    <SyntaxHighlighter
                      key={index}
                      language="javascript"
                      style={oneDark}
                      customStyle={{ borderRadius: "0.5rem" }}
                    >
                      {block.content.trim()}
                    </SyntaxHighlighter>
                  );
                default:
                  return null;
              }
            })
          ) : (
            <p className="text-zinc-500">Generaing...</p>
          )}
        </div>

        <div className="flex items-center bg-zinc-700 rounded-full px-4 py-3 shadow-lg border border-zinc-600">
          <input
            type="text"
            placeholder="Type your question and press Enter..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleEnter}
            className="flex-grow bg-transparent text-white outline-none placeholder-zinc-400 px-2"
          />
          <button
            onClick={handleAskQuestion}
            disabled={!query.trim()}
            className={`ml-3 px-5 py-2 rounded-full text-sm font-semibold transition ${
              query.trim()
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-zinc-600 cursor-not-allowed"
            }`}
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
