import React from "react";
import { useSocket } from "../SocketContext";
import { useEffect } from "react";



const Host = () => {
    const socket = useSocket();

    const generateRandomCode = () => {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        return code;
      };

    useEffect(() => {
        const code = generateRandomCode();
        socket.emit("createRoom", code)

    });

    return (
        <div>
        <h1>Host</h1>
        </div>
    );
}

export default Host;