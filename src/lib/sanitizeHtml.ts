import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize rich-text HTML before it is injected with `dangerouslySetInnerHTML`.
 *
 * `dangerouslySetInnerHTML` bypasses React's escaping, so raw stored HTML would let a
 * `<script>` / `onerror=` / `javascript:` payload run in every viewer's browser. That
 * matters most for user-authored content (forum posts), where it is stored XSS.
 *
 * `isomorphic-dompurify` runs in both the Node/RSC render and the browser, so this is
 * safe to call from Server Components.
 *
 * Note on the allowlist: RichTextEditor saves its output via `wrapContentWithStyles()`,
 * which prepends a `<style>` block and wraps everything in `<div class="rte-content">`.
 * So `style`/`class` must stay allowed or all existing content loses its formatting.
 * DOMPurify still sanitizes the CSS inside the style block and strips every script,
 * event handler (`on*`) and dangerous URL scheme.
 */
export const sanitizeHtml = (dirty?: string | null): string => {
  if (!dirty) return "";

  return DOMPurify.sanitize(dirty, {
    // Keep the editor's embedded <style> block (see note above).
    ADD_TAGS: ["style"],
    // Force links opened in a new tab to drop referrer/opener access.
    ADD_ATTR: ["target", "rel"],
    // Never allow these, regardless of defaults.
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "base"],
    FORBID_ATTR: ["formaction", "srcdoc"],
  });
};

export default sanitizeHtml;
