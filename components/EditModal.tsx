import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

interface EditModalProps {
  isOpen: boolean;
  initialContent: string;
  onSave: (newContent: string) => void;
  onClose: () => void;
}

export default function EditModal({ isOpen, initialContent, onSave, onClose }: EditModalProps) {
  const [content, setContent] = useState(initialContent);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(content);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">编辑内容</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          <RichTextEditor 
            content={content} 
            onChange={setContent} 
            defaultColor="#334155"
          />
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-transform active:scale-95"
          >
            <Check size={18} />
            保存修改
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}