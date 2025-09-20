#!/bin/bash

# Array of file renames (old_name:new_name)
declare -a renames=(
    "src/components/error/ApiKeyDialog.tsx:src/components/error/api-key-dialog.tsx"
    "src/components/error/ErrorDisplay.tsx:src/components/error/error-display.tsx"
    "src/components/error/ErrorTerminal.tsx:src/components/error/error-terminal.tsx"
    "src/components/error/ErrorViewComponents.tsx:src/components/error/error-view-components.tsx"
    "src/components/workflow/AgenticPrdWizard.tsx:src/components/workflow/agentic-prd-wizard.tsx"
    "src/components/workflow/OutlineEditor.tsx:src/components/workflow/outline-editor.tsx"
    "src/components/workflow/ProgressTimeline.tsx:src/components/workflow/progress-timeline.tsx"
    "src/components/workflow/SectionTypeSelector.tsx:src/components/workflow/section-type-selector.tsx"
    "src/components/workflow/phases/CompletePhase.tsx:src/components/workflow/phases/complete-phase.tsx"
    "src/components/workflow/phases/DraftPhase.tsx:src/components/workflow/phases/draft-phase.tsx"
    "src/components/workflow/phases/ErrorPhase.tsx:src/components/workflow/phases/error-phase.tsx"
    "src/components/workflow/phases/IdeaPhase.tsx:src/components/workflow/phases/idea-phase.tsx"
    "src/components/workflow/phases/OutlinePhase.tsx:src/components/workflow/phases/outline-phase.tsx"
)

# Array of import updates (old_import:new_import)
declare -a import_updates=(
    "ApiKeyDialog:api-key-dialog"
    "ErrorDisplay:error-display"
    "ErrorTerminal:error-terminal"
    "ErrorViewComponents:error-view-components"
    "AgenticPrdWizard:agentic-prd-wizard"
    "OutlineEditor:outline-editor"
    "ProgressTimeline:progress-timeline"
    "SectionTypeSelector:section-type-selector"
    "CompletePhase:complete-phase"
    "DraftPhase:draft-phase"
    "ErrorPhase:error-phase"
    "IdeaPhase:idea-phase"
    "OutlinePhase:outline-phase"
)

echo "🔄 Starting file renames..."

# Rename files
for rename in "${renames[@]}"; do
    old_path="${rename%%:*}"
    new_path="${rename##*:}"
    
    if [ -f "$old_path" ]; then
        echo "  📁 Renaming: $old_path -> $new_path"
        mv "$old_path" "$new_path"
    else
        echo "  ❌ File not found: $old_path"
    fi
done

echo "📝 Updating imports in index files..."

# Update error/index.ts
sed -i 's/from "\.\/ApiKeyDialog"/from ".\/api-key-dialog"/g' src/components/error/index.ts
sed -i 's/from "\.\/ErrorDisplay"/from ".\/error-display"/g' src/components/error/index.ts
sed -i 's/from "\.\/ErrorTerminal"/from ".\/error-terminal"/g' src/components/error/index.ts
sed -i 's/from "\.\/ErrorViewComponents"/from ".\/error-view-components"/g' src/components/error/index.ts

# Update workflow/index.ts if it exists
if [ -f "src/components/workflow/index.ts" ]; then
    sed -i 's/from "\.\/AgenticPrdWizard"/from ".\/agentic-prd-wizard"/g' src/components/workflow/index.ts
    sed -i 's/from "\.\/OutlineEditor"/from ".\/outline-editor"/g' src/components/workflow/index.ts
    sed -i 's/from "\.\/ProgressTimeline"/from ".\/progress-timeline"/g' src/components/workflow/index.ts
    sed -i 's/from "\.\/SectionTypeSelector"/from ".\/section-type-selector"/g' src/components/workflow/index.ts
fi

echo "🔍 Finding and updating all import references..."

# Update all import references across the codebase
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "from.*components" | while read -r file; do
    echo "  📄 Updating imports in: $file"
    
    # Update component imports
    for update in "${import_updates[@]}"; do
        old_name="${update%%:*}"
        new_name="${update##*:}"
        
        # Update relative imports
        sed -i "s/from \"\.\/.*\/${old_name}\"/from \".\/&${new_name}\"/g" "$file"
        sed -i "s/from \"\.\/.*${old_name}\"/from \".\/&${new_name}\"/g" "$file"
        
        # Update absolute imports
        sed -i "s/from \"@\/components\/.*\/${old_name}\"/from \"@\/components\/&${new_name}\"/g" "$file"
    done
done

echo "✅ File renaming complete!"