"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStreamingGeneration } from '@/hooks/useStreamingGeneration';
import { APIKeySettings } from '@/components/api-key-settings';
import type { StreamFrame } from '@/lib/spec/types';

export function PRDGenerator() {
  const [spec, setSpec] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [validationIssues, setValidationIssues] = useState<Array<{
    id: string;
    severity: 'error' | 'warn';
    message: string;
    evidence?: string;
  }>>([]);

  const {
    isRunning,
    currentPhase,
    currentMessage,
    progress,
    error,
    result,
    generateWithStreaming,
    reset
  } = useStreamingGeneration({
    onFrame: (frame: StreamFrame) => {
      // Handle different frame types for real-time updates
      switch (frame.type) {
        case 'generation':
          // Content is now markdown text, not JSON
          if (frame.partial) {
            setGeneratedContent(frame.content);
          }
          break;
        case 'validation':
          setValidationIssues(frame.issues);
          break;
        case 'result':
          if (frame.success && frame.data) {
            setGeneratedContent(frame.data);
          }
          break;
      }
    },
    onComplete: (result) => {
      if (result) {
        setGeneratedContent(result);
      }
    },
    onError: (error) => {
      console.error('Generation failed:', error);
    }
  });

  const handleRun = async () => {
    if (!spec.trim()) return;
    
    setGeneratedContent('');
    setValidationIssues([]);
    await generateWithStreaming(spec);
  };

  const handleReset = () => {
    reset();
    setGeneratedContent('');
    setValidationIssues([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CEP Speck - PRD Generator</h1>
            <p className="text-sm text-gray-600">AI-powered Product Requirements Document generation with validation</p>
          </div>
          <APIKeySettings 
            onSettingsChange={(settings) => {
              // Handle API key settings
            }} 
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          
          {/* Left Panel - Spec Input */}
          <Card className="p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Spec Input</h2>
              <div className="flex gap-2">
                <Button
                  onClick={handleRun}
                  disabled={isRunning || !spec.trim()}
                  className="px-6"
                >
                  {isRunning ? 'Running...' : 'Run'}
                </Button>
                {(generatedContent || isRunning) && (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isRunning}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <label htmlFor="spec-input" className="text-sm font-medium mb-2">
                Product Specification
              </label>
              <Textarea
                id="spec-input"
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
                placeholder="Enter your product specification here...

Example:
Project: Smart Document Assistant
Target SKU: premium
Core Problem: Knowledge workers spend too much time reviewing documents

Key Features:
- AI-powered document summarization
- Natural language Q&A
- Multi-format support (PDF, Word, PowerPoint)

Timeline: MVP in 3 months"
                className="flex-1 min-h-[300px] resize-none font-mono text-sm"
              />
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <span>{spec.length} characters</span>
                <span>Provide project details, target SKU, problems, and features</span>
              </div>
            </div>

            {/* Validation Issues Panel */}
            {validationIssues.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Validation Issues</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {validationIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`p-2 rounded text-xs ${
                        issue.severity === 'error'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Badge
                          variant={issue.severity === 'error' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {issue.severity}
                        </Badge>
                        <span className="font-medium">{issue.message}</span>
                      </div>
                      {issue.evidence && (
                        <div className="mt-1 text-xs opacity-75">
                          Evidence: {issue.evidence}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Right Panel - Generated PRD */}
          <Card className="p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Generated PRD</h2>
              {isRunning && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>{currentMessage || 'Processing...'}</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {isRunning && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>{currentPhase && currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Content Area */}
            <div className="flex-1 flex flex-col">
              {error ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-red-500 mb-2">⚠️ Error</div>
                    <div className="text-sm text-gray-600">{error}</div>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="mt-4"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="flex-1 overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded border">
                    {generatedContent}
                  </pre>
                </div>
              ) : isRunning ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <div className="text-sm text-gray-600">
                      {currentMessage || 'Starting generation...'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Phase: {currentPhase || 'initializing'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📄</div>
                    <div className="text-sm">Generated PRD will appear here</div>
                    <div className="text-xs mt-1">Enter your spec and click "Run" to start</div>
                  </div>
                </div>
              )}
            </div>

            {generatedContent && !isRunning && (
              <div className="mt-4 flex justify-end border-t pt-4">
                <Button variant="outline" className="text-sm">
                  Export PRD
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          This system uses hybrid agentic workflow with modular validation for high-quality PRD generation
        </div>
      </div>
    </div>
  );
}