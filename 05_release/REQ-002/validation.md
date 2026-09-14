# REQ-002 Validation

## Scope

- Requirement page selected: M-Bus Data Stream under Data Services.
- Delivery artifact: single-file HTML demo at `05_release/REQ-002/demo.html`.
- Source material from the attached PDF is treated as requirement data only.

## Component Alignment

- L1 tokens are inlined from `.claude/tokens/tokens.css`.
- L2 base components are inlined from `library/base.css` and `assets/js/registry-base.js`.
- L3 EG71 business components are inlined from `library/business.css` and `assets/js/registry-business.js`.
- The page uses the EG71 shell, side navigation, top navigation, cards, table, tags, alert, drawer, button, input, and select patterns.

## Implemented Demo Flow

- Raw TX/RX M-Bus communication frame table.
- Direction, result, and keyword filters.
- Frame detail drawer with raw frame and parser note.
- Export and refresh feedback.
- Side panel describing TX, RX, object parsing, and forwarding lifecycle.

## Checks

- Runtime rendering was checked with Playwright using `C:/Program Files/Google/Chrome/Application/chrome.exe`.
- The page rendered the EG71 shell and 6 frame rows with no console or page errors.
- RX filtering returned 3 rows.
- Frame detail drawer opened successfully.
- Export action displayed a success message.
