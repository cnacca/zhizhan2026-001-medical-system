# CS Shell and Tokens Spec

## Geometry

- viewport baseline: `1440 × 900`
- sidebar: `236px`, fixed
- topbar: `56px`, sticky, `padding-inline: 26px`, `gap: 12px`
- route content: `padding: 22px 26px`
- title block: adaptive `45–48px`, `margin-bottom: 18px`

## Tokens

```css
--cs-bg: #f7f9fc;
--cs-card: #ffffff;
--cs-text: #0f172a;
--cs-muted: #64748b;
--cs-faint: #94a3b8;
--cs-line: #e2e8f0;
--cs-violet: #7c3aed;
--cs-navy: #1e1b4b;
--cs-radius-card: 14px;
```

Body uses Plus Jakarta Sans with Chinese system fallbacks. Headings use Lora with Songti fallback. Cards use a `1.5px` line and reference shadow. Do not use Inter or the former `#7137e8` token in the rebuilt page layer.

## Responsive rule

Desktop is authoritative. At narrower widths, preserve usable local scrolling and stacked content without changing the 1440 geometry. There is no mobile reference to pixel-clone.
