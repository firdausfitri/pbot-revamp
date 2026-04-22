# Project Guidance

## Onboarding Guide UI
- Keep all onboarding overlays visually consistent across home, chapter, topic, question, answer-choice, and guided-answer steps.
- Reuse the existing onboarding guide language in `src/App.css` instead of styling each new step from a reference screenshot.
- Bubble styling should stay consistent:
  - white/translucent bubble surface
  - same shadow family
  - same rounded shape and pointer treatment unless layout absolutely requires a small positional tweak
  - same text color hierarchy
- Glow/focus styling should stay consistent:
  - mint/green onboarding focus border
  - white outer ring
  - soft green halo
  - avoid one-off colors like gold/yellow unless the user explicitly asks for a new visual direction
- Mascot treatment should stay consistent:
  - same shadow style
  - same general scale relationship to the bubble
- For future onboarding requests, prioritize consistency with the app's existing onboarding system over matching the exact styling of uploaded mockups.
