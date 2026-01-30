   import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import Blockly from 'blockly';
import * as BlocklyJS from 'blockly/javascript';
import BlocklyEditor from './components/BlocklyEditor';
import Stage from './components/Stage';
import SpriteGallery from './components/SpriteGallery';
import BackgroundGallery from './components/BackgroundGallery';
import PaintEditor from './components/PaintEditor';
import TextEditor from './components/TextEditor';
import { Page, Sprite, SpriteState } from './types';

// Grid constants, must match Stage.tsx
const GRID_COLS = 24;
const GRID_ROWS = 18;

// This needs to be available for the headless generator.
// --- Generator Import Compatibility ---
const getJavascriptGenerator = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lib = BlocklyJS as any;
  if (lib.javascriptGenerator) return lib.javascriptGenerator;
  if (lib.default) {
      if (lib.default.workspaceToCode) return lib.default;
      if (lib.default.javascriptGenerator) return lib.default.javascriptGenerator;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== 'undefined' && (window as any).Blockly?.JavaScript) return (window as any).Blockly.JavaScript;
  if (lib.JavascriptGenerator) {
      try { return new lib.JavascriptGenerator('JavaScript'); } catch (e) { console.warn(e); }
  }
  if (typeof lib.workspaceToCode === 'function') return lib;
  return null;
};
const javascriptGenerator = getJavascriptGenerator();


const INITIAL_SPRITE_STATE: SpriteState = {
    x: 12, // Center X
    y: 9,  // Center Y
    rotation: 0,
    scale: 1,
    visible: true,
    message: null,
    direction: 1
};

const createNewSprite = (name: string, costume: string): Sprite => ({
    id: `sprite-${Date.now()}-${Math.random()}`,
    name,
    type: 'image',
    costume,
    initialState: { ...INITIAL_SPRITE_STATE },
    workspaceXml: '<xml xmlns="https://developers.google.com/blockly/xml"></xml>',
});

const createNewTextSprite = (): Sprite => ({
    id: `text-${Date.now()}-${Math.random()}`,
    name: 'Text',
    type: 'text',
    content: 'Type here',
    color: '#000000',
    fontSize: 2, // Medium
    initialState: { ...INITIAL_SPRITE_STATE },
    workspaceXml: '<xml xmlns="https://developers.google.com/blockly/xml"></xml>', // No scripts for text
});

const createNewPage = (name: string): Page => {
    const initialSprite = createNewSprite('Cat', 'https://codejredu.github.io/jr/scratchjr/svglibrary/cat1.svg');
    return {
        id: `page-${Date.now()}-${Math.random()}`,
        name,
        background: '#ffffff',
        sprites: [initialSprite],
    };
};

// Reusable Navigation Button Component (supports image src or FontAwesome icon class)
const NavButton: React.FC<{src?: string, icon?: string, alt: string, onClick?: () => void, disabled?: boolean}> = ({ src, icon, alt, onClick, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-1 disabled:opacity-40 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full"
      title={alt}
    >
    {src ? (
      <img 
        src={src} 
        alt={alt} 
        className="h-20 w-20 transition-transform group-hover:scale-110 group-active:scale-95" 
        style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }}
      />
    ) : (
      <div 
        className="h-20 w-20 flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 text-white" 
        style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }}
      >
        <i className={`${icon} text-5xl`}></i>
      </div>
    )}
    </button>
);

// --- Presentation Mode Components ---
const PresentationNavButton: React.FC<{src: string, alt: string, onClick?: () => void, disabled?: boolean}> = ({ src, alt, onClick, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-16 h-16 p-3 bg-slate-700 rounded-full text-white text-3xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-600 active:scale-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
      title={alt}
    >
      <img 
        src={src} 
        alt={alt} 
        className="h-full w-full object-contain"
      />
    </button>
);

const PresentationView: React.FC<{
  currentPage: Page;
  runtimeSpriteStates: Record<string, SpriteState>;
  handleGreenFlag: () => void;
  handleStop: () => void;
  resetPageSprites: () => void;
  handleSpriteTap: (spriteId: string) => void;
  isRunning: boolean;
  onExit: () => void;
}> = ({ currentPage, runtimeSpriteStates, handleGreenFlag, handleStop, resetPageSprites, handleSpriteTap, isRunning, onExit }) => {
  const dummyRef = useRef(false);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Stage Container */}
      <div 
        className="w-full max-w-5xl aspect-[4/3] bg-white border-[4px] border-slate-300 shadow-2xl rounded-xl overflow-hidden relative bg-cover bg-center"
        style={{
            backgroundImage: currentPage.background,
            backgroundColor: currentPage.background.startsWith('url') ? '#ffffff' : currentPage.background,
        }}
      >
        <Stage
          sprites={currentPage.sprites}
          runtimeStates={runtimeSpriteStates}
          onClick={handleSpriteTap}
          showGrid={false} // Grid is always off in presentation mode
          onSpriteDrag={() => {}}
          onSpriteDragEnd={() => {}}
          onSpriteDoubleClick={() => {}}
          spriteToDeleteId={null}
          onDeleteSprite={() => {}}
          onSetSpriteToDelete={() => {}}
          onSpritePressStart={() => {}}
          onSpritePressEnd={() => {}}
          longPressCompletedRef={dummyRef}
        />
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center gap-4 bg-slate-800/80 p-3 rounded-full shadow-lg">
        <PresentationNavButton 
            src="https://codejr.org/scratchjr/assets/ui/fullOn2.svg" 
            alt="Exit Presentation Mode" 
            onClick={onExit} 
        />
        <div className="w-px h-8 bg-slate-600"></div>
        <PresentationNavButton 
            src="https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/ui/resetAll.svg" 
            alt="Reset" 
            onClick={resetPageSprites} 
            disabled={isRunning} 
        />
        {isRunning ? (
            <PresentationNavButton 
                src="https://raw.githubusercontent.com/codejredu/jr/master/scratchjr/assets/ui/stop1.svg" 
                alt="Stop" 
                onClick={handleStop} 
            />
        ) : (
            <PresentationNavButton 
                src="https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/ui/go.svg" 
                alt="Run" 
                onClick={handleGreenFlag} 
            />
        )}
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([createNewPage('Page 1')]);
  const [currentPageId, setCurrentPageId] = useState<string>(pages[0].id);
  const [activeSpriteId, setActiveSpriteId] = useState<string | null>(pages[0].sprites[0]?.id ?? null);
  
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isBgGalleryOpen, setIsBgGalleryOpen] = useState(false);
  const [isPaintEditorOpen, setIsPaintEditorOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [pagesPanelWidth, setPagesPanelWidth] = useState(140); // Approx w-36
  const [editingSprite, setEditingSprite] = useState<Sprite | null>(null);
  const [spriteToDeleteId, setSpriteToDeleteId] = useState<string | null>(null);
  const [pageToDeleteId, setPageToDeleteId] = useState<string | null>(null);
  const [editingTextSpriteId, setEditingTextSpriteId] = useState<string | null>(null);
  const [newlyCreatedTextSpriteId, setNewlyCreatedTextSpriteId] = useState<string | null>(null);

  const [runtimeSpriteStates, setRuntimeSpriteStates] = useState<Record<string, SpriteState>>(() => {
    const initialState: Record<string, SpriteState> = {};
    pages.forEach(p => p.sprites.forEach(s => {
        initialState[s.id] = s.initialState;
    }));
    return initialState;
  });
  
  // Ref to hold the latest sprite states to prevent stale state in animation loops
  const runtimeSpriteStatesRef = useRef(runtimeSpriteStates);
  useEffect(() => {
    runtimeSpriteStatesRef.current = runtimeSpriteStates;
  }, [runtimeSpriteStates]);

  const eventListenersRef = useRef<Record<string, { spriteId: string | null; callback: Function }[]>>({});
  const executionControllerRef = useRef({ stop: false });
  const longPressTimerRef = useRef<number | null>(null);
  const longPressCompleted = useRef(false);
  const lastActiveImageSpriteIdRef = useRef<string | null>(null);
  
  const currentPage = useMemo(() => pages.find(p => p.id === currentPageId)!, [pages, currentPageId]);
  const activeSprite = useMemo(() => currentPage.sprites.find(s => s.id === activeSpriteId), [currentPage, activeSpriteId]);
  const currentWorkspaceXml = useMemo(() => activeSprite?.workspaceXml ?? '<xml xmlns="https://developers.google.com/blockly/xml"></xml>', [activeSprite]);
  const isTextSpriteActive = activeSprite?.type === 'text';
  
  const editingTextSprite = useMemo(() => {
    if (!editingTextSpriteId) return null;
    return currentPage.sprites.find(s => s.id === editingTextSpriteId) || null;
  }, [editingTextSpriteId, currentPage.sprites]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.cursor = 'col-resize';
    const startX = e.clientX;
    const startWidth = pagesPanelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const newWidth = startWidth - dx;
        const minWidth = 120; // Increased min width for larger tiles
        const maxWidth = 384;
        setPagesPanelWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
    };

    const handleMouseUp = () => {
        document.body.style.cursor = 'default';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
}, [pagesPanelWidth]);


  const updateRuntimeSprite = useCallback((spriteId: string, updater: (prev: SpriteState) => SpriteState) => {
    setRuntimeSpriteStates(prevStates => {
      const stateBeforeUpdate = prevStates[spriteId] || INITIAL_SPRITE_STATE;
      const stateAfterUpdate = updater(stateBeforeUpdate);

      const newState = { ...stateAfterUpdate };

      // A sprite is 3 units wide/tall, so its visual extent is 1.5 from its center.
      const buffer = 1.5; 
      const stageWidthWithBuffer = GRID_COLS + 2 * buffer;
      const stageHeightWithBuffer = GRID_ROWS + 2 * buffer;

      // Wrap X coordinate
      if (newState.x > GRID_COLS + buffer) {
        newState.x -= stageWidthWithBuffer;
      }
      if (newState.x < 1 - buffer) {
        newState.x += stageWidthWithBuffer;
      }

      // Wrap Y coordinate
      if (newState.y > GRID_ROWS + buffer) {
        newState.y -= stageHeightWithBuffer;
      }
      if (newState.y < 1 - buffer) {
        newState.y += stageHeightWithBuffer;
      }
      
      return {
        ...prevStates,
        [spriteId]: newState
      };
    });
  }, []);

  const resetPageSprites = useCallback(() => {
      const page = pages.find(p => p.id === currentPageId);
      if (!page) return;
      
      const newStates: Record<string, SpriteState> = {};
      page.sprites.forEach(s => {
          newStates[s.id] = { ...s.initialState };
      });
      setRuntimeSpriteStates(s => ({...s, ...newStates}));
  }, [pages, currentPageId]);

  const generateCodeForSprite = useCallback((sprite: Sprite): string => {
    if (sprite.type === 'text' || !javascriptGenerator) {
        return '';
    }
    const workspace = new Blockly.Workspace();
    let fullCode = '';
    try {
        const dom = Blockly.utils.xml.textToDom(sprite.workspaceXml);
        Blockly.Xml.domToWorkspace(dom, workspace);
        const topBlocks = workspace.getTopBlocks(true);

        // Ensure generator initialized
        if (javascriptGenerator && typeof javascriptGenerator.init === 'function') {
            javascriptGenerator.init(workspace);
        }

        topBlocks.forEach(block => {
            const nextBlock = block.getNextBlock();
            let chainCode = '';
            if (nextBlock) {
                chainCode = javascriptGenerator.blockToCode(nextBlock) as string;
            }
            
            switch(block.type) {
                case 'event_flag':
                    fullCode += `register('flag', async () => {\n${chainCode}\n});\n`; break;
                case 'event_tap':
                    fullCode += `register('tap', async () => {\n${chainCode}\n});\n`; break;
                case 'event_bump':
                    fullCode += `register('bump', async () => {\n${chainCode}\n});\n`; break;
                case 'event_message': {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const msgColor = (block as any).getFieldValue('COLOR');
                    fullCode += `register('message_${msgColor}', async () => {\n${chainCode}\n});\n`; break;
                }
                default: break;
            }
        });
    } catch (e) {
        console.error("Error generating code for sprite", sprite.name, e);
    } finally {
        workspace.dispose();
    }
    return fullCode;
  }, []);

  const triggerEvent = useCallback(async (eventName: string, targetSpriteId?: string) => {
    const listeners = eventListenersRef.current[eventName];
    if (!listeners) return;

    const promises = listeners
      .filter(listener => !targetSpriteId || listener.spriteId === targetSpriteId)
      .map(listener => listener.callback());
    
    await Promise.all(promises);
  }, []);

  const createApiForSprite = useCallback((spriteId: string) => {
      const wait = (tenths: number) => {
        return new Promise<void>(resolve => {
          setTimeout(() => {
            if (!executionControllerRef.current.stop) resolve();
            else throw new Error('EXECUTION_STOPPED');
          }, tenths * 100);
        });
      };
      
      const animateMovement = (duration: number, updateFn: (progress: number) => void): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            // FIX: Ensure duration is at least 1 frame (16ms) to prevent div-by-zero or near-instant completion issues
            const safeDuration = Math.max(duration, 16); 
            
            let start: number | null = null;
            const step = (timestamp: number) => {
                if (executionControllerRef.current.stop) return reject(new Error('EXECUTION_STOPPED'));
                if (!start) start = timestamp;
                const elapsed = timestamp - start;
                const progress = Math.min(elapsed / safeDuration, 1);
                
                // Safely update
                try {
                    updateFn(progress);
                } catch(e) {
                    console.error("Animation update failed", e);
                    return reject(e);
                }

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(step);
        });
      };
      
      const turnRight = async (steps: number) => {
        const totalRotation = steps * 15; // 1 step = 15 degrees
        const startState = runtimeSpriteStatesRef.current[spriteId];
        await animateMovement(200 + Math.abs(totalRotation), (p) => {
            updateRuntimeSprite(spriteId, s => ({...s, rotation: startState.rotation + totalRotation * p}));
        });
      };
      
      const turnLeft = async (steps: number) => {
        const totalRotation = steps * 15;
        const startState = runtimeSpriteStatesRef.current[spriteId];
        await animateMovement(200 + Math.abs(totalRotation), (p) => {
            updateRuntimeSprite(spriteId, s => ({...s, rotation: startState.rotation - totalRotation * p}));
        });
      };
      
      return {
        moveRight: async (steps: number) => {
          const startState = runtimeSpriteStatesRef.current[spriteId];
          await animateMovement(steps * 200, p => updateRuntimeSprite(spriteId, s => ({...s, x: startState.x + steps * p, direction: 1})));
        },
        moveLeft: async (steps: number) => {
          const startState = runtimeSpriteStatesRef.current[spriteId];
          await animateMovement(steps * 200, p => updateRuntimeSprite(spriteId, s => ({...s, x: startState.x - steps * p, direction: -1})));
        },
        moveUp: async (steps: number) => {
          const startState = runtimeSpriteStatesRef.current[spriteId];
          await animateMovement(steps * 200, p => updateRuntimeSprite(spriteId, s => ({...s, y: startState.y + steps * p})));
        },
        moveDown: async (steps: number) => {
          const startState = runtimeSpriteStatesRef.current[spriteId];
          await animateMovement(steps * 200, p => updateRuntimeSprite(spriteId, s => ({...s, y: startState.y - steps * p})));
        },
        turnRight,
        turnLeft,
        hop: async (height: number) => {
            const startState = runtimeSpriteStatesRef.current[spriteId];
            await animateMovement(500, p => {
                const yOffset = 4 * height * (p - (p * p));
                updateRuntimeSprite(spriteId, s => ({...s, y: startState.y + yOffset}));
            });
        },
        goHome: async () => {
            const sprite = currentPage.sprites.find(s => s.id === spriteId);
            if (!sprite) return;
            const startState = runtimeSpriteStatesRef.current[spriteId];
            const targetState = sprite.initialState;
            await animateMovement(500, p => {
                updateRuntimeSprite(spriteId, s => ({
                    ...s,
                    x: startState.x + (targetState.x - startState.x) * p,
                    y: startState.y + (targetState.y - startState.y) * p,
                    rotation: startState.rotation + (targetState.rotation - startState.rotation) * p,
                    scale: startState.scale + (targetState.scale - startState.scale) * p,
                    visible: targetState.visible,
                }));
            });
        },
        say: async (message: string) => {
          updateRuntimeSprite(spriteId, s => ({...s, message}));
          await wait(20);
          updateRuntimeSprite(spriteId, s => ({...s, message: null}));
        },
        grow: async () => { updateRuntimeSprite(spriteId, s => ({...s, scale: s.scale * 1.25})); await wait(2); },
        shrink: async () => { updateRuntimeSprite(spriteId, s => ({...s, scale: s.scale * 0.8})); await wait(2); },
        resetSize: async () => {
            const sprite = currentPage.sprites.find(s => s.id === spriteId);
            if(sprite) updateRuntimeSprite(spriteId, s => ({...s, scale: sprite.initialState.scale}));
            await wait(2);
        },
        hide: async () => { updateRuntimeSprite(spriteId, s => ({...s, visible: false})); await wait(1); },
        show: async () => { updateRuntimeSprite(spriteId, s => ({...s, visible: true})); await wait(1); },
        playPop: async () => { 
            try {
                // Using valid raw github content URL for the pop sound to ensure playback
                const audio = new Audio("https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/pop.mp3");
                await audio.play();
            } catch(e) {
                console.warn("Failed to play pop sound", e);
            }
            await wait(5); 
        },
        playRecordedSound: async (soundKey: string) => { const audio = localStorage.getItem(soundKey); if (audio) new Audio(audio).play(); await wait(10); },
        wait,
        setSpeed: (speed: 'slow'|'medium'|'fast') => {},
        sendMessage: async (color: string) => { triggerEvent(`message_${color}`); await wait(1); },
        register: (event: string, callback: Function) => {
            if (!eventListenersRef.current[event]) eventListenersRef.current[event] = [];
            eventListenersRef.current[event].push({ spriteId, callback });
        },
      };
    }, [currentPage.sprites, updateRuntimeSprite, triggerEvent]);

    const handleStop = useCallback(() => {
        console.log('--- Stopping all scripts ---');
        executionControllerRef.current.stop = true;
        setIsRunning(false);
    }, []);

  const runProject = useCallback(async (startEvent: 'flag' | 'tap', targetSpriteId?: string) => {
    if (isRunning) return;
    executionControllerRef.current.stop = false;
    setIsRunning(true);
    
    if (startEvent === 'flag') {
        console.log('--- Running all Green Flag scripts ---');
    } else if(targetSpriteId) {
        setActiveSpriteId(targetSpriteId);
        const tappedSprite = currentPage.sprites.find(s => s.id === targetSpriteId);
        console.log(`--- Running script (tap on ${tappedSprite?.name}) ---`);
    }

    eventListenersRef.current = {};

    try {
        // Register all event handlers from all sprites on the current page
        for (const sprite of currentPage.sprites) {
            const code = generateCodeForSprite(sprite);
            if (code) {
                const spriteApi = createApiForSprite(sprite.id);
                const apiKeys = Object.keys(spriteApi);
                const apiValues = Object.values(spriteApi);
                
                // Execute in safe scope without 'with' statement
                // eslint-disable-next-line no-new-func
                const runCode = new Function(...apiKeys, `
                  return (async () => {
                    ${code}
                  })();
                `);
                await runCode(...apiValues);
            }
        }

        // Trigger the specific event that started the run
        await triggerEvent(startEvent, targetSpriteId);

    } catch (error) {
        if (error instanceof Error && error.message === 'EXECUTION_STOPPED') {
            console.log('--- Script stopped ---');
        } else {
            const errorMessage = (error instanceof Error) ? error.message : String(error);
            console.error(`Runtime error: ${errorMessage}`);
        }
    } finally {
        if (!executionControllerRef.current.stop) {
            setIsRunning(false);
            console.log('--- Script(s) finished ---');
        }
    }
  }, [isRunning, currentPage, generateCodeForSprite, createApiForSprite, triggerEvent]);

  // Handler for clicking a block directly in the workspace to run it
  const handleRunBlock = useCallback(async (code: string) => {
    if (!activeSpriteId || !code.trim()) return;

    // We allow running individual blocks even if the main project is running or stopped.
    // Ensure the execution controller allows it.
    executionControllerRef.current.stop = false;
    
    try {
        const spriteApi = createApiForSprite(activeSpriteId);
        const apiKeys = Object.keys(spriteApi);
        const apiValues = Object.values(spriteApi);
        
        console.log("--- Running clicked block ---", code);
        
        // Use new Function with destructured arguments instead of 'with'
        // This avoids Strict Mode errors.
        // eslint-disable-next-line no-new-func
        const runBlock = new Function(...apiKeys, `
            return (async () => {
                ${code}
            })();
        `);
        
        await runBlock(...apiValues);

    } catch (error) {
        if (error instanceof Error && error.message === 'EXECUTION_STOPPED') {
             console.log('--- Block execution stopped ---');
        } else {
             console.error("Error running block:", error);
        }
    }
  }, [activeSpriteId, createApiForSprite]);

  const handleGreenFlag = () => {
    runProject('flag');
  };
  
  const handleSpriteTap = (tappedSpriteId: string) => {
    setPageToDeleteId(null);
    runProject('tap', tappedSpriteId);
  };
  
  const handleXmlChange = useCallback((newXml: string) => {
      if (!activeSpriteId) return;
      setPages(currentPages => currentPages.map(p => {
          if (p.id !== currentPageId) return p;
          return { ...p, sprites: p.sprites.map(s => s.id === activeSpriteId ? { ...s, workspaceXml: newXml } : s ) };
      }));
  }, [currentPageId, activeSpriteId]);

  const handleAddPage = () => {
    const newPage = createNewPage(`Page ${pages.length + 1}`);
    setPages([...pages, newPage]);
    setCurrentPageId(newPage.id);
    setActiveSpriteId(newPage.sprites[0]?.id ?? null);
    setRuntimeSpriteStates(s => ({ ...s, [newPage.sprites[0].id]: newPage.sprites[0].initialState }));
  };

  const handleAddSpriteFromGallery = (costumeUrl: string) => {
      const name = costumeUrl.startsWith('data:image') ? `Drawing ${currentPage.sprites.length + 1}` : costumeUrl.split('/').pop()?.split('.')[0] || `Sprite ${currentPage.sprites.length + 1}`;
      const newSprite = createNewSprite(name, costumeUrl);
      setPages(pages.map(p => p.id === currentPageId ? {...p, sprites: [...p.sprites, newSprite]} : p ));
      setRuntimeSpriteStates(s => ({ ...s, [newSprite.id]: newSprite.initialState }));
      setActiveSpriteId(newSprite.id);
      setIsGalleryOpen(false);
  };

  const handleBackgroundSelect = (backgroundUrl: string) => {
    setPages(pages.map(p => p.id === currentPageId ? {...p, background: `url(${backgroundUrl})`} : p ));
    setIsBgGalleryOpen(false);
  };
  
  const handlePageSwitch = (pageId: string) => {
      if (longPressCompleted.current) {
        longPressCompleted.current = false;
        return;
      }
      if (pageToDeleteId) {
        setPageToDeleteId(null);
        return;
      }
      setSpriteToDeleteId(null);
      if(pageId === currentPageId) return;
      setCurrentPageId(pageId);
      const newPage = pages.find(p => p.id === pageId);
      setActiveSpriteId(newPage?.sprites[0]?.id ?? null);
  };
  
  const handleTogglePresentationMode = () => {
    setIsPresentationMode(prev => !prev);
  };

  const handleSpriteDrag = (spriteId: string, position: { x: number; y: number }) => {
    updateRuntimeSprite(spriteId, (s) => ({ ...s, x: position.x, y: position.y }));
  };

  const handleSpriteDragEnd = (spriteId: string, finalPosition: { x: number; y: number }) => {
    // handleSpriteDrag now manages the live position.
    // This function only commits the final position to the persistent initialState.
    setPages(currentPages => currentPages.map(p => {
        if (p.id !== currentPageId) return p;
        return { ...p, sprites: p.sprites.map(s => {
            if (s.id !== spriteId) return s;
            const newInitialState = { ...s.initialState, x: finalPosition.x, y: finalPosition.y };
            return { ...s, initialState: newInitialState };
        })};
    }));
  };
  
  const handleOpenPaintEditorForNew = () => {
      setIsGalleryOpen(false);
      setEditingSprite(null);
      setIsPaintEditorOpen(true);
  };

  const handleEditSprite = (spriteId: string) => {
    const spriteToEdit = currentPage.sprites.find(s => s.id === spriteId);
    if (spriteToEdit && spriteToEdit.type === 'image') {
        const isSvg = spriteToEdit.costume.endsWith('.svg') || spriteToEdit.costume.startsWith('data:image/svg+xml');
        if (isSvg) {
            setEditingSprite(spriteToEdit);
            setIsPaintEditorOpen(true);
        }
    }
  };

  const handleSavePaintedSprite = (svgDataUrl: string) => {
      handleAddSpriteFromGallery(svgDataUrl);
      setIsPaintEditorOpen(false);
  };

  const handleUpdatePaintedSprite = (spriteId: string, newCostume: string) => {
      setPages(currentPages => currentPages.map(p => {
          if (p.id !== currentPageId) return p;
          return { 
              ...p, 
              sprites: p.sprites.map(s => 
                  s.id === spriteId ? { ...s, costume: newCostume } : s
              ) 
          };
      }));
      setIsPaintEditorOpen(false);
      setEditingSprite(null);
  };

  const handleSpriteNameChange = (spriteId: string, newName: string) => {
    setPages(currentPages => currentPages.map(p => {
        if (p.id !== currentPageId) return p;
        return { ...p, sprites: p.sprites.map(s => s.id === spriteId ? { ...s, name: newName } : s) };
    }));
  };

  const handlePressEnd = useCallback(() => {
    if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
    }
  }, []);
  
  const handleSpritePressStart = useCallback((spriteId: string) => {
    const targetSprite = currentPage.sprites.find(s => s.id === spriteId);
    if (targetSprite?.type === 'image' && currentPage.sprites.filter(s => s.type === 'image').length <= 1) return; 

    longPressCompleted.current = false;
    handlePressEnd(); 

    longPressTimerRef.current = window.setTimeout(() => {
        setSpriteToDeleteId(spriteId);
        longPressCompleted.current = true;
    }, 800);
  }, [currentPage.sprites, handlePressEnd]);
  
  const handleDeleteSprite = useCallback((spriteIdToDelete: string) => {
    setPages(currentPages => {
        const pageIndex = currentPages.findIndex(p => p.id === currentPageId);
        if (pageIndex === -1) return currentPages;

        const page = currentPages[pageIndex];
        const spriteIndex = page.sprites.findIndex(s => s.id === spriteIdToDelete);
        if (spriteIndex === -1) return currentPages;

        const remainingSprites = page.sprites.filter(s => s.id !== spriteIdToDelete);

        if (activeSpriteId === spriteIdToDelete) {
            let nextActiveSpriteId: string | null = null;
            if (remainingSprites.length > 0) {
                nextActiveSpriteId = remainingSprites[Math.max(0, spriteIndex - 1)].id;
            }
            setActiveSpriteId(nextActiveSpriteId);
        }

        const newPages = [...currentPages];
        newPages[pageIndex] = { ...page, sprites: remainingSprites };
        return newPages;
    });

    setRuntimeSpriteStates(currentStates => {
        const newStates = { ...currentStates };
        delete newStates[spriteIdToDelete];
        return newStates;
    });

    setSpriteToDeleteId(null);
  }, [currentPageId, activeSpriteId]);

  const handlePagePressStart = useCallback((pageId: string) => {
    if (pages.length <= 1) return;

    longPressCompleted.current = false;
    handlePressEnd(); // Clear any existing timers

    longPressTimerRef.current = window.setTimeout(() => {
        setPageToDeleteId(pageId);
        longPressCompleted.current = true;
    }, 800);
  }, [pages.length, handlePressEnd]);
  
  const handleDeletePage = useCallback((pageIdToDelete: string) => {
    if (pages.length <= 1) return; // safety check

    const pageToDelete = pages.find(p => p.id === pageIdToDelete);

    setPages(currentPages => {
        const pageIndex = currentPages.findIndex(p => p.id === pageIdToDelete);
        if (pageIndex === -1) return currentPages;
        
        const remainingPages = currentPages.filter(p => p.id !== pageIdToDelete);

        if (currentPageId === pageIdToDelete) {
            const newPageIndex = Math.max(0, pageIndex - 1);
            const newCurrentPage = remainingPages[newPageIndex];
            setCurrentPageId(newCurrentPage.id);
            setActiveSpriteId(newCurrentPage.sprites[0]?.id ?? null);
        }

        return remainingPages;
    });

    if (pageToDelete) {
        setRuntimeSpriteStates(currentStates => {
            const newStates = { ...currentStates };
            pageToDelete.sprites.forEach(s => {
                delete newStates[s.id];
            });
            return newStates;
        });
    }

    setPageToDeleteId(null);
  }, [pages, currentPageId]);

  const handleAddText = () => {
    const currentActiveSprite = currentPage.sprites.find(s => s.id === activeSpriteId);
    if (currentActiveSprite && currentActiveSprite.type === 'image') {
        lastActiveImageSpriteIdRef.current = activeSpriteId;
    } else {
        const firstImageSprite = currentPage.sprites.find(s => s.type === 'image');
        lastActiveImageSpriteIdRef.current = firstImageSprite?.id || null;
    }

    const newTextSprite = createNewTextSprite();
    setPages(pages.map(p => p.id === currentPageId ? {...p, sprites: [...p.sprites, newTextSprite]} : p ));
    setRuntimeSpriteStates(s => ({ ...s, [newTextSprite.id]: newTextSprite.initialState }));
    setActiveSpriteId(newTextSprite.id);
    setNewlyCreatedTextSpriteId(newTextSprite.id);
    setEditingTextSpriteId(newTextSprite.id);
  };
  
  const handleOpenTextEditor = (spriteId: string) => {
    const sprite = currentPage.sprites.find(s => s.id === spriteId);
    if (sprite?.type === 'text') {
        const currentActiveSprite = currentPage.sprites.find(s => s.id === activeSpriteId);
        if (currentActiveSprite && currentActiveSprite.type === 'image') {
            lastActiveImageSpriteIdRef.current = activeSpriteId;
        } else {
            const firstImageSprite = currentPage.sprites.find(s => s.type === 'image');
            lastActiveImageSpriteIdRef.current = firstImageSprite?.id || null;
        }

        setActiveSpriteId(spriteId);
        setNewlyCreatedTextSpriteId(null);
        setEditingTextSpriteId(spriteId);
    }
  };
  
  const handleUpdateTextSprite = (id: string, updates: Partial<Pick<Sprite, 'content' | 'color' | 'fontSize'>>) => {
    setPages(currentPages => currentPages.map(p => {
        if (p.id !== currentPageId) return p;
        return {
            ...p,
            sprites: p.sprites.map(s => s.id === id ? { ...s, ...updates } : s)
        };
    }));
  };

  const handleCloseTextEditor = () => {
    setEditingTextSpriteId(null);
    setNewlyCreatedTextSpriteId(null);

    const targetSpriteId = lastActiveImageSpriteIdRef.current;
    const spriteExists = currentPage.sprites.some(s => s.id === targetSpriteId);

    if (targetSpriteId && spriteExists) {
        setActiveSpriteId(targetSpriteId);
    } else {
        // Fallback if the stored sprite was deleted or is on another page
        const firstImageSprite = currentPage.sprites.find(s => s.type === 'image');
        setActiveSpriteId(firstImageSprite?.id || null);
    }
    
    lastActiveImageSpriteIdRef.current = null; // Clear the ref for next time
  };

  const handleSaveProject = useCallback(() => {
    try {
        const projectData = JSON.stringify(pages, null, 2); // Pretty print for readability
        const blob = new Blob([projectData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'project.blym'; // Custom file extension
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to save project:", error);
        alert('Could not save project.');
    }
  }, [pages]);

  const handleLoadProject = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.blym,application/json';

    input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (!target.files || target.files.length === 0) {
            return;
        }
        const file = target.files[0];

        const reader = new FileReader();
        reader.onload = (event) => {
            const fileContent = event.target?.result;
            if (typeof fileContent !== 'string') {
                alert('Error reading file content.');
                return;
            }
            try {
                const loadedPages: Page[] = JSON.parse(fileContent);
                // Basic validation
                if (Array.isArray(loadedPages) && loadedPages.length > 0 && loadedPages[0].id && loadedPages[0].sprites) {
                    setPages(loadedPages);
                    
                    const firstPage = loadedPages[0];
                    setCurrentPageId(firstPage.id);
                    setActiveSpriteId(firstPage.sprites[0]?.id ?? null);
                    
                    const newRuntimeStates: Record<string, SpriteState> = {};
                    loadedPages.forEach(p => {
                        p.sprites.forEach(s => {
                            newRuntimeStates[s.id] = { ...s.initialState };
                        });
                    });
                    setRuntimeSpriteStates(newRuntimeStates);
                    
                    handleStop();

                    alert('Project Loaded!');
                } else {
                    throw new Error('Invalid project file format.');
                }
            } catch (error) {
                console.error("Failed to load project:", error);
                alert('Could not load project. The file might be corrupted or in the wrong format.');
            }
        };
        reader.onerror = () => {
            console.error('FileReader error.');
            alert('Error reading file.');
        };
        reader.readAsText(file);
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }, [handleStop]);

  return (
    <div className="flex flex-col h-screen bg-[#FDFCF8] overflow-hidden font-sans select-none">
      {isGalleryOpen && <SpriteGallery onClose={() => setIsGalleryOpen(false)} onSelect={handleAddSpriteFromGallery} onPaintNew={handleOpenPaintEditorForNew} />}
      {isBgGalleryOpen && <BackgroundGallery onClose={() => setIsBgGalleryOpen(false)} onSelect={handleBackgroundSelect} />}
      {isPaintEditorOpen && <PaintEditor 
          onClose={() => {
              setIsPaintEditorOpen(false);
              setEditingSprite(null);
          }} 
          onSave={(newCostume) => {
              if (editingSprite) {
                  handleUpdatePaintedSprite(editingSprite.id, newCostume);
              } else {
                  handleSavePaintedSprite(newCostume);
              }
          }}
          initialSprite={editingSprite}
      />}
      
      {!isPresentationMode && (
        <nav className="h-24 px-4 flex items-center justify-center shrink-0 relative z-20 shadow-md" style={{ backgroundColor: '#4B8CC2' }}>
         <div className="flex items-center gap-4">
            <NavButton icon="fas fa-save" alt="Save Project" onClick={handleSaveProject} />
            <NavButton icon="fas fa-folder-open" alt="Load Project" onClick={handleLoadProject} />
            <div className="w-px h-16 bg-slate-300/50 mx-2"></div>
            <NavButton src="https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/ui/fullOff2.svg" alt="Presentation Mode" onClick={handleTogglePresentationMode} />
            <NavButton src={showGrid ? "https://codejredu.github.io/jr/scratchjr/assets/ui/gridOff.svg" : "https://codejredu.github.io/jr/scratchjr/assets/ui/gridOn.svg"} alt="Show/Hide Grid" onClick={() => setShowGrid(prev => !prev)} />
            <NavButton src="https://codejredu.github.io/jr/scratchjr/assets/ui/scene1.svg" alt="Change Background" onClick={() => setIsBgGalleryOpen(true)} />
            <NavButton src="https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/ui/addTextPressed.svg" alt="Add Text" onClick={handleAddText} />
            <div className="w-px h-16 bg-slate-300/50 mx-2"></div>
            <NavButton src="https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/ui/resetAll.svg" alt="Reset" onClick={resetPageSprites} disabled={isRunning} />
            {isRunning ? (
                <NavButton src="https://raw.githubusercontent.com/codejredu/jr/master/scratchjr/assets/ui/stop1.svg" alt="Stop" onClick={handleStop} />
            ) : (
                <NavButton src="https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/ui/go.svg" alt="Run" onClick={handleGreenFlag} />
            )}
        </div>
      </nav>
      )}

      {!isPresentationMode ? (
        <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col bg-white">
              <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 shrink-0 z-10">
                  {activeSprite ? (
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                          {activeSprite.type === 'image' && activeSprite.costume && <img src={activeSprite.costume} alt={activeSprite.name} className="w-6 h-6 object-contain" />}
                          {activeSprite.type === 'text' && <i className="fas fa-font"></i>}
                          <span>{isTextSpriteActive ? `Editing` : 'Scripts for'} {activeSprite.name}</span>
                      </div>
                  ) : (
                      <span className="text-sm font-bold text-slate-400">Select a sprite to edit its script</span>
                  )}
              </div>
              <div className="flex-1 relative">
                  {isTextSpriteActive ? (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-center p-4">
                          Scripts cannot be added to text objects.
                      </div>
                  ) : (
                      <BlocklyEditor onCodeChange={setGeneratedCode} xml={currentWorkspaceXml} onXmlChange={handleXmlChange} onRunBlock={handleRunBlock} />
                  )}
              </div>
            </div>

            <div className="flex flex-col shrink-0 w-[850px] border-l border-slate-300 bg-slate-100">
                <div className="flex-1 p-2 overflow-y-auto bg-slate-100">
                  <div className="flex flex-col h-full bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                      <div className="flex-1 flex overflow-hidden">
                            <div className="flex-1 flex flex-col min-w-0">
                              <div className="h-36 bg-[#F9F9F9] border-b border-slate-200 flex items-center px-4 gap-4 overflow-x-auto relative">
                                  <div className="text-xs font-bold text-slate-400 absolute top-1 left-2">Objects</div>
                                  {currentPage.sprites.filter(s => s.type === 'image').map(sprite => {
                                      const isSvg = sprite.costume.endsWith('.svg') || sprite.costume.startsWith('data:image/svg+xml');
                                      return (
                                          <div 
                                            key={sprite.id} 
                                            onClick={() => {
                                              if (longPressCompleted.current) {
                                                  longPressCompleted.current = false;
                                                  return;
                                              }
                                              if (spriteToDeleteId) {
                                                setSpriteToDeleteId(null);
                                                return;
                                              }
                                              setPageToDeleteId(null);
                                              setActiveSpriteId(sprite.id);
                                            }}
                                            onMouseDown={() => handleSpritePressStart(sprite.id)}
                                            onMouseUp={handlePressEnd}
                                            onMouseLeave={handlePressEnd}
                                            onTouchStart={() => handleSpritePressStart(sprite.id)}
                                            onTouchEnd={handlePressEnd}
                                            className={`w-24 h-28 bg-white border-2 rounded-lg shadow-sm flex flex-col items-center justify-between p-1 relative cursor-pointer min-w-[96px] ${ activeSpriteId === sprite.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200' }`}
                                          >
                                              {spriteToDeleteId === sprite.id && (
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleDeleteSprite(sprite.id);
                                                    }}
                                                    className="absolute -top-2 -left-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm shadow-lg z-20 animate-pulse"
                                                    title="Delete"
                                                  >
                                                    <i className="fas fa-times"></i>
                                                  </button>
                                              )}
                                              {activeSpriteId === sprite.id && isSvg && (
                                                  <button 
                                                      onClick={(e) => { e.stopPropagation(); handleEditSprite(sprite.id); }} 
                                                      className="absolute top-0 right-0 w-5 h-5 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full flex items-center justify-center text-[10px] shadow z-10"
                                                      title="Edit Sprite"
                                                  >
                                                      <i className="fas fa-paint-brush"></i>
                                                  </button>
                                              )}
                                              <img src={sprite.costume} alt={sprite.name} className="w-16 h-16 object-contain" />
                                              
                                              {activeSpriteId === sprite.id ? (
                                                  <input type="text" value={sprite.name} onChange={(e) => handleSpriteNameChange(sprite.id, e.target.value)} onClick={(e) => e.stopPropagation()} className="text-xs font-bold text-slate-700 text-center w-full bg-blue-50 border-none outline-none rounded-sm" maxLength={15} autoFocus />
                                              ) : (
                                                  <span className="text-xs font-bold text-slate-600 mt-1 truncate w-full text-center">{sprite.name}</span>
                                              )}
                                          </div>
                                      )
                                  })}
                                  <div onClick={() => setIsGalleryOpen(true)} title="Add Sprite from Gallery" className="w-24 h-28 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center text-blue-500 hover:bg-blue-50 cursor-pointer min-w-[96px]">
                                      <i className="fas fa-plus text-2xl"></i>
                                  </div>
                              </div>

                              <div className="flex-1 bg-[#e0e0e0] p-8 flex items-center justify-center relative">
                                  <div className="w-full aspect-[4/3] bg-white border-[4px] border-slate-300 shadow-xl rounded-xl relative bg-cover bg-center" style={{ backgroundImage: currentPage.background, backgroundColor: currentPage.background.startsWith('url') ? '#ffffff' : currentPage.background }}>
                                        <Stage 
                                          sprites={currentPage.sprites} 
                                          runtimeStates={runtimeSpriteStates} 
                                          onClick={handleSpriteTap} 
                                          showGrid={showGrid} 
                                          onSpriteDrag={handleSpriteDrag} 
                                          onSpriteDragEnd={handleSpriteDragEnd}
                                          onSpriteDoubleClick={handleOpenTextEditor}
                                          spriteToDeleteId={spriteToDeleteId}
                                          onDeleteSprite={handleDeleteSprite}
                                          onSetSpriteToDelete={setSpriteToDeleteId}
                                          onSpritePressStart={handleSpritePressStart}
                                          onSpritePressEnd={handlePressEnd}
                                          longPressCompletedRef={longPressCompleted}
                                        />
                                        {editingTextSprite && (
                                          <TextEditor 
                                            sprite={editingTextSprite}
                                            isNew={newlyCreatedTextSpriteId === editingTextSprite.id}
                                            onUpdate={handleUpdateTextSprite}
                                            onDelete={handleDeleteSprite}
                                            onClose={handleCloseTextEditor}
                                          />
                                        )}
                                  </div>
                              </div>
                          </div>

                          <div onMouseDown={handleResizeMouseDown} className="w-1.5 cursor-col-resize bg-slate-200 hover:bg-blue-400 active:bg-blue-500 transition-colors duration-200 shrink-0"></div>

                          <div style={{ width: `${pagesPanelWidth}px` }} className="bg-white flex flex-col items-center py-4 px-4 gap-4 overflow-y-auto shrink-0 z-10">
                                <div className="text-xs font-bold text-slate-400 mb-2">Pages</div>
                                {pages.map((page, index) => {
                                    const pageStyle: React.CSSProperties = { width: '90px', height: '90px' };
                                    const isImageBackground = page.background.startsWith('url(');
                                    const isDefaultWhite = page.background === '#ffffff';

                                    if (isImageBackground) {
                                        pageStyle.backgroundImage = page.background;
                                        pageStyle.backgroundSize = 'cover';
                                        pageStyle.backgroundPosition = 'center';
                                    } else {
                                        pageStyle.backgroundColor = page.background;
                                    }

                                    return (
                                      <div 
                                          key={page.id} 
                                          onClick={() => handlePageSwitch(page.id)}
                                          onMouseDown={() => handlePagePressStart(page.id)}
                                          onMouseUp={handlePressEnd}
                                          onMouseLeave={handlePressEnd}
                                          onTouchStart={() => handlePagePressStart(page.id)}
                                          onTouchEnd={handlePressEnd}
                                          style={pageStyle} 
                                          title={`Page ${index + 1}`}
                                          className={`border-2 rounded-lg shadow-sm flex items-center justify-center p-1 relative cursor-pointer shrink-0 ${ currentPageId === page.id ? 'border-orange-400 ring-2 ring-orange-200' : 'border-slate-200' }`}
                                      >
                                          {pageToDeleteId === page.id && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeletePage(page.id);
                                                }}
                                                className="absolute -top-2 -left-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm shadow-lg z-20 animate-pulse"
                                                title="Delete Page"
                                              >
                                                <i className="fas fa-times"></i>
                                              </button>
                                          )}
                                          {isDefaultWhite && !isImageBackground && (
                                              <div className="text-slate-300 text-4xl"><i className="fas fa-mountain-sun"></i></div>
                                          )}
                                          <div className="absolute -top-2 -right-2 w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow">{index + 1}</div>
                                      </div>
                                    );
                                })}
                                <div onClick={handleAddPage} style={{ width: '90px', height: '90px' }} className="border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-50 cursor-pointer shrink-0">
                                    <i className="fas fa-plus text-3xl"></i>
                                </div>
                          </div>
                      </div>
                  </div>
                </div>
            </div>
        </div>
      ) : (
        <PresentationView
          currentPage={currentPage}
          runtimeSpriteStates={runtimeSpriteStates}
          handleGreenFlag={handleGreenFlag}
          handleStop={handleStop}
          resetPageSprites={resetPageSprites}
          handleSpriteTap={handleSpriteTap}
          isRunning={isRunning}
          onExit={handleTogglePresentationMode}
        />
      )}
    </div>
  );
};

export default App;
