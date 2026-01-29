import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface TerminalProps {
  logs: LogEntry[];
  onClear: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ logs, onClear }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-slate-200 font-mono text-sm rounded-lg overflow-hidden shadow-inner border border-slate-700">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-black/20">
        <span className="font-semibold text-xs uppercase tracking-wider text-slate-400">
          <i className="fas fa-terminal mr-2"></i> Console
        </span>
        <button 
          onClick={onClear} 
          className="text-xs text-slate-400 hover:text-white transition-colors"
          title="Clear Output"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {logs.length === 0 && (
          <div className="text-slate-600 italic">System ready. Output will appear here...</div>
        )}
        {logs.map((log, index) => (
          <div key={index} className={`break-words ${log.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
            <span className="text-slate-600 select-none mr-2">
              {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })} &gt;
            </span>
            {log.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Terminal;