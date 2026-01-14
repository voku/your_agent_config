export enum ProjectPhase {
  PROTOTYPE = 'prototype',
  PRODUCTION = 'production',
}

// Agent Module Types
export type ModuleCategoryType = 'engineering' | 'security' | 'operations' | 'process' | 'architecture';
export type ModuleSeverity = 'gate' | 'critical' | 'standard' | 'mode';

export interface ModuleExample {
  title: string;
  bad: string;
  good: string;
  explanation?: string;
}

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
  examples?: ModuleExample[];
  conflicts: string[];
  implies: string[];
}

export interface ModuleCategoryDefinition {
  key: string;
  name: string;
  description: string;
  displayGroup: string;
  displayOrder: number;
}

export interface DisplayGroup {
  key: string;
  name: string;
  description: string;
  categories: string[];
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

// Project preset for tech stack templates
export interface ProjectPreset {
  key: string;
  name: string;
  description: string;
  languages: string;
  frameworks: string;
  packageManager: string;
  styling: string;
  stateManagement: string;
  backend: string;
}

// Field presets for combo input suggestions
export interface FieldPresets {
  languages: string[];
  frameworks: string[];
  packageManagers: string[];
  styling: string[];
  stateManagement: string[];
  backend: string[];
}

// Severity configuration
export interface SeverityConfig {
  label: string;
  className: string;
  description: string;
}

// Workflow template phase
export interface WorkflowPhase {
  name: string;
  subtitle: string | null;
  items: string[];
}

// AI Workflow template
export interface AIWorkflowTemplate {
  title: string;
  description: string;
  phases: WorkflowPhase[];
}

// LLM Optimized Patterns principle
export interface LLMPatternPrinciple {
  name: string;
  items: string[];
}

// LLM Optimized Patterns template
export interface LLMOptimizedPatternsTemplate {
  title: string;
  description: string;
  principles: LLMPatternPrinciple[];
}

// Fix Pre-existing Issues guideline
export interface FixIssuesGuideline {
  name: string;
  items: string[];
}

// Fix Pre-existing Issues template
export interface FixPreExistingIssuesTemplate {
  title: string;
  description: string;
  guidelines: FixIssuesGuideline[];
  doFix: string[];
  dontFix: string[];
}

// Global Rules template
export interface GlobalRulesTemplate {
  title: string;
  description: string;
  motto: string;
  principles: string[];
}

// All workflow templates
export interface WorkflowTemplates {
  aiWorkflow: AIWorkflowTemplate;
  llmOptimizedPatterns: LLMOptimizedPatternsTemplate;
  fixPreExistingIssues: FixPreExistingIssuesTemplate;
  globalRules: GlobalRulesTemplate;
}

// LLM Helper prompt
export interface LLMHelper {
  key: string;
  title: string;
  description: string;
  expectedFields: string[];
  promptTemplate: string;
}

// Root schema for agents-modules.json - single source of truth
export interface AgentsModulesSchema {
  schemaVersion: number;
  categories: ModuleCategoryDefinition[];
  displayGroups: DisplayGroup[];
  severities: Record<ModuleSeverity, SeverityConfig>;
  modulePresets: ModulePreset[];
  projectPresets: ProjectPreset[];
  fieldPresets: FieldPresets;
  workflowTemplates: WorkflowTemplates;
  llmHelpers: LLMHelper[];
  modules: AgentModule[];
  syncFramework?: SYNCFrameworkTemplate;
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

// SYNC Framework Types
export enum SYNCPhase {
  ALIGN = 'align',
  IDEATE = 'ideate',
  PROTOTYPE = 'prototype',
  REFLECT = 'reflect',
  LEARN = 'learn'
}

export enum SYNCPersonaMode {
  STRICT = 'strict',
  ADAPTIVE = 'adaptive'
}

export interface SYNCPhaseDefinition {
  key: SYNCPhase;
  name: string;
  emoji: string;
  description: string;
  purpose: string;
  questions: string[];
  outputs: string[];
}

export interface SYNCAgentDefinition {
  key: string;
  name: string;
  role: string;
  analogy: string;
  responsibilities: string[];
  enforcedMandates: string[];
}

export interface SYNCMandateDefinition {
  key: string;
  name: string;
  description: string;
  ensures: string;
  basedOn?: string;
  requirements: string[];
}

export interface SYNCPersonaModeDefinition {
  key: SYNCPersonaMode;
  name: string;
  description: string;
  behavior: string;
}

export interface SYNCFrameworkTemplate {
  title: string;
  description: string;
  motto: string;
  phases: SYNCPhaseDefinition[];
  agents: SYNCAgentDefinition[];
  mandates: SYNCMandateDefinition[];
  personaModes: SYNCPersonaModeDefinition[];
  howItWorksTogether: string;
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
  // SYNC Framework
  syncFrameworkEnabled: boolean;
  syncPersonaMode: SYNCPersonaMode;
  syncEnabledPhases: SYNCPhase[];
  syncEnabledAgents: string[];
  syncEnabledMandates: string[];
}
