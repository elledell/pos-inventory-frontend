import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to detect user idle time
 * @param {number} idleTime - Time in milliseconds before considered idle (default: 30 minutes)
 * @returns {object} { isIdle, resetTimer } - Idle state and reset function
 */
export const useIdleTimer = (idleTime = 30 * 60 * 1000) => {
  const [isIdle, setIsIdle] = useState(false);

  const resetTimer = useCallback(() => {
    setIsIdle(false);
  }, []);

  useEffect(() => {
    let timeout;

    const handleActivity = () => {
      // Clear existing timeout
      clearTimeout(timeout);
      
      // If was idle, wake up
      if (isIdle) {
        setIsIdle(false);
      }

      // Set new timeout
      timeout = setTimeout(() => {
        setIsIdle(true);
      }, idleTime);
    };

    // Events to track user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Attach event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Initialize timer
    handleActivity();

    // Cleanup
    return () => {
      clearTimeout(timeout);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [idleTime, isIdle]);

  return { isIdle, resetTimer };
};