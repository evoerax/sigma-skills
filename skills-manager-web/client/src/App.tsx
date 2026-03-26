import { useState, useEffect } from 'react';
import { fetchTools, fetchSkills } from './api';
import type { Tool, Skill } from './types';
import Sidebar from './components/Sidebar';
import SkillList from './components/SkillList';
import SkillDetail from './components/SkillDetail';

export type SkillFilter = 'all' | 'regular' | 'symlink';

export default function App() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState<SkillFilter>('all');

  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    loadSkills();
  }, [selectedTool]);

  async function loadTools() {
    try {
      const data = await fetchTools();
      setTools(data);
    } catch (err) {
      console.error('Failed to load tools:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadSkills() {
    setLoading(true);
    try {
      const data = await fetchSkills(selectedTool || undefined);
      setSkills(data);
    } catch (err) {
      console.error('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        tools={tools}
        selectedTool={selectedTool}
        onSelectTool={setSelectedTool}
      />
      <SkillList
        skills={skills}
        loading={loading}
        selectedSkill={selectedSkill}
        onSelectSkill={setSelectedSkill}
        skillFilter={skillFilter}
        onSkillFilterChange={setSkillFilter}
      />
      {selectedSkill && (
        <SkillDetail
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          onDeleted={() => {
            setSelectedSkill(null);
            loadSkills();
          }}
        />
      )}
    </div>
  );
}
