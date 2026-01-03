import { createContext } from "react";
import { WebsocketService } from '../services/websocketService';

export const WebsocketContext = createContext(WebsocketService);