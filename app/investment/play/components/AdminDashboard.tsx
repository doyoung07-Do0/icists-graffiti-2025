'use client';

import { TeamDashboard } from './admin/TeamDashboard';

export default function AdminDashboard() {
  return (
    <div className="bg-black text-[#E5E7EB] min-h-screen">
      {/* Custom styles for consistent design */}
      <style jsx global>{`
        .gradient-text {
          background: linear-gradient(to right, #D2D8B2, #4CAF80);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        
        .gradient-bg {
          background: linear-gradient(135deg, #D2D8B2 0%, #4CAF80 100%);
        }
        
        .glass-card {
          background: rgba(229, 231, 235, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(229, 231, 235, 0.1);
        }
        
        .admin-button {
          background: linear-gradient(135deg, rgba(210, 216, 178, 0.1) 0%, rgba(76, 175, 128, 0.1) 100%);
          border: 1px solid rgba(210, 216, 178, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .admin-button:hover {
          background: linear-gradient(135deg, rgba(210, 216, 178, 0.2) 0%, rgba(76, 175, 128, 0.2) 100%);
          border-color: rgba(210, 216, 178, 0.3);
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `}</style>
      
      <TeamDashboard />
    </div>
  );
}
