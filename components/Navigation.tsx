'use client';

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
          <NavLink href="#investment-game" isActive={pathname === '#investment-game'}>
            Investment Game
          </NavLink>
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
