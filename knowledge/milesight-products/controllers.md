# Milesight IoT 控制器产品线

来源：milesight.com/iot，检索日期 2026-09-03

> 控制器定位「把工业有线传感器/执行器接入 LoRaWAN 或 4G」，普遍支持 Milesight D2D（设备对设备直连）、LoRaWAN OTAA/ABP、M12 接头、IP68 户外款。

## UC100（Modbus → LoRaWAN 转换器）
- **定位**：RS485 Modbus RTU 转 LoRaWAN 的轻量协议桥。
- **关键参数**：RS485 2 线端子，读 64 寄存器；LoRaWAN Class C；支持 Modbus 透传 + If-Then 规则（16 条指令）本地自治。
- **供电**：DC 5–24V / Type-C 5V/1A，功耗 <0.5W。
- **场景**：远程采集 Modbus 传感器、断网自治控制、D2D 主从通信。

## UC300（LoRaWAN & 4G 控制器）
- **定位**：工业级多路 I/O 采集 + 控制 + 上云一体。
- **关键参数**：4×DI + 2×DO（SPDT 继电器 3A）+ 6×AI（2×4-20mA、2×0-10V、2×PT100，-200~800℃）+ 1×RS485（Modbus RTU）+ 1×RS232。
- **通信**：LoRaWAN（Class A/C）或 4G LTE；D2D；MQTT/TCP/UDP/AWS IoT Core。
- **供电**：5–24VDC / USB-C，-20~60℃。
- **场景**：智慧工厂、楼宇自动化、农业、水务。

## UC50x（多接口传感集线器）
- **定位**：把各类工业传感器（模拟/数字/串口/SDI-12）汇聚接入 LoRaWAN 或 LTE。
- **代表型号**：UC501（电池+太阳能）、UC502（大容量锂电池）。
- **关键参数**：2×GPIO（DI/DO/脉冲计数）+ 1×RS232/RS485 可切 + 2×AI（4-20mA/0-10V）+ 1×SDI-12（V1.4 透传）+ 2×3.3V/5V/9V/12V 供电输出。
- **通信**：LoRaWAN（OTAA/ABP Class A/C）或 LTE（NB-IoT/Cat-M1，应用层 TCP/UDP/MQTT/AWS）；RS485 Modbus RTU / 透明串口。
- **供电**：UC501 2×18650 + 6V/1.7W 太阳能板（K023 杆装/K024 壁装）或 DC 5–24V；UC502 3×ER26500 可换锂电或 DC 5–24V。
- **防护**：IP68（1m/7 天），UC501 -20~60℃ / UC502 -30~70℃。
- **场景**：气象/水文/农业传感器（SDI-12）、水电气脉冲抄表、Modbus 转 LoRaWAN、户外恶劣环境传感汇聚。

## UC51x（电磁阀控制器）
- **定位**：LoRaWAN 电磁阀控制，精准自动灌溉。
- **代表型号**：UC511（太阳能+锂电）、UC512（大容量锂电）。
- **关键参数**：2×DC12V 双稳态电磁阀输出 + 2×DI（干接点/水表脉冲计数），M12 A 码公头。
- **供电**：UC511 太阳能 + 2×2550mAh 锂电（Class A 约 8.4 年）或 DC 5–24V；UC512 3×9000mAh ER26500（Class A >10 年）。（注：按 25℃、20min 上报 + 每日 4 次阀门）
- **场景**：按时长/流量/土壤湿度灌溉、水流脉冲监测、断网自治、组播批量控制。

## 参数基线速查表（控制器横比）
| 型号 | 定位 | I/O 能力 | 通信 | 供电 | 防护 |
|---|---|---|---|---|---|
| UC100 | Modbus 桥 | 1×RS485 | LoRaWAN C | DC 5–24V | 室内 |
| UC300 | 多路 I/O | 4DI/2DO/6AI/RS485/RS232 | LoRaWAN 或 4G | 5–24V | -20~60℃ |
| UC501 | 传感集线器 | 2GPIO/1串口/2AI/SDI-12 | LoRaWAN 或 LTE | 电池+太阳能/DC | IP68 |
| UC502 | 传感集线器 | 同 UC501 | LoRaWAN 或 LTE | 3×ER26500/DC | IP68 |
| UC511 | 电磁阀 | 2 阀/2DI | LoRaWAN | 太阳能+锂电 | IP68 |
| UC512 | 电磁阀 | 2 阀/2DI | LoRaWAN | 3×9000mAh | IP68 |

**关键差异结论**：控制器按「接入对象」分层——UC100（Modbus 协议）、UC300（I/O 点）、UC50x（传感器集线，含 SDI-12 气象/水文专长）、UC51x（灌溉执行）；共同卖点是 D2D 断网自治 + 户外 IP68 + 电池/太阳能超低功耗（UC51x 可达 10 年）。
