import React from 'react';

import { Button } from '@/components/ui/button';
import { useAgenticWorkflow } from '@/hooks/useAgenticWorkflow';
import type { AgenticWorkflowState } from '@/hooks/useAgenticWorkflow';
import type { StructuredOutline } from '@/lib/agents/types';

interface AgenticPrdWizardProps {
  onTraditionalMode: () => void;
}

export function AgenticPrdWizard({ onTraditionalMode }: AgenticPrdWizardProps) {
  const { state, setBrief, setOutline, generateOutline, generateDraft, resetWorkflow } = useAgenticWorkflow();

  const handleBriefSubmit = async () => {
    try {
      await generateOutline();
    } catch (error) {
      console.error('Failed to generate outline:', error);
    }
  };

  const handleOutlineEdit = (outline: StructuredOutline) => {
    setOutline(outline);
  };

  const handleGenerateDraft = async () => {
    try {
      await generateDraft();
    } catch (error) {
      console.error('Failed to generate draft:', error);
    }
  };

  const renderPhaseContent = () => {
    switch (state.phase) {
      case 'idea':
        return <IdeaPhase state={state} setBrief={setBrief} onSubmit={handleBriefSubmit} onTraditionalMode={onTraditionalMode} />;
      case 'outline':
        return <OutlinePhase state={state} onEdit={handleOutlineEdit} onGenerate={handleGenerateDraft} onEditBrief={() => setBrief('')} />;
      case 'draft':
      case 'evaluating':
      case 'refining':
        return <DraftPhase state={state} />;
      case 'complete':
        return <CompletePhase state={state} onReset={resetWorkflow} />;
      case 'error':
        return <ErrorPhase state={state} onReset={resetWorkflow} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {renderPhaseContent()}
    </div>
  );
}

interface OutlineEditorProps {
  outline: StructuredOutline;
  onChange: (outline: StructuredOutline) => void;
  isLoading: boolean;
}

function OutlineEditor({ outline, onChange, isLoading }: OutlineEditorProps) {
  const updateSection = (index: number, field: 'title' | 'notes', value: string) => {
    const newSections = [...outline.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    onChange({ sections: newSections });
  };

  const addSection = () => {
    const newSection = {
      id: Date.now().toString(),
      title: 'New Section',
      notes: '',
    };
    onChange({ sections: [...outline.sections, newSection] });
  };

  const removeSection = (index: number) => {
    const newSections = outline.sections.filter((_, i) => i !== index);
    onChange({ sections: newSections });
  };

  return (
    <div className="space-y-3">
      {outline.sections.map((section, index) => (
        <div key={section.id} className="border border-gray-200 rounded-md p-3">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={section.title}
              onChange={(e) => updateSection(index, 'title', e.target.value)}
              className="flex-1 font-medium border-none outline-none"
              disabled={isLoading}
            />
            <button
              onClick={() => removeSection(index)}
              className="text-red-500 hover:text-red-700 text-sm"
              disabled={isLoading}
            >
              Remove
            </button>
          </div>
          <textarea
            value={section.notes}
            onChange={(e) => updateSection(index, 'notes', e.target.value)}
            placeholder="Add notes or specific requirements for this section..."
            className="w-full h-16 p-2 text-sm border border-gray-200 rounded"
            disabled={isLoading}
          />
        </div>
      ))}
      <Button 
        onClick={addSection} 
        variant="outline" 
        size="sm"
        disabled={isLoading}
      >
        Add Section
      </Button>
    </div>
  );
}

// Phase Components

interface IdeaPhaseProps {
  state: AgenticWorkflowState;
  setBrief: (brief: string) => void;
  onSubmit: () => void;
  onTraditionalMode: () => void;
}

function IdeaPhase({ state, setBrief, onSubmit, onTraditionalMode }: IdeaPhaseProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Step 1: Describe Your Product Idea</h2>
      <p className="text-gray-600">
        Enter a brief description of your product concept. The AI will generate a structured outline for your PRD.
      </p>
      <textarea
        className="w-full h-32 p-3 border border-gray-300 rounded-md"
        placeholder="e.g., A tool to manage browser bookmarks for enterprise teams with advanced security and compliance features..."
        value={state.brief}
        onChange={(e) => setBrief(e.target.value)}
      />
      <div className="flex gap-2">
        <Button 
          onClick={onSubmit}
          disabled={!state.brief.trim() || state.isLoading}
        >
          {state.isLoading ? 'Generating Outline...' : 'Generate Outline'}
        </Button>
        <Button variant="outline" onClick={onTraditionalMode}>
          Use Traditional Mode
        </Button>
      </div>
    </div>
  );
}

interface OutlinePhaseProps {
  state: AgenticWorkflowState;
  onEdit: (outline: StructuredOutline) => void;
  onGenerate: () => void;
  onEditBrief: () => void;
}

function OutlinePhase({ state, onEdit, onGenerate, onEditBrief }: OutlinePhaseProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Step 2: Review & Edit Outline</h2>
      <p className="text-gray-600">
        The AI has generated a PRD outline. You can edit section titles and add notes before generating the draft.
      </p>
      {state.outline && (
        <OutlineEditor 
          outline={state.outline} 
          onChange={onEdit}
          isLoading={state.isLoading}
        />
      )}
      <div className="flex gap-2">
        <Button 
          onClick={onGenerate}
          disabled={!state.outline || state.isLoading}
        >
          {state.isLoading ? 'Generating Draft...' : 'Generate PRD Draft'}
        </Button>
        <Button variant="outline" onClick={onEditBrief}>
          Edit Brief
        </Button>
      </div>
    </div>
  );
}

function DraftPhase({ state }: { state: AgenticWorkflowState }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Step 3: PRD Generation</h2>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          {state.phase === 'draft' && <span>🔄 Generating initial draft...</span>}
          {state.phase === 'evaluating' && <span>🔍 Evaluating draft quality...</span>}
          {state.phase === 'refining' && <span>🩹 Refining draft (attempt {state.attempt})...</span>}
        </div>
      </div>
      <div className="border border-gray-300 rounded-md p-4 min-h-96 bg-gray-50">
        {state.draft ? (
          <pre className="whitespace-pre-wrap text-sm">{state.draft}</pre>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500">
            Generating your PRD...
          </div>
        )}
      </div>
      {state.evaluationIssues.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Issues Found (Refining...):</h3>
          <ul className="space-y-1 text-sm">
            {state.evaluationIssues.map((issue, index: number) => (
              <li key={index} className="text-orange-600">
                • {issue.section}: {issue.issue}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CompletePhase({ state, onReset }: { state: AgenticWorkflowState; onReset: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">✅ PRD Complete!</h2>
      <p className="text-green-600">
        Your PRD has been generated and validated. {state.evaluationIssues.length === 0 ? 'No issues found!' : `${state.evaluationIssues.length} remaining issues to review.`}
      </p>
      <div className="border border-gray-300 rounded-md p-4 min-h-96 bg-white">
        <pre className="whitespace-pre-wrap text-sm">{state.draft}</pre>
      </div>
      {state.evaluationIssues.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 text-orange-600">Remaining Issues:</h3>
          <ul className="space-y-2 text-sm">
            {state.evaluationIssues.map((issue, index: number) => (
              <li key={index} className="border-l-4 border-orange-400 pl-3">
                <strong>{issue.section}:</strong> {issue.issue}
                <br />
                <span className="text-gray-600">{issue.suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={onReset}>Start New PRD</Button>
        <Button variant="outline" onClick={() => navigator.clipboard.writeText(state.draft)}>
          Copy to Clipboard
        </Button>
      </div>
    </div>
  );
}

function ErrorPhase({ state, onReset }: { state: AgenticWorkflowState; onReset: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-red-600">❌ Error</h2>
      <p className="text-red-600">{state.error}</p>
      <div className="flex gap-2">
        <Button onClick={() => window.location.reload()}>Retry</Button>
        <Button variant="outline" onClick={onReset}>Start Over</Button>
      </div>
    </div>
  );
}