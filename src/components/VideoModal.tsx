import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, User, Share2 } from 'lucide-react';
import { Video } from '../types';

interface VideoModalProps {
  video: Video | null;
  onClose: () => void;
}

export function VideoModal({ video, onClose }: VideoModalProps) {
  if (!video) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-eva-dark/50 backdrop-blur-md"
        />
        
        <motion.div
          layoutId={`card-${video.id}`}
          className="relative w-full max-w-4xl max-h-[90vh] bg-eva-card rounded-3xl overflow-y-auto no-scrollbar border border-eva-green/50 shadow-[0_0_100px_rgba(0,255,204,0.2)] flex flex-col"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-eva-green hover:text-eva-dark rounded-full text-white transition-all"
          >
            <X size={20} />
          </button>

          {/* Video Player */}
          <div className="aspect-video bg-black w-full shrink-0">
            <div 
              className="w-full h-full video-container"
              dangerouslySetInnerHTML={{ 
                __html: video.embed
                  .replace(/width=['"]\d+['"]/, "width='100%'")
                  .replace(/height=['"]\d+['"]/, "height='100%'") 
              }}
            />
          </div>

          {/* Video Info */}
          <div className="p-4 md:p-5 bg-gradient-to-b from-eva-card to-black">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-grow space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    video.category === 'official' ? 'bg-eva-green text-eva-dark' : 'bg-white/10 text-white'
                  }`}>
                    {video.category === 'official' ? 'Official' : video.category === 'ambassador' ? 'Ambassador' : 'Community'}
                  </span>
                  {video.publishedAt && (
                    <div className="flex items-center gap-1.5 text-gray-500 text-[9px] font-bold uppercase tracking-widest">
                      <Calendar size={10} />
                      <span>{new Date(video.publishedAt).toLocaleDateString('en-US')}</span>
                    </div>
                  )}
                </div>
                
                <h2 className="text-lg md:text-xl font-display font-bold leading-tight text-white">
                  {video.title}
                </h2>

                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-eva-green">
                    <User size={14} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-white">{video.channel}</span>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-2 shrink-0">
                <button className="flex-grow md:w-40 py-2 bg-eva-green text-eva-dark text-[9px] font-black uppercase tracking-widest rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_15px_rgba(0,255,204,0.2)] flex items-center justify-center gap-2">
                  <Share2 size={12} />
                  Share
                </button>
                <button 
                  onClick={onClose}
                  className="flex-grow md:w-40 py-2 bg-white/5 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
