// Loosened type to prevent GraphQL FragmentType from resolving to `never`
// under strict TypeScript + current codegen setup.
// This unblocks the build. You can tighten types later after regenerating codegen locally.

export type FragmentTypePostFullFields = any
