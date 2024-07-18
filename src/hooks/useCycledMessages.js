import { useEffect, useState, useRef } from "react";

const useCycledMessages = (messages, interval = 1000) => {
  const [currentMessage, setCurrentMessage] = useState(messages[0]);
  const indexRef = useRef(0); // Use a ref to keep track of the index

  useEffect(() => {
    const messageInterval = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % messages.length;
      setCurrentMessage(messages[indexRef.current]);
    }, interval);

    return () => clearInterval(messageInterval);
  }, [messages, interval]);

  // Reset function to start from the first message
  const resetCurrentMessage = () => {
    indexRef.current = 0;
    setCurrentMessage(messages[0]);
  };

  return { currentMessage, resetCurrentMessage };
};

export default useCycledMessages;
