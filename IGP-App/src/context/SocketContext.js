import { createContext, useContext, useEffect, useState, useRef } from "react";
import { createSocket } from "../config/socket.js";
import { setAuthToken as setAxiosToken } from "../api/api.js";

const SocketContext = createContext();

export const SocketProvider = ({ token, children }) => {
  const [socket, setSocket] = useState(null);

  // keep a ref to avoid stale closures inside useEffect
  const socketRef = useRef(null);

  useEffect(() => {
    let active = true; // avoids running cleanup logic after unmount

    const setup = async () => {
      if (!token) {
        // remove axios auth header + secure stored token
        await setAxiosToken(null);

        // disconnect previous socket if any
        socketRef.current?.disconnect();
        socketRef.current = null;
        setSocket(null);
        return;
      }

      // set axios token (async)
      await setAxiosToken(token);

      // disconnect any old socket
      socketRef.current?.disconnect();

      // create + store new socket
      const s = createSocket(token);
      socketRef.current = s;

      if (active) {
        setSocket(s);
      }

      s.connect();
    };

    setup();

    return () => {
      active = false;
      socketRef.current?.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
