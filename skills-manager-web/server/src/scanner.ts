import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import matter from 'gray-matter';

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

const SKILL_MARKERS = ['SKILL.md', 'skill.md', 'CLAUDE.md', 'README.md', 'readme.md'];

const UNIVERSAL_TOOLS = new Set(['agents']);

const DEFAULT_TOOLS: Omit<Tool, 'isInstalled'>[] = [
  { key: 'agents', name: '.agents', skillsDir: '.agents/skills', detectedDir: '.agents' },
  { key: 'openclaw_local', name: 'OpenClaw (Local)', skillsDir: '.openclaw/skills', detectedDir: '.openclaw' },
  { key: 'openclaw_workspace', name: 'OpenClaw (Workspace)', skillsDir: '.openclaw/workspace/skills', detectedDir: '.openclaw' },
  { key: 'amp', name: 'Amp', skillsDir: '.config/agents/skills', detectedDir: '.config/agents' },
  { key: 'antigravity', name: 'Antigravity', skillsDir: '.gemini/antigravity/global_skills', detectedDir: '.gemini/antigravity' },
  { key: 'cline', name: 'Cline', skillsDir: '.cline/skills', detectedDir: '.cline' },
  { key: 'codex', name: 'Codex', skillsDir: '.codex/skills', detectedDir: '.codex' },
  { key: 'cursor', name: 'Cursor', skillsDir: '.cursor/skills', detectedDir: '.cursor' },
  { key: 'deep_agents', name: 'Deep Agents', skillsDir: '.deepagents/skills', detectedDir: '.deepagents' },
  { key: 'gemini_cli', name: 'Gemini CLI', skillsDir: '.gemini/skills', detectedDir: '.gemini' },
  { key: 'claude_code', name: 'Claude Code', skillsDir: '.claude/skills', detectedDir: '.claude' },
  { key: 'augment', name: 'Augment', skillsDir: '.augment/skills', detectedDir: '.augment' },
  { key: 'openclaw', name: 'OpenClaw', skillsDir: 'skills', detectedDir: '' },
  { key: 'codebuddy', name: 'CodeBuddy', skillsDir: '.codebuddy/skills', detectedDir: '.codebuddy' },
  { key: 'commandcode', name: 'Command Code', skillsDir: '.commandcode/skills', detectedDir: '.commandcode' },
  { key: 'continue', name: 'Continue', skillsDir: '.continue/skills', detectedDir: '.continue' },
  { key: 'cortex', name: 'Cortex Code', skillsDir: '.cortex/skills', detectedDir: '.cortex' },
  { key: 'crush', name: 'Crush', skillsDir: '.crush/skills', detectedDir: '.crush' },
  { key: 'droid', name: 'Droid', skillsDir: '.factory/skills', detectedDir: '.factory' },
  { key: 'goose', name: 'Goose', skillsDir: '.config/goose/skills', detectedDir: '.config/goose' },
  { key: 'opencode', name: 'OpenCode', skillsDir: '.config/opencode/skills', detectedDir: '.config/opencode' },
  { key: 'iflow', name: 'iFlow CLI', skillsDir: '.iflow/skills', detectedDir: '.iflow' },
  { key: 'kilo_code', name: 'Kilo Code', skillsDir: '.kilocode/skills', detectedDir: '.kilocode' },
  { key: 'kiro', name: 'Kiro CLI', skillsDir: '.kiro/skills', detectedDir: '.kiro' },
  { key: 'kode', name: 'Kode', skillsDir: '.kode/skills', detectedDir: '.kode' },
  { key: 'mcpjam', name: 'MCPJam', skillsDir: '.mcpjam/skills', detectedDir: '.mcpjam' },
  { key: 'mistral_vibe', name: 'Mistral Vibe', skillsDir: '.vibe/skills', detectedDir: '.vibe' },
  { key: 'mux', name: 'Mux', skillsDir: '.mux/skills', detectedDir: '.mux' },
  { key: 'openhands', name: 'OpenHands', skillsDir: '.openhands/skills', detectedDir: '.openhands' },
  { key: 'pi', name: 'Pi', skillsDir: '.pi/skills', detectedDir: '.pi' },
  { key: 'qoder', name: 'Qoder', skillsDir: '.qoder/skills', detectedDir: '.qoder' },
  { key: 'qwen', name: 'Qwen Code', skillsDir: '.qwen/skills', detectedDir: '.qwen' },
  { key: 'roo_code', name: 'Roo Code', skillsDir: '.roo/skills', detectedDir: '.roo' },
  { key: 'trae', name: 'TRAE IDE', skillsDir: '.trae/skills', detectedDir: '.trae' },
  { key: 'windsurf', name: 'Windsurf', skillsDir: '.codeium/windsurf/skills', detectedDir: '.codeium/windsurf' },
  { key: 'zencoder', name: 'Zencoder', skillsDir: '.zencoder/skills', detectedDir: '.zencoder' },
  { key: 'neovate', name: 'Neovate', skillsDir: '.neovate/skills', detectedDir: '.neovate' },
  { key: 'pochi', name: 'Pochi', skillsDir: '.pochi/skills', detectedDir: '.pochi' },
  { key: 'junie', name: 'Junie', skillsDir: '.junie/skills', detectedDir: '.junie' },
];

function getHomeDir(): string {
  return os.homedir();
}

function resolvePath(relativePath: string): string {
  if (relativePath.startsWith('~')) {
    return path.join(getHomeDir(), relativePath.slice(1));
  }
  if (relativePath.startsWith('.')) {
    return path.join(getHomeDir(), relativePath);
  }
  if (!path.isAbsolute(relativePath)) {
    return path.join(getHomeDir(), relativePath);
  }
  return relativePath;
}

async function isDirectory(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function isSymlink(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.lstat(filePath);
    return stat.isSymbolicLink();
  } catch {
    return false;
  }
}

async function resolveSymlink(filePath: string): Promise<string> {
  return fs.readlink(filePath);
}

async function isInstalled(detectedDir: string): Promise<boolean> {
  const fullPath = resolvePath(detectedDir);
  return isDirectory(fullPath);
}

export async function scanTools(): Promise<Tool[]> {
  const results: Tool[] = [];

  for (const tool of DEFAULT_TOOLS) {
    const isUniversal = UNIVERSAL_TOOLS.has(tool.key);
    results.push({
      ...tool,
      detectedDir: resolvePath(tool.detectedDir),
      isInstalled: isUniversal ? true : await isInstalled(tool.detectedDir),
      isUniversal,
    });
  }

  return results;
}

function findMarkerFile(dirPath: string, files: string[]): string | null {
  for (const file of SKILL_MARKERS) {
    if (files.includes(file)) {
      return file;
    }
  }
  return null;
}

async function parseSkillMeta(skillPath: string, markerFile: string): Promise<{ name: string; description?: string }> {
  try {
    const content = await fs.readFile(path.join(skillPath, markerFile), 'utf-8');
    const { data } = matter(content);
    return {
      name: data.name || path.basename(skillPath),
      description: data.description,
    };
  } catch {
    return { name: path.basename(skillPath) };
  }
}

async function scanDirectory(dirPath: string, toolKey: string, toolName: string): Promise<Skill[]> {
  const skills: Skill[] = [];

  try {
    const exists = await isDirectory(dirPath);
    if (!exists) return skills;

    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      
      let actualPath = entryPath;
      
      if (entry.isSymbolicLink()) {
        const target = await resolveSymlink(entryPath);
        actualPath = path.resolve(dirPath, target);
      }
      
      const actualIsDir = await isDirectory(actualPath);
      if (!actualIsDir) continue;
      
      const files = await fs.readdir(actualPath);
      const markerFile = findMarkerFile(actualPath, files);

      if (markerFile) {
        const meta = await parseSkillMeta(actualPath, markerFile);
        const isSymlink = entry.isSymbolicLink();
        skills.push({
          id: Buffer.from(actualPath).toString('base64'),
          name: meta.name,
          description: meta.description,
          tool: toolKey,
          path: actualPath,
          markerFile,
          isSymlink,
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dirPath}:`, error);
  }

  return skills;
}

export async function scanSkills(tool?: string): Promise<Skill[]> {
  const results: Skill[] = [];

  if (tool) {
    console.log('[scanSkills] Looking for tool:', tool);
    const toolConfig = DEFAULT_TOOLS.find((t) => t.key === tool);
    console.log('[scanSkills] Tool config:', toolConfig);
    if (toolConfig) {
      const dirPath = resolvePath(toolConfig.skillsDir);
      console.log('[scanSkills] Scanning dir:', dirPath);
      return scanDirectory(dirPath, toolConfig.key, toolConfig.name);
    }
    return [];
  }

  const tools = await scanTools();
  for (const t of tools) {
    if (!t.isInstalled) continue;
    const dirPath = resolvePath(t.skillsDir);
    const skills = await scanDirectory(dirPath, t.key, t.name);
    results.push(...skills);
  }

  return results;
}

export async function deleteSkill(encodedPath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const skillPath = Buffer.from(encodedPath, 'base64').toString('utf-8');
    
    const stat = await fs.lstat(skillPath);
    
    if (stat.isSymbolicLink()) {
      await fs.unlink(skillPath);
      return { success: true };
    }
    
    await fs.rm(skillPath, { recursive: true, force: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function getSkillContent(encodedPath: string): Promise<{ content: string; path: string } | null> {
  try {
    const skillPath = Buffer.from(encodedPath, 'base64').toString('utf-8');
    const exists = await fs.stat(skillPath);
    if (!exists.isDirectory()) return null;

    const files = await fs.readdir(skillPath);
    const markerFile = findMarkerFile(skillPath, files);
    if (!markerFile) return null;

    const content = await fs.readFile(path.join(skillPath, markerFile), 'utf-8');
    return { content, path: skillPath };
  } catch {
    return null;
  }
}

const foldersFile = path.join(getHomeDir(), '.skills-manager-web', 'folders.json');

async function ensureConfigDir(): Promise<void> {
  const dir = path.dirname(foldersFile);
  if (!(await isDirectory(dir))) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function loadFolders(): Promise<string[]> {
  try {
    await ensureConfigDir();
    const content = await fs.readFile(foldersFile, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function saveFolders(folders: string[]): Promise<void> {
  await ensureConfigDir();
  await fs.writeFile(foldersFile, JSON.stringify(folders, null, 2));
}

export async function getFolders(): Promise<string[]> {
  return loadFolders();
}

export async function addFolder(folderPath: string): Promise<string[]> {
  const folders = await loadFolders();
  const resolved = resolvePath(folderPath);
  if (!folders.includes(resolved)) {
    folders.push(resolved);
    await saveFolders(folders);
  }
  return folders;
}

export async function removeFolder(folderPath: string): Promise<string[]> {
  const folders = await loadFolders();
  const filtered = folders.filter((f) => f !== folderPath);
  await saveFolders(filtered);
  return filtered;
}
