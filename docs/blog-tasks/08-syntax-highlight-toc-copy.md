# [UX] Syntax Highlighting, Table of Contents, Copy-to-Clipboard

**Labels:** `blog`, `ux`  
**Milestone:** UX  
**Depends on:** #06 (post detail page)

## Context

Three interconnected UX enhancements for the post detail page. All are purely frontend, no API changes needed.

---

## 1. Syntax Highlighting

Use `rehype-pretty-code` + `shiki` (already used in many Next.js apps, zero-JS at runtime).

```ts
// lib/mdx/renderMDX.ts
import rehypePrettyCode from 'rehype-pretty-code'

const options = {
  theme: { dark: 'github-dark', light: 'github-light' },
  keepBackground: false,
}

// Add to rehype plugins
```

Supported: language label shown above code block, line numbers optional, diff highlighting (`// [!code --]` / `// [!code ++]`).

### Tasks

- [ ] Install: `rehype-pretty-code`, `shiki`
- [ ] Add `rehype-pretty-code` to MDX rehype plugins in `lib/mdx/renderMDX.ts`
- [ ] Style code blocks in `libs/code-block/CodeBlock.styles.ts` (background, font, border-radius)
- [ ] Support `// [!code highlight]` line annotations

---

## 2. Copy-to-Clipboard on Code Blocks

Custom `CodeBlock` MDX component wraps `<pre>` with a copy button.

```tsx
// libs/code-block/CodeBlock.tsx
'use client'
export function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  // extract text content, write to clipboard
  // show checkmark icon for 2s after copy
}
```

### Tasks

- [ ] Create `libs/code-block/` lib:
  - `CodeBlock.tsx` (Client Component)
  - `CodeBlock.styles.ts`
  - `CodeBlock.spec.tsx`
  - `index.ts`
- [ ] Register as `pre` in MDX component map (wraps shiki output)
- [ ] Copy button: absolute positioned top-right of code block
- [ ] Feedback: icon changes `Copy` → `Check` for 2s, then reverts
- [ ] Accessible: `aria-label="Copy code"`, `aria-pressed` on copy

---

## 3. Table of Contents (TOC)

Auto-generated from post headings (`h2`, `h3`, `h4`). Sticky on desktop, collapsed accordion on mobile.

### Algorithm

1. Parse MDX AST for headings during `renderMDX` — extract `{ depth, text, id }` list
2. Pass TOC data as prop alongside rendered content
3. Render `TableOfContents` component beside content

```tsx
// libs/table-of-contents/TableOfContents.tsx
'use client'
// Track active heading via IntersectionObserver
// Highlight active TOC item
```

### Tasks

- [ ] Add `remarkHeadings` custom remark plugin to extract TOC from MDX AST
- [ ] Auto-generate heading `id` from text (slug: lowercase, spaces→hyphens)
- [ ] Create `libs/table-of-contents/` lib:
  - `TableOfContents.tsx` (Client Component)
  - `TableOfContents.styles.ts`
  - `TableOfContents.spec.tsx`
  - `index.ts`
- [ ] `IntersectionObserver` to highlight active section as user scrolls
- [ ] Mobile: collapsible `<details>` element with "Contents" summary
- [ ] Desktop: sticky sidebar (CSS position sticky), scrollable if taller than viewport
- [ ] Smooth scroll to heading on click (`scroll-behavior: smooth` via CSS)

---

## Acceptance Criteria

- [ ] Code blocks render with syntax colors matching theme
- [ ] Copy button copies code text to clipboard
- [ ] Copy button shows check icon for 2s then resets
- [ ] TOC renders all `h2`/`h3`/`h4` from post
- [ ] Active TOC item highlights as user scrolls
- [ ] TOC is sticky on desktop, collapsible on mobile
- [ ] All components 100% test coverage
