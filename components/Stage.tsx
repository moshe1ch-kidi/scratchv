 import React, { useRef, useMemo, useState, useLayoutEffect, useEffect } from 'react';
import { Sprite, SpriteState } from '../types';

// Grid constants
const GRID_COLS = 24;
const GRID_ROWS = 18;

interface StageProps {
  sprites: Sprite[];
  runtimeStates: Record<string, SpriteState>;
  onClick?: (spriteId: string) => void;
  showGrid?: boolean;
  onSpriteDrag: (spriteId: string, position: { x: number; y: number }) => void;
  onSpriteDragEnd: (spriteId:string, position: { x: number; y: number }) => void;
  onSpriteDoubleClick?: (spriteId: string) => void;
  // New props for deletion
  spriteToDeleteId: string | null;
  onDeleteSprite: (spriteId: string) => void;
  onSetSpriteToDelete: (id: string | null) => void;
  onSpritePressStart: (spriteId: string) => void;
  onSpritePressEnd: () => void;
  longPressCompletedRef: React.RefObject<boolean>;
}

// --- Helper Components ---

const StageGrid: React.FC<{show: boolean; width: number; height: number; cellSize: number;}> = React.memo(({ show, width, height, cellSize }) => {
    if (cellSize <= 0) return null;

    const verticalLines = useMemo(() => 
        Array.from({ length: GRID_COLS + 1 }, (_, i) => (
            <line key={`v-${i}`} x1={i * cellSize} y1="0" x2={i * cellSize} y2={height} stroke="#e2e8f0" strokeWidth="1" />
        ))
    , [height, cellSize]);

    const horizontalLines = useMemo(() => 
        Array.from({ length: GRID_ROWS + 1 }, (_, i) => (
            <line key={`h-${i}`} x1="0" y1={i * cellSize} x2={width} y2={i * cellSize} stroke="#e2e8f0" strokeWidth="1" />
        ))
    , [width, cellSize]);

    const xAxisLabels = useMemo(() => 
        Array.from({ length: GRID_COLS }, (_, i) => {
            const num = i + 1;
            return (
                <text key={`x-label-${num}`} x={(num - 0.5) * cellSize} y={height + 18} dominantBaseline="middle" textAnchor="middle" fontSize="10" fill="#94a3b8">
                    {num}
                </text>
            );
        })
    , [height, cellSize]);

     const yAxisLabels = useMemo(() => 
        Array.from({ length: GRID_ROWS }, (_, i) => {
            const num = i + 1;
             return (
                <text key={`y-label-${num}`} x={-18} y={height - ((num - 0.5) * cellSize)} dominantBaseline="middle" textAnchor="middle" fontSize="10" fill="#94a3b8">
                    {num}
                </text>
            );
        })
    , [height, cellSize]);

    return (
        <svg width={width} height={height} className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0" style={{ opacity: show ? 1 : 0, overflow: 'visible' }}>
            {/* Grid Lines */}
            {verticalLines}
            {horizontalLines}
            
            {/* Axes */}
            <line x1="0" y1={height} x2={width} y2={height} stroke="#94a3b8" strokeWidth="2" />
            <line x1="0" y1="0" x2="0" y2={height} stroke="#94a3b8" strokeWidth="2" />

            {/* Ticks */}
            <g>{xAxisLabels}</g>
            <g>{yAxisLabels}</g>
        </svg>
    );
});


const SpriteCharacter: React.FC<{
  sprite: Sprite;
  state: SpriteState;
  onCharacterDoubleClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  cellSize: number;
  isMarkedForDelete: boolean;
  onDelete: () => void;
  onPressStart: () => void;
  isDragging: boolean;
  dragDelta: { x: number; y: number } | null;
}> = ({ sprite, state, onCharacterDoubleClick, onMouseDown, cellSize, isMarkedForDelete, onDelete, onPressStart, isDragging, dragDelta }) => {
    
    const imageSize = cellSize * 3;
    const finalScaleX = state.scale * state.direction;
    const finalScaleY = state.scale;
    
    // Calculate the pixel coordinates of the sprite's CENTER based on its grid state
    const pixelCenterX = (state.x - 0.5) * cellSize;
    const pixelCenterY = (state.y - 0.5) * cellSize;

    const wrapperStyles: React.CSSProperties = {
        // Position the top-left corner of the div so that its center aligns with the calculated pixel center
        left: `${pixelCenterX - imageSize / 2}px`,
        bottom: `${pixelCenterY - imageSize / 2}px`,
        width: sprite.type === 'text' ? 'auto' : `${imageSize}px`,
        height: sprite.type === 'text' ? 'auto' : `${imageSize}px`,
        zIndex: isDragging ? 100 : (sprite.type === 'text' ? 20 : 10),
    };
    
    // During a drag, apply a smooth pixel-based transform for fluid movement
    if (isDragging && dragDelta) {
        wrapperStyles.transform = `translate(${dragDelta.x}px, ${dragDelta.y}px)`;
    }

    // The transition is now handled by requestAnimationFrame in App.tsx, so no CSS transition class is needed here.

    return (
        <div 
            className={`absolute group/sprite cursor-grab`}
            style={wrapperStyles}
            onDoubleClick={onCharacterDoubleClick}
            onMouseDown={(e) => {
                onPressStart();
                onMouseDown(e);
            }}
            title={`${sprite.name} (x: ${state.x.toFixed(1)}, y: ${state.y.toFixed(1)})`}
        >
            {isMarkedForDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm shadow-lg z-20 animate-pulse"
                  title="Delete"
                >
                  <i className="fas fa-times"></i>
                </button>
            )}
            <div 
                className={`absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-in-out ${sprite.type === 'text' ? 'p-2' : ''}`}
                style={{
                    transform: `rotate(${state.rotation}deg) scale(${finalScaleX}, ${finalScaleY})`,
                    opacity: state.visible ? 1 : 0.2,
                    filter: state.visible ? 'none' : 'grayscale(100%) opacity(30%)',
                }}
            >
                {state.message && (
                    <div className="absolute bottom-full mb-2 transition-all duration-300 opacity-100 scale-100">
                        <div className="bg-white border-[3px] border-slate-800 rounded-2xl px-4 py-2 shadow-lg min-w-[100px] text-center whitespace-nowrap z-20">
                            <span className="text-lg font-bold text-slate-800 font-sans">{state.message}</span>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-slate-800 z-10"></div>
                        <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-white z-20"></div>
                    </div>
                )}
                
                {sprite.type === 'text' && sprite.content ? (
                    <div
                      className="font-bold drop-shadow-lg text-center whitespace-pre-wrap break-words select-none"
                      style={{
                        color: sprite.color || '#000000',
                        fontSize: `${1 + (sprite.fontSize || 2) * 0.8}rem`,
                        lineHeight: 1.1,
                      }}
                    >
                      {sprite.content}
                    </div>
                ) : (
                    <img
                      src={sprite.costume}
                      alt={sprite.name}
                      className="object-contain drop-shadow-lg group-hover/sprite:scale-110 transition-transform"
                      style={{ 
                        imageRendering: 'pixelated',
                        width: `${imageSize}px`,
                        height: `${imageSize}px`,
                      }}
                    />
                )}
            </div>
        </div>
    );
};

// --- Main Stage Component ---

const Stage: React.FC<StageProps> = ({ 
    sprites, runtimeStates, onClick, showGrid = true, onSpriteDrag, onSpriteDragEnd, onSpriteDoubleClick,
    spriteToDeleteId, onDeleteSprite, onSetSpriteToDelete, onSpritePressStart, onSpritePressEnd, longPressCompletedRef 
}) => {
  const stageContentRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef<{
    id: string;
    startClientX: number;
    startClientY: number;
    startSpriteX: number; // In grid units
    startSpriteY: number; // In grid units
    didMove: boolean;
  } | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0, cellSize: 0 });
  const [dragDelta, setDragDelta] = useState<{ x: number; y: number } | null>(null);
  const [isFinishingDrag, setIsFinishingDrag] = useState(false);

  useLayoutEffect(() => {
    const stageElement = stageContentRef.current;
    if (!stageElement) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        const cellSize = width / GRID_COLS;
        const height = cellSize * GRID_ROWS;
        setStageSize({ width, height, cellSize });
      }
    });
    resizeObserver.observe(stageElement);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (isFinishingDrag) {
        setIsFinishingDrag(false);
        setDragDelta(null);
        dragInfo.current = null;
    }
  }, [runtimeStates, isFinishingDrag]);
  
  const pixelsToGrid = (pixelX: number, pixelY: number): { x: number; y: number } => {
    if (stageSize.cellSize <= 0) return { x: 1, y: 1};
    
    const gridX = Math.round(pixelX / stageSize.cellSize - 0.5) + 1;
    const gridY = Math.round(pixelY / stageSize.cellSize - 0.5) + 1;
    
    const clampedX = Math.max(1, Math.min(GRID_COLS, gridX));
    const clampedY = Math.max(1, Math.min(GRID_ROWS, gridY));

    return { x: clampedX, y: clampedY };
  };

  const handleMouseDown = (e: React.MouseEvent, spriteId: string) => {
    if (!stageContentRef.current) return;
    const spriteState = runtimeStates[spriteId];
    const sprite = sprites.find(s => s.id === spriteId);
    if (!spriteState || !sprite) return;
    
    e.preventDefault();
    e.stopPropagation();

    onSpritePressStart(spriteId);

    dragInfo.current = {
        id: spriteId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startSpriteX: spriteState.x,
        startSpriteY: spriteState.y,
        didMove: false,
    };
    
    document.body.classList.add('cursor-grabbing');
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragInfo.current || stageSize.cellSize <= 0) return;
    e.preventDefault();

    const dx = e.clientX - dragInfo.current.startClientX;
    const dy = e.clientY - dragInfo.current.startClientY;

    if (!dragInfo.current.didMove && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        dragInfo.current.didMove = true;
        onSpritePressEnd();
    }
    
    if (dragInfo.current.didMove) {
      setDragDelta({ x: dx, y: dy });
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    document.body.classList.remove('cursor-grabbing');

    onSpritePressEnd();

    if (dragInfo.current) {
        const localDragInfo = { ...dragInfo.current };
        
        if (localDragInfo.didMove) {
            const dx = e.clientX - localDragInfo.startClientX;
            const dy = e.clientY - localDragInfo.startClientY;
            
            const startPixelCenterX = (localDragInfo.startSpriteX - 0.5) * stageSize.cellSize;
            const startPixelCenterY = (localDragInfo.startSpriteY - 0.5) * stageSize.cellSize;

            const finalPixelCenterX = startPixelCenterX + dx;
            const finalPixelCenterY = startPixelCenterY - dy;

            const finalGridPos = pixelsToGrid(finalPixelCenterX, finalPixelCenterY);

            onSpriteDrag(localDragInfo.id, finalGridPos);
            onSpriteDragEnd(localDragInfo.id, finalGridPos);
            
            setIsFinishingDrag(true);
        } else {
            if (longPressCompletedRef.current) {
                longPressCompletedRef.current = false;
            } else if (spriteToDeleteId) {
                onSetSpriteToDelete(null);
            } else if (onClick) {
                onClick(localDragInfo.id);
            }
            setDragDelta(null);
            dragInfo.current = null;
        }
    }
  };
  
  const renderableSprites = useMemo(() => {
    return sprites
      .map(spriteConfig => {
        const runtimeState = runtimeStates[spriteConfig.id];
        if (!runtimeState) {
          return null;
        }
        return {
          key: spriteConfig.id,
          sprite: spriteConfig,
          state: runtimeState, // Render using the true, unwrapped state
        };
      })
      .filter((s): s is { key: string; sprite: Sprite; state: SpriteState } => s !== null);
  }, [sprites, runtimeStates]);


  return (
    <div className="w-full h-full box-border flex items-center justify-center">
        <div
            ref={stageContentRef}
            className="w-full h-full relative select-none"
        >
            {stageSize.width > 0 && (
                <>
                    {/* Grid is rendered absolutely with overflow visible to show labels outside the stage area */}
                    <StageGrid 
                        show={showGrid}
                        width={stageSize.width}
                        height={stageSize.height}
                        cellSize={stageSize.cellSize}
                    />
                    
                    {/* Sprites are clipped to the stage area to prevent visual overflow */}
                    <div className="absolute inset-0 overflow-hidden z-10">
                        {renderableSprites.map(renderable => {
                            const { key, sprite, state } = renderable;
                            const isPrimary = key === sprite.id;
                            const isDragging = dragInfo.current?.id === sprite.id;

                            return (
                                <SpriteCharacter 
                                    key={key}
                                    sprite={sprite}
                                    state={state}
                                    cellSize={stageSize.cellSize}
                                    isDragging={isDragging}
                                    dragDelta={isDragging ? dragDelta : null}
                                    onMouseDown={(e) => handleMouseDown(e, sprite.id)}
                                    onCharacterDoubleClick={onSpriteDoubleClick && sprite.type === 'text' ? () => onSpriteDoubleClick(sprite.id) : () => {}}
                                    isMarkedForDelete={isPrimary && spriteToDeleteId === sprite.id}
                                    onDelete={() => onDeleteSprite(sprite.id)}
                                    onPressStart={() => onSpritePressStart(sprite.id)}
                                />
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    </div>
  );
};

export default Stage;
