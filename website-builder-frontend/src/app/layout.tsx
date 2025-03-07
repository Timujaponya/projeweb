import React from 'react';
import '../styles/globals.css';

export const metadata = {
  title: 'Website Builder',
  description: 'Create and manage your websites easily',
};

import { ReactNode } from 'react';

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;