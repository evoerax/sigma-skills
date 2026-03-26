import { useState } from 'react';
import type { Tool } from '../types';
import { 
  Folder, ChevronDown, ChevronRight, Check, 
  HelpCircle, Info, Sparkles, List, X, ExternalLink, Link as LinkIcon
} from 'lucide-react';

interface Props {
  tools: Tool[];
  selectedTool: string | null;
  onSelectTool: (key: string | null) => void;
}

const COMMON_PLATFORMS = ['agents', 'claude_code', 'cursor', 'codex', 'openclaw_local', 'openclaw_workspace'];

const PLATFORM_HELP = `
## Universal Platforms

这些平台的 skills 会被自动同步到其他平台：

| Platform | Skills Directory |
|----------|-----------------|
| Amp | \`.config/agents/skills\` |
| Antigravity | \`.gemini/antigravity/global_skills\` |
| Cline | \`.cline/skills\` |
| Codex | \`.codex/skills\` |
| Cursor | \`.cursor/skills\` |
| Deep Agents | \`.deepagents/skills\` |
| Gemini CLI | \`.gemini/skills\` |
| GitHub Copilot | \`.copilot/skills\` |
| Kimi Code CLI | \`.kimi/skills\` |
| OpenCode | \`.config/opencode/skills\` |
| Warp | \`.warp/skills\` |

## Symbol Links (软链接)

Skills Manager 使用符号链接来共享 skills。当一个平台安装的 skill 是符号链接时，列表中会显示紫色标记。

### 查看符号链接

\`\`\`bash
# 查看目录中的所有符号链接
ls -l ~/.agents/skills/

# 查找所有符号链接
find ~/.agents/skills -maxdepth 1 -type l

# 查看符号链接的目标
readlink ~/.agents/skills/superpowers

# 查看符号链接状态（是否损坏）
ls -la ~/.agents/skills/ | grep ^l

# 检查链接是否有效
test -e ~/.agents/skills/superpowers && echo "OK" || echo "Broken"
\`\`\`

### 创建符号链接

\`\`\`bash
# 创建符号链接
ln -s /path/to/source /path/to/link

# 示例：在 Claude Code 中添加 skills
ln -s ~/.agents/skills/my-skill ~/.claude/skills/my-skill

# 创建相对路径的符号链接
cd ~/.claude/skills
ln -s ../../.agents/skills/my-skill my-skill
\`\`\`

### 修改符号链接

\`\`\`bash
# 删除旧链接，创建新链接
rm ~/.claude/skills/old-skill
ln -s ~/.agents/skills/new-skill ~/.claude/skills/new-skill

# 或直接覆盖（需要 -f）
ln -sf ~/.agents/skills/new-skill ~/.claude/skills/old-skill
\`\`\`

### 查看/编辑链接内容

\`\`\`bash
# 通过链接查看文件内容（只读）
cat ~/.claude/skills/my-skill/SKILL.md

# 编辑链接指向的内容（直接修改源文件）
vim ~/.agents/skills/my-skill/SKILL.md

# 如果需要独立副本，删除链接后复制
rm ~/.claude/skills/my-skill
cp -r ~/.agents/skills/my-skill ~/.claude/skills/my-skill
\`\`\`

### 删除符号链接

\`\`\`bash
# 删除符号链接（不是目标文件）
rm ~/.claude/skills/my-skill

# 安全删除：先确认是链接再删
[ -L ~/.claude/skills/my-skill ] && rm ~/.claude/skills/my-skill
\`\`\`

### 修复损坏的链接

\`\`\`bash
# 找到所有损坏的链接
find ~/.agents/skills -maxdepth 1 -type l ! -exec test -e {} \\; -print

# 修复：删除损坏的链接
rm ~/.claude/skills/broken-skill

# 重新创建正确的链接
ln -s ~/.agents/skills/actual-skill ~/.claude/skills/actual-skill
\`\`\`

### 符号链接特点

- **节省空间**：不复制文件，只创建链接
- **自动同步**：修改源文件，所有链接同时生效
- **依赖源文件**：删除源文件会破坏链接
- **跨平台**：Unix 系统原生支持

## Skills 识别规则

一个目录被识别为 skill 需要包含以下文件之一：
- \`SKILL.md\` (优先级最高)
- \`skill.md\`
- \`CLAUDE.md\`
- \`README.md\`
`;

export default function Sidebar({ tools, selectedTool, onSelectTool }: Props) {
  const [simpleMode, setSimpleMode] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['platforms', 'help']));
  const [showHelpModal, setShowHelpModal] = useState(false);

  const toggleMenu = (menu: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menu)) {
      newExpanded.delete(menu);
    } else {
      newExpanded.add(menu);
    }
    setExpandedMenus(newExpanded);
  };

  const isExpanded = (menu: string) => expandedMenus.has(menu);

  const universalList = ['amp', 'antigravity', 'cline', 'codex', 'cursor', 'deep_agents', 
    'gemini_cli', 'github_copilot', 'kimi_code', 'opencode', 'warp', 'openclaw_local', 'openclaw_workspace'];

  const filteredTools = simpleMode 
    ? tools.filter(t => COMMON_PLATFORMS.includes(t.key) || t.isUniversal)
    : tools;

  const universalTools = filteredTools.filter(t => universalList.includes(t.key) && t.isInstalled);
  const otherTools = filteredTools.filter(t => !universalList.includes(t.key) || !t.isInstalled);
  const installedOtherTools = otherTools.filter(t => t.isInstalled && !t.isUniversal);
  const uninstalledOtherTools = otherTools.filter(t => !t.isInstalled && !t.isUniversal);

  return (
    <div className="w-72 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          Skills Manager
        </h1>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setSimpleMode(!simpleMode)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              simpleMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {simpleMode ? <Sparkles className="w-4 h-4" /> : <List className="w-4 h-4" />}
            {simpleMode ? 'Simple Mode' : 'Full Mode'}
          </button>
        </div>
        {simpleMode && (
          <p className="text-xs text-gray-400 mt-2">
            Universal, Claude Code, Cursor, Codex, OpenClaw Local, OpenClaw Workspace
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <button
            onClick={() => onSelectTool(null)}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
              selectedTool === null ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              All Skills
            </span>
            <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
              {tools.length}
            </span>
          </button>
        </div>

        <div className="px-2 py-1">
          <button
            onClick={() => toggleMenu('platforms')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800 rounded-lg"
          >
            {isExpanded('platforms') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            Platforms
          </button>

          {isExpanded('platforms') && (
            <div className="ml-2 mt-1 space-y-1">
              <button
                onClick={() => onSelectTool('agents')}
                className={`w-full text-left pl-8 pr-3 py-1.5 rounded text-sm flex items-center justify-between gap-2 ${
                  selectedTool === 'agents' ? 'bg-blue-600 text-white' : 'hover:bg-gray-800'
                }`}
              >
                <span>Universal</span>
                <span className="text-xs opacity-70">.agents/skills</span>
              </button>
              
              {universalTools.map((tool) => (
                <button
                  key={tool.key}
                  onClick={() => onSelectTool(tool.key)}
                  className={`w-full text-left pl-8 pr-3 py-1.5 rounded text-sm flex items-center justify-between gap-2 ${
                    selectedTool === tool.key ? 'bg-blue-600 text-white' : 'hover:bg-gray-800'
                  }`}
                >
                  <span>{tool.name}</span>
                  <span className="text-xs opacity-70">{tool.skillsDir}</span>
                </button>
              ))}

              {!simpleMode && (
                <>
                  <div className="px-8 py-2 text-xs text-gray-500 font-medium mt-2">
                    Additional Agents
                  </div>
                  
                  {installedOtherTools.map((tool) => (
                    <button
                      key={tool.key}
                      onClick={() => onSelectTool(tool.key)}
                      className={`w-full text-left pl-8 pr-3 py-1.5 rounded text-sm flex items-center justify-between gap-2 ${
                        selectedTool === tool.key ? 'bg-blue-600 text-white' : 'hover:bg-gray-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        {tool.name}
                      </span>
                      <span className="text-xs opacity-70">{tool.skillsDir}</span>
                    </button>
                  ))}

                  {uninstalledOtherTools.length > 0 && (
                    <>
                      <div className="px-8 py-2 text-xs text-gray-500 font-medium mt-2">
                        Not Installed
                      </div>
                      {uninstalledOtherTools.map((tool) => (
                        <div
                          key={tool.key}
                          className="pl-8 pr-3 py-1.5 rounded text-sm text-gray-500 flex items-center justify-between gap-2"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 border border-gray-500 rounded-full" />
                            {tool.name}
                          </span>
                          <span className="text-xs">{tool.skillsDir}</span>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="px-2 py-1 border-t border-gray-800 mt-2">
          <button
            onClick={() => toggleMenu('help')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800 rounded-lg"
          >
            {isExpanded('help') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            Help
          </button>

          {isExpanded('help') && (
            <div className="ml-2 mt-1 space-y-1">
              <button
                onClick={() => setShowHelpModal(true)}
                className="w-full text-left pl-8 pr-3 py-1.5 rounded text-sm hover:bg-gray-800 flex items-center gap-2"
              >
                <Info className="w-4 h-4" />
                Platform Description
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>{tools.length} platforms</span>
          <span>{simpleMode ? 'Simple' : 'Full'}</span>
        </div>
      </div>

      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowHelpModal(false)}>
          <div 
            className="bg-gray-800 rounded-lg w-[600px] max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Platform & Symlink Guide
              </h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="prose prose-invert prose-sm max-w-none">
                {PLATFORM_HELP.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-lg font-semibold mt-4 mb-2 text-blue-400">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-md font-medium mt-3 mb-2 text-gray-300">{line.replace('### ', '')}</h3>;
                  }
                  if (line.startsWith('| ')) {
                    return <p key={i} className="font-mono text-xs my-1 text-gray-400">{line}</p>;
                  }
                  if (line.startsWith('```')) {
                    return null;
                  }
                  if (line.trim() === '') {
                    return <br key={i} />;
                  }
                  return <p key={i} className="text-sm text-gray-300 my-1">{line}</p>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
