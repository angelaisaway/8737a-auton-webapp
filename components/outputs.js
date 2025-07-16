import React, { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { obsidian } from "react-syntax-highlighter/dist/esm/styles/hljs";

function CodeOutput({ code, editCode, setEditCode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!navigator.clipboard) {
      alert("Clipboard API not supported");
      return;
    }
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 500);
      })
      .catch(() => {
        alert("uh oh!");
      });
  };

  return (
    <div className="code" style={{ position: "relative" }}>
      <button
        onClick={handleCopy}
        style={{
          position: "absolute",
          top: 200,
          right: 80,
          padding: "4px 8px",
          fontSize: "0.8rem",
          cursor: "pointer",
          borderRadius: "4px",
          border: "none",
          backgroundColor: copied ? "green" : "#007bff",
          color: "white",
          userSelect: "none",
          zIndex: 10,
        }}
      >
        {copied ? "done" : "copy code to clipboard"}
      </button>

      <div className="code-block">
        <SyntaxHighlighter
          language="c"
          style={obsidian}
          wrapLines={true}
          showLineNumbers={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default CodeOutput;
