# Milesight IoT 软件平台

来源：milesight.com/iot，检索日期 2026-09-03

> Milesight 软件矩阵按「上云/私有化/运维/开放」四层切分，配合硬件纵向集成（AM/EM/VS 传感器、UC 控制器、UG 网关）。

## Milesight IoT Cloud（公有云应用平台）
- **定位**：开箱即用的设备上云 SaaS，垂直整合 Milesight 硬件。
- **能力**：拖拽仪表盘（时钟/地图/折线/饼/柱/告警列表）、地图定位设备、组合触发规则、事件中心（告警/触发日志）、日/周/月报表、分享与设备所有权转移、7 国语言、邮件/移动推送、全屏/图层。
- **部署**：AWS 托管，Web + iOS/Android App，提供在线 Demo。
- **计费**：Free 10 节点/2 仪表盘/20 控件/1000 次月执行；Pro1（50 节点）、Pro2（100）、Pro3（300）递增，Free 不含报表/分享/转移。

## DeviceHub（本地化设备管理 + LNS）
- **定位**：私有化 LoRaWAN 网络服务器 + 设备管理一体，本地部署保数据隐私。
- **能力**：内置 LNS（频段管理、设备授权、数据交换）、远程接入/配置/升级/重启网关路由与 VS 设备、实时异常告警、分组批量操作/批量固件升级。
- **部署**：本地/私有化，输入设备唯一码即加设备。
- **价值**：减少上门维护（truck roll）、降低单次处理时间与成本。

## MilesightVPN（远程运维 VPN）
- **定位**：24 小时高安全远程连接，机对机（M2M）远程访问。
- **能力**：授权码访问、Web GUI、端口映射规则、连接状态监控、远程调试/编程 PLC、接入 HMI/IP 摄像头。
- **部署**：Ubuntu 20.04（v2.0.3），配合工业路由器/控制器。
- **场景**：现场技师调试、远程排障。

## Beaver IoT（开源 IoT 平台）
- **定位**：开源（MIT）IoT 平台，快速 PoC 与可自由扩展。
- **能力**：可定制拖拽仪表盘、节点化工作流自动化、用户与角色权限、内置函数快速 PoC。
- **部署**：Docker 跨平台，云或本地；集成 Milesight Dev Platform、网关内置 NS，兼容非 Milesight 设备，可基于开源代码二次开发。

## Milesight Development Platform（开发平台）
- **定位**：设备连接/管理/集成的开发底座，面向应用开发与项目部署。
- **能力**：实时 Webhook、开放 API、应用/项目/设备集中管理、Auto-Provision 即插即用、批量操作、远程访问（Web/SSH）+ OTA、多租户权限；TSL（Thing Specification Language）设备建模 + Profile 配置。
- **计费**：Free 10 设备；Professional $1/设备/年；Private Cloud 定制。API 请求限额 Free 1000/24h、Pro 1000+100×设备、私有云不限。

## 参数基线速查表（软件横比）
| 平台 | 定位 | 部署 | 核心能力 | 开放/计费 |
|---|---|---|---|---|
| IoT Cloud | 上云 SaaS | 公有云(AWS) | 仪表盘/触发/报表/地图 | Free~Pro3 分层 |
| DeviceHub | 私有化 LNS+管理 | 本地 | LNS/批量 OTA/告警 | 私有化 |
| MilesightVPN | 远程运维 | 本地服务器 | M2M VPN/端口映射 | 私有化 |
| Beaver IoT | 开源平台 | Docker 云/本地 | 仪表盘/工作流/权限 | MIT 开源 |
| Dev Platform | 开发底座 | 公有/私有 | API/Webhook/TSL/OTA | Free/$1设备/私有云 |

**关键差异结论**：五平台形成「应用层（IoT Cloud）— 私有层（DeviceHub）— 运维层（MilesightVPN）— 开源层（Beaver IoT）— 开发层（Dev Platform）」完整漏斗，核心壁垒是「硬件垂直集成 + 多部署形态」——同一套 Milesight 设备可按客户合规/规模需求落在公有云、私有化或开源自建，这是相对纯软件 IoT 平台的差异化。
