import Image from 'next/image';
import { Users, Lightbulb, Rocket, GraduationCap, Microscope, Brain } from 'lucide-react';
import ApplyButton from '@/components/ApplyButton';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 pt-32 pb-16 max-w-6xl">
      {/* 헤더 섹션 */}
      <div className="text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">GRAFFITI 2025</h1>
        <p className="text-2xl md:text-3xl font-medium mb-6">&ldquo;One Idea can Paint the Future&rdquo;</p>
        <p className="text-xl text-gray-300 max-w-4xl mx-auto">
          여름의 정점, 당신의 아이디어를 세상에 낙서하듯 그릴 시간!
        </p>
      </div>

            {/* GRAFFITI 2025 소개 */}
            <section className="mb-20">
        <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <Rocket className="size-8 mr-3 text-[#4CAF80]" />
              GRAFFITI 2025
            </h2>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              &ldquo;One Idea can Paint the Future&rdquo;이라는 주제로 열리는 GRAFFITI 2025는
              AI를 활용한 창업 아이디어를 자유롭게 구현하고, 실제로 기업과 전문가 앞에서 선보일 수 있는 컨퍼런스입니다.
            </p>
            <div className="mb-6 p-6 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Lightbulb className="size-5 mr-2 text-[#D2D8B2]" />
                왜 &lsquo;GRAFFITI&rsquo;인가요?
              </h3>
              <p className="text-gray-300">
                20대 청년 창업가가 &lsquo;AI를 활용해 세상을 바꿀 색다른 해결책&rsquo;을 그려 나가자는 메시지를 담고 있습니다.
                AI는 이제 과제를 돕는 도구를 넘어, 환경, 교육, 금융 등 사회문제를 해결하는 핵심 기술로 자리 잡았습니다.
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Brain className="size-5 mr-2 text-[#D2D8B2]" />
                GRAFFITI 2025의 차별점
              </h3>
              <p className="text-gray-300 mb-3">
                기존 해커톤과 달리, 참가자들은 AI 스타트업과 매칭되어 해당 기술을 직접 배우고,
                이를 적용할 새로운 문제를 탐색하는 것부터 시작합니다.
              </p>
              <p className="text-gray-300">
                기술을 처음부터 만드는 것이 아니라, 기술이 주어진 상태에서
                &ldquo;무엇을 바꿀 수 있을까?&rdquo;를 고민하는 과정이 GRAFFITI 2025의 핵심입니다.
              </p>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
              <h3 className="text-2xl font-bold mb-6 text-center">행사 개요</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-[#4CAF80] mr-3">📅</span>
                  <div>
                    <h4 className="font-semibold">일정</h4>
                    <p className="text-gray-300">2025년 7월 22일(화) ~ 7월 25일(금) (3박 4일)</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-[#4CAF80] mr-3">🏫</span>
                  <div>
                    <h4 className="font-semibold">장소</h4>
                    <p className="text-gray-300">대전 KAIST 본원</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-[#4CAF80] mr-3">👥</span>
                  <div>
                    <h4 className="font-semibold">대상</h4>
                    <p className="text-gray-300">창업, AI, 사회문제 해결에 관심 있는 대학(원)생</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-[#4CAF80] mr-3">💰</span>
                  <div>
                    <h4 className="font-semibold">총상금</h4>
                    <p className="text-gray-300">140만원</p>
                  </div>
                </li>
              </ul>
              <div className="mt-8 p-6 bg-gradient-to-r from-[#D2D8B2]/10 to-[#4CAF80]/10 rounded-xl">
                <h4 className="font-bold text-lg mb-3">행사 구성</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[#4CAF80] mr-2">•</span>
                    <span>📈 <span className="font-medium">투자게임</span>: 스타트업 가치 평가 및 매칭</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#4CAF80] mr-2">•</span>
                    <span>🎤 <span className="font-medium">강연</span>: VC, AI, 창업 분야 전문가 특강</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#4CAF80] mr-2">•</span>
                    <span>🚀 <span className="font-medium">팀프로젝트</span>: AI 기술을 활용한 서비스/제품 개발</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ICISTS 소개 */}
      <section className="mb-20">
        <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <Users className="size-8 mr-3 text-[#4CAF80]" />
              ICISTS 소개
            </h2>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              ICISTS(아이시스츠)는 KAIST의 대표적인 학술 동아리로, 과학기술과 사회의 융합을 꿈꾸는 학생들이 모인 단체입니다.
              &lsquo;International Challengers for the Integration of Science, Technology and Society&rsquo;의 약자로,
              과학기술이 사회에 미치는 영향과 가능성에 대해 탐구하고 논의하는 장을 마련하고 있습니다.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              매년 여름, 국내외 학생들을 초청하여 다양한 주제로 학술 컨퍼런스를 개최하며,
              이번 GRAFFITI 2025는 그 일환으로 기획된 AI 창업 해커톤입니다.
            </p>
          </div>
          <div className="md:w-1/2 rounded-xl overflow-hidden shadow-2xl">
            <div className="aspect-video bg-gradient-to-br from-[#D2D8B2] to-[#4CAF80] flex items-center justify-center">
              <span className="text-2xl font-bold text-black">ICISTS</span>
            </div>
          </div>
        </div>
      </section>

      {/* KAIST 소개 */}
      <section className="mb-20">
        <div className="flex flex-col md:flex-row-reverse items-center gap-10 mb-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <GraduationCap className="size-8 mr-3 text-[#4CAF80]" />
              KAIST 소개
            </h2>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              한국과학기술원(KAIST)은 1971년 설립된 한국 최초의 과학기술 특성화 대학원으로,
              혁신적인 연구와 교육을 통해 글로벌 리더를 양성하고 있습니다.
              과학기술 분야에서의 선도적인 연구 성과와 창의적인 인재 양성으로 명성을 쌓아왔으며,
              특히 인공지능, 로봇공학, 바이오기술 등 미래 기술 분야에서 두각을 나타내고 있습니다.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              ICISTS는 KAIST의 대표적인 학술 동아리로, KAIST의 혁신 정신과 도전 의식을 바탕으로
              학생 주도적인 학술 교류의 장을 마련하고 있습니다.
            </p>
          </div>
          <div className="md:w-1/2 rounded-xl overflow-hidden shadow-2xl">
            <div className="aspect-video bg-gradient-to-br from-[#4CAF80] to-[#2c5a46] flex items-center justify-center">
              <span className="text-2xl font-bold text-white">KAIST</span>
            </div>
          </div>
        </div>
      </section>

      {/* 참가 신청 안내 */}
      <section className="text-center py-12 bg-gradient-to-r from-[#D2D8B2]/10 to-[#4CAF80]/10 rounded-2xl">
        <h2 className="text-3xl font-bold mb-6">함께하실 분들을 기다립니다!</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          AI와 창업에 관심 있는 대학생 여러분의 많은 참여 부탁드립니다.
          비전공자도 환영합니다!
        </p>
        <ApplyButton />
      </section>
      </div>
    </div>
  );
}
