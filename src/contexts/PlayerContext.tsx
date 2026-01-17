import { createContext } from 'react';

export interface Sound {
  soundId: number;
  title: string;
  uploader: string;
  fileUrl: string;
  thumbnailUrl: string;
}

export interface PlayerContextType {
  currentSound: Sound | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  playSound: (soundId: number) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  stopSound: () => void;
}


// Context 생성
export const PlayerContext = createContext<PlayerContextType | null>(null);
