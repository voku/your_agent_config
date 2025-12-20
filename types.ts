export enum ProjectPhase {
  PROTOTYPE = 'prototype',
  PRODUCTION = 'production',
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
  shellCommands: ShellCommand[];
  mistakesToAvoid: ListItem[];
  questionsToAsk: ListItem[];
  blindSpots: ListItem[];
}
