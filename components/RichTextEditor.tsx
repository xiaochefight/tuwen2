import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Palette, Type, ChevronDown } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  defaultColor?: string;
}

const colorPresets = [
  '#1e293b', '#0f172a', '#ffffff', '#7c3aed', '#2563eb', 
  '#059669', '#dc2626', '#ea580c', '#ca8a04',
  '#ec4899', '#14b8a6', '#64748b'
];

const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

export default function RichTextEditor({ content, onChange, defaultColor = '#1e293b' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    handleInput();
    editorRef.current?.focus();
  };

  const applyColor = (color: string) => {
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };

  const applyFontSize = (size: number) => {
    // Legacy font size 1-7 is limited, so we use spans for exact control if needed, 
    // but execCommand 'fontSize' is more stable for basic editing. 
    // For precise pixel control, we use a span insertion technique.
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const span = document.createElement('span');
      span.style.fontSize = `${size}px`;
      const range = selection.getRangeAt(0);
      
      if (range.collapsed) return; // Don't apply to empty selection

      range.surroundContents(span);
      selection.removeAllRanges();
      selection.addRange(range);
      handleInput();
    }
    setShowSizePicker(false);
  };

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-slate-100 border border-slate-200 rounded-lg flex-wrap">
        <button
          onClick={() => execCommand('bold')}
          className="p-2 hover:bg-white rounded hover:shadow-sm transition-colors text-slate-700"
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => execCommand('italic')}
          className="p-2 hover:bg-white rounded hover:shadow-sm transition-colors text-slate-700"
          title="Italic"
        >
          <Italic size={18} />
        </button>
        
        <div className="w-px h-6 bg-slate-300 mx-1"></div>

        {/* Font Size Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowSizePicker(!showSizePicker); setShowColorPicker(false); }}
            className="flex items-center gap-1 p-2 hover:bg-white rounded hover:shadow-sm transition-colors text-slate-700"
            title="Font Size"
          >
            <Type size={18} />
            <ChevronDown size={12} />
          </button>
          
          {showSizePicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-2 w-48 max-h-60 overflow-y-auto grid grid-cols-4 gap-1">
              {fontSizes.map(size => (
                <button
                  key={size}
                  onClick={() => applyFontSize(size)}
                  className="p-1 hover:bg-slate-100 rounded text-center text-sm"
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color Picker Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowColorPicker(!showColorPicker); setShowSizePicker(false); }}
            className="flex items-center gap-1 p-2 hover:bg-white rounded hover:shadow-sm transition-colors text-slate-700"
            title="Text Color"
          >
            <Palette size={18} />
            <ChevronDown size={12} />
          </button>
          
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-2 w-48 flex flex-wrap gap-2">
              {colorPresets.map(color => (
                <button
                  key={color}
                  onClick={() => applyColor(color)}
                  className="w-6 h-6 rounded-full border border-slate-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
              <div className="w-full h-px bg-slate-100 my-1"></div>
              <label className="flex items-center gap-2 text-xs text-slate-500 w-full cursor-pointer hover:bg-slate-50 p-1 rounded">
                 Custom:
                 <input 
                    type="color" 
                    className="w-6 h-6 p-0 border-0 rounded overflow-hidden" 
                    onChange={(e) => applyColor(e.target.value)} 
                 />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="flex-1 p-4 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 overflow-y-auto min-h-[200px]"
        style={{ color: defaultColor }} 
      />
      <div className="text-xs text-slate-400 px-1">
        提示: 选中文字后点击工具栏按钮应用样式。
      </div>
    </div>
  );
}