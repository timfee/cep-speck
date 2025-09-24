"use client";

import { Lightbulb, Target, Users, Clock } from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CodeEditor } from "@/components/ui/code-editor";

interface IdeaCaptureStepProps {
  prompt: string;
  onChange: (prompt: string) => void;
}

export function IdeaCaptureStep({ prompt, onChange }: IdeaCaptureStepProps) {
  const wordCount = prompt
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const characterCount = prompt.length;

  const prompts = [
    {
      icon: Target,
      title: "Project Objective",
      prompt: "What problem does this product solve?",
    },
    {
      icon: Users,
      title: "Target Users",
      prompt: "Who will use this product?",
    },
    {
      icon: Lightbulb,
      title: "Key Features",
      prompt: "What are the main features or capabilities?",
    },
    {
      icon: Clock,
      title: "Timeline",
      prompt: "What's the expected timeline or urgency?",
    },
  ];

  const handlePromptClick = (promptText: string) => {
    const currentPrompt = prompt.trim();
    if (currentPrompt && !currentPrompt.endsWith("\n")) {
      onChange(currentPrompt + "\n\n" + promptText + ": ");
    } else {
      onChange(currentPrompt + promptText + ": ");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Describe Your Product Idea</h2>
        <p className="text-muted-foreground">
          Tell us about your product concept. The more detail you provide, the
          better we can structure your PRD.
        </p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Product Description</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {wordCount} words
            </Badge>
            <Badge variant="outline" className="text-xs">
              {characterCount} characters
            </Badge>
          </div>
        </div>

        <CodeEditor
          value={prompt}
          onChange={onChange}
          title="Product Concept"
          placeholder="Describe your product idea here...&#10;&#10;For example:&#10;Project: Smart Document Assistant&#10;Target Users: Knowledge workers and professionals&#10;Objective: AI-powered document analysis and insight generation&#10;Key Features: Document summarization, Q&A, insights extraction&#10;Timeline: MVP in 3 months"
          copyButton={true}
          showWordCount={false}
          maxWords={500}
          rows={12}
          className="min-h-[300px]"
        />

        {prompt.trim().length < 10 && (
          <div className="text-sm text-muted-foreground bg-amber-50 p-3 rounded-lg border border-amber-200">
            💡 Tip: Provide at least a few sentences to get the best section
            suggestions.
          </div>
        )}
      </Card>

      {/* Guided prompts */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          Need help getting started?
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Click any prompt below to add it to your description:
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          {prompts.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all"
                onClick={() => handlePromptClick(item.prompt)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">{item.prompt}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Progress indicators */}
      {wordCount > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
            {wordCount >= 20 ? "✅" : "⏳"}
            <span>
              {wordCount >= 20
                ? "Great! You have enough detail to proceed."
                : `Add ${20 - wordCount} more words for better results.`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
