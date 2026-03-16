import React from 'react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#4B8CC2] text-white">
          <h2 className="text-2xl font-bold">About the Platform</h2>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 text-slate-700 leading-relaxed">
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

          <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-xl font-bold text-[#4B8CC2] mb-2">Our Mission</h3>
            <p className="italic">
              Our goal is to empower the next generation of digital creators. By providing a "simplified yet sophisticated" environment, we give children the tools to move from being passive consumers of technology to active, imaginative builders.
            </p>
          </section>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2 bg-[#4B8CC2] hover:bg-[#3a7db3] text-white font-bold rounded-full transition-all shadow-md active:scale-95"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
