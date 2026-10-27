'use client';
import { useEffect, useRef } from 'react';

export default function TelegramLogin({ botName, onAuth }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && containerRef.current.children.length === 0) {
      window.onTelegramAuth = function(user) {
        onAuth(user);
      };

      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', botName);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.async = true;
      
      containerRef.current.appendChild(script);
    }
  }, [botName, onAuth]);

  return <div ref={containerRef} className="flex justify-center my-4"></div>;
}