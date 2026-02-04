 import React from 'react';

const SPRITE_URLS = [
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Aeroplane.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Astronaut.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Bus.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Camel.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Car.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Car1.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Fort.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Frog.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Giraffe.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Girl.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Girl1.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Girl2.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Girl3.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Grandfather.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Grandmother.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Horse.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Igloo.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Inuit.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Lizard.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Monkey.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Moon.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/MoonBkg.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Mother.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Mushroom.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/NightTable.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Penguin.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Purple.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Rabbit.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Rancher.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Red.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Rocket.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Rowboat.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/SailBoat.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Scubadiver.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Seahorse.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/ShootingStar.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Snake.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/SoccerNet.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Star.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Star2.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Star3.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Starfish.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Stool.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Sun.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Table.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Teen2.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Teen3.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/TeenBoy1.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/TeenBoy2.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/TeenBoy3.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/TeenGirl1.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/TeenGirl2.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/TeenGirl3.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Tornado.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Tree1.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Tree2.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Tree3.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Tree4.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Tulip2.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Weed.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Whale.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Winter.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Wizard.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Zebra.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/blue1.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/cat1.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/wolf.png',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/sprite/alligator.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/sprite/Polarbear.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/sprite/bee.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/sprite/dolpin.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/sprite/fox.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/sprite/monkey.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/tiger.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/sprite/lion.svg'
];

interface SpriteGalleryProps {
  onClose: () => void;
  onSelect: (url: string) => void;
  onPaintNew: () => void;
}

const SpriteGallery: React.FC<SpriteGalleryProps> = ({ onClose, onSelect, onPaintNew }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-700">Choose a Sprite</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-2xl">
            <i className="fas fa-times-circle"></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {/* Paint New Button */}
            <div 
              onClick={onPaintNew}
              className="bg-blue-50 border-2 border-dashed border-blue-300 text-blue-500 cursor-pointer aspect-square flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-blue-400 hover:scale-105 hover:bg-blue-100 rounded-lg"
            >
              <i className="fas fa-paint-brush text-3xl"></i>
              <span className="text-xs font-bold mt-2">Paint New</span>
            </div>

            {/* Existing Sprites */}
            {SPRITE_URLS.map(url => (
              <div 
                key={url} 
                onClick={() => onSelect(url)}
                className="bg-white p-2 rounded-lg border border-slate-200 cursor-pointer aspect-square flex items-center justify-center transition-all hover:shadow-md hover:border-blue-400 hover:scale-105"
              >
                <img src={url} alt="" className="max-w-full max-h-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpriteGallery;
