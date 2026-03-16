import React, { useState } from 'react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('submitting');
    
    // The user provided their real Google Apps Script URL
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbwoWxAe8wLZGsoEXMveaIXhhv9ACGqSobsMn9CbVfx8w2Q8W-leaKet-8Qyr4a_22p_/exec';

    try {
      // We use 'no-cors' because Google Apps Script redirects can cause CORS issues in simple fetch
      // Alternatively, we can use a service like Formspree if the user prefers
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message, timestamp: new Date().toISOString() }),
      });
      
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#4B8CC2] text-white shrink-0">
          <h2 className="text-2xl font-bold">About the Platform</h2>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 text-slate-700 leading-relaxed">
          <section className="mb-10 pb-8 border-b border-slate-100">
            <h3 className="text-xl font-bold text-[#4B8CC2] mb-4">Send Us Feedback</h3>
            {status === 'success' ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 flex items-center gap-3">
                <i className="fas fa-check-circle text-xl"></i>
                <p className="font-medium">Thank you! Your feedback has been sent successfully.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="ml-auto text-sm underline hover:no-underline"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4B8CC2] transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4B8CC2] transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Message *</label>
                  <textarea 
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4B8CC2] transition-all h-32 resize-none"
                    placeholder="Tell us what you think..."
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">* Required field</p>
                  <button 
                    type="submit"
                    disabled={status === 'submitting'}
                    className="px-6 py-2 bg-[#4B8CC2] hover:bg-[#3a7db3] text-white font-bold rounded-full transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {status === 'submitting' ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Send Feedback
                      </>
                    )}
                  </button>
                </div>
                {status === 'error' && (
                  <p className="text-red-500 text-sm mt-2">Oops! Something went wrong. Please try again later.</p>
                )}
              </form>
            )}
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-[#4B8CC2] mb-3">Elevating Early Coding: The Next Step After ScratchJr</h3>
            <p>
              Welcome to the new standard for young creators. Our web-based platform is a sophisticated evolution of the beloved ScratchJr experience, specifically redesigned for children aged 6–10. We bridge the gap between basic block play and real-world programming logic through a modern, powerful, and intuitive interface.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-[#4B8CC2] mb-4">What Makes Us Different?</h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="text-3xl shrink-0">🧱</div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Vertical Logic – Coding Like a Pro</h4>
                  <p>Moving beyond the traditional horizontal layout, our platform introduces Vertical Programming. By connecting blocks from top to bottom, children learn to read and structure logic exactly how professional developers do. It’s a natural transition that prepares young minds for the future of technology.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-3xl shrink-0">🏗️</div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Infinite Storytelling (No Scene Limits)</h4>
                  <p>We believe creativity shouldn't have a "stop" button. Unlike other tools that limit you to a few scenes, our platform offers unlimited scenes. Whether it’s a short animation or a long, branching adventure, children have the space to build their entire vision without technical constraints.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-3xl shrink-0">⚡</div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Enhanced Blocks & Smarter Interactions</h4>
                  <p>We’ve re-engineered the core mechanics to make the building process smoother and more responsive:</p>
                  <ul className="list-disc ml-5 mt-2 space-y-2">
                    <li><strong>The Improved "BUMP" Block:</strong> We’ve refined collision detection so characters interact with their environment with precision and speed.</li>
                    <li><strong>Performance-First Engine:</strong> Optimized for the web, ensuring that animations and logic run fluidly directly in the browser.</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-3xl shrink-0">💻</div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Pure Web Experience</h4>
                  <p>No downloads, no installations, and no hardware restrictions. Our tool is built for the modern classroom and home, accessible instantly from any computer.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
            <h3 className="text-xl font-bold text-[#4B8CC2] mb-2">Our Mission</h3>
            <p className="italic">
              Our goal is to empower the next generation of digital creators. By providing a "simplified yet sophisticated" environment, we give children the tools to move from being passive consumers of technology to active, imaginative builders.
            </p>
          </section>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-8 py-2 bg-[#4B8CC2] hover:bg-[#3a7db3] text-white font-bold rounded-full transition-all shadow-md active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
