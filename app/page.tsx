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

        /* 그라데이션 텍스트 스타일 */
        .gradient-text {
          background: linear-gradient(to right, #D2D8B2, #4CAF80);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
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
          <motion.div
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12 } },
            }}
          >
            <motion.p
              className="text-lg md:text-xl font-bold text-gray-300 tracking-wider"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              ICISTS Presents
            </motion.p>
            <motion.h2
              className="text-5xl md:text-7xl lg:text-8xl font-black font-roboto tracking-tighter gradient-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              GRAFFITI 2025
            </motion.h2>
            <motion.p
              className="text-2xl md:text-4xl font-bold text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              &quot;One Idea can Paint the Future&quot;
            </motion.p>
            <motion.p
              className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              여름의 정점, 당신의 아이디어를 세상에 낙서하듯 그릴 시간!
              <br />
              AI 스타트업의 기술로 사회 문제를 해결하는 새로운 방식의 해커톤에
              당신을 초대합니다
            </motion.p>
            <motion.button
              onClick={() => {
                document
                  .getElementById('about')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-block gradient-button font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#4CAF80]/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 20px rgba(76, 175, 128, 0.4)',
              }}
              whileTap={{ scale: 0.98 }}
              transition={{
                delay: 0.6,
                type: 'spring',
                stiffness: 400,
                damping: 10,
              }}
            >
              자세히 알아보기
            </motion.button>
          </motion.div>
        </motion.section>

        {/* Why GRAFFITI? Section */}
        <motion.section
          id="about"
          className="py-20 px-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="container mx-auto max-w-4xl text-center">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              🎨 왜 <span className="gradient-text">GRAFFITI</span>인가요?
            </h3>
            <div className="section-divider" />
            <p className="text-lg text-gray-300 mb-8">
              20대 청년 창업가가 &apos;AI를 활용해 세상을 바꿀 색다른
              해결책&apos;을 그려 나가자는 메시지를 담고 있습니다.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h4 className="text-2xl font-bold mb-3 gradient-text">
                  The Problem
                </h4>
                <p className="text-gray-400">
                  AI는 환경 🌱, 교육 📚, 금융 💰 등 사회문제를 해결하는 핵심
                  기술이지만, 대학생들이 AI를 직접 적용해 볼 기회는 제한적이고,
                  개발 지식이라는 진입 장벽도 여전히 높습니다.
                </p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h4 className="text-2xl font-bold mb-3 gradient-text">
                  Our Solution
                </h4>
                <p className="text-gray-400">
                  GRAFFITI는 현직 AI 스타트업 기술을 응용하는 방식을
                  채택했습니다. 기술이 주어진 상태에서 &quot;무엇을 바꿀 수
                  있을까?&quot;를 고민하며, 아이디어와 기획의 가치에 집중합니다.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* AI Assistant Section */}
        <motion.section
          id="ice-breaking"
          className="py-20 bg-gray-900/50 px-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="container mx-auto max-w-4xl text-center">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              🤖 <span className="gradient-text">AI 행사 도우미</span>
            </h3>
            <div className="section-divider" />
            <p className="text-lg text-gray-300 mb-8">
              GRAFFITI 2025와 관련된 모든 궁금증을 해결해드립니다. 행사 일정부터
              심사 기준까지, 무엇이든 물어보세요!
            </p>
            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 text-left">
              <p className="text-gray-300 mb-6">
                &quot;와이파이 비밀번호가 뭔가요?&quot;, &quot;심사 기준은
                어떻게 되나요?&quot;와 같은 행사 관련 질문들에 대해 즉각적인
                답변을 제공하는 AI 챗봇을 준비했습니다. 24시간 언제든 문의하실
                수 있어요!
              </p>
              <div className="text-center">
                <Link
                  href="https://chatgpt.com/g/g-68789d665d848191962495cb4db6a748-kaist-graffiti2025-ai-startup-mueosideun-muleoboseyo"
                  className="inline-block gradient-button font-bold py-3 px-8 rounded-lg text-lg"
                >
                  행사 관련 질의응답 챗봇으로 가기 →
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Program Structure / Investment Game Section */}
        <motion.section
          id="investment-game"
          className="py-20 px-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h3 className="text-4xl md:text-5xl font-bold">🚀 행사 개요</h3>
              <div className="section-divider" />
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Timeline Image - Left Side */}
              <div className="order-2 lg:order-1">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-center lg:text-left"
                >
                  <img
                    src="/images/timeline.png"
                    alt="GRAFFITI 2025 4-Day Event Timeline"
                    className="w-full h-auto rounded-xl shadow-2xl border border-gray-600"
                    style={{ minHeight: '600px', maxHeight: '800px' }}
                  />
                </motion.div>
              </div>

              {/* Program Structure - Right Side */}
              <div className="order-1 lg:order-2">
                <div className="relative pl-8 border-l-2 border-gray-600 space-y-12 mt-4 lg:mt-8">
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute left-[calc(-42px)] top-1/2 -translate-y-1/2 z-10">
                      <div className="size-5 bg-gradient-to-r from-yellow-200 to-green-500 rounded-full ring-4 ring-gray-900" />
                    </div>
                    <h4 className="text-2xl font-bold mb-2 gradient-text">
                      🧊 아이스 브레이킹 (Ice Breaking)
                    </h4>
                    <p className="text-gray-300">
                      Ice Breaking 세션은 투자 게임에 앞서 팀원 간의 친목을
                      도모하기 위한 활동입니다. 단순한 미니 게임을 넘어, AI를
                      활용한 창의적인 게임을 통해 행사 취지에 부합하면서도
                      재미까지 더한 시간이 될 것입니다.
                    </p>
                  </div>
                  {/* Step 2 */}
                  <div className="relative">
                    <div className="absolute left-[calc(-42px)] top-1/2 -translate-y-1/2 z-10">
                      <div className="size-5 bg-gradient-to-r from-yellow-200 to-green-500 rounded-full ring-4 ring-gray-900" />
                    </div>
                    <h4 className="text-2xl font-bold mb-2 gradient-text">
                      💰 투자 게임 (Investment Game)
                    </h4>
                    <p className="text-gray-300">
                      여러분이 직접 투자자가 되어서 스타트업에게 투자하세요!
                      "시드머니 퀴즈" 세션을 통해 시드머니를 확보한 후,
                      스타트업의 피칭을 들으면서 여러분은 포트폴리오를 제출하게
                      됩니다. 이를 기반으로 여러분은 원하는 스타트업과
                      매칭됩니다!
                    </p>
                  </div>
                  {/* Step 3 */}
                  <div className="relative">
                    <div className="absolute left-[calc(-42px)] top-1/2 -translate-y-1/2 z-10">
                      <div className="size-5 bg-gradient-to-r from-yellow-200 to-green-500 rounded-full ring-4 ring-gray-900" />
                    </div>
                    <h4 className="text-2xl font-bold mb-2 gradient-text">
                      🎤 강연 (Talks)
                    </h4>
                    <p className="text-gray-300">
                      실무자 및 전문가로부터 스타트업, AI, 사회 문제 해결 등
                      다양한 주제의 초청 강연을 통해 인사이트와 영감을 얻습니다.
                    </p>
                  </div>
                  {/* Step 4 */}
                  <div className="relative">
                    <div className="absolute left-[calc(-42px)] top-1/2 -translate-y-1/2 z-10">
                      <div className="size-5 bg-gradient-to-r from-yellow-200 to-green-500 rounded-full ring-4 ring-gray-900" />
                    </div>
                    <h4 className="text-2xl font-bold mb-2 gradient-text">
                      🎮 서머나잇 (Summer Night)
                    </h4>
                    <p className="text-gray-300">
                      섬머나잇 세션은 '팀플 팀의 경계를 넘어 더 많은 사람들과
                      교류하고 친해질 수 있는 친목의 장'을 제공하는 활동입니다.
                    </p>
                  </div>
                  {/* Step 5 */}
                  <div className="relative">
                    <div className="absolute left-[calc(-42px)] top-1/2 -translate-y-1/2 z-10">
                      <div className="size-5 bg-gradient-to-r from-yellow-200 to-green-500 rounded-full ring-4 ring-gray-900" />
                    </div>
                    <h4 className="text-2xl font-bold mb-2 gradient-text">
                      📙 팀 프로젝트 (Team Project)
                    </h4>
                    <p className="text-gray-300">
                      팀 프로젝트의 목표는 참가자 여러분이 AI 스타트업의 창업
                      과정을 경험해 보는 것입니다. 각자 배정된 스타트업의
                      입장에서 생각하며, 기업을 발전시킬 수 있는 아이디어를 내고
                      검증하여 확장하는 과정을 거친다는 뜻이죠.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.section
          className="py-24 text-center px-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <div className="container mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              당신의 아이디어로 미래를 그릴 준비가 되셨나요?
            </h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              망설이지 마세요. GRAFFITI 2025는 당신의 아이디어가 현실이 되는
              무대입니다.
            </p>
            <a
              href="https://www.instagram.com/icistskaist/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gradient-button font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#4CAF80]/20"
            >
              ICISTS 인스타 둘러보기
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
          <p className="font-bold text-lg text-gray-300 mb-2">
            GRAFFITI 2025 by ICISTS
          </p>
          <p>문의: 인스타그램 DM 또는 이메일 icists@icists.org</p>
          <p className="mt-4 text-sm">
            &copy; 2025 KAIST ICISTS. All rights reserved.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
