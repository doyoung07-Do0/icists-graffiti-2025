'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="bg-black text-[#E5E7EB]">
      {/* Custom Styles */}
      <style jsx global>{`
        /* 부드러운 스크롤 효과 */
        html {
          scroll-behavior: smooth;
        }

        /* 기본 폰트 설정 */
        body {
          font-family: 'Noto Sans KR', sans-serif;
          background-color: #111111;
          color: #E5E7EB;
        }

        /* 로고, 제목 등에 사용할 영문 폰트 */
        .font-roboto {
          font-family: 'Roboto', sans-serif;
        }

        /* 그라데이션 버튼 스타일 */
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

        /* 섹션 구분선 */
        .section-divider {
          height: 2px;
          width: 100px;
          background: linear-gradient(to right, #D2D8B2, #4CAF80);
          margin: 1rem auto;
        }
      `}</style>

      {/* Main Content with page load animation */}
      <motion.main
        className="pt-28"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Hero Section with special animation */}
        <motion.section
          className="min-h-screen flex items-center justify-center text-center px-4 -mt-24"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.div className="space-y-6" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}>
            <motion.p className="text-lg md:text-xl font-bold text-gray-300 tracking-wider" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              ICISTS Presents
            </motion.p>
            <motion.h2 className="text-5xl md:text-7xl lg:text-8xl font-black font-roboto tracking-tighter gradient-text" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              GRAFFITI 2025
            </motion.h2>
            <motion.p className="text-2xl md:text-4xl font-bold text-white" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              &quot;One Idea can Paint the Future&quot;
            </motion.p>
            <motion.p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              여름의 정점, 당신의 아이디어를 세상에 낙서하듯 그릴 시간!<br />
              AI 스타트업의 기술로 사회 문제를 해결하는 새로운 방식의 해커톤에 당신을 초대합니다
            </motion.p>
            <motion.a href="#" className="inline-block gradient-button font-bold py-3 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition-transform" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              해커톤 참여하기
            </motion.a>
          </motion.div>
        </motion.section>

        {/* Why GRAFFITI? Section */}
        <motion.section id="about" className="py-20 px-4" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}>
          <div className="container mx-auto max-w-4xl text-center">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">🎨 왜 <span className="gradient-text">GRAFFITI</span>인가요?</h3>
            <div className="section-divider"></div>
            <p className="text-lg text-gray-300 mb-8">
              20대 청년 창업가가 &apos;AI를 활용해 세상을 바꿀 색다른 해결책&apos;을 그려 나가자는 메시지를 담고 있습니다.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h4 className="text-2xl font-bold mb-3 gradient-text">The Problem</h4>
                <p className="text-gray-400">
                  AI는 환경 🌱, 교육 📚, 금융 💰 등 사회문제를 해결하는 핵심 기술이지만, 대학생들이 AI를 직접 적용해 볼 기회는 제한적이고, 개발 지식이라는 진입 장벽도 여전히 높습니다.
                </p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h4 className="text-2xl font-bold mb-3 gradient-text">Our Solution</h4>
                <p className="text-gray-400">
                  GRAFFITI는 현직 AI 스타트업 기술을 응용하는 방식을 채택했습니다. 기술이 주어진 상태에서 &quot;무엇을 바꿀 수 있을까?&quot;를 고민하며, 아이디어와 기획의 가치에 집중합니다.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Ice Breaking Section */}
        <motion.section id="ice-breaking" className="py-20 bg-gray-900/50 px-4" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }}>
          <div className="container mx-auto max-w-4xl text-center">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">🧊 <span className="gradient-text">Ice Breaking</span> &amp; Networking</h3>
            <div className="section-divider"></div>
            <p className="text-lg text-gray-300 mb-8">
              훌륭한 아이디어는 훌륭한 팀에서 시작됩니다. GRAFFITI 2025는 단순한 경쟁을 넘어, 참가자 간의 교류와 협업을 중요하게 생각합니다.
            </p>
            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 text-left">
              <p className="text-gray-300 mb-6">
                본격적인 해커톤 시작에 앞서, 어색함을 깨고 동료들과 친해질 수 있는 다양한 아이스 브레이킹 활동이 준비되어 있습니다. 가벼운 게임과 미션을 통해 자연스럽게 네트워킹하고, 함께 미래를 그려나갈 최고의 팀원들을 만나보세요!
              </p>
              <div className="text-center">
                <Link href="/chat" className="inline-block gradient-button font-bold py-3 px-8 rounded-lg text-lg">
                  AI 챗봇으로 Ice Breaking 시작하기 →
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Program Structure / Investment Game Section */}
        <motion.section id="investment-game" className="py-20 px-4" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.4 }}>
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h3 className="text-4xl md:text-5xl font-bold">🚀 행사 구성</h3>
              <div className="section-divider"></div>
            </div>
            <div className="relative pl-8 border-l-2 border-gray-600 space-y-12">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-[42px] top-0 h-full flex items-center">
                  <div className="h-5 w-5 bg-gradient-to-r from-yellow-200 to-green-500 rounded-full ring-4 ring-gray-900"></div>
                </div>
                <h4 className="text-2xl font-bold mb-2 gradient-text">📈 투자게임 (Investment Game)</h4>
                <p className="text-gray-300">참가자들이 직접 스타트업의 가치를 평가하고 투자자의 관점을 기릅니다. 이 과정을 통해 팀프로젝트를 함께할 스타트업과 매칭됩니다.</p>
              </div>
              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-[42px] top-0 h-full flex items-center">
                  <div className="h-5 w-5 bg-gradient-to-r from-yellow-200 to-green-500 rounded-full ring-4 ring-gray-900"></div>
                </div>
                <h4 className="text-2xl font-bold mb-2 gradient-text">🎤 전문가 강연</h4>
                <p className="text-gray-300">VC, AI, 창업 분야 전문가들의 강연을 통해 AI 창업 인사이트를 얻고 팀프로젝트 아이디어를 구체화하는 데 도움을 받습니다.</p>
              </div>
              {/* Step 3 */}
              <div className="relative">
                <div className="absolute -left-[42px] top-0 h-full flex items-center">
                  <div className="h-5 w-5 bg-gradient-to-r from-yellow-200 to-green-500 rounded-full ring-4 ring-gray-900"></div>
                </div>
                <h4 className="text-2xl font-bold mb-2 gradient-text">🚀 팀프로젝트</h4>
                <p className="text-gray-300">4~6인으로 팀을 이뤄 매칭된 스타트업의 AI 기술을 이용, 새로운 문제를 정의하고 시장 조사를 통해 AI 기반 서비스/제품을 구체화하는 핵심 프로그램입니다.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Event Details Section */}
        <motion.section id="details" className="py-20 bg-gray-900/50 px-4" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.5 }}>
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h3 className="text-4xl md:text-5xl font-bold">💡 행사 개요</h3>
              <div className="section-divider"></div>
            </div>
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <strong className="gradient-text text-lg">📆 일정:</strong>
                  <p>2025.07.22(화) ~ 07.25(금) (3박 4일)</p>
                </div>
                <div>
                  <strong className="gradient-text text-lg">🏫 장소:</strong>
                  <p>대전 KAIST 본원</p>
                </div>
                <div>
                  <strong className="gradient-text text-lg">👥 대상:</strong>
                  <p>창업, AI, 사회문제 해결에 관심 있는 대학(원)생</p>
                </div>
                <div>
                  <strong className="gradient-text text-lg">💰 총상금:</strong>
                  <p>140만원</p>
                </div>
              </div>
              <div>
                <strong className="gradient-text text-lg">💳 참가비:</strong>
                <ul className="list-disc list-inside text-gray-300 mt-2">
                  <li>얼리버드 (~07.03): 기숙사 제외 65,000원 / 기숙사 포함 85,000원</li>
                  <li>레귤러 (~07.18): 기숙사 제외 85,000원 / 기숙사 포함 105,000원</li>
                </ul>
              </div>
              <div>
                <p className="text-center text-lg bg-green-900/30 p-4 rounded-lg">🛌 행사 기간 점심, 저녁, 숙소 제공 &amp; 네트워킹 파티 🎉</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.section className="py-24 text-center px-4" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.6 }}>
          <div className="container mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">당신의 아이디어로 미래를 그릴 준비가 되셨나요?</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">망설이지 마세요. GRAFFITI 2025는 당신의 아이디어가 현실이 되는 무대입니다.</p>
            <a href="https://www.instagram.com/icistskaist/" target="_blank" rel="noopener noreferrer" className="inline-block gradient-button font-bold py-4 px-10 rounded-full text-xl shadow-lg transform hover:scale-105 transition-transform">
              ICISTS 인스타에서 신청하기
            </a>
          </div>
        </motion.section>
      </motion.main>

      {/* Footer with animation */}
      <motion.footer
        className="bg-black py-8 px-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
      >
        <div className="container mx-auto text-center text-gray-500">
          <p className="font-bold text-lg text-gray-300 mb-2">GRAFFITI 2025 by ICISTS</p>
          <p>문의: 인스타그램 DM 또는 이메일 icists@icists.org</p>
          <p className="mt-4 text-sm">&copy; 2025 KAIST ICISTS. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  );
}
