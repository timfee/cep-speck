import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';

export interface KnowledgeFile {
  path: string;
  content: string;
  lastModified: Date;
}

export async function readKnowledgeDirectory(basePath: string = './knowledge'): Promise<KnowledgeFile[]> {
  const files: KnowledgeFile[] = [];
  
  try {
    await stat(basePath);
  } catch {
    return files;
  }
  
  try {
    const entries = await readdir(basePath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await readKnowledgeDirectory(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.txt'))) {
        try {
          const content = await readFile(fullPath, 'utf-8');
          const stats = await stat(fullPath);
          files.push({
            path: fullPath,
            content,
            lastModified: stats.mtime
          });
        } catch (error) {
          console.warn(`Failed to read knowledge file ${fullPath}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to read knowledge directory ${basePath}:`, error);
  }
  
  return files;
}

export function searchKnowledgeFiles(files: KnowledgeFile[], query: string): KnowledgeFile[] {
  const queryLower = query.toLowerCase();
  return files.filter(file => 
    file.content.toLowerCase().includes(queryLower) ||
    file.path.toLowerCase().includes(queryLower)
  );
}
