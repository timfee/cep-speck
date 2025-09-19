"use client";

import { X, Settings, ExternalLink } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyDialog({ isOpen, onClose }: ApiKeyDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Dialog */}
      <Card className={cn(
        "relative z-10 mx-4 max-w-md w-full",
        "border-amber-200 bg-amber-50 shadow-xl"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg text-amber-800">
                API Key Required
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-sm text-amber-700">
            <p className="mb-3">
              To use the PRD generation feature, you need to configure your Google Generative AI API key.
            </p>
            
            <div className="space-y-2">
              <p className="font-medium">Setup Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Create a <code className="bg-amber-100 px-1 rounded">.env.local</code> file in your project root</li>
                <li>Add your API key:</li>
              </ol>
              
              <div className="mt-2 p-3 bg-amber-100 rounded border text-xs font-mono">
                GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
              </div>
              
              <p className="mt-2">
                <strong>3.</strong> Restart the development server for changes to take effect
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-amber-200">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 hover:underline"
            >
              Get API Key
              <ExternalLink className="h-3 w-3" />
            </a>
            
            <Button
              onClick={onClose}
              variant="default"
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Got it
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}