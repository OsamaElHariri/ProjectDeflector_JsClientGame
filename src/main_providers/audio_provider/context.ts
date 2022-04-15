import { createContext, useContext } from 'react'


export type SoundEffect =
  'cancel'
  | 'confirm_pawn'
  | 'end_turn'
  | 'lose_game'
  | 'multi_bounce_1'
  | 'multi_bounce_2'
  | 'multi_bounce_3'
  | 'preview_pawn'
  | 'shuffle'
  | 'turn_start'
  | 'win_game';

export const AudioContext = createContext<{ play: (audio: SoundEffect) => void }>({ play: () => undefined })

export function useAudio() {
  return useContext(AudioContext)
}