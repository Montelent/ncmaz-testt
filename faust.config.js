import { setConfig } from "@faustwp/core";
import templates from "./src/wp-templates";
import possibleTypes from "./possibleTypes.json";

/**
 * @type {import('@faustwp/core').FaustConfig}
 **/
export default setConfig({
  templates,
  possibleTypes,
  usePersistedQueries: false,
  // Prefer POST so large queries never hit URL length limits (414)
  useGETForQueries: false,
});
