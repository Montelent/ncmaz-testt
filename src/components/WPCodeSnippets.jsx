/**
 * WPCodeSnippets.jsx
 *
 * Renders WPCode snippets (fetched via the wpcode-graphql-bridge.php plugin)
 * on a Faust.js frontend, grouped by their original WPCode location.
 *
 * Usage in pages/_app.js:
 *
 *   import { useQuery } from "@apollo/client";
 *   import {
 *     WPCODE_SNIPPETS_QUERY,
 *     WPCodeHeaderSnippets,
 *     WPCodeBodyOpenSnippets,
 *     WPCodeFooterSnippets,
 *   } from "../components/WPCodeSnippets";
 *
 *   function MyApp({ Component, pageProps }) {
 *     const { data } = useQuery(WPCODE_SNIPPETS_QUERY);
 *     const snippets = data?.wpcodeSnippets ?? [];
 *
 *     return (
 *       <>
 *         <WPCodeHeaderSnippets snippets={snippets} />
 *         <WPCodeBodyOpenSnippets snippets={snippets} />
 *         <Component {...pageProps} />
 *         <WPCodeFooterSnippets snippets={snippets} />
 *       </>
 *     );
 *   }
 *
 *   export default MyApp;
 */

import { gql } from "@apollo/client";
import Head from "next/head";
import Script from "next/script";

export const WPCODE_SNIPPETS_QUERY = gql`
  query GetWPCodeSnippets($location: String) {
    wpcodeSnippets(location: $location) {
      databaseId
      title
      code
      codeType
      location
      priority
    }
  }
`;

function renderSnippet(snippet) {
  const { databaseId, code, codeType } = snippet;
  if (!code) return null;

  switch (codeType) {
    case "css":
      return (
        <style
          key={databaseId}
          id={`wpcode-${databaseId}`}
          dangerouslySetInnerHTML={{ __html: code }}
        />
      );

    case "js":
      return (
        <Script
          key={databaseId}
          id={`wpcode-${databaseId}`}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: code }}
        />
      );

    case "html":
    case "universal":
    case "text":
      return (
        <div
          key={databaseId}
          id={`wpcode-${databaseId}`}
          dangerouslySetInnerHTML={{ __html: code }}
        />
      );

    default:
      // PHP snippets execute on the server in classic WP — there's nothing
      // to run client-side, so they're intentionally skipped here.
      return null;
  }
}

/** Place inside <Head> — mirrors WPCode's "Site Wide Header" location. */
export function WPCodeHeaderSnippets({ snippets }) {
  const headerSnippets = snippets.filter((s) => s.location === "frontend_header");
  if (!headerSnippets.length) return null;
  return <Head>{headerSnippets.map(renderSnippet)}</Head>;
}

/** Place immediately after your top-level layout opens — mirrors "Body - Open". */
export function WPCodeBodyOpenSnippets({ snippets }) {
  const bodySnippets = snippets.filter((s) => s.location === "frontend_body_open");
  if (!bodySnippets.length) return null;
  return <>{bodySnippets.map(renderSnippet)}</>;
}

/** Place at the very end of your layout — mirrors "Site Wide Footer". */
export function WPCodeFooterSnippets({ snippets }) {
  const footerSnippets = snippets.filter((s) => s.location === "frontend_footer");
  if (!footerSnippets.length) return null;
  return <>{footerSnippets.map(renderSnippet)}</>;
}
