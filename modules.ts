import { 
  AgentModule, 
  ModuleCategory, 
  AgentsModulesSchema, 
  ModulePreset, 
  ProjectPreset, 
  FieldPresets,
  SeverityConfig,
  WorkflowTemplates,
  LLMHelper,
  ModuleSeverity
} from './types';
import modulesData from './agents-modules.json';

// Cast JSON data to properly typed schema
const schema = modulesData as AgentsModulesSchema;

// Export modules from the single source of truth
export const MODULES: AgentModule[] = schema.modules;

// Export module presets from the single source of truth
export const MODULE_PRESETS: Record<string, ModulePreset> = Object.fromEntries(
  schema.modulePresets.map(preset => [preset.key, preset])
);

// Export project presets from the single source of truth
export const PROJECT_PRESETS: Record<string, ProjectPreset> = Object.fromEntries(
  schema.projectPresets.map(preset => [preset.key, preset])
);

// Export field presets from the single source of truth
export const FIELD_PRESETS: FieldPresets = schema.fieldPresets;

// Export severity configurations from the single source of truth
export const SEVERITIES: Record<ModuleSeverity, SeverityConfig> = schema.severities;

// Export workflow templates from the single source of truth
export const WORKFLOW_TEMPLATES: WorkflowTemplates = schema.workflowTemplates;

// Export LLM helpers from the single source of truth
export const LLM_HELPERS: LLMHelper[] = schema.llmHelpers;

// Export SYNC framework from the single source of truth
export const SYNC_FRAMEWORK = schema.syncFramework;

// Build categories dynamically from the schema's displayGroups
export const CATEGORIES: ModuleCategory[] = schema.displayGroups
  .sort((a, b) => a.displayOrder - b.displayOrder)
  .map(group => ({
    name: group.name,
    description: group.description,
    modules: MODULES.filter(m => group.categories.includes(m.category))
  }));

/**
 * Check if enabling a new module would create a conflict with already enabled modules
 */
export function hasConflict(enabledModules: string[], newModule: string, syncFrameworkEnabled = false): boolean {
  const module = MODULES.find(m => m.key === newModule);
  if (!module) return false;
  
  // Check if the new module conflicts with any enabled module
  const newModuleConflicts = enabledModules.some(enabled => 
    module.conflicts.includes(enabled)
  );
  
  // Also check if any enabled module conflicts with the new one
  const enabledModulesConflict = enabledModules.some(enabled => {
    const enabledModule = MODULES.find(m => m.key === enabled);
    return enabledModule?.conflicts.includes(newModule) ?? false;
  });
  
  // Check if SYNC Framework conflicts with this module
  const syncConflictsWithNewModule = syncFrameworkEnabled && 
    SYNC_FRAMEWORK?.conflicts?.includes(newModule);
  
  return newModuleConflicts || enabledModulesConflict || syncConflictsWithNewModule || false;
}

/**
 * Get all modules that conflict with a given module
 */
export function getConflictingModules(moduleKey: string): string[] {
  const module = MODULES.find(m => m.key === moduleKey);
  if (!module) return [];
  
  // Get modules that this module conflicts with
  const directConflicts = [...module.conflicts];
  
  // Also get modules that conflict with this module (using filter for better performance)
  const reverseConflicts = MODULES
    .filter(m => m.conflicts.includes(moduleKey) && !directConflicts.includes(m.key))
    .map(m => m.key);
  
  return [...directConflicts, ...reverseConflicts];
}

/**
 * Get modules that are implied (recommended) when enabling a module
 */
export function getImpliedModules(moduleKey: string): string[] {
  const module = MODULES.find(m => m.key === moduleKey);
  return module?.implies || [];
}

/**
 * Check if SYNC Framework conflicts with a given module
 */
export function syncConflictsWithModule(moduleKey: string): boolean {
  return SYNC_FRAMEWORK?.conflicts?.includes(moduleKey) ?? false;
}

/**
 * Get modules that conflict with SYNC Framework
 */
export function getModulesConflictingWithSync(): string[] {
  return SYNC_FRAMEWORK?.conflicts || [];
}

/**
 * Get a module by its key
 */
export function getModuleByKey(key: string): AgentModule | undefined {
  return MODULES.find(m => m.key === key);
}

/**
 * Get severity badge styling info from the single source of truth
 */
export function getSeverityInfo(severity: ModuleSeverity): SeverityConfig {
  return SEVERITIES[severity];
}

/**
 * Interpolate template variables in a string
 */
export function interpolateTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '');
}
