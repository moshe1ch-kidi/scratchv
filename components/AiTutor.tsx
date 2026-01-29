import React, { useState } from 'react';
import { explainCode, getChallenge, checkSolution } from '../services/geminiService';
import { Challenge } from '../types';

interface AiTutorProps {
  currentCode: string;
}

const AiTutor: React.FC<AiTutorProps> = ({ currentCode }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: "Hi! I'm Gemini, your personal Blockly tutor. You can ask me to explain code, give you challenges, or check your solutions!" }
  ]);
  const [loading, setLoading] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);

  const addMessage = (role: 'user' | 'ai', content: string) => {
    setMessages(prev => [...prev, { role, content }]);
  };

  const handleExplain = async () => {
    setLoading(true);
    addMessage('user', 'Explain what the code does');
    const explanation = await explainCode(currentCode);
    addMessage('ai', explanation);
    setLoading(false);
  };

  const handleGetChallenge = async (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    setLoading(true);
    addMessage('user', `Give me a ${difficulty} challenge`);
    const challenge = await getChallenge(difficulty);
    setActiveChallenge({ ...challenge, difficulty });
    addMessage('ai', `**${challenge.title}**\n${challenge.description}`);
    setLoading(false);
  };

  const handleCheckSolution = async () => {
    if (!activeChallenge) {
      addMessage('ai', "There's no active challenge right now. Ask for a new one first!");
      return;
    }
    setLoading(true);
    addMessage('user', 'Check my solution');
    const feedback = await checkSolution(currentCode, activeChallenge.description);
    addMessage('ai', feedback);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
                <i className="fas fa-robot text-xl"></i>
                <h2 className="font-bold">AI Tutor</h2>
            </div>
            {activeChallenge && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    Active Challenge: {activeChallenge.title}
                </span>
            )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-white text-slate-800 rounded-br-none border border-slate-200' 
                        : 'bg-indigo-100 text-indigo-900 rounded-bl-none'
                    }`}>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                </div>
            ))}
            {loading && (
                <div className="flex justify-end">
                    <div className="bg-indigo-50 text-indigo-400 p-3 rounded-2xl rounded-bl-none text-xs animate-pulse">
                        Gemini is thinking...
                    </div>
                </div>
            )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-white border-t border-slate-200">
            <div className="grid grid-cols-2 gap-2 mb-2">
                <button 
                    onClick={handleExplain}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm transition-colors font-medium"
                >
                    <i className="fas fa-glasses"></i> Explain Code
                </button>
                <button 
                    onClick={handleCheckSolution}
                    disabled={loading || !activeChallenge}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors font-medium ${
                        activeChallenge 
                        ? 'bg-green-100 hover:bg-green-200 text-green-700' 
                        : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                    }`}
                >
                    <i className="fas fa-check-circle"></i> Check Solution
                </button>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 whitespace-nowrap">New Challenge:</span>
                <div className="flex gap-1 flex-1">
                    {(['Easy', 'Medium', 'Hard'] as const).map(diff => (
                        <button
                            key={diff}
                            onClick={() => handleGetChallenge(diff)}
                            disabled={loading}
                            className="flex-1 py-1 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs rounded border border-indigo-100 transition-colors"
                        >
                            {diff}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default AiTutor;