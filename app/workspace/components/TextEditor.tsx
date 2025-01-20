'use client';
import { useState, useEffect } from 'react';

interface TextEditorProps {
  initialText?: string;
  onTextChange?: (text: string) => void;
}

export default function TextEditor({ initialText = '', onTextChange }: TextEditorProps) {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onTextChange?.(newText);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-100 p-3 border-b">
        <h2 className="font-semibold">Transcript Editor</h2>
      </div>
      <textarea
        className="flex-1 p-4 border-0 focus:ring-0 focus:outline-none resize-none font-mono text-sm"
        value={text}
        onChange={handleChange}
        placeholder="Start typing or load a transcript..."
      />
    </div>
  );
} 