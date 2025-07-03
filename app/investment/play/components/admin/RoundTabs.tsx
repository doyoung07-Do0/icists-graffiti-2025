import { Round, RoundTabProps } from './types';

const RoundTabs = ({ 
  activeRound, 
  onRoundChange,
  roundStatus
}: { 
  activeRound: Round;
  onRoundChange: (round: Round) => void;
  roundStatus: Record<Round, { status: 'locked' | 'open' | 'closed' }>;
}) => {
  const rounds: Round[] = ['r1', 'r2', 'r3', 'r4'];
  
  const statusColors = {
    locked: 'bg-gray-100 text-gray-700',
    open: 'bg-blue-100 text-blue-700',
    closed: 'bg-green-100 text-green-700',
  };

  return (
    <div className="flex border-b border-gray-200 mb-6">
      {rounds.map((round) => (
        <button
          key={round}
          onClick={() => onRoundChange(round)}
          className={`px-6 py-2 font-medium flex items-center space-x-2 ${
            activeRound === round
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span>{round.toUpperCase()}</span>
          <span 
            className={`text-xs px-2 py-0.5 rounded-full ${
              statusColors[roundStatus[round].status]
            }`}
          >
            {roundStatus[round].status.toUpperCase()}
          </span>
        </button>
      ))}
    </div>
  );
};

export default RoundTabs;
