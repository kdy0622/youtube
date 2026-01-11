
export interface ThumbnailStrategy {
  title: string;
  subtitle: string;
  badge: string;
  image_prompt: string;
}

export interface HistoryItem {
  id: string;
  input: string;
  strategy: ThumbnailStrategy;
  imageUrl?: string;
  timestamp: number;
}
