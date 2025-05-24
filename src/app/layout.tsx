// src/app/layout.tsx
"use client"; // RootLayout needs to be a client component for useState and useEffect

import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { PasswordProtectModal } from "@/components/layout/password-protect-modal"; // Import the new modal
import React, { useState, useEffect } from 'react';
import { LoaderDots } from '@/components/ui/loader-dots'; // For loading state

const geistSans = GeistSans;
const geistMono = GeistMono;

// export const metadata: Metadata = { // Metadata cannot be dynamic in a client component RootLayout
//   title: '敬若涵的搞钱神器！',
//   description: 'AI 驱动的内容创作与优化工具',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Check sessionStorage only on the client side
    if (typeof window !== 'undefined') {
      const authStatus = sessionStorage.getItem('app_is_authenticated_jzl');
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      }
      setIsLoadingAuth(false);
    }
  }, []);

  const handleAuthenticated = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('app_is_authenticated_jzl', 'true');
    }
    setIsAuthenticated(true);
  };

  if (isLoadingAuth) {
    return (
      <html lang="zh-CN" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased flex items-center justify-center min-h-screen bg-background`}>
          <div className="text-center p-8">
            <LoaderDots className="text-primary h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">正在检查访问权限...</p>
            {/* Fallback title for when metadata object can't be used */}
            <title>敬若涵的搞钱神器！</title> 
          </div>
        </body>
      </html>
    );
  }

  if (!isAuthenticated) {
    return (
      <html lang="zh-CN" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background`}>
          <PasswordProtectModal onAuthenticated={handleAuthenticated} />
          {/* Fallback title for when metadata object can't be used */}
          <title>敬若涵的搞钱神器！</title> 
        </body>
      </html>
    );
  }

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* Add metadata tags directly here since the exportable metadata object isn't suitable for client components */}
        <title>敬若涵的搞钱神器！</title>
        <meta name="description" content="AI 驱动的内容创作与优化工具" />
        {/* You can add more meta tags, link tags for favicons etc. here */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}