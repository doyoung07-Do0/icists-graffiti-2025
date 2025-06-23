'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isInvestmentDropdownOpen, setIsInvestmentDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  const isGuest = session?.user?.email ? session.user.email.endsWith('@guest.com') : false;
  
  // More strict condition: only show user dropdown if it's a real authenticated user
  // Guest users or any user with @guest.com email should be treated as not logged in
  const isRealUser = session?.user && 
                     session.user.email && 
                     !session.user.email.endsWith('@guest.com') &&
                     !session.user.email.startsWith('guest-');
  
  // Inline styles for complete independence
  const navStyles: React.CSSProperties = {
    position: 'fixed',
    top: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 50,
    width: '100%',
    maxWidth: '72rem',
    padding: '0 16px',
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    width: '100%',
    minWidth: '0',
    boxSizing: 'border-box',
  };

  const logoStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    fontFamily: 'Roboto, sans-serif',
    textDecoration: 'none',
    background: 'linear-gradient(to right, #D2D8B2, #4CAF80)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
  };

  const menuContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  };

  const getNavLinkStyles = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '9999px',
    transition: 'all 0.2s',
    textDecoration: 'none',
    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    color: isActive ? '#ffffff' : '#d1d5db',
  });

  const dropdownStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
  };

  const dropdownButtonStyles: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '9999px',
    transition: 'all 0.2s',
    backgroundColor: pathname.startsWith('/investment') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    color: pathname.startsWith('/investment') ? '#ffffff' : '#d1d5db',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const userButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '8px 16px',
    borderRadius: '9999px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
  };

  const loginButtonStyles: React.CSSProperties = {
    backgroundColor: '#ffffff',
    color: '#000000',
    padding: '8px 16px',
    borderRadius: '9999px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
  };

  const loadingStyles: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '8px 16px',
    borderRadius: '9999px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
  };

  const dropdownContentStyles: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: '0',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    padding: '8px',
    minWidth: '160px',
    zIndex: 100,
  };

  const userDropdownContentStyles: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    right: '0',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    padding: '8px',
    minWidth: '192px',
    zIndex: 100,
  };

  const dropdownItemStyles: React.CSSProperties = {
    display: 'block',
    padding: '8px',
    fontSize: '14px',
    color: '#d1d5db',
    textDecoration: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'left',
  };

  return (
    <>
      {/* Override any global styles that might interfere */}
      <style jsx>{`
        .navigation-override {
          position: fixed !important;
          top: 16px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          z-index: 50 !important;
          width: 100% !important;
          max-width: 72rem !important;
          padding: 0 16px !important;
          box-sizing: border-box !important;
        }
        
        .navigation-container-override {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 12px 24px !important;
          background-color: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(16px) !important;
          border-radius: 16px !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }
      `}</style>
      
      <nav className="navigation-override" style={navStyles}>
        <div className="navigation-container-override" style={containerStyles}>
          <Link href="/" style={logoStyles}>
            GRAFFITI 2025
          </Link>
          
          <div style={menuContainerStyles}>
            <Link 
              href="/" 
              style={getNavLinkStyles(pathname === '/')}
              onMouseEnter={(e) => {
                if (pathname !== '/') {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== '/') {
                  e.currentTarget.style.color = '#d1d5db';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              Home
            </Link>
            <Link 
              href="/about" 
              style={getNavLinkStyles(pathname === '/about')}
              onMouseEnter={(e) => {
                if (pathname !== '/about') {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== '/about') {
                  e.currentTarget.style.color = '#d1d5db';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              About
            </Link>
            <Link 
              href="/chat" 
              style={getNavLinkStyles(pathname.startsWith('/chat'))}
              onMouseEnter={(e) => {
                if (!pathname.startsWith('/chat')) {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!pathname.startsWith('/chat')) {
                  e.currentTarget.style.color = '#d1d5db';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              Ice Breaking
            </Link>
            
            {/* Investment Game Dropdown */}
            <div 
              style={dropdownStyles}
              onMouseEnter={() => setIsInvestmentDropdownOpen(true)}
              onMouseLeave={() => setIsInvestmentDropdownOpen(false)}
            >
              <button 
                style={dropdownButtonStyles}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  if (!pathname.startsWith('/investment')) {
                    e.currentTarget.style.color = '#d1d5db';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Investment Game
                <span style={{ fontSize: '12px', marginLeft: '4px' }}>▼</span>
              </button>
              {isInvestmentDropdownOpen && (
                <div style={dropdownContentStyles}>
                  <Link 
                    href="/investment/overview" 
                    style={dropdownItemStyles}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#d1d5db';
                    }}
                  >
                    Overview
                  </Link>
                  <Link 
                    href="/investment/play" 
                    style={dropdownItemStyles}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#d1d5db';
                    }}
                  >
                    Play
                  </Link>
                </div>
              )}
            </div>
            
            {/* User Authentication Section */}
            {status === 'loading' ? (
              <div style={loadingStyles}>
                Loading...
              </div>
            ) : isRealUser ? (
              <div 
                style={dropdownStyles}
                onMouseEnter={() => setIsUserDropdownOpen(true)}
                onMouseLeave={() => setIsUserDropdownOpen(false)}
              >
                <button 
                  style={userButtonStyles}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <Image
                    src={`https://avatar.vercel.sh/${session.user.email}`}
                    alt={session.user.email ?? 'User Avatar'}
                    width={20}
                    height={20}
                    style={{ borderRadius: '50%' }}
                  />
                  <span style={{ 
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '96px',
                    color: '#ffffff'
                  }}>
                    {session.user.email?.split('@')[0] || 'User'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#ffffff' }}>▼</span>
                </button>
                {isUserDropdownOpen && (
                  <div style={userDropdownContentStyles}>
                    <div style={{
                      padding: '8px',
                      fontSize: '14px',
                      color: '#d1d5db',
                      pointerEvents: 'none',
                    }}>
                      {session.user.email}
                    </div>
                    <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)', margin: '4px 0' }} />
                    <button 
                      style={dropdownItemStyles}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#d1d5db';
                      }}
                      onClick={() => {
                        signOut({
                          redirectTo: '/',
                        });
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login" 
                style={loginButtonStyles}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
