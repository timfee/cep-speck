"use client";

import { 
  FileText, 
  TrendingUp, 
  List, 
  Code, 
  BarChart, 
  Calendar, 
  Shield, 
  Users
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { SectionDefinition } from '@/types/workflow';
import type {
  LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  FileText,
  TrendingUp,
  List,
  Code,
  BarChart,
  Calendar,
  Shield,
  Users,
};

interface SectionTypeSelectorProps {
  sections: SectionDefinition[];
  selectedSections: string[];
  onChange: (selectedSections: string[]) => void;
  className?: string;
}

export function SectionTypeSelector({ 
  sections, 
  selectedSections, 
  onChange, 
  className 
}: SectionTypeSelectorProps) {
  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedSections, sectionId]);
    } else {
      onChange(selectedSections.filter(id => id !== sectionId));
    }
  };

  const totalEstimatedWords = sections
    .filter(section => selectedSections.includes(section.id))
    .reduce((total, section) => total + section.estimatedWords, 0);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select PRD Sections</h3>
        {selectedSections.length > 0 && (
          <Badge variant="outline" className="text-sm">
            {selectedSections.length} sections • ~{totalEstimatedWords} words
          </Badge>
        )}
      </div>
      
      <div className="grid gap-3 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = iconMap[section.icon] || FileText;
          const isSelected = selectedSections.includes(section.id);
          
          return (
            <Card
              key={section.id}
              className={cn(
                "relative cursor-pointer transition-all duration-200",
                "hover:shadow-md hover:border-primary/50",
                isSelected && "border-primary bg-primary/5 shadow-sm"
              )}
              onClick={() => handleSectionToggle(section.id, !isSelected)}
            >
              <div className="flex items-start space-x-3 p-4">
                <div className="flex-shrink-0">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    section.required 
                      ? "bg-blue-100 text-blue-600" 
                      : "bg-gray-100 text-gray-600"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">
                      {section.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {section.required && (
                        <Badge variant="default" className="text-xs">
                          Required
                        </Badge>
                      )}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSectionToggle(section.id, e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  
                  <p className="mt-1 text-xs text-muted-foreground">
                    {section.description}
                  </p>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      ~{section.estimatedWords} words
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      
      {selectedSections.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Select one or more sections to include in your PRD
          </p>
        </div>
      )}
    </div>
  );
}