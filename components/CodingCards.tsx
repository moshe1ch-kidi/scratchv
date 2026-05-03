import React, { useState } from 'react';

import { Video } from 'lucide-react';

interface CardData {
  id: string;
  title: string; // Used for modal title
  icon: string | React.ReactNode;
  description: React.ReactNode;
  color: string;
}

// Helper to generate dummy cards
const createDummyCard = (index: number): CardData => ({
  id: `dummy-${index}`,
  title: `Card ${index + 1}`,
  icon: 'https://placehold.co/150x150/e2e8f0/64748b?text=Image', // Dummy placeholder
  description: 'Content coming soon...',
  color: '#cbd5e1',
});

const INTERFACE_DESCRIPTION = (
  <div className="text-left space-y-4 text-sm sm:text-base">
    <div>
      <h4 className="font-bold text-slate-800 mb-1">Top Toolbar (Project Management)</h4>
      <ul className="list-none space-y-1 pl-0">
        <li><strong>1 - Save:</strong> Click here to save your current project.</li>
        <li><strong>2 - Projects Folder:</strong> Returns to the main home screen to view your saved projects or start a new one.</li>
        <li><strong>3 - Full Screen Mode:</strong> Enlarges the Stage (10) to fill the screen so you can present your animation.</li>
        <li><strong>4 - Grid:</strong> Displays a coordinate grid on the stage to help you position characters precisely.</li>
        <li><strong>5 - Backgrounds:</strong> Allows you to select or design a new background for the stage.</li>
        <li><strong>6 - Add Text:</strong> Enables you to add titles or labels that appear on the screen.</li>
        <li><strong>7 - Reset Characters:</strong> Returns all characters on the stage to their original starting positions.</li>
        <li><strong>8 - Green Flag:</strong> The "Go" button – clicking this runs all code sequences that begin with a Green Flag block.</li>
      </ul>
    </div>
    
    <div>
      <h4 className="font-bold text-slate-800 mb-1">Characters and Pages Management</h4>
      <ul className="list-none space-y-1 pl-0">
        <li><strong>9 - Add Character:</strong> Clicking the + allows you to add new characters (like animals or objects) to the project.</li>
        <li><strong>10 - The Stage:</strong> This is where the action happens. You can see your characters move and execute the code here.</li>
        <li><strong>11 - Page Management:</strong> Here you can add new "scenes" or pages to the project (like the next page in a story).</li>
      </ul>
    </div>

    <div>
      <h4 className="font-bold text-slate-800 mb-1">Programming Area (Blocks)</h4>
      <ul className="list-none space-y-1 pl-0">
        <li><strong>12 - Block Categories:</strong> Clicking each color opens a different set of commands (Yellow for Events, Blue for Motion, Purple for Looks, Green for Sound, etc.).</li>
        <li><strong>13 - Programming Area (Workspace):</strong> The space where you drag and connect blocks to create your program.</li>
        <li><strong>14 - Block Palette:</strong> This is where the specific blocks are located, ready to be dragged into the workspace.</li>
      </ul>
    </div>

    <div>
      <h4 className="font-bold text-slate-800 mb-1">Navigation and Editing</h4>
      <ul className="list-none space-y-1 pl-0">
        <li><strong>15 - Center:</strong> Resets the view to the center of your workspace where your code is located.</li>
        <li><strong>16 - Zoom (+/-):</strong> Increases or decreases the size of the blocks in the workspace.</li>
        <li><strong>17 - Trash Can:</strong> Dragging blocks here will delete them from your program.</li>
      </ul>
    </div>
  </div>
);

const BLOCKS_DATA = [
    { category: 'TRIGGERING', name: 'Flag', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/flag.png', desc: 'Starts the script when the Green Flag is tapped.', color: '#FFD700' },
    { category: 'TRIGGERING', name: 'Tap', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/handtouch.png', desc: 'Starts the script when you tap the character.', color: '#FFD700' },
    { category: 'TRIGGERING', name: 'Bump', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/excident.png', desc: 'Starts the script when the character is touched by another character.', color: '#FFD700' },
    { category: 'TRIGGERING', name: 'Start on Message', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/getmail.png', desc: 'Runs the script when a message is received.', color: '#FFD700' },
    { category: 'TRIGGERING', name: 'Send Message', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/send.png', desc: 'Send a message.', color: '#FFD700' },

    { category: 'MOTION', name: 'Move Right', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/right.png', desc: 'Moves the character a specified number of grid squares to the right.', color: '#4A90E2' },
    { category: 'MOTION', name: 'Move Left', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/left.png', desc: 'Moves the character a specified number of grid squares to the left.', color: '#4A90E2' },
    { category: 'MOTION', name: 'Move Up', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/up.png', desc: 'Moves the character a specified number of grid squares up.', color: '#4A90E2' },
    { category: 'MOTION', name: 'Move Down', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/down.png', desc: 'Moves the character a specified number of grid squares down.', color: '#4A90E2' },
    { category: 'MOTION', name: 'Turn Right', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/turnright.png', desc: 'Rotates the character clockwise.', color: '#4A90E2' },
    { category: 'MOTION', name: 'Turn Left', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/turnleft.png', desc: 'Rotates the character counter-clockwise.', color: '#4A90E2' },
    { category: 'MOTION', name: 'Hop', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/jump.png', desc: 'Makes the character jump up and down.', color: '#4A90E2' },
    { category: 'MOTION', name: 'Go Home', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/home.png', desc: 'Resets the character to its starting position.', color: '#4A90E2' },

    { category: 'LOOKS', name: 'Say', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/say.png', desc: 'Shows a speech bubble with a message.', color: '#9013FE' },
    { category: 'LOOKS', name: 'Grow', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/Enlarge.png', desc: 'Increases the character\'s size.', color: '#9013FE' },
    { category: 'LOOKS', name: 'Shrink', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/Decreases.png', desc: 'Decreases the character\'s size.', color: '#9013FE' },
    { category: 'LOOKS', name: 'Reset Size', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/defaultsize.png', desc: 'Returns the character to its default size.', color: '#9013FE' },
    { category: 'LOOKS', name: 'Hide', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/hide.png', desc: 'Fades the character away until it is invisible.', color: '#9013FE' },
    { category: 'LOOKS', name: 'Show', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/show.png', desc: 'Makes the character appear gradually.', color: '#9013FE' },

    { category: 'SOUND', name: 'Pop', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/pop.png', desc: 'Plays a "Pop" sound.', color: '#7ED321' },
    { category: 'SOUND', name: 'Record', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/record.png', desc: 'Plays a sound recorded by the user.', color: '#7ED321' },

    { category: 'CONTROL', name: 'Wait', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/wait.png', desc: 'Pauses the script for a specified amount of time.', color: '#F5A623' },
    { category: 'CONTROL', name: 'Stop', icon: 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Stop.svg', desc: 'Stops all the characters\' scripts.', color: '#F5A623' },
    { category: 'CONTROL', name: 'Set Speed', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/speed.png', desc: 'Changes the speed of the character\'s actions.', color: '#F5A623' },
    { category: 'CONTROL', name: 'Repeat', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/repeat.png', desc: 'Repeats the blocks inside the loop.', color: '#F5A623' },

    { category: 'END BLOCKS', name: 'End', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/end.png', desc: 'Indicates the end of the script (but does not affect the script in any way).', color: '#D0021B' },
    { category: 'END BLOCKS', name: 'Forever', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/forever.png', desc: 'Runs the script over and over.', color: '#D0021B' },
    { category: 'END BLOCKS', name: 'Go to Page', icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/gotopage.png', desc: 'Changes to the specified page of the project.', color: '#D0021B' },
];

const BLOCKS_DESCRIPTION = (
    <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
            <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="p-3 font-bold text-slate-700 w-24">Category</th>
                    <th className="p-3 font-bold text-slate-700 w-24">Name</th>
                    <th className="p-3 font-bold text-slate-700 text-center w-48">Icon</th>
                    <th className="p-3 font-bold text-slate-700">Description</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {BLOCKS_DATA.map((block, idx) => (
                    <tr key={idx} className="hover:opacity-90 transition-opacity" style={{ backgroundColor: block.color + '33' }}>
                        <td className="p-3 font-bold text-xs uppercase tracking-wider" style={{ color: block.color === '#FFD700' ? '#D97706' : block.color }}>{block.category}</td>
                        <td className="p-3 font-medium text-slate-900 break-words">{block.name}</td>
                        <td className="p-3 text-center">
                            <img src={block.icon} alt={block.name} className="w-40 h-auto object-contain mx-auto" />
                        </td>
                        <td className="p-3 text-slate-800 text-base font-medium">{block.desc}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const YoutubeEmbed = ({ url }: { url: string }) => {
  const videoId = url.split('v=')[1];
  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-slate-200">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

const CARDS: CardData[] = [
  // Card 1: Interface (Specific Content)
  { 
    id: 'interface', 
    title: 'Interface Guide', 
    icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/intarface.png', 
    description: INTERFACE_DESCRIPTION, 
    color: '#3b82f6' 
  },
  // Card 2: Blocks Guide (New)
  {
    id: 'blocks',
    title: 'Blocks Guide',
    icon: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/components/help/blocksmenu.png',
    description: BLOCKS_DESCRIPTION,
    color: '#F5A623' // Orange-ish for blocks
  },
  // Card 3: Introducing STACKIDI
  {
    id: 'stackidi',
    title: 'Introducing STACKIDI',
    icon: <Video className="w-12 h-12 text-white" />,
    description: <YoutubeEmbed url="https://www.youtube.com/watch?v=0bpgxclrEAI" />,
    color: '#4B8CC2'
  },
  // Card 4: SPRITES
  {
    id: 'sprites-help',
    title: 'SPRITES',
    icon: <Video className="w-12 h-12 text-white" />,
    description: <YoutubeEmbed url="https://www.youtube.com/watch?v=96dYRjJpL3M" />,
    color: '#9013FE'
  },
  // Card 5: pages
  {
    id: 'pages-help',
    title: 'pages',
    icon: <Video className="w-12 h-12 text-white" />,
    description: <YoutubeEmbed url="https://www.youtube.com/watch?v=uzfGiala1_k" />,
    color: '#7ED321'
  },
  // Card 6: FIRST CODE
  {
    id: 'first-code',
    title: 'FIRST CODE',
    icon: <Video className="w-12 h-12 text-white" />,
    description: <YoutubeEmbed url="https://www.youtube.com/watch?v=rN0R8Qils2k" />,
    color: '#D0021B'
  },
  // Card 7: Acrobatic
  {
    id: 'acrobatic',
    title: 'Acrobatic',
    icon: <Video className="w-12 h-12 text-white" />,
    description: <YoutubeEmbed url="https://www.youtube.com/watch?v=uspPhcZWPe8" />,
    color: '#F8E71C'
  },
  // Card 8: Increase the Sprite
  {
    id: 'increase-sprite',
    title: 'Increase the Sprite',
    icon: <Video className="w-12 h-12 text-white" />,
    description: <YoutubeEmbed url="https://www.youtube.com/watch?v=4KugwjWkh4s" />,
    color: '#4A90E2'
  },
  // Card 9: The Stealth Sailboat
  {
    id: 'stealth-sailboat',
    title: 'The Stealth Sailboat',
    icon: <Video className="w-12 h-12 text-white" />,
    description: <YoutubeEmbed url="https://www.youtube.com/watch?v=ExAqPpGjf4k" />,
    color: '#F5A623'
  },
  // Card 10: start on bump
  {
    id: 'start-on-bump',
    title: 'start on bump',
    icon: <Video className="w-12 h-12 text-white" />,
    description: <YoutubeEmbed url="https://www.youtube.com/watch?v=Vtv8D6aN2lw" />,
    color: '#7ED321'
  },
  // Card 11: girl jump ball
  {
    id: 'girl-jump-ball',
    title: 'girl jump ball',
    icon: <Video className="w-12 h-12 text-white" />,
    description: <YoutubeEmbed url="https://www.youtube.com/watch?v=tWL1MNxiOkI" />,
    color: '#4A90E2'
  },
  // Card 12: Messages
  {
    id: 'messages',
    title: 'Messages',
    icon: <Video className="w-12 h-12 text-white" />,
    description: <YoutubeEmbed url="https://www.youtube.com/watch?v=tzzfmic8Ed8" />,
    color: '#F5A623'
  },
  // Generate remaining dummy cards to fill 4x7 grid (total 28)
  // We have 12 real cards now, so we need 16 dummy cards.
  ...Array.from({ length: 16 }, (_, i) => createDummyCard(i + 12))
];

interface CodingCardsProps {
  onClose: () => void;
}

const CodingCards: React.FC<CodingCardsProps> = ({ onClose }) => {
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-[#4B8CC2] p-4 flex items-center justify-between shrink-0">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <i className="fas fa-book-open"></i>
            Coding Cards
          </h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-7 gap-4 auto-rows-fr">
            {CARDS.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md border-2 border-transparent hover:border-blue-300 transition-all flex flex-col items-center justify-between group aspect-square overflow-hidden p-0"
              >
                <div 
                  className="w-full flex-1 flex items-center justify-center p-4 transition-transform group-hover:scale-105"
                  style={typeof card.icon !== 'string' ? { backgroundColor: card.color } : {}}
                >
                  {typeof card.icon === 'string' ? (
                    <img 
                      src={card.icon} 
                      alt={card.title} 
                      className="max-w-full max-h-full object-contain" 
                    />
                  ) : (
                    card.icon
                  )}
                </div>
                <div className="w-full bg-[#4B8CC2] text-white text-center py-2 text-xs font-bold shrink-0 line-clamp-1 px-1">
                  {card.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Modal Overlay */}
        {selectedCard && (
          <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl max-h-[90%] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                 <h3 className="text-xl font-bold text-slate-800">{selectedCard.title}</h3>
                 <button onClick={() => setSelectedCard(null)} className="text-slate-400 hover:text-slate-600">
                    <i className="fas fa-times text-xl"></i>
                 </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="flex flex-col items-center gap-6">
                  {/* Large Image - Hide for blocks guide and video cards */}
                  {!['blocks', 'stackidi', 'sprites-help', 'pages-help', 'first-code', 'acrobatic', 'increase-sprite', 'stealth-sailboat', 'start-on-bump', 'girl-jump-ball', 'messages'].includes(selectedCard.id) && (
                    <div className="w-full max-w-2xl bg-slate-50 rounded-xl border border-slate-200 p-2 shadow-inner flex justify-center items-center overflow-hidden min-h-[300px]">
                      {typeof selectedCard.icon === 'string' ? (
                        <img 
                          src={selectedCard.icon} 
                          alt={selectedCard.title} 
                          className="w-full h-auto object-contain rounded-lg" 
                        />
                      ) : (
                        <div className="p-12 rounded-full" style={{ backgroundColor: selectedCard.color }}>
                          {React.cloneElement(selectedCard.icon as React.ReactElement, { className: 'w-32 h-32 text-white' })}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Description Content */}
                  <div className="w-full max-w-3xl text-slate-700 leading-relaxed">
                    {selectedCard.description}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-center shrink-0">
                <button 
                  onClick={() => setSelectedCard(null)}
                  className="px-8 py-2 bg-slate-800 text-white rounded-full font-bold hover:bg-slate-700 transition-colors shadow-sm active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CodingCards;
