# CS Workspace and Chat Pages Spec

## Information review / translation

Use reference data-processing list language for task filters and rows. The selected task exposes original text, translation draft, structured production information, version/audit metadata and a link to the related inquiry. Editing authority belongs to translation staff.

## Inquiry communication

- outer grid: `290px 1fr`
- height: `calc(100vh - 56px - 80px)`
- outer border: `1.5px`, radius `14px`, overflow hidden
- chat header: about `66px`
- timeline: fills remaining space, reference baseline about `610px`
- composer: about `85px`

The conversation is free-form. Quick replies only populate the composer. Customer-facing send remains unavailable when permission or backend capability is missing. Related order/task/design context is visible without replacing the conversation.
