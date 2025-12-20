import React, { useState, useMemo } from 'react';
import { AgentConfig, ProjectPhase, AIStyle, DocMapItem, ListItem, AdditionalResource, ShellCommand } from './types';
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
  aiStyle: AIStyle.EXPLANATORY,
  // New fields
  additionalResources: [],
  developmentPrinciples: [],
  preImplementationChecklist: [],
  aiWorkflowEnabled: false,
  llmOptimizedPatternsEnabled: false,
  fixPreExistingIssuesEnabled: false,
  shellCommands: [],
  mistakesToAvoid: [],
  questionsToAsk: [],
  blindSpots: []
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

  // Helper functions for list item management
  const addListItem = (field: 'developmentPrinciples' | 'preImplementationChecklist' | 'mistakesToAvoid' | 'questionsToAsk' | 'blindSpots', text: string) => {
    if (!text.trim()) return;
    const newItem: ListItem = { id: Date.now().toString(), text: text.trim() };
    setConfig(prev => ({ ...prev, [field]: [...prev[field], newItem] }));
  };

  const removeListItem = (field: 'developmentPrinciples' | 'preImplementationChecklist' | 'mistakesToAvoid' | 'questionsToAsk' | 'blindSpots', id: string) => {
    setConfig(prev => ({ ...prev, [field]: prev[field].filter(item => item.id !== id) }));
  };

  const updateListItem = (field: 'developmentPrinciples' | 'preImplementationChecklist' | 'mistakesToAvoid' | 'questionsToAsk' | 'blindSpots', id: string, text: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: prev[field].map(item => item.id === id ? { ...item, text } : item)
    }));
  };

  // Shell commands management
  const addShellCommand = (command: string, description: string) => {
    if (!command.trim()) return;
    const newCmd: ShellCommand = { id: Date.now().toString(), command: command.trim(), description: description.trim() };
    setConfig(prev => ({ ...prev, shellCommands: [...prev.shellCommands, newCmd] }));
  };

  const removeShellCommand = (id: string) => {
    setConfig(prev => ({ ...prev, shellCommands: prev.shellCommands.filter(cmd => cmd.id !== id) }));
  };

  const updateShellCommand = (id: string, field: 'command' | 'description', value: string) => {
    setConfig(prev => ({
      ...prev,
      shellCommands: prev.shellCommands.map(cmd => cmd.id === id ? { ...cmd, [field]: value } : cmd)
    }));
  };

  // Additional resources management
  const addAdditionalResource = (title: string, path: string, description: string) => {
    if (!title.trim() || !path.trim()) return;
    const newRes: AdditionalResource = { id: Date.now().toString(), title: title.trim(), path: path.trim(), description: description.trim() };
    setConfig(prev => ({ ...prev, additionalResources: [...prev.additionalResources, newRes] }));
  };

  const removeAdditionalResource = (id: string) => {
    setConfig(prev => ({ ...prev, additionalResources: prev.additionalResources.filter(res => res.id !== id) }));
  };

  const updateAdditionalResource = (id: string, field: 'title' | 'path' | 'description', value: string) => {
    setConfig(prev => ({
      ...prev,
      additionalResources: prev.additionalResources.map(res => res.id === id ? { ...res, [field]: value } : res)
    }));
  };

  // State for new item inputs
  const [newInputs, setNewInputs] = useState<{[key: string]: string}>({});
  const [newShellCmd, setNewShellCmd] = useState({ command: '', description: '' });
  const [newResource, setNewResource] = useState({ title: '', path: '', description: '' });

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

        // Handle new list item types
        if (data.developmentPrinciples && Array.isArray(data.developmentPrinciples)) {
            const newItems = data.developmentPrinciples.map((text: string, i: number) => ({
                id: Date.now().toString() + "-principle-" + i,
                text: text
            }));
            next.developmentPrinciples = [...next.developmentPrinciples, ...newItems];
        }

        if (data.mistakesToAvoid && Array.isArray(data.mistakesToAvoid)) {
            const newItems = data.mistakesToAvoid.map((text: string, i: number) => ({
                id: Date.now().toString() + "-mistake-" + i,
                text: text
            }));
            next.mistakesToAvoid = [...next.mistakesToAvoid, ...newItems];
        }

        if (data.questionsToAsk && Array.isArray(data.questionsToAsk)) {
            const newItems = data.questionsToAsk.map((text: string, i: number) => ({
                id: Date.now().toString() + "-question-" + i,
                text: text
            }));
            next.questionsToAsk = [...next.questionsToAsk, ...newItems];
        }

        if (data.blindSpots && Array.isArray(data.blindSpots)) {
            const newItems = data.blindSpots.map((text: string, i: number) => ({
                id: Date.now().toString() + "-blindspot-" + i,
                text: text
            }));
            next.blindSpots = [...next.blindSpots, ...newItems];
        }

        if (data.preImplementationChecklist && Array.isArray(data.preImplementationChecklist)) {
            const newItems = data.preImplementationChecklist.map((text: string, i: number) => ({
                id: Date.now().toString() + "-checklist-" + i,
                text: text
            }));
            next.preImplementationChecklist = [...next.preImplementationChecklist, ...newItems];
        }

        if (data.shellCommands && Array.isArray(data.shellCommands)) {
            const newCmds = data.shellCommands.map((cmd: any, i: number) => ({
                id: Date.now().toString() + "-cmd-" + i,
                command: cmd.command || "",
                description: cmd.description || ""
            }));
            next.shellCommands = [...next.shellCommands, ...newCmds];
        }

        if (data.additionalResources && Array.isArray(data.additionalResources)) {
            const newRes = data.additionalResources.map((res: any, i: number) => ({
                id: Date.now().toString() + "-resource-" + i,
                title: res.title || "",
                path: res.path || "",
                description: res.description || ""
            }));
            next.additionalResources = [...next.additionalResources, ...newRes];
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
    
    // Build optional sections
    const additionalResourcesSection = config.additionalResources.length > 0 ? `
### Additional Resources
${config.additionalResources.map(r => `- **${r.title}**: See \`${r.path}\` ${r.description ? `for ${r.description}` : ''}`).join('\n')}
` : '';

    const developmentPrinciplesSection = config.developmentPrinciples.length > 0 ? `
## Development Principles
${config.developmentPrinciples.map(p => `- ✅ **${p.text}**`).join('\n')}
` : '';

    const preImplementationChecklistSection = config.preImplementationChecklist.length > 0 ? `
### Pre-Implementation Checklist
**Complete ALL items before writing code:**
${config.preImplementationChecklist.map(item => `- [ ] ${item.text}`).join('\n')}
` : '';

    const aiWorkflowSection = config.aiWorkflowEnabled ? `
## AI Assistant Workflow

**IMPORTANT**: AI assistants must follow this step-by-step approach:

### 1. Discovery Phase (ALWAYS do this first)
- **Read documentation completely** to understand the current priorities
- **Examine the existing codebase structure** using exploration commands
- **Study similar existing files** - look for patterns, naming conventions, and architectural decisions
- **Run the test suite** to understand current functionality
- **Check dependencies and configuration files**

### 2. Planning Phase (Before any implementation)
- **Create a detailed implementation plan** that explains:
  - Which files need to be created/modified
  - What existing patterns you'll follow
  - How your changes integrate with current architecture
  - What tests need to be added/updated
- **Identify potential breaking changes** and mitigation strategies
- **Plan your testing approach**

### 3. Implementation Phase
- **Start with tests** when adding new functionality (TDD approach)
- **Make small, incremental changes** - don't implement everything at once
- **Follow existing code patterns exactly**
- **Test continuously** - run relevant tests after each significant change

### 4. Verification Phase (MANDATORY)
- **Run the full test suite** - all tests must pass
- **Verify type checking** - no TypeScript errors
- **Test the actual functionality** - don't assume it works because tests pass
- **Check for integration issues** - ensure your changes work with existing features
` : '';

    const llmOptimizedPatternsSection = config.llmOptimizedPatternsEnabled ? `
## LLM-Optimized Code Patterns

**IMPORTANT**: This codebase should be optimized for LLM understanding and modification.

### Code Optimization Principles for LLMs

1. **Prefer Standard Library APIs Over Custom Abstractions**
   - Use standard APIs like \`Date.now()\`, \`.filter()\`, \`.map()\` instead of custom wrappers
   - Standard APIs are trained knowledge - LLMs understand them instantly
   - Avoid custom abstractions that require "mental mapping"

2. **When to Extract Functions (LLM-Optimized)**
   - Extract when logic is complex AND used multiple times
   - Extract when the function name clearly describes what it does
   - Don't extract simple one-liners
   - Don't create wrapper functions around standard APIs

3. **Duplication Guidelines**
   - Small duplications are OK for standard patterns
   - Large duplications should be extracted
   - Business logic should be centralized with named constants

4. **Token Efficiency**
   - Standard patterns require less cognitive load than custom abstractions
   - Shorter code isn't always better - clarity matters more
` : '';

    const fixPreExistingIssuesSection = config.fixPreExistingIssuesEnabled ? `
## Fix Pre-existing Issues When in Context

**IMPORTANT**: When working in an area of the codebase, you should proactively identify and fix pre-existing issues.

### Guidelines for Contextual Improvements

1. **Identify Issues Within Your Working Area**
   - Look for obvious bugs, code smells, or anti-patterns in files you're already modifying
   - Notice flaky tests in the test suite you're running
   - Spot performance issues in code paths you're executing
   - Identify outdated patterns or deprecated API usage

2. **Scope Appropriately**
   - Only fix issues directly related to the area you're working in
   - Don't expand scope to unrelated parts of the codebase
   - Keep fixes small and focused to avoid introducing new issues
   - If you find major issues outside your scope, document them instead of fixing

3. **Quality Bar for Fixes**
   - Fix must be low-risk and obvious (clear bugs, typos, dead code)
   - Fix must not require significant refactoring
   - Fix must not change public APIs or behavior users depend on
   - Must have test coverage or add tests when fixing bugs

4. **Document Your Improvements**
   - Clearly separate scope-required changes from opportunistic fixes
   - Explain why each fix is safe and beneficial
   - Note any risks or assumptions in your fixes

### Examples of Good Opportunistic Fixes

✅ **DO FIX:**
- Typos in comments or error messages
- Unused imports or variables
- Deprecated API usage with clear migration path
- Missing error handling in code you're already touching
- Flaky tests that are failing in your test runs
- Performance issues in hot paths you're modifying
- Inconsistent formatting in files you're editing

❌ **DON'T FIX:**
- Issues in completely unrelated files
- Large-scale refactorings
- Changes that require extensive testing
- Modifications to stable, working code outside your task
- Changes that could affect many users or systems

**Remember**: The goal is to leave the code better than you found it, not perfect. Perfect is the enemy of done.
` : '';

    const shellCommandsSection = config.shellCommands.length > 0 ? `
## Commands to Run

\`\`\`bash
${config.shellCommands.map(cmd => `# ${cmd.description}\n${cmd.command}`).join('\n\n')}
\`\`\`
` : '';

    const mistakesToAvoidSection = config.mistakesToAvoid.length > 0 ? `
## Common AI Assistant Mistakes to Avoid

${config.mistakesToAvoid.map((m, i) => `${i + 1}. **${m.text}**`).join('\n')}
` : '';

    const questionsToAskSection = config.questionsToAsk.length > 0 ? `
## Questions AI Assistants Should Ask

Before starting implementation, consider:
${config.questionsToAsk.map(q => `- "${q.text}"`).join('\n')}
` : '';

    const blindSpotsSection = config.blindSpots.length > 0 ? `
## AI Assistant Blind Spots and Mitigations

${config.blindSpots.map(b => `- **${b.text}**`).join('\n')}
` : '';
    
    return `# ${config.projectName} - AGENTS.md

> **⚠️ SYSTEM CONTEXT FILE**
> This file governs the behavior of AI agents (Cursor, Copilot, Windsurf) within this repository.
${additionalResourcesSection ? '\n' + additionalResourcesSection : ''}${developmentPrinciplesSection ? '\n' + developmentPrinciplesSection : ''}
## 1. Project Identity & Mission
**Goal:** ${config.mission}
**North Star:** ${config.northStar}
${preImplementationChecklistSection ? '\n' + preImplementationChecklistSection : ''}
## 2. Status & Stability
**Phase:** ${isProto ? '🌱 PROTOTYPE' : '🌳 PRODUCTION'}
**Breaking Changes:** ${isProto ? '✅ ALLOWED (Improve architecture freely)' : '⛔ FORBIDDEN (Strict backward compatibility)'}
**Refactoring Policy:** ${isProto ? 'Aggressive refactoring encouraged.' : 'Conservative. Discuss before large changes.'}
${aiWorkflowSection ? '\n' + aiWorkflowSection : ''}
## 3. Tech Stack & Architecture
- **Languages:** ${config.languages}
- **Frameworks:** ${config.frameworks}
- **Package Manager:** ${config.packageManager}
- **Styling:** ${config.styling}
- **State Management:** ${config.stateManagement}
- **Backend/Services:** ${config.backend}
${llmOptimizedPatternsSection ? '\n' + llmOptimizedPatternsSection : ''}${fixPreExistingIssuesSection ? '\n' + fixPreExistingIssuesSection : ''}
## 4. Project Structure
**Key Directories:**
\`\`\`
${config.directoryStructure}
\`\`\`

**Context Map:**
${config.docMap.map(d => `- \`${d.path}\`: ${d.description}`).join('\n')}
${shellCommandsSection ? '\n' + shellCommandsSection : ''}
## 5. Rules of Engagement
### ⛔ The NEVER List
${config.neverList.map(item => `- **NEVER** ${item}`).join('\n')}
${!isProto ? '- **NEVER** Change database schemas without migrations\n- **NEVER** Break public API contracts' : ''}

### Testing & Quality
- **Strategy:** ${config.testingStrategy}
- **Mocking:** Avoid mocks unless strictly necessary. Favor real integrations to prevent "testing the mocks".
${mistakesToAvoidSection ? '\n' + mistakesToAvoidSection : ''}${questionsToAskSection ? '\n' + questionsToAskSection : ''}${blindSpotsSection ? '\n' + blindSpotsSection : ''}
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
    },
    {
      title: "🎯 Development Principles Generator",
      description: "Generate core development principles. Returns JSON to add to principles list.",
      prompt: `I am building "${config.projectName}" with the following mission:
${config.mission}

North Star: ${config.northStar}
Phase: ${config.phase}

Please suggest 5-7 core development principles that should guide all development decisions.
CRITICAL: Return ONLY a raw JSON object (no markdown) with this exact structure:
{
  "developmentPrinciples": ["Zero downtime deployments", "Security first", "User experience over features", ...]
}`
    },
    {
      title: "⚠️ AI Mistakes Generator",
      description: "Generate common mistakes AI should avoid. Returns JSON to add to mistakes list.",
      prompt: `I am using the following stack:
- Languages: ${config.languages}
- Frameworks: ${config.frameworks}
- Backend: ${config.backend}

Please suggest 5-7 common mistakes AI assistants make when working with this tech stack.
CRITICAL: Return ONLY a raw JSON object (no markdown) with this exact structure:
{
  "mistakesToAvoid": ["Don't implement without understanding existing patterns", "Don't skip the discovery phase", ...]
}`
    },
    {
      title: "❓ Questions Generator",
      description: "Generate self-check questions for AI. Returns JSON to add to questions list.",
      prompt: `I am building a ${config.phase} project called "${config.projectName}".

Please suggest 5-7 questions an AI assistant should ask itself before starting any implementation.
CRITICAL: Return ONLY a raw JSON object (no markdown) with this exact structure:
{
  "questionsToAsk": ["What similar functionality already exists?", "What existing tests can guide my understanding?", ...]
}`
    },
    {
      title: "👁️ Blind Spots Generator",
      description: "Generate AI blind spots and mitigations. Returns JSON to add to blind spots list.",
      prompt: `I am using:
- Languages: ${config.languages}
- Frameworks: ${config.frameworks}
- Backend: ${config.backend}

Please suggest 5-7 potential blind spots an AI assistant might have when working on this project, along with mitigation strategies.
CRITICAL: Return ONLY a raw JSON object (no markdown) with this exact structure:
{
  "blindSpots": ["Local environment unknown – confirm tool availability before relying on them", "Hidden dependencies – request explicit dependency lists", ...]
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

          {/* Advanced AI Workflow Options */}
          <Card title="6. AI Workflow Options">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surfaceHighlight rounded-lg border border-border">
                <div>
                  <Label>Enable AI Workflow Phases</Label>
                  <p className="text-xs text-textMuted">Adds Discovery, Planning, Implementation, and Verification phases</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.aiWorkflowEnabled}
                  onChange={(e) => setConfig(prev => ({ ...prev, aiWorkflowEnabled: e.target.checked }))}
                  className="w-5 h-5 rounded border-border"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-surfaceHighlight rounded-lg border border-border">
                <div>
                  <Label>Enable LLM-Optimized Patterns</Label>
                  <p className="text-xs text-textMuted">Adds guidelines for writing code optimized for LLM understanding</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.llmOptimizedPatternsEnabled}
                  onChange={(e) => setConfig(prev => ({ ...prev, llmOptimizedPatternsEnabled: e.target.checked }))}
                  className="w-5 h-5 rounded border-border"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-surfaceHighlight rounded-lg border border-border">
                <div>
                  <Label>Fix Pre-existing Issues When in Context</Label>
                  <p className="text-xs text-textMuted">Encourages AI to fix bugs, flaky tests, or performance issues when working in an area</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.fixPreExistingIssuesEnabled}
                  onChange={(e) => setConfig(prev => ({ ...prev, fixPreExistingIssuesEnabled: e.target.checked }))}
                  className="w-5 h-5 rounded border-border"
                />
              </div>
            </div>
          </Card>

          {/* Development Principles */}
          <Card title="7. Development Principles">
            <p className="text-xs text-textMuted mb-4">Core principles that guide all development decisions</p>
            <div className="space-y-2 mb-4">
              {config.developmentPrinciples.map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-surfaceHighlight p-2 rounded-lg border border-border group">
                  <span className="text-green-400 text-xs font-bold px-2 py-0.5 bg-green-900/20 rounded">✅</span>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateListItem('developmentPrinciples', item.id, e.target.value)}
                    className="flex-1 text-sm bg-transparent border-none focus:outline-none text-textMain"
                  />
                  <button onClick={() => removeListItem('developmentPrinciples', item.id)} className="opacity-0 group-hover:opacity-100 text-textMuted hover:text-red-400 transition-opacity">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                value={newInputs['principle'] || ''} 
                onChange={(e) => setNewInputs(prev => ({...prev, principle: e.target.value}))} 
                placeholder="e.g. Zero downtime deployments" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addListItem('developmentPrinciples', newInputs['principle'] || '');
                    setNewInputs(prev => ({...prev, principle: ''}));
                  }
                }}
              />
              <Button onClick={() => {
                addListItem('developmentPrinciples', newInputs['principle'] || '');
                setNewInputs(prev => ({...prev, principle: ''}));
              }} variant="secondary">Add</Button>
            </div>
          </Card>

          {/* Pre-Implementation Checklist */}
          <Card title="8. Pre-Implementation Checklist">
            <p className="text-xs text-textMuted mb-4">Items AI must complete before writing code</p>
            <div className="space-y-2 mb-4">
              {config.preImplementationChecklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-surfaceHighlight p-2 rounded-lg border border-border group">
                  <span className="text-blue-400 text-xs font-bold px-2 py-0.5 bg-blue-900/20 rounded">☐</span>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateListItem('preImplementationChecklist', item.id, e.target.value)}
                    className="flex-1 text-sm bg-transparent border-none focus:outline-none text-textMain"
                  />
                  <button onClick={() => removeListItem('preImplementationChecklist', item.id)} className="opacity-0 group-hover:opacity-100 text-textMuted hover:text-red-400 transition-opacity">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                value={newInputs['checklist'] || ''} 
                onChange={(e) => setNewInputs(prev => ({...prev, checklist: e.target.value}))} 
                placeholder="e.g. Read the TODO.md completely" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addListItem('preImplementationChecklist', newInputs['checklist'] || '');
                    setNewInputs(prev => ({...prev, checklist: ''}));
                  }
                }}
              />
              <Button onClick={() => {
                addListItem('preImplementationChecklist', newInputs['checklist'] || '');
                setNewInputs(prev => ({...prev, checklist: ''}));
              }} variant="secondary">Add</Button>
            </div>
          </Card>

          {/* Shell Commands */}
          <Card title="9. Shell Commands">
            <p className="text-xs text-textMuted mb-4">Commands to build, test, and lint the project</p>
            <div className="space-y-3 mb-4">
              {config.shellCommands.map((cmd) => (
                <div key={cmd.id} className="flex gap-2 items-start bg-surfaceHighlight p-3 rounded-lg border border-border group">
                  <div className="flex-1 space-y-2">
                    <Input 
                      value={cmd.command} 
                      onChange={(e) => updateShellCommand(cmd.id, 'command', e.target.value)} 
                      placeholder="npm run build"
                      className="font-mono text-xs"
                    />
                    <Input 
                      value={cmd.description} 
                      onChange={(e) => updateShellCommand(cmd.id, 'description', e.target.value)} 
                      placeholder="Description (e.g. Build the project)"
                    />
                  </div>
                  <button onClick={() => removeShellCommand(cmd.id)} className="opacity-0 group-hover:opacity-100 text-textMuted hover:text-red-400 transition-opacity mt-2">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Input 
                  value={newShellCmd.command} 
                  onChange={(e) => setNewShellCmd(prev => ({...prev, command: e.target.value}))} 
                  placeholder="npm run test"
                  className="font-mono text-xs"
                />
                <Input 
                  value={newShellCmd.description} 
                  onChange={(e) => setNewShellCmd(prev => ({...prev, description: e.target.value}))} 
                  placeholder="Description"
                />
              </div>
              <Button onClick={() => {
                addShellCommand(newShellCmd.command, newShellCmd.description);
                setNewShellCmd({ command: '', description: '' });
              }} variant="secondary" className="self-end">Add</Button>
            </div>
          </Card>

          {/* Additional Resources */}
          <Card title="10. Additional Resources">
            <p className="text-xs text-textMuted mb-4">Links to documentation and related files</p>
            <div className="space-y-3 mb-4">
              {config.additionalResources.map((res) => (
                <div key={res.id} className="flex gap-2 items-start bg-surfaceHighlight p-3 rounded-lg border border-border group">
                  <div className="flex-1 space-y-2">
                    <Input 
                      value={res.title} 
                      onChange={(e) => updateAdditionalResource(res.id, 'title', e.target.value)} 
                      placeholder="Title (e.g. Development Workflow)"
                    />
                    <Input 
                      value={res.path} 
                      onChange={(e) => updateAdditionalResource(res.id, 'path', e.target.value)} 
                      placeholder="Path (e.g. docs/DEVELOPMENT.md)"
                      className="font-mono text-xs"
                    />
                    <Input 
                      value={res.description} 
                      onChange={(e) => updateAdditionalResource(res.id, 'description', e.target.value)} 
                      placeholder="Description"
                    />
                  </div>
                  <button onClick={() => removeAdditionalResource(res.id)} className="opacity-0 group-hover:opacity-100 text-textMuted hover:text-red-400 transition-opacity mt-2">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Input 
                  value={newResource.title} 
                  onChange={(e) => setNewResource(prev => ({...prev, title: e.target.value}))} 
                  placeholder="Title"
                />
                <Input 
                  value={newResource.path} 
                  onChange={(e) => setNewResource(prev => ({...prev, path: e.target.value}))} 
                  placeholder="Path"
                  className="font-mono text-xs"
                />
                <Input 
                  value={newResource.description} 
                  onChange={(e) => setNewResource(prev => ({...prev, description: e.target.value}))} 
                  placeholder="Description"
                />
              </div>
              <Button onClick={() => {
                addAdditionalResource(newResource.title, newResource.path, newResource.description);
                setNewResource({ title: '', path: '', description: '' });
              }} variant="secondary" className="self-end">Add</Button>
            </div>
          </Card>

          {/* Mistakes to Avoid */}
          <Card title="11. Common AI Mistakes to Avoid">
            <p className="text-xs text-textMuted mb-4">Pitfalls AI assistants should watch out for</p>
            <div className="space-y-2 mb-4">
              {config.mistakesToAvoid.map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-surfaceHighlight p-2 rounded-lg border border-border group">
                  <span className="text-yellow-400 text-xs font-bold px-2 py-0.5 bg-yellow-900/20 rounded">⚠️</span>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateListItem('mistakesToAvoid', item.id, e.target.value)}
                    className="flex-1 text-sm bg-transparent border-none focus:outline-none text-textMain"
                  />
                  <button onClick={() => removeListItem('mistakesToAvoid', item.id)} className="opacity-0 group-hover:opacity-100 text-textMuted hover:text-red-400 transition-opacity">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                value={newInputs['mistake'] || ''} 
                onChange={(e) => setNewInputs(prev => ({...prev, mistake: e.target.value}))} 
                placeholder="e.g. Don't implement without understanding" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addListItem('mistakesToAvoid', newInputs['mistake'] || '');
                    setNewInputs(prev => ({...prev, mistake: ''}));
                  }
                }}
              />
              <Button onClick={() => {
                addListItem('mistakesToAvoid', newInputs['mistake'] || '');
                setNewInputs(prev => ({...prev, mistake: ''}));
              }} variant="secondary">Add</Button>
            </div>
          </Card>

          {/* Questions to Ask */}
          <Card title="12. Questions AI Should Ask">
            <p className="text-xs text-textMuted mb-4">Self-check questions before implementation</p>
            <div className="space-y-2 mb-4">
              {config.questionsToAsk.map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-surfaceHighlight p-2 rounded-lg border border-border group">
                  <span className="text-purple-400 text-xs font-bold px-2 py-0.5 bg-purple-900/20 rounded">❓</span>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateListItem('questionsToAsk', item.id, e.target.value)}
                    className="flex-1 text-sm bg-transparent border-none focus:outline-none text-textMain"
                  />
                  <button onClick={() => removeListItem('questionsToAsk', item.id)} className="opacity-0 group-hover:opacity-100 text-textMuted hover:text-red-400 transition-opacity">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                value={newInputs['question'] || ''} 
                onChange={(e) => setNewInputs(prev => ({...prev, question: e.target.value}))} 
                placeholder="e.g. What similar functionality already exists?" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addListItem('questionsToAsk', newInputs['question'] || '');
                    setNewInputs(prev => ({...prev, question: ''}));
                  }
                }}
              />
              <Button onClick={() => {
                addListItem('questionsToAsk', newInputs['question'] || '');
                setNewInputs(prev => ({...prev, question: ''}));
              }} variant="secondary">Add</Button>
            </div>
          </Card>

          {/* Blind Spots */}
          <Card title="13. AI Blind Spots & Mitigations">
            <p className="text-xs text-textMuted mb-4">Known limitations and how to address them</p>
            <div className="space-y-2 mb-4">
              {config.blindSpots.map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-surfaceHighlight p-2 rounded-lg border border-border group">
                  <span className="text-orange-400 text-xs font-bold px-2 py-0.5 bg-orange-900/20 rounded">👁️</span>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateListItem('blindSpots', item.id, e.target.value)}
                    className="flex-1 text-sm bg-transparent border-none focus:outline-none text-textMain"
                  />
                  <button onClick={() => removeListItem('blindSpots', item.id)} className="opacity-0 group-hover:opacity-100 text-textMuted hover:text-red-400 transition-opacity">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                value={newInputs['blindspot'] || ''} 
                onChange={(e) => setNewInputs(prev => ({...prev, blindspot: e.target.value}))} 
                placeholder="e.g. Local environment unknown - confirm tool availability" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addListItem('blindSpots', newInputs['blindspot'] || '');
                    setNewInputs(prev => ({...prev, blindspot: ''}));
                  }
                }}
              />
              <Button onClick={() => {
                addListItem('blindSpots', newInputs['blindspot'] || '');
                setNewInputs(prev => ({...prev, blindspot: ''}));
              }} variant="secondary">Add</Button>
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
