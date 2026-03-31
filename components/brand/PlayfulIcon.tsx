interface PlayfulIconProps {
  name: 'spark' | 'map' | 'calendar' | 'book' | 'cloud' | 'pin' | 'sun' | 'rain' | 'arrow';
  className?: string;
}

export function PlayfulIcon({ name, className }: PlayfulIconProps) {
  if (name === 'map') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path d="M3 7.5 8.5 5l7 2.5L21 5v11.5l-5.5 2.5-7-2.5L3 19V7.5Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.5 5v11.5m7-9V19" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (name === 'calendar') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <rect x="3.5" y="5.5" width="17" height="15" rx="2.6" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 3.5v4m8-4v4M3.5 9.5h17" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (name === 'book') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path d="M6 5.5h11a2 2 0 0 1 2 2v11H8a2 2 0 0 0-2 2V5.5Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M6 5.5a2 2 0 0 0-2 2v12.5h2" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (name === 'cloud') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M7.4 18.2h9.2a4.4 4.4 0 1 0-.8-8.7 5.4 5.4 0 0 0-10.3 1.8A3.6 3.6 0 0 0 7.4 18.2Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
      </svg>
    );
  }

  if (name === 'pin') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path d="M12 20s6-5.6 6-10a6 6 0 1 0-12 0c0 4.4 6 10 6 10Z" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (name === 'sun') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <circle cx="12" cy="12" r="4.6" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 2.8v2.5M12 18.7v2.5M4.7 12H7.2m9.6 0h2.5m-11.2-6.3 1.8 1.8m6.2 6.2 1.8 1.8m0-9.8-1.8 1.8m-6.2 6.2-1.8 1.8" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (name === 'rain') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M7.3 15.1h9.4a4.1 4.1 0 1 0-.7-8.1A5.2 5.2 0 0 0 6 8.8a3.4 3.4 0 0 0 1.3 6.3Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path d="m9 18.2-.7 2m4.2-2-.7 2m4.2-2-.7 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'arrow') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path d="M5 12h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="m12 3 1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
