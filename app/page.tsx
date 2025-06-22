'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-[#111111] text-[#E5E7EB]">
      {/* Custom Styles */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          background-color: #111111;
          color: #E5E7EB;
        }
        
        .gradient-text {
          background: linear-gradient(to right, #D2D8B2, #4CAF80);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .gradient-button {
          background-image: linear-gradient(to right, #D2D8B2 0%, #4CAF80 50%, #D2D8B2 100%);
          background-size: 200% auto;
          color: #111;
          transition: 0.5s;
        }
        
        .gradient-button:hover {
          background-position: right center;
          color: #000;
        }
        
        .section-divider {
          height: 2px;
          width: 100px;
          background: linear-gradient(to right, #D2D8B2, #4CAF80);
          margin: 1rem auto;
        }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#111111]/80 backdrop-blur-sm z-50 shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold gradient-text">GRAFFITI 2025</h1>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-gray-300 hover:text-white transition-colors duration-300">About</a>
            <Link href="/chat" className="text-gray-300 hover:text-white transition-colors duration-300">
              Ice Breaking
            </Link>
            <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-300">Features</a>
          </nav>

          <Link href="/chat" className="gradient-button font-bold py-2 px-6 rounded-lg text-sm md:text-base">
            Start Chat
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center text-center px-4 -mt-24">
          <div className="space-y-6">
            <p className="text-lg md:text-xl font-bold text-gray-300 tracking-wider">KAIST ICISTS Presents</p>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter gradient-text">
              AI CHATBOT
            </h2>
            <p className="text-2xl md:text-4xl font-bold text-white">"Experience the Future of Conversation"</p>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Discover the power of AI-driven conversations.<br />
              Your intelligent assistant is ready to help you explore, learn, and create.
            </p>
            <Link href="/chat" className="inline-block gradient-button font-bold py-4 px-10 rounded-full text-xl shadow-lg transform hover:scale-105 transition-transform">
              Start Chatting Now
            </Link>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 px-4 fade-in">
          <div className="container mx-auto max-w-4xl text-center">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">🤖 Why <span className="gradient-text">AI Chatbot</span>?</h3>
            <div className="section-divider"></div>
            <p className="text-lg text-gray-300 mb-8">
              Experience the cutting-edge AI technology that understands and responds to your needs with remarkable intelligence.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h4 className="text-2xl font-bold mb-3 gradient-text">The Challenge</h4>
                <p className="text-gray-300">
                  Traditional interfaces limit how we interact with technology. 
                  We need more natural, intuitive ways to access information and solve problems.
                </p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h4 className="text-2xl font-bold mb-3 gradient-text">The Solution</h4>
                <p className="text-gray-300">
                  Our AI chatbot provides intelligent, context-aware conversations that adapt to your needs,
                  making complex tasks simple and accessible.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-900/50 px-4 fade-in">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h3 className="text-4xl md:text-5xl font-bold">✨ Key Features</h3>
              <div className="section-divider"></div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h4 className="text-xl font-bold mb-2 gradient-text">Lightning Fast</h4>
                <p className="text-gray-300">Get instant responses powered by advanced AI technology</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 text-center">
                <div className="text-4xl mb-4">🧠</div>
                <h4 className="text-xl font-bold mb-2 gradient-text">Intelligent</h4>
                <p className="text-gray-300">Context-aware conversations that understand your needs</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h4 className="text-xl font-bold mb-2 gradient-text">Versatile</h4>
                <p className="text-gray-300">From creative tasks to problem-solving, we've got you covered</p>
              </div>
            </div>
          </div>
        </section>

        {/* Ice Breaking Section */}
        <section className="py-20 px-4 fade-in">
          <div className="container mx-auto max-w-4xl text-center">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">🚀 Ready to <span className="gradient-text">Break the Ice</span>?</h3>
            <div className="section-divider"></div>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Step into the future of AI interaction. Start a conversation and discover what's possible
              when human creativity meets artificial intelligence.
            </p>
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-8">
              <div className="space-y-4">
                <p className="text-xl font-bold gradient-text">What can you do?</p>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-gray-300">💬 Have natural conversations</p>
                    <p className="text-gray-300">🎨 Generate creative content</p>
                    <p className="text-gray-300">📊 Analyze data and information</p>
                  </div>
                  <div>
                    <p className="text-gray-300">💡 Brainstorm ideas</p>
                    <p className="text-gray-300">🔧 Solve complex problems</p>
                    <p className="text-gray-300">📝 Write and edit text</p>
                  </div>
                </div>
                <Link href="/chat" className="inline-block gradient-button font-bold py-3 px-8 rounded-lg text-lg mt-6">
                  Start Your Journey →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 text-center px-4 fade-in">
          <div className="container mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to experience the future of AI?</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Don't wait. Your AI assistant is ready to help you explore new possibilities and unlock your potential.
            </p>
            <Link href="/chat" className="inline-block gradient-button font-bold py-4 px-10 rounded-full text-xl shadow-lg transform hover:scale-105 transition-transform">
              Begin Conversation
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black py-8 px-4">
        <div className="container mx-auto text-center text-gray-500">
          <p className="font-bold text-lg text-gray-300 mb-2">GRAFFITI 2025 AI Chatbot</p>
          <p>Experience intelligent conversations powered by advanced AI</p>
          <p className="mt-4 text-sm">&copy; {new Date().getFullYear()} KAIST ICISTS. All rights reserved.</p>
        </div>
      </footer>

      {/* Scroll Animation Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Fade-in animation on scroll
            const faders = document.querySelectorAll('.fade-in');
            const appearOptions = {
              threshold: 0.2,
              rootMargin: "0px 0px -50px 0px"
            };
            const appearOnScroll = new IntersectionObserver(function (entries, appearOnScroll) {
              entries.forEach(entry => {
                if (!entry.isIntersecting) {
                  return;
                } else {
                  entry.target.classList.add('visible');
                  appearOnScroll.unobserve(entry.target);
                }
              });
            }, appearOptions);

            faders.forEach(fader => {
              appearOnScroll.observe(fader);
            });
          `,
        }}
      />
    </div>
  );
}
