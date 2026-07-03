import React from 'react';

// A plain anchor (not fetch) so the browser does a full navigation to our
// server route, which then redirects to Google.
export default function GoogleButton({ label = 'Continue with Google' }: { label?: string }) {
  return (
    <a
      href="/api/auth/google"
      style={{
        background: '#000',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '11px',
        width: '100%',
        textAlign: 'center',
        fontWeight: 600,
        textDecoration: 'none',
        display: 'block',
      }}
    >
      {label}
    </a>
  );
}
