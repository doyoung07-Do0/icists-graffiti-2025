import { TeamData } from './types';

interface TeamRowProps {
  team: TeamData;
  isEditing: boolean;
  onToggleSubmitted: (team: string, currentStatus: boolean) => void;
  onInputChange: (team: string, field: keyof TeamData, value: any) => void;
  onEdit: () => void;
  onSave: () => void;
}

const TeamRow = ({
  team,
  isEditing,
  onToggleSubmitted,
  onInputChange,
  onEdit,
  onSave,
}: TeamRowProps) => {
  const calculateRemaining = (team: TeamData) => {
    return team.pre_fund - (team.s1 + team.s2 + team.s3 + team.s4);
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap font-medium">
        {team.team}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="number"
          value={team.pre_fund}
          onChange={(e) => onInputChange(team.team, 'pre_fund', Number(e.target.value))}
          className="w-20 border rounded px-2 py-1"
          disabled={!isEditing}
        />
      </td>
      {['s1', 's2', 's3', 's4'].map((s) => (
        <td key={s} className="px-6 py-4 whitespace-nowrap">
          <input
            type="number"
            value={team[s as keyof TeamData] as number}
            onChange={(e) => onInputChange(team.team, s as keyof TeamData, Number(e.target.value))}
            className="w-20 border rounded px-2 py-1"
            disabled={!isEditing}
          />
        </td>
      ))}
      <td className="px-6 py-4 whitespace-nowrap">
        {calculateRemaining(team)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="number"
          value={team.post_fund || ''}
          onChange={(e) => onInputChange(team.team, 'post_fund', e.target.value ? Number(e.target.value) : null)}
          className="w-20 border rounded px-2 py-1"
          disabled={!isEditing}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onToggleSubmitted(team.team, team.submitted)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            team.submitted
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
        >
          {team.submitted ? 'Yes' : 'No'}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <button
            onClick={onSave}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Save
          </button>
        ) : (
          <button
            onClick={onEdit}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
          >
            Edit
          </button>
        )}
      </td>
    </tr>
  );
};

export default TeamRow;
