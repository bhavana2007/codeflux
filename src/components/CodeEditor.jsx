import React from 'react';

const CodeEditor = ({ value, onChange, language }) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-full p-4 bg-slate-900 text-slate-100 font-mono text-sm resize-none focus:outline-none"
      placeholder={`Write your ${language} code here...`}
      spellCheck={false}
    />
  );
};

export default CodeEditor;
