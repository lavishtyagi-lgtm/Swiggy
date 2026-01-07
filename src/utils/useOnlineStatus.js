import { useState, useEffect } from "react";

export const useOnlineStatus = () => {
  // check if online

  const [OnlineStatus, setOnlineStatus] = useState(true);
  useEffect(() => {
    window.addEventListener("online", (event) => {
      setOnlineStatus(true);
    });

    window.addEventListener("offline", (event) => {
      setOnlineStatus(false);
    });
  }, []);
  return OnlineStatus;
};
