import React from 'react';
import { StatCardProps } from '../types';

export const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, icon, loading, tooltip }) => {
  return (
    <div className="glass-card rounded-2xl p-6 transition-all duration-500 hover:border-slate-500/30 group relative overflow-hidden flex flex-col justify-between h-full">
      {/* Decorative Glow */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500"></div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em]">
            {title}
          </span>
          <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-400 group-hover:text-blue-400 transition-colors duration-300">
            {icon}
          </div>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            <div className="h-8 w-32 bg-slate-800/50 rounded-lg animate-pulse"></div>
            <div className="h-4 w-20 bg-slate-800/30 rounded-lg animate-pulse"></div>
          </div>
        ) : (
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight group-hover:scale-[1.02] origin-left transition-transform duration-300">
              {value}
            </div>
            {subValue && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500 font-mono">
                  {subValue}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {tooltip && (
        <div className="absolute inset-0 bg-slate-950/95 flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
            <p className="text-sm text-center text-slate-300 font-medium leading-relaxed">{tooltip}</p>
        </div>
      )}
    </div>
  );
};