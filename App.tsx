import React, { useState, useMemo } from 'react';
import { AgentConfig, ProjectPhase, AIStyle, DocMapItem } from './types';
import { Card, Label, Input, TextArea, Button, TrashIcon, CopyIcon, DownloadIcon, ImportIcon } from './components/UIComponents';

const INITIAL_STATE: AgentConfig = {
  projectName: "My Awesome Project",
  mission: "Create a seamless user experience for...",
  northStar: "User data privacy > Feature velocity",
  phase: ProjectPhase.PROTOTYPE,
  languages: "TypeScript, Rust",
  frameworks: "React (Vite), Tailwind CSS",
  packageManager: "pnpm",
  styling: "Tailwind CSS only",
  stateManagement: "Zustand",
  backend: "Supabase",
  directoryStructure: "src/components (Atomic design), src/hooks, src/services",
  docMap: [{ id: '1', path: 'docs/architecture.md', description: 'System Overview' }],
  neverList: ["Commit .env files", "Use 'any' type", "Inline styles"],
  testingStrategy: "Unit tests for utilities, E2E for critical flows",
  aiStyle: AIStyle.EXPLANATORY
};

const App: React.FC = () => {
  const [config, setConfig] = useState<AgentConfig>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'markdown' | 'prompt' | 'helpers'>('markdown');
  const [newNeverItem, setNewNeverItem] = useState("");
  
  // State for the "Import JSON" textareas in the helper tab
  const [importInputs, setImportInputs] = useState<{[key: number]: string}>({});

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const addNeverItem = () => {
    if (!newNeverItem.trim()) return;
    setConfig(prev => ({ ...prev, neverList: [...prev.neverList, newNeverItem.trim()] }));
    setNewNeverItem("");
  };

  const removeNeverItem = (index: number) => {
    setConfig(prev => ({ ...prev, neverList: prev.neverList.filter((_, i) => i !== index) }));
  };

  const updateDocMap = (id: string, field: 'path' | 'description', value: string) => {
    setConfig(prev => ({
      ...prev,
      docMap: prev.docMap.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeDocMap = (id: string) => {
    setConfig(prev => ({ ...prev, docMap: prev.docMap.filter(item => item.id !== id) }));
  };

  // Logic to parse and merge pasted JSON
  const handleImportJson = (index: number) => {
    const rawInput = importInputs[index];
    if (!rawInput) return;

    // Clean markdown code blocks if present
    const cleanJson = rawInput.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const data = JSON.parse(cleanJson);
      setConfig(prev => {
        const next = { ...prev };
        
        // Merge known fields if they exist in the JSON
        if (data.languages) next.languages = data.languages;
        if (data.frameworks) next.frameworks = data.frameworks;
        if (data.packageManager) next.packageManager = data.packageManager;
        if (data.styling) next.styling = data.styling;
        if (data.stateManagement) next.stateManagement = data.stateManagement;
        if (data.backend) next.backend = data.backend;
        
        // Append never list items if they exist
        if (data.neverList && Array.isArray(data.neverList)) {
           // Merge unique items
           const combined = new Set([...next.neverList, ...data.neverList]);
           next.neverList = Array.from(combined);
        }

        if (data.mission) next.mission = data.mission;
        
        if (data.directoryStructure) next.directoryStructure = data.directoryStructure;
        
        if (data.docMap && Array.isArray(data.docMap)) {
            const newDocs = data.docMap.map((d: any, i: number) => ({
                id: Date.now().toString() + "-imported-" + i,
                path: d.path || "unknown/path",
                description: d.description || "No description provided"
            }));
            next.docMap = [...next.docMap, ...newDocs];
        }

        return next;
      });
      
      // Clear input after success
      setImportInputs(prev => ({ ...prev, [index]: '' }));
      alert("Successfully merged external LLM data!");
    } catch (e) {
      console.error(e);
      alert("Failed to parse JSON. Please ensure the response is valid JSON format.");
    }
  };

  // Markdown Generation Logic
  const generatedMarkdown = useMemo(() => {
    const isProto = config.phase === ProjectPhase.PROTOTYPE;
    
    return `# ${config.projectName} - AGENTS.md

> **⚠️ SYSTEM CONTEXT FILE**
> This file governs the behavior of AI agents (Cursor, Copilot, Windsurf) within this repository.

## 1. Project Identity & Mission
**Goal:** ${config.mission}
**North Star:** ${config.northStar}

## 2. Status & Stability
**Phase:** ${isProto ? '🌱 PROTOTYPE' : '🌳 PRODUCTION'}
**Breaking Changes:** ${isProto ? '✅ ALLOWED (Improve architecture freely)' : '⛔ FORBIDDEN (Strict backward compatibility)'}
**Refactoring Policy:** ${isProto ? 'Aggressive refactoring encouraged.' : 'Conservative. Discuss before large changes.'}

## 3. Tech Stack & Architecture
- **Languages:** ${config.languages}
- **Frameworks:** ${config.frameworks}
- **Package Manager:** ${config.packageManager}
- **Styling:** ${config.styling}
- **State Management:** ${config.stateManagement}
- **Backend/Services:** ${config.backend}

## 4. Project Structure
**Key Directories:**
\`\`\`
${config.directoryStructure}
\`\`\`

**Context Map:**
${config.docMap.map(d => `- \`${d.path}\`: ${d.description}`).join('\n')}

## 5. Rules of Engagement
### ⛔ The NEVER List
${config.neverList.map(item => `- **NEVER** ${item}`).join('\n')}
${!isProto ? '- **NEVER** Change database schemas without migrations\n- **NEVER** Break public API contracts' : ''}

### Testing & Quality
- **Strategy:** ${config.testingStrategy}
- **Mocking:** Avoid mocks unless strictly necessary. Favor real integrations to prevent "testing the mocks".

## 6. Interaction Style
**Preferred Tone:** ${config.aiStyle === AIStyle.TERSE ? 'Terse (Code only, minimal explanation)' : config.aiStyle === AIStyle.SOCRATIC ? 'Socratic (Guide me, don\'t just solve)' : 'Explanatory (Teach me while coding)'}
`;
  }, [config]);

  const systemPrompt = useMemo(() => {
    return `You are a senior engineer working on "${config.projectName}".
    
CONTEXT:
${generatedMarkdown}

INSTRUCTIONS:
1. Read the AGENTS.md file content above carefully.
2. Adhere strictly to the "North Star" principle.
3. If the user asks for code, ensure it matches the "${config.styling}" and "${config.languages}" preferences.
4. ${config.phase === ProjectPhase.PRODUCTION ? 'You are in PRODUCTION mode. Be extremely careful with breaking changes.' : 'You are in PROTOTYPE mode. Feel free to suggest architectural improvements.'}
`;
  }, [generatedMarkdown, config]);

  const helperPrompts = useMemo(() => [
    {
      title: "🚀 Tech Stack Advisor",
      description: "Ask an LLM to suggest the best stack. Returns JSON to auto-fill stack fields.",
      prompt: `I am starting a software project called "${config.projectName}".
Mission: ${config.mission}
Phase: ${config.phase}

Please recommend a complete technical stack best suited for this mission.
CRITICAL: Return ONLY a raw JSON object (no markdown, no explanations) with this exact structure:
{
  "languages": "...",
  "frameworks": "...",
  "packageManager": "...",
  "styling": "...",
  "stateManagement": "...",
  "backend": "..."
}`
    },
    {
      title: "🛡️ Safety Guardrails",
      description: "Generate specific 'NEVER' rules. Returns JSON to merge into your list.",
      prompt: `I am using the following stack:
- Languages: ${config.languages}
- Frameworks: ${config.frameworks}
- State Mgmt: ${config.stateManagement}

Please suggest 5-7 critical "NEVER" rules for an AI coding agent.
CRITICAL: Return ONLY a raw JSON object (no markdown) with this exact structure:
{
  "neverList": ["Never use 'any'", "Never mutate state directly", ...]
}`
    },
    {
      title: "✨ Mission Refinement",
      description: "Polishes your mission. Returns JSON to update the mission field.",
      prompt: `My project's mission is: "${config.mission}".
North Star: "${config.northStar}"

Please refine this mission statement to be concise yet inspiring for a developer team.
CRITICAL: Return ONLY a raw JSON object (no markdown) with this exact structure:
{
  "mission": "The single best refined mission statement here"
}`
    },
    {
      title: "🗺️ Architecture Map",
      description: "Suggests directory structure. Returns JSON to update structure and docs.",
      prompt: `I am building a ${config.phase} project using ${config.frameworks} and ${config.backend}.
      
Please suggest a robust, scalable directory structure.
CRITICAL: Return ONLY a raw JSON object (no markdown) with this exact structure:
{
  "directoryStructure": "src/components\\nsrc/hooks\\n...",
  "docMap": [
    { "path": "docs/architecture.md", "description": "High level overview" },
    { "path": "prisma/schema.prisma", "description": "Database schema" }
  ]
}`
    },
    {
      title: "📂 Key Files Detector",
      description: "Identifies important files AI agents should read. Returns JSON to add to context map.",
      prompt: `I am using the following tech stack:
- Languages: ${config.languages}
- Frameworks: ${config.frameworks}
- State Management: ${config.stateManagement}
- Backend: ${config.backend}

Based on this stack, suggest 3-5 key file paths that an AI coding agent should read to understand the architecture and conventions of this project.
CRITICAL: Return ONLY a raw JSON object (no markdown) with this exact structure:
{
  "docMap": [
    { "path": "src/types.ts", "description": "Type definitions and interfaces" },
    { "path": "prisma/schema.prisma", "description": "Database schema" }
  ]
}`
    }
  ], [config]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadFile = () => {
    const blob = new Blob([generatedMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AGENTS.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      {/* LEFT PANEL: CONFIGURATION */}
      <div className="w-full md:w-1/2 lg:w-[600px] xl:w-[700px] bg-background flex flex-col border-r border-border h-full">
        <div className="p-6 border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-500">
            Agent Context Architect
          </h1>
          <p className="text-textMuted text-sm mt-1">Build the brain for your AI coding assistants.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          
          {/* Identity Section */}
          <Card title="1. Project Identity">
            <div className="space-y-4">
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input name="projectName" value={config.projectName} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="mission">Mission Statement</Label>
                <TextArea name="mission" value={config.mission} onChange={handleInputChange} />
                <p className="text-xs text-textMuted mt-1">💡 Use the "LLM Helpers" tab to generate a refined mission statement</p>
              </div>
              <div>
                <Label htmlFor="northStar">North Star Principle (Tie-breaker)</Label>
                <Input name="northStar" value={config.northStar} onChange={handleInputChange} placeholder="e.g. Speed > Features" />
              </div>
            </div>
          </Card>

          {/* Phase Section */}
          <Card title="2. Phase & Stability">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setConfig(prev => ({ ...prev, phase: ProjectPhase.PROTOTYPE }))}
                className={`p-4 rounded-xl border text-center transition-all ${
                  config.phase === ProjectPhase.PROTOTYPE 
                    ? 'bg-green-500/10 border-green-500 text-green-400' 
                    : 'bg-surfaceHighlight border-border text-textMuted hover:border-textMuted'
                }`}
              >
                <div className="text-2xl mb-2">🌱</div>
                <div className="font-bold text-sm">Prototype</div>
                <div className="text-xs opacity-70 mt-1">Breaking changes OK</div>
              </button>
              <button
                onClick={() => setConfig(prev => ({ ...prev, phase: ProjectPhase.PRODUCTION }))}
                className={`p-4 rounded-xl border text-center transition-all ${
                  config.phase === ProjectPhase.PRODUCTION 
                    ? 'bg-red-500/10 border-red-500 text-red-400' 
                    : 'bg-surfaceHighlight border-border text-textMuted hover:border-textMuted'
                }`}
              >
                <div className="text-2xl mb-2">🌳</div>
                <div className="font-bold text-sm">Production</div>
                <div className="text-xs opacity-70 mt-1">Stability First</div>
              </button>
            </div>
            
            <div className="mt-4">
               <Label>AI Persona Style</Label>
               <select 
                  name="aiStyle"
                  value={config.aiStyle}
                  onChange={handleInputChange}
                  className="w-full bg-surfaceHighlight border border-border rounded-lg px-3 py-2.5 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
               >
                  <option value={AIStyle.TERSE}>Terse (Code only)</option>
                  <option value={AIStyle.EXPLANATORY}>Explanatory (Standard)</option>
                  <option value={AIStyle.SOCRATIC}>Socratic (Teaching)</option>
               </select>
            </div>
          </Card>

          {/* Tech Stack */}
          <Card title="3. Tech Stack">
            <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="languages">Languages</Label>
                    <Input name="languages" value={config.languages} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="frameworks">Frameworks</Label>
                    <Input name="frameworks" value={config.frameworks} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="styling">Styling</Label>
                    <Input name="styling" value={config.styling} onChange={handleInputChange} />
                  </div>
                   <div>
                    <Label htmlFor="stateManagement">State Management</Label>
                    <Input name="stateManagement" value={config.stateManagement} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="backend">Backend</Label>
                    <Input name="backend" value={config.backend} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="packageManager">Package Manager</Label>
                    <Input name="packageManager" value={config.packageManager} onChange={handleInputChange} />
                  </div>
               </div>
               <p className="text-xs text-textMuted mt-2">💡 Use the "LLM Helpers" tab to get AI suggestions for your tech stack</p>
            </div>
          </Card>

          {/* Documentation Map */}
          <Card title="4. Context Map (Key Files)">
            <div className="space-y-3">
              {config.docMap.map((doc) => (
                <div key={doc.id} className="flex gap-2 items-start">
                   <div className="flex-1 space-y-2">
                      <Input 
                        value={doc.path} 
                        onChange={(e) => updateDocMap(doc.id, 'path', e.target.value)} 
                        placeholder="Path (e.g. src/types.ts)"
                      />
                      <Input 
                        value={doc.description} 
                        onChange={(e) => updateDocMap(doc.id, 'description', e.target.value)} 
                        placeholder="Description"
                      />
                   </div>
                   <Button variant="icon" onClick={() => removeDocMap(doc.id)} className="text-red-400 mt-1">
                      <TrashIcon />
                   </Button>
                </div>
              ))}
              <Button 
                variant="ghost" 
                onClick={() => setConfig(prev => ({ ...prev, docMap: [...prev.docMap, { id: Date.now().toString(), path: '', description: '' }] }))}
                className="w-full border border-dashed border-border"
              >
                + Add File Path
              </Button>
              <div className="mt-4">
                <Label htmlFor="directoryStructure">Directory Structure Tree</Label>
                <TextArea 
                  name="directoryStructure" 
                  value={config.directoryStructure} 
                  onChange={handleInputChange} 
                  className="font-mono text-xs h-32" 
                />
              </div>
            </div>
          </Card>

          {/* Rules / Never List */}
          <Card title="5. Rules & Boundaries">
             <Label>The NEVER List (Strict Constraints)</Label>
             <div className="space-y-2 mb-4">
               {config.neverList.map((item, idx) => (
                 <div key={idx} className="flex items-center gap-2 bg-surfaceHighlight p-2 rounded-lg border border-border group">
                   <span className="text-red-400 text-xs font-bold px-2 py-0.5 bg-red-900/20 rounded">NEVER</span>
                   <span className="flex-1 text-sm">{item}</span>
                   <button onClick={() => removeNeverItem(idx)} className="opacity-0 group-hover:opacity-100 text-textMuted hover:text-red-400 transition-opacity">
                     <TrashIcon />
                   </button>
                 </div>
               ))}
             </div>
             <div className="flex gap-2">
               <Input 
                 value={newNeverItem} 
                 onChange={(e) => setNewNeverItem(e.target.value)} 
                 placeholder="e.g. Use class components" 
                 onKeyDown={(e) => e.key === 'Enter' && addNeverItem()}
               />
               <Button onClick={addNeverItem} variant="secondary">Add</Button>
             </div>
             
             <div className="mt-6">
                <Label htmlFor="testingStrategy">Testing Strategy</Label>
                <TextArea name="testingStrategy" value={config.testingStrategy} onChange={handleInputChange} />
             </div>
          </Card>
        </div>
      </div>

      {/* RIGHT PANEL: PREVIEW & TOOLS */}
      <div className="w-full md:w-1/2 lg:w-full bg-[#1e1e1e] flex flex-col h-full overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center border-b border-[#333] bg-[#252526]">
           <button 
             onClick={() => setActiveTab('markdown')}
             className={`px-6 py-3 text-sm font-medium border-r border-[#333] transition-colors ${activeTab === 'markdown' ? 'bg-[#1e1e1e] text-white border-t-2 border-t-primary' : 'text-gray-400 hover:bg-[#2d2d2d]'}`}
           >
             📄 AGENTS.md
           </button>
           <button 
             onClick={() => setActiveTab('prompt')}
             className={`px-6 py-3 text-sm font-medium border-r border-[#333] transition-colors ${activeTab === 'prompt' ? 'bg-[#1e1e1e] text-white border-t-2 border-t-primary' : 'text-gray-400 hover:bg-[#2d2d2d]'}`}
           >
             🤖 System Prompt
           </button>
           <button 
             onClick={() => setActiveTab('helpers')}
             className={`px-6 py-3 text-sm font-medium border-r border-[#333] transition-colors ${activeTab === 'helpers' ? 'bg-[#1e1e1e] text-white border-t-2 border-t-primary' : 'text-gray-400 hover:bg-[#2d2d2d]'}`}
           >
             🛠️ LLM Helpers
           </button>
           <div className="ml-auto px-4 flex gap-2">
             <Button variant="ghost" onClick={() => copyToClipboard(activeTab === 'markdown' ? generatedMarkdown : activeTab === 'prompt' ? systemPrompt : '')} title="Copy to Clipboard">
               <CopyIcon />
             </Button>
             {activeTab === 'markdown' && (
               <Button variant="primary" onClick={downloadFile} className="text-xs">
                 <DownloadIcon /> Download
               </Button>
             )}
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-[#1e1e1e] p-0 relative">
          {activeTab === 'markdown' && (
             <div className="p-8 max-w-4xl mx-auto">
               <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">{generatedMarkdown}</pre>
             </div>
          )}

          {activeTab === 'prompt' && (
             <div className="p-8 max-w-4xl mx-auto">
               <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mb-6 text-sm text-blue-200">
                 <strong>How to use:</strong> Paste this into Cursor's "Rules for AI" or as a System Prompt in your chat configuration.
               </div>
               <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">{systemPrompt}</pre>
             </div>
          )}

          {activeTab === 'helpers' && (
            <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
              {helperPrompts.map((helper, idx) => (
                <div key={idx} className="bg-[#252526] border border-[#333] rounded-xl p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        {helper.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">{helper.description}</p>
                    </div>
                    <Button variant="ghost" onClick={() => copyToClipboard(helper.prompt)}>
                      <CopyIcon /> Copy
                    </Button>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-3 mb-4 border border-white/5 flex-1 max-h-40 overflow-y-auto">
                    <pre className="text-xs text-gray-500 whitespace-pre-wrap font-mono">{helper.prompt}</pre>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5">
                    <Label>Import LLM Response (JSON)</Label>
                    <div className="flex gap-2">
                      <TextArea 
                        placeholder="Paste the JSON response here..." 
                        className="bg-black/20 border-white/10 h-20 font-mono text-xs"
                        value={importInputs[idx] || ''}
                        onChange={(e) => setImportInputs(prev => ({...prev, [idx]: e.target.value}))}
                      />
                      <Button variant="secondary" className="h-20" onClick={() => handleImportJson(idx)}>
                        <ImportIcon />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
