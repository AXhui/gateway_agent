# REQ-003 Validation

## Scope

- Requirement page selected: M-Bus Data Forwarding under Data Services.
- Delivery artifact: single-file HTML demo at `05_release/REQ-003/demo.html`.
- Source material from the attached PDF is treated as requirement data only.

## Component Alignment

- L1 tokens are inlined from `.claude/tokens/tokens.css`.
- L2 base components are inlined from `library/base.css` and `assets/js/registry-base.js`.
- L3 EG71 business components are inlined from `library/business.css` and `assets/js/registry-business.js`.
- The page uses the EG71 shell, side navigation, top navigation, cards, tags, form items, selects, buttons, alerts, and object mapping blocks.

## Implemented Demo Flow

- MQTT, HTTP, BACnet, and Modbus forwarding channel switching.
- Channel status display and endpoint / mapping configuration.
- Payload preview for JSON, BACnet object mapping, and Modbus register mapping.
- Enabled M-Bus object reference cards.
- Save, test publish, and object selector feedback.

## Checks

- Runtime rendering was checked with Playwright using `C:/Program Files/Google/Chrome/Application/chrome.exe`.
- The page rendered the EG71 shell, 4 forwarding channels, and 4 object references with no console or page errors.
- BACnet channel switching displayed Analog-Input mapping.
- Test publish displayed a success message.
