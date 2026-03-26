export interface Tool {
  key: string;
  name: string;
  skillsDir: string;
  detectedDir: string;
  isInstalled: boolean;
  isUniversal: boolean;
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
  tool: string;
  path: string;
  markerFile: string;
  isSymlink: boolean;
}

export interface SkillContent {
  content: string;
  path: string;
}
