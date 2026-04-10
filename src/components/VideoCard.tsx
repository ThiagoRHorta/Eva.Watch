import { motion } from 'motion/react';
import { Youtube, Play, Calendar, User } from 'lucide-react';
import { Video } from '../types';
import { getYouTubeId } from '../lib/utils';

interface VideoCardProps {
  video: Video;
  onClick: () => void;
  key?: string | number;
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  const youtubeId = getYouTubeId(video.embed);

  return (
    <motion.div
      layoutId={`card-${video.id}`}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group flex flex-col bg-eva-card rounded-2xl overflow-hidden border border-white/5 hover:border-eva-green/30 cursor-pointer transition-colors"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video overflow-hidden bg-black">
        {youtubeId ? (
          <img 
            src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
            alt={video.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Youtube size={48} />
          </div>
        )}
        
        <div className="absolute inset-0 z-10 flex items-center justify-center group/play">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-40 group-hover/play:opacity-20 transition-opacity" />
          <div className="w-12 h-12 bg-eva-green/90 rounded-full flex items-center justify-center scale-90 group-hover/play:scale-100 group-hover/play:bg-eva-green transition-all duration-300 shadow-xl">
            <Play className="text-eva-dark fill-eva-dark w-5 h-5 ml-0.5" />
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
            video.category === 'official' ? 'bg-eva-green text-eva-dark' : 'bg-white/10 text-white'
          }`}>
            {video.category === 'official' ? 'Official' : video.category === 'ambassador' ? 'Ambassador' : 'Community'}
          </span>
          <Calendar size={10} className="text-gray-600" />
        </div>
        <h3 className="font-display font-bold text-sm leading-tight group-hover:text-eva-green transition-colors line-clamp-2">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 text-gray-500 text-[10px] mt-1">
          <User size={10} />
          <span className="truncate font-bold">{video.channel}</span>
        </div>
      </div>
    </motion.div>
  );
}
