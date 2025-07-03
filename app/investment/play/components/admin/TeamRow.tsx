import { TeamRowProps } from './types';

function TeamRow({
  team,
  isEditing,
  onToggleSubmitted,
  onInputChange,
  onEdit,
  onSave,
}: TeamRowProps) {
  // Calculate remain based on pre_fund and sum of s1-s4
  const remain = team.pre_fund - (team.s1 + team.s2 + team.s3 + team.s4);

  const handleInputChange = (field: keyof typeof team, value: string) => {
    // For number inputs, convert to number, but allow empty string for post_fund
    const numValue = field === 'post_fund' && value === '' 
      ? null 
      : Number(value);
    
    onInputChange(team.team, field as any, numValue);
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-semibold text-white">
          {team.team}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="number"
            min="0"
            className="w-20 p-1 border rounded"
            value={team.pre_fund}
            onChange={(e) => handleInputChange('pre_fund', e.target.value)}
          />
        ) : (
          team.pre_fund
        )}
      </td>
      {(['s1', 's2', 's3', 's4'] as const).map((field) => (
        <td key={field} className="px-6 py-4 whitespace-nowrap">
          {isEditing ? (
            <input
              type="number"
              min="0"
              max={team.pre_fund}
              className="w-16 p-1 border rounded"
              value={team[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
            />
          ) : (
            team[field]
          )}
        </td>
      ))}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {remain}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="number"
            min="0"
            className="w-20 p-1 border rounded"
            value={team.post_fund ?? ''}
            onChange={(e) => handleInputChange('post_fund', e.target.value)}
          />
        ) : (
          team.post_fund ?? '—'
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onToggleSubmitted(team.team, team.submitted)}
          className={`px-2 py-1 rounded text-xs font-medium border ${
            team.submitted
              ? 'bg-green-600 text-white hover:bg-green-700 border-green-700'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600'
          }`}
        >
          {team.submitted ? 'Submitted' : 'Not Submitted'}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {isEditing ? (
          <button
            onClick={onSave}
            className="text-indigo-600 hover:text-indigo-900"
            disabled={remain < 0} // Disable save if remain is negative
          >
            Save
          </button>
        ) : (
          <button
            onClick={onEdit}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Edit
          </button>
        )}
      </td>
    </tr>
  );
}

export default TeamRow;
