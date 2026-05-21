'use client';

import { useEffect, useState } from 'react';

export default function CookieNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookieNoticeAccepted');
    if (!accepted) {
      setTimeout(() => setShow(true), 800);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieNoticeAccepted', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="banner"
      aria-label="Cookie Notice"
      className="cookie-notice"
    >
      <span className="cookie-notice-text">
        this site uses essential cookies only.
      </span>
      <a
        href="/privacy#cookies"
        className="cookie-notice-link"
      >
        privacy
      </a>
      <button
        onClick={handleAccept}
        className="cookie-notice-button"
        aria-label="Accept cookie notice"
      >
        got it
      </button>
    </div>
  );
}
