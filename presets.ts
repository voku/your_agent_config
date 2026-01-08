// All presets are now in agents-modules.json (single source of truth)
// Re-export from modules.ts which loads from JSON

export { MODULE_PRESETS, PROJECT_PRESETS, FIELD_PRESETS } from './modules';

// Re-export types for convenience
export type { ModulePreset, ProjectPreset, FieldPresets } from './types';
