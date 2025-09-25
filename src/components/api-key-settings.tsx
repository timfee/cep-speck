"use client";

import { Key, Settings } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type AIModel = "gemini-2.0-flash-thinking-exp" | "gemini-2.0-flash-exp" | "gemini-1.5-pro" | "gemini-1.5-flash";
type APIKeySource = "system" | "user";

interface APIKeySettingsProps {
  onSettingsChange?: (settings: {
    apiKeySource: APIKeySource;
    userApiKey?: string;
    model: AIModel;
  }) => void;
}

export function APIKeySettings({ onSettingsChange }: APIKeySettingsProps) {
  const [open, setOpen] = useState(false);
  const [apiKeySource, setApiKeySource] = useState<APIKeySource>("system");
  const [userApiKey, setUserApiKey] = useState("");
  const [model, setModel] = useState<AIModel>("gemini-2.0-flash-exp");

  const handleSave = () => {
    onSettingsChange?.({
      apiKeySource,
      userApiKey: apiKeySource === "user" ? userApiKey : undefined,
      model,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          API Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            AI Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your AI model and API key settings for PRD generation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Model Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">AI Model</Label>
            <RadioGroup value={model} onValueChange={(value) => setModel(value as AIModel)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gemini-2.0-flash-thinking-exp" id="thinking" />
                <Label htmlFor="thinking" className="text-sm">
                  Gemini 2.0 Flash Thinking (Experimental) - Best reasoning
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gemini-2.0-flash-exp" id="flash2" />
                <Label htmlFor="flash2" className="text-sm">
                  Gemini 2.0 Flash (Experimental) - Fast & capable
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gemini-1.5-pro" id="pro" />
                <Label htmlFor="pro" className="text-sm">
                  Gemini 1.5 Pro - Production stable
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gemini-1.5-flash" id="flash" />
                <Label htmlFor="flash" className="text-sm">
                  Gemini 1.5 Flash - Fastest
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* API Key Source */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">API Key Source</Label>
            <RadioGroup value={apiKeySource} onValueChange={(value) => setApiKeySource(value as APIKeySource)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="text-sm">
                  Use system API key (recommended)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="user" id="user" />
                <Label htmlFor="user" className="text-sm">
                  Bring your own API key
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* User API Key Input */}
          {apiKeySource === "user" && (
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-sm font-medium">
                Your Google AI API Key
              </Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Google AI API key..."
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Google AI Studio
                </a>
                . Your key is stored locally and never sent to our servers.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={apiKeySource === "user" && !userApiKey.trim()}
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}