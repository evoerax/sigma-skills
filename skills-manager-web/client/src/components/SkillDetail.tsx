import { useState, useEffect } from 'react';
import type { Skill, SkillContent } from '../types';
import { fetchSkillContent, deleteSkill } from '../api';
import { X, FileText, Copy, Check, Trash2, GitBranch, AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  skill: Skill;
  onClose: () => void;
  onDeleted: () => void;
}

export default function SkillDetail({ skill, onClose, onDeleted }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadContent();
  }, [skill.id]);

  async function loadContent() {
    setLoading(true);
    try {
      const data: SkillContent = await fetchSkillContent(skill.id);
      setContent(data?.content || null);
    } catch (err) {
      console.error('Failed to load content:', err);
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const result = await deleteSkill(skill.id);
      if (result.success) {
        onDeleted();
        onClose();
      } else {
        alert(`Failed to delete: ${result.error}`);
      }
    } catch (err) {
      console.error('Failed to delete skill:', err);
      alert('Failed to delete skill');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="flex-1 bg-gray-50 flex flex-col">
      <div className="p-4 bg-white border-b flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900">{skill.name}</h2>
            {skill.isSymlink && (
              <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                <GitBranch className="w-3 h-3" />
                Symlink
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1 truncate">{skill.path}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            disabled={!content}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            title="Copy content"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Copy className="w-5 h-5 text-gray-500" />
            )}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 hover:bg-red-50 rounded-lg text-red-500"
            title="Delete skill"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-gray-400" />
          </div>
        ) : content ? (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
              {content}
            </pre>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p>No content available</p>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[400px] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Skill</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                <strong>{skill.name}</strong>
              </p>
              <p className="text-xs text-gray-500 truncate mt-1">{skill.path}</p>
              {skill.isSymlink && (
                <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  This is a symlink - only the link will be removed, not the source
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
