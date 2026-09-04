# 组件 Skill 资产库（L1 + L2）

> 每个目录一份 `SKILL.md`，是「组件 Skill 文档」—— 供不同平台（工作台 / 飞书 / 各 Agent）统一调用，从线上组件文档原样抽取。
> 本索引按**六分类 + 设计资源**组织，解决「63 个组件一多就找不到」的问题。

## 分类总览

| 分类 | 数量 | 一句话定位 |
|---|---|---|
| 基础 | 5 | 最原子的控件：按钮 / 图标 / 排版 / 分割 / 品牌 |
| 布局 | 5 | 页面骨架：栅格 / 布局 / 间距 / 固钉 / 页头 |
| 导航 | 8 | 在页面里"走"：菜单 / 面包屑 / 分页 / 步骤 / 标签页 |
| 数据录入 | 16 | 让人"填"和"选"：表单 / 输入 / 选择 / 上传 |
| 数据展示 | 19 | 让人"看"：表格 / 卡片 / 列表 / 树 / 统计 / 标签 |
| 反馈 | 10 | 给人"反馈"：提示 / 弹窗 / 抽屉 / 加载 / 进度 |
| 设计资源 | 1 | L1 设计令牌唯一真源 tokens.css |

---

## 基础（5）

| 组件 | 中文 | 目录 | 何时用 |
|---|---|---|---|
| Button | 按钮 | [`Button/`](Button/) | 触发动作，五态（主要/次要/虚线/文字/链接） |
| Divider | 分割线 | [`Divider/`](Divider/) | 分隔内容块，横/竖 |
| Icon | 图标 | [`Icon/`](Icon/) | 内联 SVG 图标 |
| Logo | 品牌标识 | [`Logo/`](Logo/) | 侧边栏 / 登录页品牌位 |
| Typography | 排版 | [`Typography/`](Typography/) | 标题 / 正文 / 辅助文字层级 |

## 布局（5）

| 组件 | 中文 | 目录 | 何时用 |
|---|---|---|---|
| Affix | 固钉 | [`Affix/`](Affix/) | 吸顶 / 吸底（如底部操作栏） |
| Grid | 栅格 | [`Grid/`](Grid/) | 24 栅格响应式排布 |
| Layout | 布局 | [`Layout/`](Layout/) | 页级布局（侧边栏 + 顶栏 + 内容） |
| PageHeader | 页头 | [`PageHeader/`](PageHeader/) | 页面标题 + 面包屑 + 操作区 |
| Space | 间距 | [`Space/`](Space/) | 元素间统一间距 |

## 导航（8）

| 组件 | 中文 | 目录 | 何时用 |
|---|---|---|---|
| Anchor | 锚点 | [`Anchor/`](Anchor/) | 页内目录跳转 |
| BackTop | 回到顶部 | [`BackTop/`](BackTop/) | 长页面回顶 |
| Breadcrumb | 面包屑 | [`Breadcrumb/`](Breadcrumb/) | 层级导航 |
| DropdownMenu | 下拉菜单 | [`DropdownMenu/`](DropdownMenu/) | 更多操作收起 |
| NavMenu | 导航菜单 | [`NavMenu/`](NavMenu/) | 侧边栏 / 顶部导航 |
| Pagination | 分页 | [`Pagination/`](Pagination/) | 列表翻页 |
| Steps | 步骤条 | [`Steps/`](Steps/) | 多步流程进度 |
| Tabs | 标签页 | [`Tabs/`](Tabs/) | 同区多视图切换 |

## 数据录入（16）

| 组件 | 中文 | 目录 | 何时用 |
|---|---|---|---|
| AutoComplete | 自动完成 | [`AutoComplete/`](AutoComplete/) | 输入联想 |
| Cascader | 级联选择 | [`Cascader/`](Cascader/) | 层级选择（如地区） |
| Checkbox | 复选框 | [`Checkbox/`](Checkbox/) | 多选 |
| DatePicker | 日期选择框 | [`DatePicker/`](DatePicker/) | 选日期 |
| Form | 表单 | [`Form/`](Form/) | 表单容器 + 校验 |
| Input | 输入框 | [`Input/`](Input/) | 文本输入 |
| InputNumber | 数字输入框 | [`InputNumber/`](InputNumber/) | 数值输入 + 步进 |
| Radio | 单选框 | [`Radio/`](Radio/) | 单选 |
| Segmented | 分段控制器 | [`Segmented/`](Segmented/) | 少量互斥选项切换 |
| Select | 选择器 | [`Select/`](Select/) | 下拉单选 / 多选 |
| Slider | 滑动输入条 | [`Slider/`](Slider/) | 区间数值 |
| Switch | 开关 | [`Switch/`](Switch/) | 布尔开关 |
| TimePicker | 时间选择框 | [`TimePicker/`](TimePicker/) | 选时间 |
| Transfer | 穿梭框 | [`Transfer/`](Transfer/) | 两栏多选迁移 |
| TreeSelect | 树选择 | [`TreeSelect/`](TreeSelect/) | 树形下拉选择 |
| Upload | 上传 | [`Upload/`](Upload/) | 文件上传 |

## 数据展示（19）

| 组件 | 中文 | 目录 | 何时用 |
|---|---|---|---|
| Avatar | 头像 | [`Avatar/`](Avatar/) | 用户 / 设备图标位 |
| Badge | 徽标数 | [`Badge/`](Badge/) | 角标数量 |
| Calendar | 日历 | [`Calendar/`](Calendar/) | 日历视图 |
| Card | 卡片 | [`Card/`](Card/) | 信息容器 |
| Collapse | 折叠面板 | [`Collapse/`](Collapse/) | 可展开收起的区块 |
| Comment | 评论 | [`Comment/`](Comment/) | 评论 / 消息流 |
| Descriptions | 描述列表 | [`Descriptions/`](Descriptions/) | 键值对详情 |
| Empty | 空状态 | [`Empty/`](Empty/) | 无数据占位 |
| Image | 图片 | [`Image/`](Image/) | 图片展示 |
| List | 列表 | [`List/`](List/) | 行式列表 |
| Popover | 气泡卡片 | [`Popover/`](Popover/) | 悬浮气泡内容 |
| Rate | 评分 | [`Rate/`](Rate/) | 星级评分 |
| Statistic | 统计数值 | [`Statistic/`](Statistic/) | 指标卡数字 |
| Table | 表格 | [`Table/`](Table/) | 结构化数据表格（IoT 强依赖） |
| Tag | 标签 | [`Tag/`](Tag/) | 状态 / 属性标签 |
| Timeline | 时间轴 | [`Timeline/`](Timeline/) | 时间序列记录 |
| Tooltip | 文字提示 | [`Tooltip/`](Tooltip/) | 悬停文字提示 |
| Tree | 树形控件 | [`Tree/`](Tree/) | 树形结构展示 |
| Watermark | 水印 | [`Watermark/`](Watermark/) | 页面水印 |

## 反馈（10）

| 组件 | 中文 | 目录 | 何时用 |
|---|---|---|---|
| Alert | 警告提示 | [`Alert/`](Alert/) | 页内常驻提示（4 态） |
| Drawer | 抽屉 | [`Drawer/`](Drawer/) | 侧滑详情 / 表单 |
| Message | 全局提示 | [`Message/`](Message/) | 瞬时操作反馈 |
| Modal | 对话框 | [`Modal/`](Modal/) | 需用户确认的弹窗 |
| Notification | 通知提醒框 | [`Notification/`](Notification/) | 系统级通知 |
| Popconfirm | 气泡确认框 | [`Popconfirm/`](Popconfirm/) | 二次确认（如删除） |
| Progress | 进度条 | [`Progress/`](Progress/) | 进度展示 |
| Result | 结果 | [`Result/`](Result/) | 成功 / 失败 / 空结果页 |
| Skeleton | 骨架屏 | [`Skeleton/`](Skeleton/) | 加载占位 |
| Spin | 加载中 | [`Spin/`](Spin/) | 局部 / 全局 loading |

## 设计资源（1）

| 资源 | 目录 | 说明 |
|---|---|---|
| Tokens | [`req2demo/00_skills/Tokens/`](../Tokens/) | L1 设计令牌唯一真源（`tokens.css` + `tokens-preview.html` + `SKILL.md`） |

---

## 怎么用这份索引

- **找组件**：先想"我要的是填 / 选 / 看 / 反馈哪一类"，落到分类再查表。
- **调组件**：打开对应 `SKILL.md`，按「产品层（何时用）→ UED 层（Token）→ 研发层（Props 契约）」三层读。
- **改样式**：样式真源不在单个 SKILL.md，而在 [`req2demo/00_skills/Tokens/tokens.css`](../Tokens/tokens.css)（令牌）+ `library/base.css`（基础组件）+ `library/business.css`（业务组件）。改完执行 `python3 tools/build-css-bundle.py` 打包。
- **加组件**：改 `assets/js/registry-base.js` 后跑 `python3 tools/generate-components.py` 重新生成 `req2demo/00_skills/src_components/{Name}/SKILL.md` 与 `frontend/components/{Name}/index.html`。
