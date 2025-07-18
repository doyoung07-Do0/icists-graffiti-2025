'use client';

export default function UnauthorizedAccess() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-gray-900/50 backdrop-blur-sm border border-red-700 rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-3xl font-bold mb-4 text-red-400">
            접근 권한이 없습니다
          </h2>
          <p className="text-gray-300 mb-6">
            이 페이지에 접근하려면 관리자 또는 팀 계정으로 로그인해야 합니다.
          </p>
          <div className="space-y-3 text-sm text-gray-400">
            <p>
              <strong>관리자:</strong> admin@icists.com
            </p>
            <p>
              <strong>팀 계정:</strong> team1@icists.com ~ team15@icists.com
            </p>
          </div>
          <div className="mt-6">
            <a
              href="/api/auth/signin"
              className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-all"
            >
              로그인하기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
