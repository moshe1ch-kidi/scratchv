import React from 'react';

const BACKGROUND_URLS = [
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Arctic.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/BeachDay.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/BeachNight.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/BeachSunrise.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Bedroom.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Classroom.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Creek.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Desert.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/EmptyRoom.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Fall.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Farm.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/House1.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Jungle.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Lake.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Park.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Savannah.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Space.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Spring.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Summer.svg',
  'https://codejredu.github.io/jr/scratchjr/svglibrary/Theatre.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/bg/airport.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/bg/beach.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/bg/city.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/bg/nightcity.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/bg/vilage.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/bg/fileD.svg'
];

interface BackgroundGalleryProps {
  onClose: () => void;
  onSelect: (url: string) => void;
}

const BackgroundGallery: React.FC<BackgroundGalleryProps> = ({ onClose, onSelect }) => {
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
          <h2 className="text-xl font-bold text-slate-700">Choose a Background</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-2xl">
            <i className="fas fa-times-circle"></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {BACKGROUND_URLS.map(url => (
              <div 
                key={url} 
                onClick={() => onSelect(url)}
                className="bg-white p-2 rounded-lg border border-slate-200 cursor-pointer aspect-video flex items-center justify-center transition-all hover:shadow-md hover:border-blue-400 hover:scale-105 overflow-hidden"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundGallery;
