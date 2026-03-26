import type { Skill } from '../types';
import type { SkillFilter } from '../App';
import { FileText, Package, Link, FolderOpen, GitBranch } from 'lucide-react';

interface Props {
  skills: Skill[];
  loading: boolean;
  selectedSkill: Skill | null;
  onSelectSkill: (skill: Skill) => void;
  skillFilter: SkillFilter;
  onSkillFilterChange: (filter: SkillFilter) => void;
}

export default function SkillList({ 
  skills, loading, selectedSkill, onSelectSkill, 
  skillFilter, onSkillFilterChange 
}: Props) {
  const filteredSkills = skills.filter(skill => {
    if (skillFilter === 'regular') return !skill.isSymlink;
    if (skillFilter === 'symlink') return skill.isSymlink;
    return true;
  });

  const regularCount = skills.filter(s => !s.isSymlink).length;
  const symlinkCount = skills.filter(s => s.isSymlink).length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white border-r overflow-y-auto">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700">
            {filteredSkills.length} Skill{filteredSkills.length !== 1 ? 's' : ''}
            {skillFilter !== 'all' && (
              <span className="text-gray-400 text-sm ml-2">
                (filtered from {skills.length})
              </span>
            )}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSkillFilterChange('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              skillFilter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
            <span className="text-xs opacity-70">({skills.length})</span>
          </button>
          
          <button
            onClick={() => onSkillFilterChange('regular')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              skillFilter === 'regular' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Normal
            <span className="text-xs opacity-70">({regularCount})</span>
          </button>
          
          <button
            onClick={() => onSkillFilterChange('symlink')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              skillFilter === 'symlink' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Symlink
            <span className="text-xs opacity-70">({symlinkCount})</span>
          </button>
        </div>
      </div>

      {filteredSkills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Package className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-500">No skills found</p>
          <p className="text-gray-400 text-sm mt-1">
            {skillFilter === 'regular' ? 'No normal skills in this platform' : 'No symlinks in this platform'}
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {filteredSkills.map((skill) => (
            <button
              key={skill.id}
              onClick={() => onSelectSkill(skill)}
              className={`w-full text-left p-4 hover:bg-blue-50 transition-colors ${
                selectedSkill?.id === skill.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <FileText className={`w-5 h-5 mt-0.5 flex-shrink-0 ${skill.isSymlink ? 'text-purple-500' : 'text-blue-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">{skill.name}</h3>
                    {skill.isSymlink && (
                      <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        <GitBranch className="w-3 h-3" />
                        symlink
                      </span>
                    )}
                  </div>
                  {skill.description && (
                    <p className="text-sm text-gray-500 truncate mt-1">{skill.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {skill.tool}
                    </span>
                    <span className="text-xs text-gray-400 truncate">{skill.path}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
