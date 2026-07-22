# Contact Keep UX Skill

Use this when changing screens, forms, navigation, empty states, or user-facing copy.

## Product Context

Contact Keep is a practical contact manager. The UI should feel fast, trustworthy, and quiet: users come to find, add, edit, and remove contacts without friction.

## Design Rules

- Favor clear forms, readable lists, and predictable actions.
- Keep one primary action per view.
- Use sentence case for labels and buttons.
- Show validation messages near the field or action they affect.
- Preserve keyboard navigation and visible focus states.
- Keep mobile forms usable without horizontal scrolling.
- Avoid decorative card-heavy layouts, generic hero sections, emoji icons, and novelty styling.

## Quality Floor

- Auth, empty, loading, and error states must be designed before implementation is called done.
- Buttons must describe the action: `Add contact`, `Save contact`, `Delete`.
- Destructive actions must be visually distinct and reversible only when the app actually supports undo.
- Forms must use real labels, not placeholder-only labels.

## Verifier Checklist

- [ ] Critical actions are keyboard accessible.
- [ ] Validation and API errors are visible to the user.
- [ ] Empty contact state tells the user what to do next.
- [ ] Layout works on mobile and desktop.
- [ ] No placeholder text, sample unrelated copy, or unrelated product references remain.
