// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import { ImageProvider } from './ImageContext';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <ImageProvider>
          {children}
        </ImageProvider>
      </body>
    </html>
  );
}
