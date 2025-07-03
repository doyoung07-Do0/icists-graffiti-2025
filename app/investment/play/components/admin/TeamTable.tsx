import { TeamData } from './types';
import TeamRow from './TeamRow';

interface TeamTableProps {
  data: TeamData[];
  isLoading: boolean;
  editingTeam: string | null;
  onToggleSubmitted: (team: string, currentStatus: boolean) => void;
  onInputChange: (team: string, field: keyof TeamData, value: any) => void;
  setEditingTeam: (team: string | null) => void;
  onSubmit: (team: string) => void;
}

const TeamTable = ({
  data,
  isLoading,
  editingTeam,
  onToggleSubmitted,
  onInputChange,
  setEditingTeam,
  onSubmit,
}: TeamTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Team
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pre Fund
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              S1
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              S2
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              S3
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              S4
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Remain
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Post Fund
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {isLoading ? (
            <tr>
              <td colSpan={10} className="px-6 py-4 text-center">
                Loading...
              </td>
            </tr>
          ) : (
            data.map((team) => (
              <TeamRow
                key={team.team}
                team={team}
                isEditing={editingTeam === team.team}
                onToggleSubmitted={onToggleSubmitted}
                onInputChange={onInputChange}
                onEdit={() => setEditingTeam(team.team)}
                onSave={() => onSubmit(team.team)}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeamTable;
