"use client";

import { useState } from "react";

export interface SetupData {
  problemContext: string;
  type: string;
  title: string;
  description: string;
}

interface ScaffoldSetupProps {
  onGenerate: (data: SetupData) => void;
  setupData: SetupData | null;
  isGenerating: boolean;
}

export function ScaffoldSetup({
  onGenerate,
  setupData,
  isGenerating,
}: ScaffoldSetupProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<SetupData>({
    problemContext: "",
    type: "",
    title: "",
    description: "",
  });

  const showForm = !setupData || editing;

  const formData = editing && setupData ? { ...setupData, ...form } : form;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = editing && setupData ? formData : form;
    if (!data.type.trim() || !data.title.trim()) return;
    onGenerate(data);
    setEditing(false);
  };

  const handleEdit = () => {
    if (setupData) {
      setForm(setupData);
    }
    setEditing(true);
  };

  if (!showForm && setupData) {
    return (
      <div className="px-3 py-3 border-b border-foreground/10">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-foreground/10 text-foreground/50 font-medium">
                {setupData.type}
              </span>
              <span className="text-xs font-medium truncate">
                {setupData.title}
              </span>
            </div>
            {setupData.description && (
              <p className="text-[11px] text-foreground/40 line-clamp-2">
                {setupData.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleEdit}
              className="text-[10px] px-2 py-1 rounded bg-foreground/5 text-foreground/40 hover:text-foreground/60 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onGenerate(setupData)}
              disabled={isGenerating}
              className="text-[10px] px-2 py-1 rounded bg-foreground/5 text-foreground/40 hover:text-foreground/60 transition-colors disabled:opacity-30"
            >
              {isGenerating ? "..." : "Regenerate"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentForm = editing ? formData : form;

  return (
    <form onSubmit={handleSubmit} className="px-3 py-3 border-b border-foreground/10 space-y-2">
      <div className="text-[11px] font-medium text-foreground/50 mb-1">
        Scaffold Setup
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Type (e.g. decision-matrix)"
          value={currentForm.type}
          onChange={(e) =>
            setForm((f) => ({ ...f, type: e.target.value }))
          }
          className="text-xs px-2.5 py-1.5 rounded-md border border-foreground/10 bg-foreground/[0.02] placeholder:text-foreground/25 focus:border-foreground/20 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Title"
          value={currentForm.title}
          onChange={(e) =>
            setForm((f) => ({ ...f, title: e.target.value }))
          }
          className="text-xs px-2.5 py-1.5 rounded-md border border-foreground/10 bg-foreground/[0.02] placeholder:text-foreground/25 focus:border-foreground/20 focus:outline-none"
        />
      </div>
      <textarea
        placeholder="Description — what this scaffold should help with"
        value={currentForm.description}
        onChange={(e) =>
          setForm((f) => ({ ...f, description: e.target.value }))
        }
        rows={2}
        className="w-full text-xs px-2.5 py-1.5 rounded-md border border-foreground/10 bg-foreground/[0.02] placeholder:text-foreground/25 focus:border-foreground/20 focus:outline-none resize-none"
      />
      <textarea
        placeholder="Problem context — describe the problem this scaffold addresses"
        value={currentForm.problemContext}
        onChange={(e) =>
          setForm((f) => ({ ...f, problemContext: e.target.value }))
        }
        rows={3}
        className="w-full text-xs px-2.5 py-1.5 rounded-md border border-foreground/10 bg-foreground/[0.02] placeholder:text-foreground/25 focus:border-foreground/20 focus:outline-none resize-none"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isGenerating || !currentForm.type.trim() || !currentForm.title.trim()}
          className="text-xs px-3 py-1.5 rounded-md bg-foreground text-background hover:opacity-80 transition-opacity disabled:opacity-30"
        >
          {isGenerating ? "Generating..." : "Generate Scaffold"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-xs px-3 py-1.5 rounded-md border border-foreground/10 text-foreground/50 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
