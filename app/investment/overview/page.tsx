'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart2, TrendingUp, Users, Target, Clock, Award } from 'lucide-react';

type RoundInfo = {
  id: string;
  name: string;
  description: string;
  pitchingPoints: string[];
  icon: React.ReactNode;
};

export default function InvestmentOverview() {
  const [activeRound, setActiveRound] = useState<string>('pre-seed');

  const rounds: RoundInfo[] = [
    {
      id: 'pre-seed',
      name: 'Pre-seed 라운드',
      description: '초기 스타트업의 핵심 키워드를 바탕으로 한 첫 투자 기회',
      pitchingPoints: [
        '각 스타트업이 해결하려는 문제에 대한 핵심 키워드(5~6개) 공개',
        '초기 투자금을 분산 투자 형태로 제출',
        '모든 팀의 투자 후 랜덤 수익률 결정'
      ],
      icon: <BarChart2 className="size-6" />
    },
    {
      id: 'seed',
      name: 'Seed 라운드',
      description: '스타트업의 문제 인식과 해결 방안에 대한 심층 분석',
      pitchingPoints: [
        '문제 인식 배경 및 해결 필요성',
        '제품/서비스 소개',
        '사업 모델 및 수익 구조',
        '미래 비전 제시'
      ],
      icon: <TrendingUp className="size-6" />
    },
    {
      id: 'series-a',
      name: 'Series A',
      description: '사회적 가치와 영리적 가치의 균형에 초점',
      pitchingPoints: [
        '사회적 가치와 영리적 가치의 균형',
        '창업 초기 가치와 현재 방향성',
        '현실적인 문제점과 해결 방향',
        '사회 문제 해결 생태계에서의 역할'
      ],
      icon: <Users className="size-6" />
    },
    {
      id: 'series-b',
      name: 'Series B',
      description: '스타트업과의 직접적인 질의응답을 통한 최종 투자 결정',
      pitchingPoints: [
        '16개 조로 나뉘어 진행되는 질의응답 세션',
        '각 조당 5분씩 진행되는 심층 질의',
        '최종 포트폴리오 리밸런싱',
        '최종 수익률 결정'
      ],
      icon: <Target className="size-6" />
    }
  ];

  const selectedRound = rounds.find(round => round.id === activeRound) || rounds[0];

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 pt-32 pb-12 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">투자 게임 개요</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            AI 스타트업과 학생 팀 간의 매칭을 위한 4단계 투자 게임에 참여해보세요.
            각 라운드마다 전략적으로 투자하여 최종 매칭 우선권을 획득하세요!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {rounds.map((round) => (
            <motion.button
              key={round.id}
              onClick={() => setActiveRound(round.id)}
              className={`p-6 rounded-xl text-left transition-all duration-300 ${
                activeRound === round.id 
                  ? 'bg-white/10 border border-white/20 shadow-lg' 
                  : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10'
              }`}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#D2D8B2] to-[#4CAF80] text-black mr-3">
                  {round.icon}
                </div>
                <h3 className="text-lg font-semibold">{round.name}</h3>
              </div>
              <p className="text-sm text-gray-300">{round.description}</p>
            </motion.button>
          ))}
        </div>

        <div className="bg-white/5 rounded-2xl p-8 mb-12 border border-white/10">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#D2D8B2] to-[#4CAF80] text-black mr-4">
              {selectedRound.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{selectedRound.name}</h2>
              <p className="text-gray-300">{selectedRound.description}</p>
            </div>
          </div>
          
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="size-6 shrink-0 text-[#4CAF80]" />
              주요 피칭 포인트
            </h3>
            <ul className="space-y-3 pl-2">
              {selectedRound.pitchingPoints.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-[#4CAF80] mr-2">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Award className="size-5 mr-2 text-[#4CAF80]" />
              게임 진행 방식
            </h3>
            <ol className="space-y-4">
              <li className="flex">
                <div className="shrink-0 size-6 rounded-full bg-[#4CAF80] flex items-center justify-center text-xs font-bold mr-3">1</div>
                <div>
                  <h4 className="font-semibold">초기 자금 확보</h4>
                  <p className="text-sm text-gray-300">VC 에듀세션 퀴즈를 통해 초기 투자금 획득</p>
                </div>
              </li>
              <li className="flex">
                <div className="shrink-0 size-6 rounded-full bg-[#4CAF80] flex items-center justify-center text-xs font-bold mr-3">2</div>
                <div>
                  <h4 className="font-semibold">포트폴리오 구성</h4>
                  <p className="text-sm text-gray-300">각 라운드별로 스타트업에 분산 투자</p>
                </div>
              </li>
              <li className="flex">
                <div className="shrink-0 size-6 rounded-full bg-[#4CAF80] flex items-center justify-center text-xs font-bold mr-3">3</div>
                <div>
                  <h4 className="font-semibold">수익률 결정</h4>
                  <p className="text-sm text-gray-300">투자 규모에 따른 랜덤 수익률 적용</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold mb-4">투자 전략 가이드</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-[#D2D8B2]">📈 평균 회귀 전략</h4>
                <p className="text-sm text-gray-300 mt-1">
                  직전 라운드에서 수익률이 낮았던 스타트업은 다음 라운드에서 회복할 가능성이 높습니다.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#D2D8B2]">⚖️ 리스크 분산</h4>
                <p className="text-sm text-gray-300 mt-1">
                  모든 달걀을 한 바구니에 담지 마세요. 여러 스타트업에 분산 투자하세요.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#D2D8B2]">📊 투자 규모 고려</h4>
                <p className="text-sm text-gray-300 mt-1">
                  큰 규모의 투자는 안정적이지만, 작은 규모의 투자는 높은 수익률을 기대할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link 
            href="/investment/play" 
            className="inline-flex items-center px-8 py-3 rounded-full bg-gradient-to-r from-[#D2D8B2] to-[#4CAF80] text-black font-medium hover:opacity-90 transition-opacity"
          >
            게임 시작하기 <ArrowRight className="ml-2 size-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
