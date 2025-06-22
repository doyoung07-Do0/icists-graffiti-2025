'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="flex items-center justify-between px-6 py-3 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg">
        <Link href="/" className="text-lg font-bold font-roboto gradient-text">
          GRAFFITI 2025
        </Link>
        
        <div className="flex items-center space-x-6">
          <NavLink href="/" isActive={pathname === '/'}>
            Home
          </NavLink>
          <NavLink href="/about" isActive={pathname === '/about'}>
            About
          </NavLink>
          <NavLink href="/chat" isActive={pathname.startsWith('/chat')}>
            Ice Breaking
          </NavLink>
          <div className="relative group">
            <button 
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                pathname.startsWith('/investment') 
                  ? 'bg-white/20 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Investment Game
              <span className="ml-1 inline-block transform group-hover:rotate-180 transition-transform">
                ▼
              </span>
            </button>
            <div className="absolute left-0 mt-1 w-40 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <Link 
                href="/investment/overview" 
                className={`block px-4 py-2 text-sm ${
                  pathname === '/investment/overview' 
                    ? 'bg-white/20 text-white' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                Overview
              </Link>
              <Link 
                href="/investment/play" 
                className={`block px-4 py-2 text-sm rounded-b-lg ${
                  pathname === '/investment/play' 
                    ? 'bg-white/20 text-white' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                Play
              </Link>
            </div>
          </div>
          <Link 
            href="/login" 
            className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-md"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ 
  href, 
  isActive, 
  children 
}: { 
  href: string; 
  isActive: boolean; 
  children: React.ReactNode 
}) {
  return (
    <Link 
      href={href} 
      className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
        isActive 
          ? 'bg-white/20 text-white' 
          : 'text-gray-300 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </Link>
  );
}
