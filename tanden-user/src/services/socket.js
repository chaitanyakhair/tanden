import { io } from 'socket.io-client';
import { API_URL } from './getBaseUrl';

let socket;
export const getSocket = () => {
    if (!socket) {
        socket = io(API_URL, {
            autoConnect: false,
            transports: ["websocket"],
            withCredentials: true,
        })
    }
    console.log("socket initailzed: ")
    return socket
}