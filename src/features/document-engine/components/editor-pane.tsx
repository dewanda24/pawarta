interface EditorPaneProps {
  content: string;
  onChange: (value: string) => void;
  previewMode: boolean;
}

export function EditorPane({ content, onChange, previewMode }: EditorPaneProps) {
  return (
    <div className={`flex-1 flex flex-col bg-white border-r border-gray-200 ${previewMode ? 'hidden md:flex md:w-1/2' : 'w-full'}`}>
      <div className="p-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 flex justify-between">
        <span>MODE EDITOR</span>
        <span>Tiptap Rich Text Editor (Mockup)</span>
      </div>
      <textarea 
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 w-full p-6 focus:outline-none resize-none text-sm font-mono text-gray-700"
        spellCheck={false}
      />
    </div>
  );
}
