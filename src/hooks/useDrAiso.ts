import { useState, useEffect, useCallback } from "react";
import quotesData from "../data/drAisoQuotes.json";

export interface DrAisoToast {
  id: string;
  quote: string;
  category: string;
}

export function useDrAiso() {
  const [toasts, setToasts] = useState<DrAisoToast[]>([]);
  const [toastHistory, setToastHistory] = useState<DrAisoToast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerToast = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * quotesData.length);
    const selectedQuote = quotesData[randomIndex];
    const toastId = Math.random().toString(36).substring(2, 9);

    const newToast: DrAisoToast = {
      id: toastId,
      quote: selectedQuote.quote,
      category: selectedQuote.category,
    };

    setToasts((prev) => [...prev, newToast]);
    setToastHistory((prev) => [newToast, ...prev]);

    window.setTimeout(() => {
      dismissToast(toastId);
    }, 15000);
  }, [dismissToast]);

  useEffect(() => {
    let timerId: number;

    const scheduleNext = () => {
      const randomDelay = Math.floor(Math.random() * (1200000 - 600000 + 1)) + 600000;
      timerId = window.setTimeout(() => {
        triggerToast();
        scheduleNext();
      }, randomDelay);
    };

    const initialDelay = window.setTimeout(() => {
      triggerToast();
      scheduleNext();
    }, 300000);

    return () => {
      window.clearTimeout(initialDelay);
      window.clearTimeout(timerId);
    };
  }, [triggerToast]);

  return {
    toasts,
    toastHistory,
    dismissToast,
    triggerToast,
  };
}
