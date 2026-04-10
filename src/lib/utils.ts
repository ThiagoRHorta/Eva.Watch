export const getYouTubeId = (embed: string): string | null => {
  const match = embed.match(/embed\/([^?|'|"]+)/);
  return match ? match[1] : null;
};
