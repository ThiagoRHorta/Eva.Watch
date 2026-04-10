import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, TrendingUp, Github, Search, ArrowUp } from 'lucide-react';
import { Video, FilterType } from './types';
import { VideoCard } from './components/VideoCard';
import { VideoModal } from './components/VideoModal';

export default function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const videosUrl = `${import.meta.env.BASE_URL}videos.json`;

    fetch(videosUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load videos.json (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error('videos.json must be an array');
        }

        const processedData = data.map((v: any, i: number) => ({
          ...v,
          id: v.id || `${v.title}-${i}`
        })).sort((a: Video, b: Video) => {
          if (!a.publishedAt) return 1;
          if (!b.publishedAt) return -1;
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        });
        setVideos(processedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Error loading videos from ${videosUrl}:`, err);
        setLoading(false);
      });
  }, []);

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchesFilter = filter === 'all' || v.category === filter;
      const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           v.channel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [videos, filter, searchQuery]);

  const handleLogoClick = () => {
    setFilter('all');
    setSearchQuery('');
    setExpandedId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedVideo = useMemo((): Video | null => 
    videos.find(v => v.id === expandedId) || null, 
    [videos, expandedId]
  );

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-eva-green selection:text-eva-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-eva-dark/80 backdrop-blur-xl border-b border-white/5 py-3 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-2 group transition-transform active:scale-95 shrink-0"
          >
            <div className="w-9 h-9 bg-eva-green rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,204,0.3)] group-hover:shadow-[0_0_25px_rgba(0,255,204,0.5)] transition-all duration-300 rotate-3 group-hover:rotate-0">
              <Play className="text-eva-dark fill-eva-dark w-4 h-4 ml-0.5" />
            </div>
            <h1 className="text-xl font-display font-bold tracking-tighter">
              EVA<span className="text-eva-green">.watch</span>
            </h1>
          </button>

          {/* Desktop Search & Filter */}
          <div className="hidden md:flex items-center gap-4 flex-grow max-w-xl justify-center">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input 
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-eva-green/50 focus:bg-white/10 transition-all"
                />
              </div>

              <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'official', label: 'Official' },
                  { id: 'ambassador', label: 'Ambassadors' },
                  { id: 'community', label: 'Community' },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setFilter(btn.id as FilterType)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                      filter === btn.id
                        ? 'bg-eva-green text-eva-dark shadow-[0_0_15px_rgba(0,255,204,0.4)]'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group"
            >
              <Github size={16} className="text-gray-400 group-hover:text-white" />
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white">Repo</span>
            </a>
            
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-eva-green/10 border border-eva-green/20 rounded-lg">
              <TrendingUp size={14} className="text-eva-green" />
              <span className="text-[10px] font-bold text-eva-green uppercase tracking-widest">
                {filteredVideos.length} Videos
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main ref={mainRef} className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="w-16 h-16 border-4 border-eva-green/20 border-t-eva-green rounded-full animate-spin"></div>
            <p className="text-eva-green font-display font-medium animate-pulse uppercase tracking-widest text-xs">Syncing EVA...</p>
          </div>
        ) : (
          <>
            {filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 items-start">
                <AnimatePresence mode="popLayout">
                  {filteredVideos.map((video: Video) => (
                    <VideoCard 
                      key={video.id}
                      video={video}
                      onClick={() => setExpandedId(video.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Search size={32} className="text-gray-600" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">No videos found</h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button 
                  onClick={() => { setFilter('all'); setSearchQuery(''); }}
                  className="mt-6 px-6 py-2 bg-eva-green text-eva-dark text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Modal Overlay for Expanded Video */}
      <VideoModal 
        video={selectedVideo}
        onClose={() => setExpandedId(null)}
      />

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
          <button onClick={handleLogoClick} className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-eva-green rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,204,0.2)]">
              <Play className="text-eva-dark fill-eva-dark w-5 h-5 ml-0.5" />
            </div>
            <span className="font-display font-bold tracking-tighter text-2xl">EVA.watch</span>
          </button>
          
          <nav className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <a href="#" className="hover:text-eva-green transition-colors">Twitter</a>
            <a href="#" className="hover:text-eva-green transition-colors">Telegram</a>
            <a href="#" className="hover:text-eva-green transition-colors">GitHub</a>
            <a href="#" className="hover:text-eva-green transition-colors">EverValue.io</a>
          </nav>

          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-0.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                animate={{ x: [-96, 96] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-full h-full bg-eva-green/50"
              />
            </div>
            <p className="text-gray-600 text-[9px] font-bold uppercase tracking-widest">
              Built for the EverValue Community
            </p>
          </div>
        </div>
      </footer>
      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 p-4 bg-eva-green text-eva-dark rounded-2xl shadow-[0_0_30px_rgba(0,255,204,0.3)] hover:scale-110 active:scale-95 transition-all"
            aria-label="Scroll to top"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
