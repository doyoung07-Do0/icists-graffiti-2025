'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart2,
  TrendingUp,
  Users,
  Target,
  Clock,
  Award,
} from 'lucide-react';

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
      id: 'seed',
      name: 'seed',
      description: '스타트업의 핵심 키워드 공개. 첫 포트폴리오 제출!',
      pitchingPoints: [
        '각 스타트업이 해결하려는 문제에 대한 핵심 키워드를 공개',
        '투자 게임 플랫폼에 익숙해지기',
        '첫 번째 포트폴리오 제출',
      ],
      icon: <BarChart2 className="size-6" />,
    },
    {
      id: 'series-a',
      name: 'Series A',
      description: '스타트업의 문제 인식, 해결 방안과 사업 모델에 대한 피칭',
      pitchingPoints: [
        '문제 인식 배경 및 해결 필요성',
        '제품/서비스 소개',
        '사업 모델 및 수익 구조',
        '미래 비전 제시',
      ],
      icon: <TrendingUp className="size-6" />,
    },
    {
      id: 'series-b',
      name: 'Series B',
      description: '사회적 가치와 영리적 가치의 균형에 대한 발표',
      pitchingPoints: [
        '사회적 가치와 영리적 가치의 균형',
        '창업 초기 가치와 현재 방향성',
        '현실적인 문제점과 해결 방향',
        '사회 문제 해결 생태계에서의 역할',
      ],
      icon: <Users className="size-6" />,
    },
    {
      id: 'series-c',
      name: 'Series C',
      description: '스타트업과의 직접적인 질의응답을 통한 최종 투자 결정',
      pitchingPoints: [
        '자유롭게 피칭과 발표를 들으며 생겼던 궁금점들을 질의응답',
        '최종 포트폴리오 제출',
        '스타트업과 학생팀 최종 매칭',
      ],
      icon: <Target className="size-6" />,
    },
  ];

  const selectedRound =
    rounds.find((round) => round.id === activeRound) || rounds[0];

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 pt-32 pb-12 max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#D0D7B1] to-[#4BDE80] bg-clip-text text-transparent w-fit mx-auto">
            투자 게임 개요
          </p>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            여러분이 직접 투자자가 되어서 스타트업에게 투자하세요!
          </p>
          <p>
            <span className="text-sm text-gray-400">
              매 라운드마다 스타트업의 정보를 얻고 제출한 포트폴리오를 기반으로
              4일간 함께할 스타트업과 매칭됩니다.
            </span>
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
              &nbsp;&nbsp;주요 진행 포인트
            </h3>
            <ul className="space-y-3 pl-2">
              {selectedRound.pitchingPoints.map((point, index) => (
                <li
                  key={`${selectedRound.id}-point-${index}`}
                  className="flex items-start"
                >
                  <span className="text-[#4CAF80] mr-2">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
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
