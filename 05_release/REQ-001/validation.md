# REQ-001 Validation

## Scope

- Requirement page selected: M-Bus device and object management under Data Services / Data Acquisition.
- Delivery artifact: single-file HTML demo at `05_release/REQ-001/demo.html`.
- Source material from the attached PDF is treated as requirement data only.

## Component Alignment

- L1 tokens are inlined from `.claude/tokens/tokens.css`.
- L2 base components are inlined from `library/base.css`.
- L3 business components are inlined from `library/business.css` and `assets/js/registry-business.js`.
- Page assembly uses the existing EG71 shell, side navigation, top navigation, tags, tables, form items, modal patterns, and protocol detail drawer.

## Implemented Demo Flow

- M-Bus access network summary with configuration modal.
- Device list with filtering, scan modal, manual add modal, delete confirmation, detail drawer, and simulated instant read.
- Object tab with per-device object list, enable/disable state, and simulated object read.
- Demo data is stored in `localStorage` under `req001-mbus-demo-state`.

## Checks

- HTML is a self-contained document with inline CSS and JavaScript.
- JavaScript syntax was checked by extracting all inline scripts and parsing them with Node.js `new Function`.
- Core selectors were checked: EG71 shell, M-Bus title, scan action, detail drawer, and localStorage key.
- Runtime rendering was checked with Playwright using the installed Chrome executable. The page rendered the EG71 shell, 3 device rows, the inline logo, scan modal, and detail drawer with no console or page errors.

## Limitation

- The bundled Playwright Chromium is not installed in the local runtime, so the verification used `C:/Program Files/Google/Chrome/Application/chrome.exe`.
