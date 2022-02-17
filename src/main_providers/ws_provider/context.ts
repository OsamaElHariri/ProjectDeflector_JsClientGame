import { createContext, useContext } from 'react'
import { WsClientConnection } from './types'

export const WsClientContext = createContext<WsClientConnection | undefined>(undefined)

export function useWsClient() {
  return useContext(WsClientContext)
}