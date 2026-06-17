import { useState, useEffect, useCallback } from "react";
import quotesData from "../data/drAisoQuotes.json";

export interface DrAisoToast {
  id: string;
  quote: string;
  category: string;
}

export function useDrAiso() {
  const [toasts, setToasts] = useState<DrAisoToast[]>([]);

  // Function to manually dismiss a toast
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Function to trigger a new random toast notification
  const triggerToast = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * quotesData.length);
    const selectedQuote = quotesData[randomIndex];
    const toastId = Math.random().toString(36).substring(2, 9);

    const newToast: DrAisoToast = {
      id: toastId,
      quote: selectedQuote.quote,
      category: selectedQuote.category,
    };

    // Add new toast to active pile
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss the specific toast after 6 seconds
    setTimeout(() => {
      dismissToast(toastId);
    }, 6000);
  }, [dismissToast]);

  // Handle randomized periodic triggers (e.g. between 15 and 35 seconds)
  useEffect(() => {
    let timerId: number;

    const scheduleNext = () => {
      // Pick random delay between 15000 ms (15s) and 35000 ms (35s)
      const randomDelay = Math.floor(Math.random() * (35000 - 15000 + 1)) + 15000;

      timerId = window.setTimeout(() => {
        triggerToast();
        scheduleNext(); // Schedule subsequent one
      }, randomDelay);
    };

    // Delay the very first notification slightly so it doesn't pop up immediately on startup
    const initialDelay = window.setTimeout(() => {
      triggerToast();
      scheduleNext();
    }, 10000);

    return () => {
      window.clearTimeout(initialDelay);
      window.clearTimeout(timerId);
    };
  }, [triggerToast]);

  return {
    toasts,
    dismissToast,
    triggerToast, // Exposed so the user can summon one manually too!
  };
}
