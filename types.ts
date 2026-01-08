export enum ProjectPhase {
  PROTOTYPE = 'prototype',
  PRODUCTION = 'production',
}

// Agent Module Types
export type ModuleCategoryType = 'engineering' | 'security' | 'operations' | 'process' | 'architecture';
export type ModuleSeverity = 'gate' | 'critical' | 'standard' | 'mode';

export interface AgentModule {
  key: string;
  title: string;
  enabled: boolean;
  category: ModuleCategoryType;
  severity: ModuleSeverity;
  description: string;
  purpose: string;
  failureModes: string[];
  rules: {
    hard: string[];
    soft: string[];
  };
  conflicts: string[];
  implies: string[];
}

export interface ModuleCategoryDefinition {
  key: string;
  name: string;
  description: string;
  displayOrder: number;
}

export interface ModulePreset {
  key: string;
  name: string;
  description: string;
  modules: string[];
  advisory: string[];
}

export interface ModuleCategory {
  name: string;
  modules: AgentModule[];
  description: string;
}

// Root schema for agents-modules.json - single source of truth
export interface AgentsModulesSchema {
  schemaVersion: number;
  categories: ModuleCategoryDefinition[];
  presets: ModulePreset[];
  modules: AgentModule[];
}

export enum AIStyle {
  TERSE = 'terse',
  EXPLANATORY = 'explanatory',
  SOCRATIC = 'socratic'
}

export interface DocMapItem {
  id: string;
  path: string;
  description: string;
}

export interface ListItem {
  id: string;
  text: string;
}

export interface AdditionalResource {
  id: string;
  title: string;
  path: string;
  description: string;
}

export interface ShellCommand {
  id: string;
  command: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  path: string;
  license?: string;
  compatibility?: string;
  metadata?: {
    author?: string;
    version?: string;
    [key: string]: string | undefined;
  };
  allowedTools?: string;
  hasReferences?: boolean;
  hasScripts?: boolean;
  hasAssets?: boolean;
}

export interface AgentConfig {
  projectName: string;
  mission: string;
  northStar: string;
  phase: ProjectPhase;
  languages: string;
  frameworks: string;
  packageManager: string;
  styling: string;
  stateManagement: string;
  backend: string;
  docMap: DocMapItem[];
  neverList: string[];
  testingStrategy: string;
  aiStyle: AIStyle;
  directoryStructure: string;
  // New fields for extended AGENTS.md features
  additionalResources: AdditionalResource[];
  developmentPrinciples: ListItem[];
  preImplementationChecklist: ListItem[];
  aiWorkflowEnabled: boolean;
  llmOptimizedPatternsEnabled: boolean;
  fixPreExistingIssuesEnabled: boolean;
  globalRulesEnabled: boolean;
  shellCommands: ShellCommand[];
  mistakesToAvoid: ListItem[];
  questionsToAsk: ListItem[];
  blindSpots: ListItem[];
  skills: Skill[];
  // Enforcement modules
  enabledModules: string[];
  advisoryModules: string[];
}
