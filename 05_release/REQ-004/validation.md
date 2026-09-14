# REQ-004 Validation

## Scope

- Requirement page selected: M-Bus Object Field Validator under Data Services.
- Delivery artifact: single-file HTML demo at `05_release/REQ-004/demo.html`.
- Source material from the attached PDF is treated as requirement data only.

## Component Alignment

- L1 tokens are inlined from `.claude/tokens/tokens.css`.
- L2 base components are inlined from `library/base.css` and `assets/js/registry-base.js`.
- L3 EG71 business components are inlined from `library/business.css` and `assets/js/registry-business.js`.
- The page uses the EG71 shell, side navigation, top navigation, cards, tags, table, alert, filter controls, and validation preview patterns.

## Implemented Demo Flow

- Object field precheck table for M-Bus template definitions.
- Pass, warning, and error metrics for publish readiness.
- Result filter and keyword search for template, object, DIB, and VIB.
- Validation rules panel for hex fields, duplicate tuples, and publish gate behavior.
- JSON precheck output showing blocking errors and warnings.
- Run check and auto-fill position actions with visible feedback.

## Checks

- Runtime rendering was checked with Playwright using `C:/Program Files/Google/Chrome/Application/chrome.exe`.
- The page rendered the EG71 shell and 7 validation rows with no console or page errors.
- Filtering by Error returned 2 blocking rows.
- Run check action displayed a warning summary.
- Auto-fill positions action displayed a success message.
