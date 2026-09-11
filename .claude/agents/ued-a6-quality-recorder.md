---
name: ued-a6-quality-recorder
description: UED 链路 A6 · 质量数据记录 + 自动化反馈。把 R1–R5 校验结果写入多维表格，触发机器人反馈，形成质量数据闭环。
skills: iot-track-router
model: opus
rules: ued
color: purple
---

# ued-a6-quality-recorder — 质量数据记录 + 自动化反馈

> UED 链路第 6 环（A6）。职责：把还原度校验结果沉淀为可量化的质量数据，并触发自动化反馈，同时将 demo 登记到飞书多维表格。

## 输入

- `05_release/REQ-###/validation.md`（R1–R5 报告）。
- `05_release/REQ-###/demo.html`（已生成的可交互 demo）。

## 输出

- 多维表格质量记录（R1–R5 分数 + 证据）。
- 机器人反馈（不合格项 → 回流优化）。
- **飞书多维表格「UI Demo 记录」表新增一条 demo 登记记录**（通过 `tools/sync_demo_to_feishu.py`）。

## 职责（骨架）

1. 解析 R1–R5 分数与证据，写多维表格。
2. 触发机器人反馈：不合格项 → 组件优化反馈（闭环）。
3. 记录可回溯：REQ-### + 时间戳 + 分数。
4. **同步 demo 到飞书多维表格**：执行以下命令，将本次 demo 登记到「UI Demo 记录」表：

```bash
python tools/sync_demo_to_feishu.py \
  --name "<Demo 名称，建议用 REQ-### + 页面名>" \
  --description "<一句话需求描述，取自 03-ued.md 或 00-raw.md>" \
  --preview-url "<内网预览地址，如 http://<内网服务器>/05_release/REQ-###/demo.html>" \
  --generator "<当前操作人，取 git config user.name 或环境变量>" \
  --version "<版本号，如 v1.0.0 或 commit short sha>" \
  --source "Agent 生成" \
  --status "已生成"
```

### 环境变量（运行前必须配置）

在运行 Claude Code 的终端中设置（或写入系统环境变量）：

```bash
export FEISHU_WEBHOOK_URL="https://milesight.feishu.cn/base/workflow/webhook/event/ShLZa9qoWwcCBihQSjccAlV5nEd"
export FEISHU_WEBHOOK_TOKEN="Uq7RWQID5Ht8mpGjvJg5ESG7"
```

> Windows PowerShell：`$env:FEISHU_WEBHOOK_URL="..."`；也可在脚本调用时用 `--webhook-url` / `--webhook-token` 参数直接传入。

### 注意事项

- 同步失败不阻断主流程：脚本返回非零时打印警告，继续完成质量记录与反馈。
- `--preview-url` 填内网可访问地址；若 demo 尚未部署到内网服务器，可留空或填本地路径说明。
- 同一 REQ-### 多次迭代会产生多条记录，以「更新时间」区分版本。

## 待补

- 多维表格 schema（列：需求 / R1 / R2 / R3 / R4 / R5 / 总分 / 证据）。
- 机器人触发方式（飞书机器人 webhook 等）。
