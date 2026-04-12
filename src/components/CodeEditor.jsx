import Editor from "@monaco-editor/react";

export default function CodeEditor({ value, onChange, language = "javascript" }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
      <Editor
        height="420px"
        defaultLanguage={language}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        options={{ fontSize: 14, minimap: { enabled: false }, tabSize: 2, wordWrap: "on" }}
      />
    </div>
  );
}
