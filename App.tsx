import React, { useState, useMemo } from 'react';
import { AgentConfig, ProjectPhase, AIStyle, DocMapItem, ListItem, AdditionalResource, ShellCommand, Skill, AgentModule, SYNCPhase, SYNCPersonaMode } from './types';
import { Card, Label, Input, TextArea, Button, TrashIcon, CopyIcon, DownloadIcon, ImportIcon, SunIcon, MoonIcon, GithubIcon } from './components/UIComponents';
import { ComboInput } from './components/ComboInput';
import { PROJECT_PRESETS, FIELD_PRESETS, MODULE_PRESETS } from './presets';
import { CATEGORIES, MODULES, hasConflict, getConflictingModules, getImpliedModules, getSeverityInfo, WORKFLOW_TEMPLATES, LLM_HELPERS, interpolateTemplate, SYNC_FRAMEWORK, syncConflictsWithModule, getModulesConflictingWithSync } from './modules';

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
  globalRulesEnabled: false,
  shellCommands: [],
  mistakesToAvoid: [],
  questionsToAsk: [],
  blindSpots: [],
  skills: [],
  // Enforcement modules
  enabledModules: [],
  advisoryModules: [],
  // SYNC Framework
  syncFrameworkEnabled: false,
  syncPersonaMode: SYNCPersonaMode.ADAPTIVE,
  syncEnabledPhases: [],
  syncEnabledAgents: [],
  syncEnabledMandates: []
};

const App: React.FC = () => {
  const [config, setConfig] = useState<AgentConfig>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'markdown' | 'prompt' | 'helpers'>('markdown');
  const [newNeverItem, setNewNeverItem] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // State for the "Import JSON" textareas in the helper tab
  const [importInputs, setImportInputs] = useState<{[key: number]: string}>({});

  // Theme toggle effect
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Helper to generate unique IDs
  let idCounter = 0;
  const generateUniqueId = (prefix: string = ''): string => {
    idCounter++;
    return `${prefix}${Date.now()}-${idCounter}-${Math.random().toString(36).substr(2, 9)}`;
  };

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
    const newItem: ListItem = { id: generateUniqueId(), text: text.trim() };
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
    const newCmd: ShellCommand = { id: generateUniqueId(), command: command.trim(), description: description.trim() };
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
    const newRes: AdditionalResource = { id: generateUniqueId(), title: title.trim(), path: path.trim(), description: description.trim() };
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
  const [newSkill, setNewSkill] = useState({ name: '', description: '', path: '', license: '', compatibility: '', author: '', version: '', allowedTools: '', hasReferences: false, hasScripts: false, hasAssets: false });
  const [skillNameError, setSkillNameError] = useState<string>("");

  // Skill name validation
  const validateSkillName = (name: string): string => {
    const trimmedName = name.trim();
    if (!trimmedName) return "";
    
    // Check length first
    if (trimmedName.length > 64) {
      return "Name must be 64 characters or less";
    }
    
    // Check for consecutive hyphens
    if (trimmedName.includes('--')) {
      return "Name cannot contain consecutive hyphens";
    }
    
    // Check if starts or ends with hyphen
    if (trimmedName.startsWith('-') || trimmedName.endsWith('-')) {
      return "Name cannot start or end with a hyphen";
    }
    
    // Finally, check overall pattern (lowercase, numbers, hyphens only)
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(trimmedName)) {
      return "Name must be lowercase letters, numbers, and hyphens only";
    }
    
    return "";
  };

  // Skills management
  const addSkill = (name: string, description: string, path: string, license: string, compatibility: string, author: string, version: string, allowedTools: string, hasReferences: boolean, hasScripts: boolean, hasAssets: boolean) => {
    if (!name.trim() || !description.trim()) return;
    
    const validationError = validateSkillName(name.trim());
    if (validationError) {
      setSkillNameError(validationError);
      return;
    }
    
    const newSkillItem: Skill = { 
      id: generateUniqueId('skill-'), 
      name: name.trim(), 
      description: description.trim(),
      path: path.trim() || `skills/${name.trim().toLowerCase().replace(/\s+/g, '-')}`,
      license: license.trim() || undefined,
      compatibility: compatibility.trim() || undefined,
      allowedTools: allowedTools.trim() || undefined,
      hasReferences: hasReferences,
      hasScripts: hasScripts,
      hasAssets: hasAssets,
      metadata: (author.trim() || version.trim()) ? {
        author: author.trim() || undefined,
        version: version.trim() || undefined
      } : undefined
    };
    setConfig(prev => ({ ...prev, skills: [...prev.skills, newSkillItem] }));
    setSkillNameError("");
  };

  const removeSkill = (id: string) => {
    setConfig(prev => ({ ...prev, skills: prev.skills.filter(skill => skill.id !== id) }));
  };

  const updateSkill = (id: string, field: keyof Skill, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      skills: prev.skills.map(skill => {
        if (skill.id !== id) return skill;
        if (field === 'metadata') return skill; // handled separately
        return { ...skill, [field]: value };
      })
    }));
  };

  const updateSkillMetadata = (id: string, field: 'author' | 'version', value: string) => {
    setConfig(prev => ({
      ...prev,
      skills: prev.skills.map(skill => {
        if (skill.id !== id) return skill;
        return {
          ...skill,
          metadata: {
            ...skill.metadata,
            [field]: value.trim() || undefined
          }
        };
      })
    }));
  };

  // Module toggle handler
  const handleModuleToggle = (moduleKey: string) => {
    setConfig(prev => {
      const isCurrentlyEnabled = prev.enabledModules.includes(moduleKey);
      
      if (isCurrentlyEnabled) {
        // Disable module
        return {
          ...prev,
          enabledModules: prev.enabledModules.filter(k => k !== moduleKey),
          advisoryModules: prev.advisoryModules.filter(k => k !== moduleKey)
        };
      } else {
        // Enable module - check for implied modules to suggest
        const implied = getImpliedModules(moduleKey);
        const enabledSet = new Set([...prev.enabledModules, moduleKey]);
        
        // Automatically add implied modules that aren't already enabled
        implied.forEach(imp => enabledSet.add(imp));
        
        return {
          ...prev,
          enabledModules: Array.from(enabledSet)
        };
      }
    });
  };

  // Toggle advisory mode for a module
  const handleAdvisoryToggle = (moduleKey: string) => {
    setConfig(prev => {
      const isAdvisory = prev.advisoryModules.includes(moduleKey);
      return {
        ...prev,
        advisoryModules: isAdvisory 
          ? prev.advisoryModules.filter(k => k !== moduleKey)
          : [...prev.advisoryModules, moduleKey]
      };
    });
  };

  // Apply module preset
  const applyModulePreset = (presetKey: string) => {
    const preset = MODULE_PRESETS[presetKey];
    if (!preset) return;
    
    setConfig(prev => ({
      ...prev,
      enabledModules: [...preset.modules],
      advisoryModules: [...preset.advisory]
    }));
  };


  // Helper to validate JSON structure
  const validateJsonStructure = (data: any, expectedFields: string[]): { valid: boolean; message: string } => {
    if (typeof data !== 'object' || data === null) {
      return { valid: false, message: 'Response must be a JSON object' };
    }
    
    const dataKeys = Object.keys(data);
    const hasExpectedFields = expectedFields.some(field => dataKeys.includes(field));
    
    if (!hasExpectedFields) {
      return { 
        valid: false, 
        message: `JSON missing expected fields. Expected one of: ${expectedFields.join(', ')}. Found: ${dataKeys.join(', ')}` 
      };
    }
    
    return { valid: true, message: 'Valid' };
  };

  // Logic to parse and merge pasted JSON
  const handleImportJson = (index: number) => {
    const rawInput = importInputs[index];
    if (!rawInput) {
      alert("Please paste JSON response first");
      return;
    }

    // Clean markdown code blocks if present
    let cleanJson = rawInput.trim();
    
    // Remove markdown code blocks
    cleanJson = cleanJson.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Try to find JSON object if there's extra text
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanJson = jsonMatch[0];
    }

    // Validate it's not empty
    if (!cleanJson) {
      alert("No JSON content found. Please paste the LLM's JSON response.");
      return;
    }

    try {
      const data = JSON.parse(cleanJson);
      
      // Get expected fields from the helper prompt object
      const validation = validateJsonStructure(data, helperPrompts[index]?.expectedFields || []);
      if (!validation.valid) {
        alert(`Invalid JSON structure: ${validation.message}\n\nPlease ensure the LLM returned JSON in the expected format.`);
        return;
      }
      
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
            const newDocs = data.docMap.map((d: any) => ({
                id: generateUniqueId('imported-doc-'),
                path: d.path || "unknown/path",
                description: d.description || "No description provided"
            }));
            next.docMap = [...next.docMap, ...newDocs];
        }

        // Handle new list item types
        if (data.developmentPrinciples && Array.isArray(data.developmentPrinciples)) {
            const newItems = data.developmentPrinciples.map((text: string) => ({
                id: generateUniqueId('principle-'),
                text: text
            }));
            next.developmentPrinciples = [...next.developmentPrinciples, ...newItems];
        }

        if (data.mistakesToAvoid && Array.isArray(data.mistakesToAvoid)) {
            const newItems = data.mistakesToAvoid.map((text: string) => ({
                id: generateUniqueId('mistake-'),
                text: text
            }));
            next.mistakesToAvoid = [...next.mistakesToAvoid, ...newItems];
        }

        if (data.questionsToAsk && Array.isArray(data.questionsToAsk)) {
            const newItems = data.questionsToAsk.map((text: string) => ({
                id: generateUniqueId('question-'),
                text: text
            }));
            next.questionsToAsk = [...next.questionsToAsk, ...newItems];
        }

        if (data.blindSpots && Array.isArray(data.blindSpots)) {
            const newItems = data.blindSpots.map((text: string) => ({
                id: generateUniqueId('blindspot-'),
                text: text
            }));
            next.blindSpots = [...next.blindSpots, ...newItems];
        }

        if (data.preImplementationChecklist && Array.isArray(data.preImplementationChecklist)) {
            const newItems = data.preImplementationChecklist.map((text: string) => ({
                id: generateUniqueId('checklist-'),
                text: text
            }));
            next.preImplementationChecklist = [...next.preImplementationChecklist, ...newItems];
        }

        if (data.shellCommands && Array.isArray(data.shellCommands)) {
            const newCmds = data.shellCommands.map((cmd: any) => ({
                id: generateUniqueId('cmd-'),
                command: cmd.command || "",
                description: cmd.description || ""
            }));
            next.shellCommands = [...next.shellCommands, ...newCmds];
        }

        if (data.additionalResources && Array.isArray(data.additionalResources)) {
            const newRes = data.additionalResources.map((res: any) => ({
                id: generateUniqueId('resource-'),
                title: res.title || "",
                path: res.path || "",
                description: res.description || ""
            }));
            next.additionalResources = [...next.additionalResources, ...newRes];
        }

        if (data.skills && Array.isArray(data.skills)) {
            const newSkills = data.skills.map((skill: any) => ({
                id: generateUniqueId('skill-'),
                name: skill.name || "",
                description: skill.description || "",
                path: skill.path || `skills/${(skill.name || 'skill').toLowerCase().replace(/\s+/g, '-')}`,
                license: skill.license || undefined,
                compatibility: skill.compatibility || undefined,
                allowedTools: skill.allowedTools || undefined,
                hasReferences: skill.hasReferences || false,
                hasScripts: skill.hasScripts || false,
                hasAssets: skill.hasAssets || false,
                metadata: skill.metadata || undefined
            }));
            next.skills = [...next.skills, ...newSkills];
        }

        return next;
      });
      
      // Clear input after success
      setImportInputs(prev => ({ ...prev, [index]: '' }));
      alert("✅ Successfully merged external LLM data!");
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      console.error('JSON Parse Error:', e);
      alert(`❌ Failed to parse JSON: ${errorMsg}\n\nPlease ensure:\n1. The LLM returned ONLY JSON (no markdown, no explanations)\n2. The JSON is properly formatted\n3. Remove any code blocks or extra text`);
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

    // Generate workflow sections from single source of truth
    const aiWorkflow = WORKFLOW_TEMPLATES.aiWorkflow;
    const aiWorkflowSection = config.aiWorkflowEnabled ? `
## ${aiWorkflow.title}

**IMPORTANT**: AI assistants must follow this step-by-step approach:

${aiWorkflow.phases.map((phase, i) => `### ${i + 1}. ${phase.name}${phase.subtitle ? ` (${phase.subtitle})` : ''}
${phase.items.map(item => `- ${item}`).join('\n')}`).join('\n\n')}
` : '';

    const llmPatterns = WORKFLOW_TEMPLATES.llmOptimizedPatterns;
    const llmOptimizedPatternsSection = config.llmOptimizedPatternsEnabled ? `
## ${llmPatterns.title}

**IMPORTANT**: This codebase should be optimized for LLM understanding and modification.

### Code Optimization Principles for LLMs

${llmPatterns.principles.map((principle, i) => `${i + 1}. **${principle.name}**
${principle.items.map(item => `   - ${item}`).join('\n')}`).join('\n\n')}
` : '';

    const fixIssues = WORKFLOW_TEMPLATES.fixPreExistingIssues;
    const fixPreExistingIssuesSection = config.fixPreExistingIssuesEnabled ? `
## ${fixIssues.title}

**IMPORTANT**: When working in an area of the codebase, you should proactively identify and fix pre-existing issues.

### Guidelines for Contextual Improvements

${fixIssues.guidelines.map((guideline, i) => `${i + 1}. **${guideline.name}**
${guideline.items.map(item => `   - ${item}`).join('\n')}`).join('\n\n')}

### Examples of Good Opportunistic Fixes

✅ **DO FIX:**
${fixIssues.doFix.map(item => `- ${item}`).join('\n')}

❌ **DON'T FIX:**
${fixIssues.dontFix.map(item => `- ${item}`).join('\n')}

**Remember**: The goal is to leave the code better than you found it, not perfect. Perfect is the enemy of done.
` : '';

    const shellCommandsSection = config.shellCommands.length > 0 ? `
## Commands to Run

\`\`\`bash
${config.shellCommands.map(cmd => `# ${cmd.description}\n${cmd.command}`).join('\n\n')}
\`\`\`
` : '';

    // Unified AI Assistant Guidance Section
    const aiAssistantGuidanceSection = (() => {
      const hasMistakes = config.mistakesToAvoid.length > 0;
      const hasQuestions = config.questionsToAsk.length > 0;
      const hasBlindSpots = config.blindSpots.length > 0;
      
      if (!hasMistakes && !hasQuestions && !hasBlindSpots) {
        return '';
      }
      
      const subsections = [];
      
      if (hasMistakes) {
        subsections.push(`### Common Mistakes to Avoid

${config.mistakesToAvoid.map((m, i) => `${i + 1}. **${m.text}**`).join('\n')}`);
      }
      
      if (hasQuestions) {
        subsections.push(`### Questions to Ask Before Implementation

Before starting implementation, consider:
${config.questionsToAsk.map(q => `- "${q.text}"`).join('\n')}`);
      }
      
      if (hasBlindSpots) {
        subsections.push(`### Blind Spots and Mitigations

${config.blindSpots.map(b => `- **${b.text}**`).join('\n')}`);
      }
      
      return `
## AI Assistant Guidance

${subsections.join('\n\n')}
`;
    })();

    const skillsSection = config.skills.length > 0 ? `
## Available Skills

Skills use progressive disclosure to manage context efficiently:
- **Discovery**: At startup, only skill names and descriptions are loaded
- **Activation**: When relevant, the full SKILL.md is read into context
- **Execution**: Instructions are followed, with optional file/script loading

${config.skills.map(skill => {
  let skillText = `### ${skill.name}\n\n**Description:** ${skill.description}\n\n**Path:** \`${skill.path}/SKILL.md\``;
  
  // Add "Includes" section if any directory flags are set
  if (skill.hasReferences || skill.hasScripts || skill.hasAssets) {
    skillText += '\n\n**Includes:**';
    if (skill.hasReferences) skillText += '\n- 📚 References: Additional documentation in `references/`';
    if (skill.hasScripts) skillText += '\n- 🔧 Scripts: Executable code in `scripts/`';
    if (skill.hasAssets) skillText += '\n- 📦 Assets: Templates and resources in `assets/`';
  }
  
  if (skill.license) skillText += `\n\n**License:** ${skill.license}`;
  if (skill.compatibility) skillText += `\n**Compatibility:** ${skill.compatibility}`;
  if (skill.allowedTools) skillText += `\n**Allowed Tools:** ${skill.allowedTools}`;
  if (skill.metadata) {
    const metaEntries = Object.entries(skill.metadata).filter(([_, v]) => v);
    if (metaEntries.length > 0) {
      skillText += `\n**Metadata:** ${metaEntries.map(([k, v]) => `${k}=${v}`).join(', ')}`;
    }
  }
  return skillText;
}).join('\n\n---\n\n')}

### Progressive Disclosure Best Practices

1. **Keep SKILL.md focused** (< 500 lines recommended)
2. **Move detailed content to references/** for on-demand loading
3. **Structure for efficiency**: Metadata (~100 tokens) → Instructions (~5000 tokens) → Resources (as needed)
` : '';

    const globalRulesTemplate = WORKFLOW_TEMPLATES.globalRules;
    const globalRulesSection = config.globalRulesEnabled ? `
# ${globalRulesTemplate.title}

You are a world-class software engineer and software architect.

Your motto is:

> **${globalRulesTemplate.motto}**

You always:

${globalRulesTemplate.principles.map(p => `- ${p}`).join('\n')}

---
` : '';

    // Generate SYNC Framework section
    const syncFrameworkSection = config.syncFrameworkEnabled && SYNC_FRAMEWORK ? `
## SYNC Framework for LLM-Driven Development

> **${SYNC_FRAMEWORK.motto}**

${SYNC_FRAMEWORK.description}

### Operating Mode: ${config.syncPersonaMode === SYNCPersonaMode.STRICT ? '🔒 STRICT' : '🔄 ADAPTIVE'}

${SYNC_FRAMEWORK.personaModes.find(m => m.key === config.syncPersonaMode)?.behavior}

${config.syncEnabledPhases.length > 0 ? `
### Phases

This project follows these SYNC phases:

${config.syncEnabledPhases.map(phaseKey => {
  const phase = SYNC_FRAMEWORK.phases.find(p => p.key === phaseKey);
  if (!phase) return '';
  return `#### ${phase.emoji} ${phase.name} – ${phase.description}

**Purpose**: ${phase.purpose}

**Steps**:
${phase.steps.map(s => `- ${s}`).join('\n')}

**Outputs**:
${phase.outputs.map(o => `- ${o}`).join('\n')}`;
}).join('\n\n')}` : ''}

${config.syncEnabledAgents.length > 0 ? `
### Specialized Agents

These agents represent clear, non-overlapping roles in the development process:

| Agent | Role | Responsibilities |
|-------|------|------------------|
${config.syncEnabledAgents.map(agentKey => {
  const agent = SYNC_FRAMEWORK.agents.find(a => a.key === agentKey);
  if (!agent) return '';
  return `| **${agent.name}** | ${agent.role} | ${agent.responsibilities.join('; ')} |`;
}).join('\n')}

**How Agents Work Together**: ${SYNC_FRAMEWORK.howItWorksTogether}` : ''}

${config.syncEnabledMandates.length > 0 ? `
### Mandates (Non-Negotiable Laws)

These mandates are enforced constraints that every phase must comply with:

${config.syncEnabledMandates.map(mandateKey => {
  const mandate = SYNC_FRAMEWORK.mandates.find(m => m.key === mandateKey);
  if (!mandate) return '';
  return `#### ${mandate.name}

**Ensures**: ${mandate.ensures}${mandate.basedOn ? `\n**Based On**: ${mandate.basedOn}` : ''}

**Requirements**:
${mandate.requirements.map(r => `- ${r}`).join('\n')}`;
}).join('\n\n')}` : ''}

${SYNC_FRAMEWORK.keyTerms && Object.keys(SYNC_FRAMEWORK.keyTerms).length > 0 ? `
### Key Terms

${Object.entries(SYNC_FRAMEWORK.keyTerms).map(([term, definition]) => `- **${term}**: ${definition}`).join('\n')}` : ''}

---
` : '';

    // Generate enforcement modules section
    const enabledModulesData = config.enabledModules
      .map(key => MODULES.find(m => m.key === key))
      .filter((m): m is AgentModule => m !== undefined);
    
    const enforcementModulesSection = enabledModulesData.length > 0 ? `
## Enforcement Modules

${enabledModulesData.map(module => {
  const isAdvisory = config.advisoryModules.includes(module.key);
  const severityLabel = isAdvisory ? 'ADVISORY' : module.severity.toUpperCase();
  const examplesSection = module.examples && module.examples.length > 0 
    ? `

**Examples**:
${module.examples.map(ex => `
#### ${ex.title}

❌ **Bad**:
\`\`\`
${ex.bad}
\`\`\`

✅ **Good**:
\`\`\`
${ex.good}
\`\`\`
${ex.explanation ? `\n*${ex.explanation}*` : ''}`).join('\n')}`
    : '';
  
  return `### ${module.title} [${severityLabel}]

**Purpose**: ${module.description}

**Hard Rules**:
${module.rules.hard.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}

**Soft Rules**:
${module.rules.soft.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}
${module.conflicts.length > 0 ? `
**Conflicts with**: ${module.conflicts.join(', ')}` : ''}${examplesSection}`;
}).join('\n\n---\n\n')}
` : '';
    
    const sections = [
      `# ${config.projectName} - AGENTS.md`,
      '',
      '> **⚠️ SYSTEM CONTEXT FILE**',
      '> This file governs the behavior of AI agents (Cursor, Copilot, Windsurf) within this repository.',
    ];

    if (globalRulesSection) {
      sections.push('', globalRulesSection);
    }

    if (syncFrameworkSection) {
      sections.push('', syncFrameworkSection);
    }

    if (additionalResourcesSection) {
      sections.push('', additionalResourcesSection);
    }

    if (developmentPrinciplesSection) {
      sections.push('', developmentPrinciplesSection);
    }

    sections.push(
      '## 1. Project Identity & Mission',
      `**Goal:** ${config.mission}`,
      `**North Star:** ${config.northStar}`
    );

    if (preImplementationChecklistSection) {
      sections.push('', preImplementationChecklistSection);
    }

    sections.push(
      '## 2. Status & Stability',
      `**Phase:** ${isProto ? '🌱 PROTOTYPE' : '🌳 PRODUCTION'}`,
      `**Breaking Changes:** ${isProto ? '✅ ALLOWED (Improve architecture freely)' : '⛔ FORBIDDEN (Strict backward compatibility)'}`,
      `**Refactoring Policy:** ${isProto ? 'Aggressive refactoring encouraged.' : 'Conservative. Discuss before large changes.'}`
    );

    if (aiWorkflowSection) {
      sections.push('', aiWorkflowSection);
    }

    sections.push(
      '## 3. Tech Stack & Architecture',
      `- **Languages:** ${config.languages}`,
      `- **Frameworks:** ${config.frameworks}`,
      `- **Package Manager:** ${config.packageManager}`,
      `- **Styling:** ${config.styling}`,
      `- **State Management:** ${config.stateManagement}`,
      `- **Backend/Services:** ${config.backend}`
    );

    if (llmOptimizedPatternsSection) {
      sections.push('', llmOptimizedPatternsSection);
    }

    if (fixPreExistingIssuesSection) {
      sections.push('', fixPreExistingIssuesSection);
    }

    sections.push(
      '## 4. Project Structure',
      '**Key Directories:**',
      '```',
      config.directoryStructure,
      '```',
      '',
      '**Context Map:**',
      config.docMap.map(d => `- \`${d.path}\`: ${d.description}`).join('\n')
    );

    if (shellCommandsSection) {
      sections.push('', shellCommandsSection);
    }

    sections.push(
      '## 5. Rules of Engagement',
      '### ⛔ The NEVER List',
      config.neverList.map(item => `- **NEVER** ${item}`).join('\n')
    );

    if (!isProto) {
      sections.push('- **NEVER** Change database schemas without migrations');
      sections.push('- **NEVER** Break public API contracts');
    }

    sections.push(
      '',
      '### Testing & Quality',
      `- **Strategy:** ${config.testingStrategy}`,
      '- **Mocking:** Avoid mocks unless strictly necessary. Favor real integrations to prevent "testing the mocks".'
    );

    if (enforcementModulesSection) {
      sections.push('', enforcementModulesSection);
    }

    if (aiAssistantGuidanceSection) {
      sections.push('', aiAssistantGuidanceSection);
    }

    if (skillsSection) {
      sections.push('', skillsSection);
    }

    sections.push(
      '## 6. Interaction Style',
      `**Preferred Tone:** ${config.aiStyle === AIStyle.TERSE ? 'Terse (Code only, minimal explanation)' : config.aiStyle === AIStyle.SOCRATIC ? 'Socratic (Guide me, don\'t just solve)' : 'Explanatory (Teach me while coding)'}`
    );

    return sections.join('\n');
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

  // Generate helper prompts from the single source of truth, interpolating config variables
  const helperPrompts = useMemo(() => {
    const variables: Record<string, string> = {
      projectName: config.projectName,
      mission: config.mission,
      northStar: config.northStar,
      phase: config.phase,
      languages: config.languages,
      frameworks: config.frameworks,
      stateManagement: config.stateManagement,
      backend: config.backend,
      styling: config.styling,
      packageManager: config.packageManager,
    };
    
    return LLM_HELPERS.map(helper => ({
      title: helper.title,
      description: helper.description,
      expectedFields: helper.expectedFields,
      prompt: interpolateTemplate(helper.promptTemplate, variables)
    }));
  }, [config]);

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-500">
                Agent Context Architect
              </h1>
              <p className="text-textMuted text-sm mt-1">Build the brain for your AI coding assistants.</p>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href="https://github.com/voku/your_agent_config" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 hover:bg-surfaceHighlight rounded-lg transition-colors text-textMuted hover:text-primary"
                title="Contribute on GitHub"
              >
                <GithubIcon />
              </a>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 hover:bg-surfaceHighlight rounded-lg transition-colors text-textMuted hover:text-primary"
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>
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
                    ? 'bg-green-500/10 border-green-500 text-green-800' 
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
                    ? 'bg-red-500/10 border-red-500 text-red-800' 
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
               {/* Project Type Preset Selector */}
               <div>
                 <Label>Quick Start Template</Label>
                 <select 
                   onChange={(e) => {
                     const preset = PROJECT_PRESETS[e.target.value];
                     if (preset) {
                       setConfig(prev => ({
                         ...prev,
                         languages: preset.languages,
                         frameworks: preset.frameworks,
                         packageManager: preset.packageManager,
                         styling: preset.styling,
                         stateManagement: preset.stateManagement,
                         backend: preset.backend,
                       }));
                     }
                   }}
                   className="w-full bg-surfaceHighlight border border-border rounded-lg px-3 py-2.5 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                 >
                   <option value="">Select a template or customize below...</option>
                   {Object.entries(PROJECT_PRESETS).map(([key, preset]) => (
                     <option key={key} value={key}>
                       {preset.name} - {preset.description}
                     </option>
                   ))}
                 </select>
                 <p className="text-xs text-textMuted mt-1">💡 Choose a template to auto-fill fields below, or customize manually</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="languages">Languages</Label>
                    <ComboInput 
                      name="languages" 
                      value={config.languages} 
                      onChange={(val) => setConfig(prev => ({...prev, languages: val}))}
                      presets={FIELD_PRESETS.languages}
                      placeholder="e.g. TypeScript, Python"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frameworks">Frameworks</Label>
                    <ComboInput 
                      name="frameworks" 
                      value={config.frameworks} 
                      onChange={(val) => setConfig(prev => ({...prev, frameworks: val}))}
                      presets={FIELD_PRESETS.frameworks}
                      placeholder="e.g. React, Next.js"
                    />
                  </div>
                  <div>
                    <Label htmlFor="styling">Styling</Label>
                    <ComboInput 
                      name="styling" 
                      value={config.styling} 
                      onChange={(val) => setConfig(prev => ({...prev, styling: val}))}
                      presets={FIELD_PRESETS.styling}
                      placeholder="e.g. Tailwind CSS"
                    />
                  </div>
                   <div>
                    <Label htmlFor="stateManagement">State Management</Label>
                    <ComboInput 
                      name="stateManagement" 
                      value={config.stateManagement} 
                      onChange={(val) => setConfig(prev => ({...prev, stateManagement: val}))}
                      presets={FIELD_PRESETS.stateManagement}
                      placeholder="e.g. Zustand, Redux"
                    />
                  </div>
                  <div>
                    <Label htmlFor="backend">Backend</Label>
                    <ComboInput 
                      name="backend" 
                      value={config.backend} 
                      onChange={(val) => setConfig(prev => ({...prev, backend: val}))}
                      presets={FIELD_PRESETS.backend}
                      placeholder="e.g. Supabase, Firebase"
                    />
                  </div>
                  <div>
                    <Label htmlFor="packageManager">Package Manager</Label>
                    <ComboInput 
                      name="packageManager" 
                      value={config.packageManager} 
                      onChange={(val) => setConfig(prev => ({...prev, packageManager: val}))}
                      presets={FIELD_PRESETS.packageManagers}
                      placeholder="e.g. npm, pnpm"
                    />
                  </div>
               </div>
               <p className="text-xs text-textMuted mt-2">💡 Type to filter options, or enter custom values. Use the "LLM Helpers" tab for AI suggestions.</p>
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
                onClick={() => setConfig(prev => ({ ...prev, docMap: [...prev.docMap, { id: generateUniqueId('doc-'), path: '', description: '' }] }))}
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
                   <span className="text-red-300 text-xs font-bold px-2 py-0.5 bg-red-950 rounded border border-red-800">NEVER</span>
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
                  className="w-4 h-4 rounded border-border"
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
                  className="w-4 h-4 rounded border-border"
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
                  className="w-4 h-4 rounded border-border"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-surfaceHighlight rounded-lg border border-border">
                <div>
                  <Label>Enable Global Rules (Must Follow)</Label>
                  <p className="text-xs text-textMuted">Adds world-class engineering principles: 100% quality, no hacks, real tests, full ownership</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.globalRulesEnabled}
                  onChange={(e) => setConfig(prev => ({ ...prev, globalRulesEnabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-border"
                />
              </div>
            </div>
          </Card>

          {/* SYNC Framework Configuration */}
          <Card title="6a. SYNC Framework">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surfaceHighlight rounded-lg border border-border">
                <div>
                  <Label>Enable SYNC Framework</Label>
                  <p className="text-xs text-textMuted">A rigorously structured, fact-enforced framework for LLM-driven development</p>
                  {config.syncFrameworkEnabled && getModulesConflictingWithSync().some(m => config.enabledModules.includes(m)) && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ Conflicts with enabled modules: {getModulesConflictingWithSync().filter(m => config.enabledModules.includes(m)).join(', ')}
                    </p>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={config.syncFrameworkEnabled}
                  onChange={(e) => setConfig(prev => ({ ...prev, syncFrameworkEnabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-border"
                />
              </div>

              {config.syncFrameworkEnabled && SYNC_FRAMEWORK && (
                <>
                  {/* Persona Mode Selector */}
                  <div className="space-y-2">
                    <Label>Persona Mode</Label>
                    <select
                      value={config.syncPersonaMode}
                      onChange={(e) => setConfig(prev => ({ ...prev, syncPersonaMode: e.target.value as SYNCPersonaMode }))}
                      className="w-full bg-surfaceHighlight border border-border rounded-lg px-3 py-2.5 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    >
                      {SYNC_FRAMEWORK.personaModes.map(mode => (
                        <option key={mode.key} value={mode.key}>
                          {mode.name} - {mode.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phase Selection */}
                  <div className="space-y-2">
                    <Label>Enabled Phases</Label>
                    <p className="text-xs text-textMuted mb-2">Select which SYNC phases to include in your workflow</p>
                    <div className="space-y-2">
                      {SYNC_FRAMEWORK.phases.map(phase => (
                        <label key={phase.key} className="flex items-start p-3 bg-surfaceHighlight rounded-lg border border-border cursor-pointer hover:bg-border transition-colors">
                          <input
                            type="checkbox"
                            checked={config.syncEnabledPhases.includes(phase.key)}
                            onChange={(e) => {
                              setConfig(prev => ({
                                ...prev,
                                syncEnabledPhases: e.target.checked
                                  ? [...prev.syncEnabledPhases, phase.key]
                                  : prev.syncEnabledPhases.filter(p => p !== phase.key)
                              }));
                            }}
                            className="w-4 h-4 mt-0.5 rounded border-border"
                          />
                          <div className="ml-3 flex-1">
                            <div className="font-semibold text-sm">{phase.emoji} {phase.name}</div>
                            <div className="text-xs text-textMuted">{phase.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Agent Selection */}
                  <div className="space-y-2">
                    <Label>Enabled Agents</Label>
                    <p className="text-xs text-textMuted mb-2">Select which specialized agents to use</p>
                    <div className="space-y-2">
                      {SYNC_FRAMEWORK.agents.map(agent => (
                        <label key={agent.key} className="flex items-start p-3 bg-surfaceHighlight rounded-lg border border-border cursor-pointer hover:bg-border transition-colors">
                          <input
                            type="checkbox"
                            checked={config.syncEnabledAgents.includes(agent.key)}
                            onChange={(e) => {
                              setConfig(prev => ({
                                ...prev,
                                syncEnabledAgents: e.target.checked
                                  ? [...prev.syncEnabledAgents, agent.key]
                                  : prev.syncEnabledAgents.filter(a => a !== agent.key)
                              }));
                            }}
                            className="w-4 h-4 mt-0.5 rounded border-border"
                          />
                          <div className="ml-3 flex-1">
                            <div className="font-semibold text-sm">{agent.name}</div>
                            <div className="text-xs text-textMuted">{agent.role} - {agent.analogy}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Mandate Selection */}
                  <div className="space-y-2">
                    <Label>Enabled Mandates</Label>
                    <p className="text-xs text-textMuted mb-2">Select which non-negotiable laws to enforce</p>
                    <div className="space-y-2">
                      {SYNC_FRAMEWORK.mandates.map(mandate => (
                        <label key={mandate.key} className="flex items-start p-3 bg-surfaceHighlight rounded-lg border border-border cursor-pointer hover:bg-border transition-colors">
                          <input
                            type="checkbox"
                            checked={config.syncEnabledMandates.includes(mandate.key)}
                            onChange={(e) => {
                              setConfig(prev => ({
                                ...prev,
                                syncEnabledMandates: e.target.checked
                                  ? [...prev.syncEnabledMandates, mandate.key]
                                  : prev.syncEnabledMandates.filter(m => m !== mandate.key)
                              }));
                            }}
                            className="w-4 h-4 mt-0.5 rounded border-border"
                          />
                          <div className="ml-3 flex-1">
                            <div className="font-semibold text-sm">{mandate.name}</div>
                            <div className="text-xs text-textMuted">{mandate.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Quick Enable All Button */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setConfig(prev => ({
                          ...prev,
                          syncEnabledPhases: SYNC_FRAMEWORK.phases.map(p => p.key),
                          syncEnabledAgents: SYNC_FRAMEWORK.agents.map(a => a.key),
                          syncEnabledMandates: SYNC_FRAMEWORK.mandates.map(m => m.key)
                        }));
                      }}
                      className="flex-1"
                    >
                      Enable All
                    </Button>
                    <Button
                      onClick={() => {
                        setConfig(prev => ({
                          ...prev,
                          syncEnabledPhases: [],
                          syncEnabledAgents: [],
                          syncEnabledMandates: []
                        }));
                      }}
                      className="flex-1"
                    >
                      Clear All
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Enforcement Modules */}
          <Card title="6b. Enforcement Modules">
            <p className="text-xs text-textMuted mb-4">Select modules to enforce specific development practices. Modules with conflicts will be grayed out.</p>
            
            {/* Module Preset Selector */}
            <div className="mb-6">
              <Label>Quick Start Preset</Label>
              <select 
                onChange={(e) => {
                  if (e.target.value) {
                    applyModulePreset(e.target.value);
                  }
                }}
                className="w-full bg-surfaceHighlight border border-border rounded-lg px-3 py-2.5 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="">Select a module preset...</option>
                {Object.entries(MODULE_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.name} - {preset.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Module Categories */}
            {CATEGORIES.map(category => (
              <details key={category.name} className="mb-4 border border-border rounded-lg overflow-hidden" open>
                <summary className="px-4 py-3 bg-surfaceHighlight cursor-pointer hover:bg-border transition-colors">
                  <span className="font-semibold text-sm">{category.name}</span>
                  <span className="text-xs text-textMuted ml-2">({category.modules.length} modules)</span>
                  <p className="text-xs text-textMuted mt-1">{category.description}</p>
                </summary>
                <div className="p-4 space-y-3">
                  {category.modules.map(module => {
                    const isEnabled = config.enabledModules.includes(module.key);
                    const conflictingWith = getConflictingModules(module.key).filter(k => config.enabledModules.includes(k));
                    const conflictsWithSync = config.syncFrameworkEnabled && syncConflictsWithModule(module.key);
                    const hasActiveConflict = conflictingWith.length > 0 || conflictsWithSync;
                    const isConflicting = !isEnabled && hasConflict(config.enabledModules, module.key, config.syncFrameworkEnabled);
                    const impliedBy = getImpliedModules(module.key);
                    const isAdvisory = config.advisoryModules.includes(module.key);
                    const severityInfo = getSeverityInfo(module.severity);
                    
                    const conflictsList = [...conflictingWith, ...(conflictsWithSync ? ['SYNC Framework'] : [])];
                    
                    return (
                      <div 
                        key={module.key}
                        className={`p-3 rounded-lg border transition-all ${
                          isEnabled 
                            ? hasActiveConflict
                              ? 'bg-red-500/10 border-red-500/30'
                              : 'bg-primary/10 border-primary/30' 
                            : isConflicting 
                              ? 'bg-red-500/5 border-red-500/20 opacity-60' 
                              : 'bg-surfaceHighlight border-border hover:border-textMuted'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            disabled={isConflicting}
                            onChange={() => handleModuleToggle(module.key)}
                            className="mt-1 w-4 h-4 rounded border-border cursor-pointer disabled:cursor-not-allowed"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{module.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded border ${severityInfo.className}`}>
                                {isAdvisory ? 'ADVISORY' : severityInfo.label}
                              </span>
                              {(isConflicting || hasActiveConflict) && (
                                <span className="text-xs px-2 py-0.5 rounded border bg-red-500/10 text-red-600 border-red-500/30">
                                  ⚠️ Conflicts with: {conflictsList.join(', ')}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-textMuted mt-1">{module.description}</p>
                            
                            {/* Show implied modules */}
                            {impliedBy.length > 0 && isEnabled && (
                              <p className="text-xs text-primary mt-1">
                                → Implies: {impliedBy.join(', ')}
                              </p>
                            )}
                            
                            {/* Advisory toggle when enabled */}
                            {isEnabled && (
                              <div className="mt-2 flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`advisory-${module.key}`}
                                  checked={isAdvisory}
                                  onChange={() => handleAdvisoryToggle(module.key)}
                                  className="w-3 h-3 rounded border-border"
                                />
                                <label htmlFor={`advisory-${module.key}`} className="text-xs text-textMuted cursor-pointer">
                                  Advisory only (warn but don't block)
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>
            ))}
            
            {/* Summary of enabled modules */}
            {config.enabledModules.length > 0 && (
              <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-sm font-medium">
                  {config.enabledModules.length} module{config.enabledModules.length > 1 ? 's' : ''} enabled
                </p>
                <p className="text-xs text-textMuted mt-1">
                  {config.enabledModules.join(', ')}
                </p>
              </div>
            )}
          </Card>

          {/* Development Principles */}
          <Card title="7. Development Principles">
            <p className="text-xs text-textMuted mb-4">Core principles that guide all development decisions</p>
            <div className="space-y-2 mb-4">
              {config.developmentPrinciples.map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-surfaceHighlight p-2 rounded-lg border border-border group">
                  <span className="text-green-300 text-xs font-bold px-2 py-0.5 bg-green-950 rounded border border-green-800">✅</span>
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
                  <span className="text-blue-300 text-xs font-bold px-2 py-0.5 bg-blue-950 rounded border border-blue-800">☐</span>
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
                  <span className="text-yellow-300 text-xs font-bold px-2 py-0.5 bg-yellow-950 rounded border border-yellow-800">⚠️</span>
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
                  <span className="text-purple-300 text-xs font-bold px-2 py-0.5 bg-purple-950 rounded border border-purple-800">❓</span>
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
                  <span className="text-orange-300 text-xs font-bold px-2 py-0.5 bg-orange-950 rounded border border-orange-800">👁️</span>
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

          {/* Skills */}
          <Card title="14. Agent Skills">
            <p className="text-xs text-textMuted mb-4">Specialized knowledge and workflows for specific tasks. Each skill is a folder with a SKILL.md file containing instructions.</p>
            
            {/* Best Practices Expandable */}
            <details className="mb-4 p-4 bg-surfaceHighlight rounded-lg border border-border">
              <summary className="font-semibold cursor-pointer text-sm">
                📖 Skill Best Practices
              </summary>
              <div className="mt-2 space-y-2 text-xs text-textMuted">
                <p><strong>Name Requirements:</strong></p>
                <ul className="list-disc ml-6">
                  <li>Lowercase letters, numbers, and hyphens only</li>
                  <li>Cannot start/end with hyphen or have consecutive hyphens</li>
                  <li>Max 64 characters</li>
                  <li>Should match folder name</li>
                </ul>
                
                <p className="mt-3"><strong>Description Tips:</strong></p>
                <ul className="list-disc ml-6">
                  <li>Include BOTH what it does AND when to use it</li>
                  <li>Add specific keywords/triggers</li>
                  <li>Keep it clear and focused (1-1024 chars)</li>
                </ul>
                
                <p className="mt-3"><strong>Structure:</strong></p>
                <ul className="list-disc ml-6">
                  <li>Keep main SKILL.md under 500 lines</li>
                  <li>Use references/ for detailed docs</li>
                  <li>Use scripts/ for executable code</li>
                  <li>Use assets/ for templates/resources</li>
                </ul>
              </div>
            </details>

            <div className="space-y-3 mb-4">
              {config.skills.map((skill) => (
                <div key={skill.id} className="flex gap-2 items-start bg-surfaceHighlight p-3 rounded-lg border border-border group">
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        value={skill.name} 
                        onChange={(e) => updateSkill(skill.id, 'name', e.target.value)} 
                        placeholder="Skill name (e.g. pdf-processing)"
                        className="font-mono text-xs"
                      />
                      <Input 
                        value={skill.path} 
                        onChange={(e) => updateSkill(skill.id, 'path', e.target.value)} 
                        placeholder="Path (e.g. skills/pdf-processing)"
                        className="font-mono text-xs"
                      />
                    </div>
                    <TextArea 
                      value={skill.description} 
                      onChange={(e) => updateSkill(skill.id, 'description', e.target.value)} 
                      placeholder="Description: what the skill does and when to use it (include keywords)"
                      className="text-xs h-16"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input 
                        value={skill.license || ''} 
                        onChange={(e) => updateSkill(skill.id, 'license', e.target.value)} 
                        placeholder="License (optional)"
                        className="text-xs"
                      />
                      <Input 
                        value={skill.compatibility || ''} 
                        onChange={(e) => updateSkill(skill.id, 'compatibility', e.target.value)} 
                        placeholder="Compatibility (optional)"
                        className="text-xs"
                      />
                      <Input 
                        value={skill.allowedTools || ''} 
                        onChange={(e) => updateSkill(skill.id, 'allowedTools', e.target.value)} 
                        placeholder="Allowed tools (optional)"
                        className="text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        value={skill.metadata?.author || ''} 
                        onChange={(e) => updateSkillMetadata(skill.id, 'author', e.target.value)} 
                        placeholder="Author (optional)"
                        className="text-xs"
                      />
                      <Input 
                        value={skill.metadata?.version || ''} 
                        onChange={(e) => updateSkillMetadata(skill.id, 'version', e.target.value)} 
                        placeholder="Version (optional)"
                        className="text-xs"
                      />
                    </div>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 text-xs">
                        <input 
                          type="checkbox" 
                          checked={skill.hasReferences || false}
                          onChange={(e) => updateSkill(skill.id, 'hasReferences', e.target.checked)}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span>📚 Has references/</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input 
                          type="checkbox" 
                          checked={skill.hasScripts || false}
                          onChange={(e) => updateSkill(skill.id, 'hasScripts', e.target.checked)}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span>🔧 Has scripts/</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input 
                          type="checkbox" 
                          checked={skill.hasAssets || false}
                          onChange={(e) => updateSkill(skill.id, 'hasAssets', e.target.checked)}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span>📦 Has assets/</span>
                      </label>
                    </div>
                  </div>
                  <button onClick={() => removeSkill(skill.id)} className="opacity-0 group-hover:opacity-100 text-textMuted hover:text-red-400 transition-opacity mt-2">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input 
                      value={newSkill.name} 
                      onChange={(e) => {
                        const name = e.target.value;
                        setNewSkill(prev => ({...prev, name}));
                        setSkillNameError(validateSkillName(name));
                      }} 
                      placeholder="Skill name (lowercase-with-hyphens)"
                      className={`font-mono text-xs ${skillNameError ? 'border-red-500' : ''}`}
                    />
                    {skillNameError && <p className="text-xs text-red-400 mt-1">{skillNameError}</p>}
                  </div>
                  <Input 
                    value={newSkill.path} 
                    onChange={(e) => setNewSkill(prev => ({...prev, path: e.target.value}))} 
                    placeholder="Path (auto-generated if empty)"
                    className="font-mono text-xs"
                  />
                </div>
                <TextArea 
                  value={newSkill.description} 
                  onChange={(e) => setNewSkill(prev => ({...prev, description: e.target.value}))} 
                  placeholder="Description: what it does AND when to use it (e.g., 'Extract PDFs. Use when user mentions PDFs or documents')"
                  className="text-xs h-16"
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input 
                    value={newSkill.license} 
                    onChange={(e) => setNewSkill(prev => ({...prev, license: e.target.value}))} 
                    placeholder="License (optional)"
                    className="text-xs"
                  />
                  <Input 
                    value={newSkill.compatibility} 
                    onChange={(e) => setNewSkill(prev => ({...prev, compatibility: e.target.value}))} 
                    placeholder="Compatibility (optional)"
                    className="text-xs"
                  />
                  <Input 
                    value={newSkill.allowedTools} 
                    onChange={(e) => setNewSkill(prev => ({...prev, allowedTools: e.target.value}))} 
                    placeholder="Allowed tools (optional)"
                    className="text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    value={newSkill.author} 
                    onChange={(e) => setNewSkill(prev => ({...prev, author: e.target.value}))} 
                    placeholder="Author (optional)"
                    className="text-xs"
                  />
                  <Input 
                    value={newSkill.version} 
                    onChange={(e) => setNewSkill(prev => ({...prev, version: e.target.value}))} 
                    placeholder="Version (optional)"
                    className="text-xs"
                  />
                </div>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input 
                      type="checkbox" 
                      checked={newSkill.hasReferences}
                      onChange={(e) => setNewSkill(prev => ({...prev, hasReferences: e.target.checked}))}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span>📚 Has references/</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input 
                      type="checkbox" 
                      checked={newSkill.hasScripts}
                      onChange={(e) => setNewSkill(prev => ({...prev, hasScripts: e.target.checked}))}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span>🔧 Has scripts/</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input 
                      type="checkbox" 
                      checked={newSkill.hasAssets}
                      onChange={(e) => setNewSkill(prev => ({...prev, hasAssets: e.target.checked}))}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span>📦 Has assets/</span>
                  </label>
                </div>
              </div>
              <Button onClick={() => {
                if (!skillNameError) {
                  addSkill(newSkill.name, newSkill.description, newSkill.path, newSkill.license, newSkill.compatibility, newSkill.author, newSkill.version, newSkill.allowedTools, newSkill.hasReferences, newSkill.hasScripts, newSkill.hasAssets);
                  setNewSkill({ name: '', description: '', path: '', license: '', compatibility: '', author: '', version: '', allowedTools: '', hasReferences: false, hasScripts: false, hasAssets: false });
                }
              }} variant="secondary" className="self-end">Add</Button>
            </div>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-800">
              <strong>💡 Tip:</strong> Use the "LLM Helpers" tab to generate skills suggestions using AI!
            </div>
          </Card>
        </div>
      </div>

      {/* RIGHT PANEL: PREVIEW & TOOLS */}
      <div className="w-full md:w-1/2 lg:w-full bg-surfaceHighlight dark:bg-darkCodeBg flex flex-col h-full overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center border-b border-border dark:border-darkCodeBorder bg-surface dark:bg-darkCodeSurface">
           <button 
             onClick={() => setActiveTab('markdown')}
             className={`px-6 py-3 text-sm font-medium border-r border-border dark:border-darkCodeBorder transition-colors ${activeTab === 'markdown' ? 'bg-surfaceHighlight dark:bg-darkCodeBg text-textMain dark:text-white border-t-2 border-t-primary' : 'text-textMuted dark:text-gray-400 hover:bg-background dark:hover:bg-darkCodeHover'}`}
           >
             📄 AGENTS.md
           </button>
           <button 
             onClick={() => setActiveTab('prompt')}
             className={`px-6 py-3 text-sm font-medium border-r border-border dark:border-darkCodeBorder transition-colors ${activeTab === 'prompt' ? 'bg-surfaceHighlight dark:bg-darkCodeBg text-textMain dark:text-white border-t-2 border-t-primary' : 'text-textMuted dark:text-gray-400 hover:bg-background dark:hover:bg-darkCodeHover'}`}
           >
             🤖 System Prompt
           </button>
           <button 
             onClick={() => setActiveTab('helpers')}
             className={`px-6 py-3 text-sm font-medium border-r border-border dark:border-darkCodeBorder transition-colors ${activeTab === 'helpers' ? 'bg-surfaceHighlight dark:bg-darkCodeBg text-textMain dark:text-white border-t-2 border-t-primary' : 'text-textMuted dark:text-gray-400 hover:bg-background dark:hover:bg-darkCodeHover'}`}
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
        <div className="flex-1 overflow-auto bg-surfaceHighlight dark:bg-darkCodeBg p-0 relative">
          {activeTab === 'markdown' && (
             <div className="p-8 max-w-4xl mx-auto">
               <pre className="font-mono text-sm text-textMain dark:text-gray-300 whitespace-pre-wrap">{generatedMarkdown}</pre>
             </div>
          )}

          {activeTab === 'prompt' && (
             <div className="p-8 max-w-4xl mx-auto">
               <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mb-6 text-sm text-blue-800">
                 <strong>How to use:</strong> Paste this into Cursor's "Rules for AI" or as a System Prompt in your chat configuration.
               </div>
               <pre className="font-mono text-sm text-textMain dark:text-gray-300 whitespace-pre-wrap">{systemPrompt}</pre>
             </div>
          )}

          {activeTab === 'helpers' && (
            <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
              {helperPrompts.map((helper, idx) => (
                <div key={idx} className="bg-surface dark:bg-darkCodeSurface border border-border dark:border-darkCodeBorder rounded-xl p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-textMain dark:text-white flex items-center gap-2">
                        {helper.title}
                      </h3>
                      <p className="text-sm text-textMuted dark:text-gray-400 mt-1">{helper.description}</p>
                    </div>
                    <Button variant="ghost" onClick={() => copyToClipboard(helper.prompt)}>
                      <CopyIcon /> Copy
                    </Button>
                  </div>
                  
                  <div className="bg-surfaceHighlight dark:bg-black/30 rounded-lg p-3 mb-4 border border-border dark:border-white/5 flex-1 max-h-40 overflow-y-auto">
                    <pre className="text-xs text-textMuted dark:text-gray-500 whitespace-pre-wrap font-mono">{helper.prompt}</pre>
                  </div>

                  <div className="mt-auto pt-4 border-t border-border dark:border-white/5">
                    <Label>Import LLM Response (JSON)</Label>
                    <div className="flex gap-2">
                      <TextArea 
                        placeholder="Paste the JSON response here..." 
                        className="bg-surfaceHighlight dark:bg-black/20 border-border dark:border-white/10 h-20 font-mono text-xs"
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
