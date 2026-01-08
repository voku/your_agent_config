import { AgentModule, ModuleCategory } from './types';
import modulesData from './agents-modules.json';

// Cast JSON data to properly typed modules
export const MODULES: AgentModule[] = modulesData as AgentModule[];

export const CATEGORIES: ModuleCategory[] = [
  {
    name: 'Security & Operations',
    description: 'Critical safety nets for production systems',
    modules: MODULES.filter(m => m.category === 'security' || m.category === 'operations')
  },
  {
    name: 'Engineering Discipline',
    description: 'Code quality and testing practices',
    modules: MODULES.filter(m => m.category === 'engineering')
  },
  {
    name: 'Process & Workflow',
    description: 'Team collaboration and development modes',
    modules: MODULES.filter(m => m.category === 'process')
  },
  {
    name: 'Architecture & Design',
    description: 'System structure and API contracts',
    modules: MODULES.filter(m => m.category === 'architecture')
  }
];

/**
 * Check if enabling a new module would create a conflict with already enabled modules
 */
export function hasConflict(enabledModules: string[], newModule: string): boolean {
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
  
  return newModuleConflicts || enabledModulesConflict;
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
 * Get a module by its key
 */
export function getModuleByKey(key: string): AgentModule | undefined {
  return MODULES.find(m => m.key === key);
}

/**
 * Get severity badge styling info
 */
export function getSeverityInfo(severity: AgentModule['severity']): { label: string; className: string; description: string } {
  switch (severity) {
    case 'gate':
      return { 
        label: 'ENFORCED', 
        className: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
        description: 'Mandatory enforcement - blocks merge if violated'
      };
    case 'critical':
      return { 
        label: 'BLOCKS MERGE', 
        className: 'bg-red-500/10 text-red-600 border-red-500/30',
        description: 'Critical rule - will block merge on violation'
      };
    case 'standard':
      return { 
        label: 'ADVISORY', 
        className: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
        description: 'Standard advisory - warns but does not block'
      };
    case 'mode':
      return { 
        label: 'MODE', 
        className: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
        description: 'Operating mode - changes overall behavior'
      };
  }
}
