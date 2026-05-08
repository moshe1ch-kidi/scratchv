import React, { useState, useMemo } from 'react';

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
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/bg/fileD.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/bg/aquarium.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/bg/way1.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/bg/way.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/bg/hills1.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/bg/hills.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/bg/golan.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/bg/vectorizedroad.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/bg/jungel.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/main/bg/snow.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/bg/redroof.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/bg/tress.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/bg/greenfiled.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/bg/city2.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/bg/greenforrest.svg',
  'https://raw.githubusercontent.com/moshe1ch-kidi/scratchv/refs/heads/main/bg/basketball.svg'
];

interface BackgroundGalleryProps {
  onClose: () => void;
  onSelect: (url: string) => void;
}

const BackgroundGallery: React.FC<BackgroundGalleryProps> = ({ onClose, onSelect }) => {
  const [visibleCount, setVisibleCount] = useState(15);

  const visibleBackgrounds = useMemo(() => {
    return BACKGROUND_URLS.slice(0, visibleCount);
  }, [visibleCount]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
      if (visibleCount < BACKGROUND_URLS.length) {
        setVisibleCount(prev => prev + 15);
      }
    }
  };

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
          <h2 className="text-xl font-bold text-slate-700">Choose a Background</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-2xl">
            <i className="fas fa-times-circle"></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4" onScroll={handleScroll}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {visibleBackgrounds.map((url, idx) => (
              <div 
                key={`${url}-${idx}`} 
                onClick={() => onSelect(url)}
                className="bg-white p-2 rounded-lg border border-slate-200 cursor-pointer aspect-video flex items-center justify-center transition-all hover:shadow-md hover:border-blue-400 hover:scale-105 overflow-hidden"
              >
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>

          {visibleCount < BACKGROUND_URLS.length && (
            <div className="flex justify-center mt-8 mb-4">
              <button 
                onClick={() => setVisibleCount(prev => prev + 15)}
                className="bg-yellow-400 text-yellow-900 px-8 py-3 rounded-full font-black hover:bg-yellow-500 transition-all hover:scale-110 shadow-xl border-4 border-yellow-200 flex items-center gap-2"
              >
                <span>🌈 Show More Backgrounds 🌈</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackgroundGallery;
