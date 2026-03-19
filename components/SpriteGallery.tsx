 import React, { useState, useMemo } from 'react';

const SPRITE_CATEGORIES = {
  all: 'All',
  animals: 'Animals',
  people: 'People',
  vehicles: 'Vehicles',
  nature: 'Nature',
  items: 'Items'
};

const SPRITES = [
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Aeroplane.svg', category: 'vehicles' },
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
  { url: 'https://codejredu.github.io/jr/scratchjr/svglibrary/Rocket.svg', category: 'vehicles' },
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
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/missle.svg', category: 'items' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/football.svg', category: 'items' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/psndamain.svg', category: 'items' },
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
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/anicopter.svg', category: 'vehicles' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/car1.svg', category: 'vehicles' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/brid3.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/bird2.svg', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/bird2.gif', category: 'animals' },
  { url: 'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/anipiqrnAXrT.svg', category: 'items' }
];

interface SpriteGalleryProps {
  onClose: () => void;
  onSelect: (url: string) => void;
  onPaintNew: () => void;
}

const SpriteGallery: React.FC<SpriteGalleryProps> = ({ onClose, onSelect, onPaintNew }) => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof SPRITE_CATEGORIES>('all');

  const filteredSprites = useMemo(() => {
    if (activeCategory === 'all') return SPRITES;
    return SPRITES.filter(s => s.category === activeCategory);
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
          <h2 className="text-xl font-bold text-slate-700">Choose a Sprite</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-2xl">
            <i className="fas fa-times-circle"></i>
          </button>
        </div>

        {/* Categories Tabs */}
        <div className="px-4 py-2 border-b border-slate-200 bg-white flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {Object.entries(SPRITE_CATEGORIES).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                activeCategory === id 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {/* Paint New Button - Only show in 'all' or 'items' maybe? Or always show */}
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
            {filteredSprites.map(sprite => (
              <div 
                key={sprite.url} 
                onClick={() => onSelect(sprite.url)}
                className="bg-white p-2 rounded-lg border border-slate-200 cursor-pointer aspect-square flex items-center justify-center transition-all hover:shadow-md hover:border-blue-400 hover:scale-105"
              >
                <img 
                  src={sprite.url} 
                  alt="" 
                  loading="lazy"
                  className="max-w-full max-h-full object-contain" 
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpriteGallery;
