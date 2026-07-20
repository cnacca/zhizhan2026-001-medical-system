# CS Reference Detail Foundation Spec

## Overview

Target: detail containers rendered by `frontend/src/components/CsPortalPages.vue`, styled in `frontend/src/cs-rebuilt-pages.css`.

- desktop reference viewport: `1440 × 900`; desktop geometry is authoritative
- standard drawer: `540px × 100vh`; overlay `rgba(30, 27, 75, .15)`; left border `1.5px solid #e2e8f0`; shadow `-8px 0 32px rgba(30, 27, 75, .10)`
- header: sticky, `61px`, white, `padding: 8px 20px`; content: `padding: 16px 20px 24px`
- cards: white or semantic tint, `1.5px` border, `10px` radius; card spacing `12px`
- tokens: violet `#7c3aed`, navy `#1e1b4b`, green `#059669`, amber `#d97706`, rose `#e11d48`, surface `#f7f9fc`
- assets: reuse Emoji, inline symbols, CSS dots/lines/blocks and existing reference assets; do not replace these with generic icon libraries or fetch external images
- interaction: close button and Escape close the container; no fabricated success; loading, API error, empty, permission and contradiction states are visually distinct
- responsive: below `720px`, drawer width is `100vw`; grids collapse to one column while preserving desktop measurements at the baseline viewport

## Shared visual grammar

The header contains an uppercase eyebrow, serif title and bordered close square. Summary cells use a faint background and uppercase label. Alerts use a colored left edge plus a large Emoji marker. Timelines use CSS vertical rules with round status nodes. Tabs use a violet underline and do not resize the container.
