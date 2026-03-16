import React from 'react';

/**
 * Mock of next/link for testing
 */
export default function Link({ href, children, ...props }: any) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
