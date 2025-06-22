'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function InvestmentPlayPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Same authentication logic as Navigation component
  const isRealUser = session?.user && 
                     session.user.email && 
                     !session.user.email.endsWith('@guest.com') &&
                     !session.user.email.startsWith('guest-');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'loading') return; // Still loading
    
    if (!isRealUser) {
      router.push('/login');
    }
  }, [status, isRealUser, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!isRealUser) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  // Main page content for authenticated users
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Investment Game
              </span>
            </h1>
            <p className="text-gray-300 text-lg">
              Welcome, {session.user.email?.split('@')[0]}! Ready to start playing?
            </p>
          </div>

          {/* Game Area */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-6">Investment Simulation</h2>
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-6 rounded-xl">
                  <h3 className="text-xl font-medium mb-4 text-green-400">Portfolio Dashboard</h3>
                  <p className="text-gray-400">
                    This is where your investment game will be displayed.
                  </p>
                </div>
                
                <div className="bg-gray-800/50 p-6 rounded-xl">
                  <h3 className="text-xl font-medium mb-4 text-blue-400">Market Data</h3>
                  <p className="text-gray-400">
                    Real-time market information and investment opportunities.
                  </p>
                </div>
                
                <div className="bg-gray-800/50 p-6 rounded-xl">
                  <h3 className="text-xl font-medium mb-4 text-purple-400">Trading Interface</h3>
                  <p className="text-gray-400">
                    Buy and sell investments to build your portfolio.
                  </p>
                </div>
              </div>
              
              <div className="mt-8">
                <button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105">
                  Start Playing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
