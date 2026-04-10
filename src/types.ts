export interface Video {
  id: string;
  title: string;
  embed: string;
  channel: string;
  category: 'official' | 'ambassador' | 'community';
  publishedAt?: string;
}

export type FilterType = 'all' | 'official' | 'ambassador' | 'community';
