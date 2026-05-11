import React, { useState, useMemo } from 'react';

const SPRITE_CATEGORIES = {
  all: { label: 'All', icon: 'fas fa-th-large' },
  animals: { label: 'Animals', icon: 'fas fa-dove' },
  people: { label: 'People', icon: 'fas fa-users' },
  vehicles: { label: 'Vehicles', icon: 'fas fa-car' },
  aircraft: { label: 'Aircraft', icon: 'fas fa-plane' },
  nature: { label: 'Nature', icon: 'fas fa-leaf' },
  items: { label: 'Items', icon: 'fas fa-box-open' }
};

const SPRITES = [
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Aeroplane.svg', category: 'aircraft' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Astronaut.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Bus.svg', category: 'vehicles' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/camel.svg', category: 'animals' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Car.svg', category: 'vehicles' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Car1.svg', category: 'vehicles' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Fort.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Frog.svg', category: 'animals' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Giraffe.svg', category: 'animals' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Girl.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Girl1.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Girl2.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Girl3.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Grandfather.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Grandmother.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Horse.svg', category: 'animals' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Igloo.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Inuit.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Lizard.svg', category: 'animals' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Monkey.svg', category: 'animals' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Moon.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/MoonBkg.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Mother.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Mushroom.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/NightTable.svg', category: 'items' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Penguin.svg', category: 'animals' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Purple.svg', category: 'items' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/rabbit.svg', category: 'animals' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Rancher.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Red.svg', category: 'items' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Rocket.svg', category: 'aircraft' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Rowboat.svg', category: 'vehicles' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/SailBoat.svg', category: 'vehicles' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Scubadiver.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Seahorse.svg', category: 'animals' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/ShootingStar.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Snake.svg', category: 'animals' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/SoccerNet.svg', category: 'items' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Star.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Star2.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Star3.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Starfish.svg', category: 'animals' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Stool.svg', category: 'items' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Sun.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Table.svg', category: 'items' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Teen2.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Teen3.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/TeenBoy1.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/TeenBoy2.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/TeenBoy3.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/TeenGirl1.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/TeenGirl2.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/TeenGirl3.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Tornado.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Tree1.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Tree2.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Tree3.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Tree4.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Tulip2.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Weed.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Whale.svg', category: 'animals' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Winter.svg', category: 'nature' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Wizard.svg', category: 'people' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Zebra.svg', category: 'animals' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/blue1.svg', category: 'items' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/cat1.svg', category: 'animals' },
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/wolf.png', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/sprite/alligator.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/sprite/Polarbear.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/sprite/bee.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/sprite/dolpin.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/sprite/fox.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/sprite/monkey.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/tiger.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/lion.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/doll1.svg', category: 'people' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/doll2.svg', category: 'people' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/doll3.svg', category: 'people' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/doll4.svg', category: 'people' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/doll5.svg', category: 'people' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/fish-1.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/fish-2.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/fish-3.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/firer.svg', category: 'items' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/missle.svg', category: 'aircraft' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/football.svg', category: 'items' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/psndamain.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/3dmoustang.svg', category: 'vehicles' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/3djagouar.svg', category: 'vehicles' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/3dbentez.svg', category: 'vehicles' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/3dcorvet.svg', category: 'vehicles' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/3dmaeck.svg', category: 'vehicles' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/kid5.svg', category: 'people' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/kid3.svg', category: 'people' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/kid2.svg', category: 'people' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/kid1.svg', category: 'people' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/horse1.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/anicopter.svg', category: 'aircraft' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/car1.svg', category: 'vehicles' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/brid3.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/bird2.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/bird2.gif', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/anipiqrnAXrT.svg', category: 'items' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/anidogi2.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/aniturtle.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/anicat2.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/anbicycle.svg', category: 'vehicles' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/anicar3.svg', category: 'vehicles' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/anicock.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/anibutter.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/anitiger.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/bat.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/bbasket.svg', category: 'items' }
];

interface SpriteGalleryProps {
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  onPaintNew: () => void;
}

const SpriteGallery: React.FC<SpriteGalleryProps> = ({ onClose, onSelect, onPaintNew }) => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof SPRITE_CATEGORIES>('all');
  const [visibleCount, setVisibleCount] = useState(24);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  const filteredSprites = useMemo(() => {
    let result = SPRITES;
    if (activeCategory !== 'all') {
      result = SPRITES.filter(s => s.category === activeCategory);
    }
    return result;
  }, [activeCategory]);

  const visibleSprites = useMemo(() => {
    return filteredSprites.slice(0, visibleCount);
  }, [filteredSprites, visibleCount]);

  const toggleSprite = (url: string) => {
    setSelectedUrls(prev => 
      prev.includes(url) 
        ? prev.filter(u => u !== url) 
        : [...prev, url]
    );
  };

  const handleSelectAllInView = () => {
    const newUrls = visibleSprites.map(s => s.url).filter(url => !selectedUrls.includes(url));
    if (newUrls.length === 0) {
      // If all are already selected, maybe deselect them?
      const visibleUrls = visibleSprites.map(s => s.url);
      setSelectedUrls(prev => prev.filter(url => !visibleUrls.includes(url)));
    } else {
      setSelectedUrls(prev => [...prev, ...newUrls]);
    }
  };

  const handleDone = () => {
    if (selectedUrls.length > 0) {
      onSelect(selectedUrls);
    } else {
      onClose();
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
      if (visibleCount < filteredSprites.length) {
        setVisibleCount(prev => prev + 24);
      }
    }
  };

  // Reset visible count when category changes
  React.useEffect(() => {
    setVisibleCount(24);
  }, [activeCategory]);

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] h-auto flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-700">Choose Sprites</h2>
            {selectedUrls.length > 0 && (
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                {selectedUrls.length} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
             {selectedUrls.length > 0 && (
               <button 
                 onClick={() => setSelectedUrls([])}
                 className="text-slate-500 hover:text-slate-700 text-sm font-medium"
               >
                 Clear all
               </button>
             )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-2xl cursor-pointer">
              <i className="fas fa-times-circle"></i>
            </button>
          </div>
        </div>

        {/* Categories Tabs & Selection Actions */}
        <div className="px-4 py-2 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {Object.entries(SPRITE_CATEGORIES).map(([id, category]) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id as any)}
                title={category.label}
                className={`px-4 py-2 rounded-xl text-xl transition-all whitespace-nowrap flex items-center justify-center min-w-[3rem] cursor-pointer ${
                  activeCategory === id 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <i className={category.icon}></i>
              </button>
            ))}
          </div>
          <button 
            onClick={handleSelectAllInView}
            className="hidden sm:block text-blue-600 hover:text-blue-700 text-sm font-bold bg-blue-50 px-3 py-2 rounded-lg"
          >
            Select/Deselect All
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-100/50" onScroll={handleScroll}>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {/* Paint New Button */}
            {activeCategory === 'all' && (
              <div 
                onClick={onPaintNew}
                className="bg-blue-50 border-2 border-dashed border-blue-300 text-blue-500 cursor-pointer aspect-square flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-blue-400 hover:scale-105 hover:bg-blue-100 rounded-lg"
              >
                <i className="fas fa-paint-brush text-3xl"></i>
                <span className="text-xs font-bold mt-2">Paint New</span>
              </div>
            )}

            {/* Existing Sprites */}
            {visibleSprites.map((sprite, idx) => {
              const isSelected = selectedUrls.includes(sprite.url);
              return (
                <div 
                  key={`${sprite.url}-${idx}`} 
                  onClick={() => toggleSprite(sprite.url)}
                  className={`relative p-2 rounded-xl cursor-pointer aspect-square flex items-center justify-center transition-all hover:shadow-lg hover:scale-105 bg-white border-2 ${
                    isSelected 
                      ? 'border-blue-500 ring-4 ring-blue-100' 
                      : 'border-transparent shadow-sm'
                  }`}
                >
                  <img 
                    src={sprite.url} 
                    alt="" 
                    loading="lazy"
                    className="max-w-full max-h-full object-contain" 
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
                      <i className="fas fa-check text-xs"></i>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {visibleCount < filteredSprites.length && (
            <div className="flex justify-center mt-8 mb-4">
              <button 
                onClick={() => setVisibleCount(prev => prev + 24)}
                className="bg-yellow-400 text-yellow-900 px-8 py-3 rounded-full font-black hover:bg-yellow-500 transition-all hover:scale-110 shadow-xl border-4 border-yellow-200 flex items-center gap-2"
              >
                <span>✨ Show More ✨</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer with Done Button */}
        <div className="p-6 border-t-4 border-slate-200 bg-white flex justify-center shrink-0">
          <button 
            onClick={handleDone}
            disabled={selectedUrls.length === 0}
            className={`px-16 py-4 rounded-3xl font-black text-xl transition-all shadow-2xl flex items-center gap-3 border-b-8 active:border-b-0 active:translate-y-2 ${
              selectedUrls.length > 0
                ? 'bg-green-500 text-white hover:bg-green-600 border-green-700 hover:scale-105'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-300 opacity-60'
            }`}
          >
            {selectedUrls.length > 0 ? (
              <>
                <i className="fas fa-check-circle"></i>
                OK! Add {selectedUrls.length} {selectedUrls.length === 1 ? 'Sprite' : 'Sprites'}
              </>
            ) : (
              'Pick your Sprites!'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpriteGallery;
