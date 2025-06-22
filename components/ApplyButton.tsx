'use client';

import React from 'react';

export default function ApplyButton() {
  const handleClick = () => {
    alert("참가 신청이 종료되었습니다");
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-[#D2D8B2] to-[#4CAF80] text-black font-medium rounded-full hover:opacity-90 transition-opacity cursor-pointer"
    >
      참가 신청하기
    </button>
  );
}
