 import React, { useState, useEffect } from 'react';
import { Sprite } from '../types';

interface TextEditorProps {
  sprite: Sprite;
  isNew: boolean;
  onUpdate: (id: string, updates: Partial<Pick<Sprite, 'content' | 'color' | 'fontSize'>>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const FONT_SIZES = [
  { id: 1, label: 'A', className: 'text-sm' },
  { id: 2, label: 'A', className: 'text-xl' },
  { id: 3, label: 'A', className: 'text-3xl' },
];

const COLORS = [
  '#ff0000', '#ff8d2a', '#fffa2a', '#3eff2a',
  '#2acbff', '#ff2ac1', '#b32aff', '#ffffff',
  '#969696', '#000000'
];

const TextEditor: React.FC<TextEditorProps> = ({ sprite, isNew, onUpdate, onDelete, onClose }) => {
  const [text, setText] = useState(sprite.content || '');
  const [initialSpriteState] = useState(sprite);

  useEffect(() => {
    setText(sprite.content || '');
  }, [sprite.content, sprite.id]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    // Live update while typing
    onUpdate(sprite.id, { content: e.target.value });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleOk();
    }
  };

  const handleSizeChange = (size: number) => {
    onUpdate(sprite.id, { fontSize: size });
  };
  
  const handleColorChange = (color: string) => {
    onUpdate(sprite.id, { color: color });
  };

  const handleOk = () => {
    onUpdate(sprite.id, { content: text });
    onClose();
  };

  const handleCancel = () => {
    if (isNew) {
      onDelete(sprite.id);
    } else {
      onUpdate(sprite.id, {
        content: initialSpriteState.content,
        color: initialSpriteState.color,
        fontSize: initialSpriteState.fontSize,
      });
    }
    onClose();
  };


  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-30" onClick={(e) => e.stopPropagation()}>
      <div className="bg-[#4a90e2] p-4 rounded-xl shadow-2xl border-2 border-white/50 flex flex-col items-center gap-4">
        {/* Text Input */}
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onUpdate(sprite.id, { content: e.target.value });
          }}
          className="w-full bg-white rounded-lg p-3 text-2xl text-center font-bold border-2 border-slate-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 min-h-[120px] resize-none"
          autoFocus
          maxLength={200}
        />

        {/* Controls */}
        <div className="w-full flex flex-col gap-4">
            <div className="w-full flex justify-between items-center">
                {/* Font Size */}
                <div className="flex items-center gap-2 p-1 bg-black/10 rounded-lg">
                    {FONT_SIZES.map(size => (
                    <button
                        key={size.id}
                        onClick={() => handleSizeChange(size.id)}
                        className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
                        sprite.fontSize === size.id ? 'bg-white text-blue-500' : 'text-white/70 hover:bg-white/30'
                        }`}
                    >
                        <span className={`font-bold ${size.className}`}>{size.label}</span>
                    </button>
                    ))}
                </div>

                {/* Color Palette */}
                <div className="flex items-center gap-2">
                    {COLORS.map(color => (
                    <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 border ${color === '#ffffff' ? 'border-slate-300' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                    >
                        {sprite.color === color && (
                        <div className="w-full h-full rounded-full ring-2 ring-offset-2 ring-white ring-offset-[#4a90e2]"></div>
                        )}
                    </button>
                    ))}
                </div>
            </div>
          
            {/* Action Buttons */}
            <div className="w-full flex justify-end items-center gap-2">
                <button onClick={handleCancel} className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg text-lg hover:bg-red-600 transition-colors shadow-md">
                    Cancel
                </button>
                <button onClick={handleOk} className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg text-lg hover:bg-green-600 transition-colors shadow-md">
                    OK
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
