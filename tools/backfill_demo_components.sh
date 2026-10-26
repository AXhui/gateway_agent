#!/usr/bin/env bash
# post-commit 辅助：把 demo 实际使用的组件关联 + AI 自评 reason 回写到飞书多维表格。
# 由 post-commit 钩子调用；直接调 lark-cli（不经过 Python subprocess，Mac/Windows 都能读到 user token）。
#
# 用法：
#   bash tools/backfill_demo_components.sh \
#       --demo-file <demo.html 路径> \
#       --req-id <REQ-XXX> \
#       --quality-file <quality.json 路径，可选> \
#       --base-token <多维表格 token> \
#       --demo-table <Demo 记录表 id 或名称> \
#       --component-table <组件质量表 id 或名称> \
#       [--dry-run]
#
# 行为：
#   1. 用 tools/detect_components.py 分析 demo.html 命中的组件中文名
#   2. 用 lark-cli 查组件质量表，得到 组件名 -> record_id 映射
#   3. 用 lark-cli 查 Demo 记录表按需求编号找最新一条记录
#   4. 更新该记录的「使用组件」(link) 和「AI自评」(text)
set -uo pipefail

# 默认内置团队配置（与 sync_demo_to_feishu.py 一致，所有同事 clone 即可用）
DEFAULT_BASE_TOKEN="F2MebgSgMaUZSbseUWLcefqbnKd"
DEFAULT_DEMO_TABLE="tbln6WxfFJ6iYaek"
DEFAULT_COMPONENT_TABLE="tblzae8q8LwpVcoM"
DEFAULT_REGISTRY="milesight-ui-prototype-workspace/component-registry.json"

DEMO_FILE=""
REQ_ID=""
QUALITY_FILE=""
BASE_TOKEN="${FEISHU_BASE_TOKEN:-$DEFAULT_BASE_TOKEN}"
DEMO_TABLE="${FEISHU_DEMO_TABLE:-$DEFAULT_DEMO_TABLE}"
COMPONENT_TABLE="${FEISHU_COMPONENT_TABLE:-$DEFAULT_COMPONENT_TABLE}"
REGISTRY="${FEISHU_REGISTRY:-$DEFAULT_REGISTRY}"
DRY_RUN=0

while [ $# -gt 0 ]; do
  case "$1" in
    --demo-file) DEMO_FILE="$2"; shift 2 ;;
    --req-id) REQ_ID="$2"; shift 2 ;;
    --quality-file) QUALITY_FILE="$2"; shift 2 ;;
    --base-token) BASE_TOKEN="$2"; shift 2 ;;
    --demo-table) DEMO_TABLE="$2"; shift 2 ;;
    --component-table) COMPONENT_TABLE="$2"; shift 2 ;;
    --registry) REGISTRY="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    *) echo "[backfill] 未知参数: $1" >&2; exit 2 ;;
  esac
done

if [ -z "$DEMO_FILE" ] || [ -z "$REQ_ID" ]; then
  echo "[backfill] 缺少 --demo-file / --req-id" >&2
  exit 2
fi

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
cd "$REPO_ROOT" || exit 2

TMP_DIR=$(mktemp -d 2>/dev/null || echo /tmp)
# Git Bash (Windows) 下 /tmp 是 MSYS 虚拟路径，Windows python 打不开，需转成 Windows 路径；
# Mac / Linux 无 cygpath，保持原路径。
WIN_TMP=$(cygpath -w "$TMP_DIR" 2>/dev/null || echo "$TMP_DIR")

# 1) 分析 demo 命中的组件，写入临时文件
if [ ! -f "$DEMO_FILE" ]; then
  echo "[backfill] demo 文件不存在: $DEMO_FILE" >&2
  exit 2
fi
python3 tools/detect_components.py \
  --demo-file "$DEMO_FILE" \
  --registry "$REGISTRY" \
  > "$TMP_DIR/components.txt" 2>/dev/null || echo "" > "$TMP_DIR/components.txt"
if [ ! -s "$TMP_DIR/components.txt" ]; then
  echo "[backfill] 未检测到组件库类，跳过组件关联回写（demo 可能未使用组件库）"
  rm -rf "$TMP_DIR" 2>/dev/null || true
  exit 0
fi
echo "[backfill] 检测到组件: $(tr '\n' ' ' < "$TMP_DIR/components.txt")"

# 2) 拉组件质量表，建立 组件名 -> record_id 映射，写入临时文件
lark-cli base +record-list \
  --base-token "$BASE_TOKEN" \
  --table-id "$COMPONENT_TABLE" \
  --as user --format json 2>/dev/null \
  | python3 -c "
import json,sys
try:
  d=json.load(sys.stdin)
  data=d.get('data',{})
  fields=data.get('fields',[])
  rids=data.get('record_id_list',[])
  rows=data.get('data',[])
  try:
    i_name=fields.index('组件名')
  except ValueError:
    i_name=0
  out={}
  for rid,row in zip(rids,rows):
    name=row[i_name] if i_name < len(row) else ''
    if name:
      out[name]=rid
  print(json.dumps(out,ensure_ascii=False))
except Exception:
  print('{}')
" > "$TMP_DIR/comp_map.json" 2>/dev/null || echo '{}' > "$TMP_DIR/comp_map.json"
if [ "$(cat "$TMP_DIR/comp_map.json")" = "{}" ]; then
  echo "[backfill] 组件质量表读取失败或为空" >&2
  rm -rf "$TMP_DIR" 2>/dev/null || true
  exit 1
fi

# 3) 查 Demo 记录表：按需求编号找最新一条记录（按更新时间倒序取第一条）
DEMO_RECORD=$(lark-cli base +record-search \
  --base-token "$BASE_TOKEN" \
  --table-id "$DEMO_TABLE" \
  --keyword "$REQ_ID" \
  --search-field "需求编号" \
  --sort-json '[{"field":"更新时间","desc":true}]' \
  --as user --format json 2>/dev/null || echo '{}')
printf '%s' "$DEMO_RECORD" > "$TMP_DIR/demo_search.json"
TARGET_RECORD_ID=$(python3 -c "
import json
d=json.load(open(r'$WIN_TMP/demo_search.json',encoding='utf-8'))
data=d.get('data',{})
rids=data.get('record_id_list',[])
print(rids[0] if rids else '')
")
if [ -z "$TARGET_RECORD_ID" ]; then
  echo "[backfill] 未找到需求编号 $REQ_ID 的 Demo 记录，跳过（Webhook 可能尚未写入或写入失败）"
  rm -rf "$TMP_DIR" 2>/dev/null || true
  exit 0
fi

# 4) 组装 v3 格式更新 payload：{update_records: {record_id: {fields}}}
AI_COMMENT=""
if [ -n "$QUALITY_FILE" ] && [ -f "$QUALITY_FILE" ]; then
  # quality.json 直接由 python 读取（路径在仓库内，bash/python 都能访问）
  AI_COMMENT=$(python3 -c "
import json,sys
try:
  d=json.load(open(sys.argv[1],encoding='utf-8-sig'))
  print((d.get('reason') or '').strip())
except Exception:
  print('')
" "$QUALITY_FILE")
fi
printf '%s' "$AI_COMMENT" > "$TMP_DIR/ai_comment.txt"

UPDATE_JSON=$(python3 -c "
import json
comps=[l.strip() for l in open(r'$WIN_TMP/components.txt',encoding='utf-8') if l.strip()]
comp_map=json.load(open(r'$WIN_TMP/comp_map.json',encoding='utf-8'))
ai_comment=open(r'$WIN_TMP/ai_comment.txt',encoding='utf-8').read().strip()
links=[{'id':comp_map[c]} for c in comps if c in comp_map]
miss=[c for c in comps if c not in comp_map]
if miss:
  import sys
  print('[backfill] 组件未在质量表登记:', ','.join(miss), file=sys.stderr)
fields={'使用组件': links}
if ai_comment:
  fields['AI自评']=ai_comment
print(json.dumps({'update_records':{'$TARGET_RECORD_ID':fields}},ensure_ascii=False))
" 2>"$TMP_DIR/missing.log" || echo '{}')
if [ -s "$TMP_DIR/missing.log" ]; then
  cat "$TMP_DIR/missing.log" >&2
fi

if [ "$UPDATE_JSON" = "{}" ]; then
  echo "[backfill] payload 构造失败" >&2
  rm -rf "$TMP_DIR" 2>/dev/null || true
  exit 1
fi

if [ "$DRY_RUN" = "1" ]; then
  echo "[backfill][dry-run] 将更新记录 $TARGET_RECORD_ID:"
  echo "$UPDATE_JSON"
  rm -rf "$TMP_DIR" 2>/dev/null || true
  exit 0
fi

echo "[backfill] 更新记录 $TARGET_RECORD_ID（使用组件 + AI自评）"
printf '%s' "$UPDATE_JSON" > "$WIN_TMP/payload.json"
RESULT=$(lark-cli base +record-batch-update \
  --base-token "$BASE_TOKEN" \
  --table-id "$DEMO_TABLE" \
  --json @"$WIN_TMP/payload.json" \
  --as user --format json 2>&1 || true)

if printf '%s' "$RESULT" | grep -q '"ok": true'; then
  echo "[backfill] 组件关联与 AI 自评回写成功"
else
  echo "[backfill] 回写失败：$RESULT" >&2
  rm -rf "$TMP_DIR" 2>/dev/null || true
  exit 1
fi
rm -rf "$TMP_DIR" 2>/dev/null || true
