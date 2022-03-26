import { createContext, useContext } from 'react'
import { Player } from '../../types/types'

export const PlayerContext = createContext<{ player?: Player, updatePlayer?: (player: Player) => void }>({})

export function usePlayer() {
  return useContext(PlayerContext)
}