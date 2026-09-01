# Golden Test 01 — 网关管理

## Requirement

做一个网关管理页面，我希望运维可以快速查找设备，看哪些设备在线或者离线，点击设备可以查看详细信息。

## Execution status

Executed against the real locally configured LLM gateway on 2026-09-01. The request passed the local configuration guard, but the upstream model did not return within the 60-second request limit.

## Failure reason

The LLM request timed out before it produced a candidate page JSON. No simulated or fallback model output was used. The renderer retained the previously valid Golden Demo rather than rendering an unvalidated page.

## Generation record

- Component selection: no output received
- Schema Validator: not run (no candidate JSON)
- Design System Validator: not run (no candidate JSON)
- Repair attempt: not run; the first generation request failed before a candidate existed to repair
- Render result: generated page not rendered; existing valid Golden Demo remained visible

## Resume criteria

Verify that the configured LLM endpoint accepts the OpenAI-compatible JSON request used by the local gateway and returns within 60 seconds, then rerun this exact requirement. The final record must include the selected registered components, both validator results, any failure reason, and at most one repair attempt.
