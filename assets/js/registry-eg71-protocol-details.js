/* ==========================================================================
   EG71 协议接口详情数据字典（只读数据，非注册组件）
   --------------------------------------------------------------------------
   供 bc-eg71-protocol-detail 消费：以路由为 key，value 为该组件的 ctx.detail 契约对象。
   字段值取自 Figma 楼宇网关-首版本 node 2016:95454「画板 Dashboard」下 10 个协议详情态节点。
   ========================================================================== */
window.MS_EG71_PROTOCOL_DETAILS = {
  '/network/wlan': {
    icon: 'wlan', title: 'WLAN',
    tags: [{ text: 'Enable', tone: 'success' }, { text: 'Offline' }],
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { label: 'MAC Address', value: '-' },
          { label: 'Interface Type', value: 'AP' },
          { label: 'SSID', value: 'Gateway_F5A711' },
          { label: 'Channel', value: 'Auto' },
          { label: 'Encryption Type', value: 'WPA-PSK/WPA2-PSK' },
          { label: 'Cipher', value: 'Auto' },
          { label: 'Ip Address', value: '192.168.1.1' },
          { label: 'Netmask', value: '255.255.255.0' },
          { label: 'Connection Duration', value: '0 days, 00:00:00' }
        ]
      },
      {
        title: 'Associated Stations',
        table: {
          columns: [{ key: 'ip', title: 'IP Address' }, { key: 'mac', title: 'MAC Address' }, { key: 'duration', title: 'Connection duration' }],
          rows: [],
          empty: 'No data'
        }
      }
    ]
  },

  '/network/cellular': {
    icon: 'cellular', title: 'Cellular Network',
    sections: [
      {
        title: 'Modem',
        tag: { text: 'Pin Error', tone: 'error' },
        fields: [
          { label: 'Model', value: 'EG912U' },
          { label: 'Version', value: 'EG912UGLAAR03A14M08_01.200.01.200' },
          { label: 'Signal Level', value: '31asu (-51dBm)' },
          { label: 'IMEI', value: '869487061062054' },
          { label: 'IMSI', value: '-' },
          { label: 'ICCID', value: '-' },
          { label: 'Network Type', value: '-' },
          { label: 'Cellular Frequency Band', value: '-' },
          { label: 'PLMN ID', value: '-' },
          { label: 'LAC', value: '-' },
          { label: 'Cell ID', value: '-' }
        ]
      },
      {
        title: 'Network',
        tag: { text: 'Disconnected' },
        fields: [
          { label: 'IP Address', value: '0.0.0.0' },
          { label: 'Netmask', value: '0.0.0.0' },
          { label: 'Gateway', value: '0.0.0.0' },
          { label: 'DNS', value: '0.0.0.0' }
        ]
      },
      {
        title: 'Data Usage Monthly',
        fields: [
          { label: 'Cellular', value: 'RX: 0.0 MiB TX: 0.0 MiB ALL: 0.0 MiB' }
        ]
      }
    ]
  },

  '/network/io': {
    icon: 'io', title: 'IO',
    sections: [
      { fields: [{ label: 'IO number', value: 'UI:4；AI:3；AO:2; DO:3' }] },
      {
        headcard: { icon: 'io', title: 'UI1' },
        fields: [
          { label: 'Type', value: 'NTC 10K Type3' },
          { label: 'Status', value: '30℃' }
        ]
      },
      {
        headcard: { icon: 'io', title: 'UI2' },
        fields: [
          { label: 'Type', value: 'NTC 10K Type3' },
          { label: 'Status', value: 'Down' }
        ]
      },
      {
        headcard: { icon: 'io', title: 'AI1' },
        fields: [
          { label: 'Type', value: 'NTC 10K Type3' },
          { label: 'Status', value: '30℃' }
        ]
      }
    ]
  },

  '/network/rs485-1': {
    sections: [
      {
        headcard: { icon: 'rs485', title: 'RS485-1', tags: [{ text: 'Online', tone: 'success' }] },
        fields: [
          { label: 'Type', value: 'Modbus RTU' },
          { label: 'Device Number', value: '96' },
          { label: 'Baud rate', value: '9600' },
          { label: 'Data bits', value: '7bits' },
          { label: 'Stop bits', value: '1bits' },
          { label: 'Check digit', value: 'Disabled' }
        ]
      },
      {
        headcard: { icon: 'rs485', title: 'RS485-2', tags: [{ text: 'Online', tone: 'success' }] },
        fields: [
          { label: 'Type', value: 'Modbus RTU' },
          { label: 'Device Number', value: '96' },
          { label: 'Baud rate', value: '9600' },
          { label: 'Data bits', value: '7bits' },
          { label: 'Stop bits', value: '1bits' },
          { label: 'Check digit', value: 'Disabled' }
        ]
      }
    ]
  },

  '/network/knx-tp': {
    icon: 'knx', title: 'KNX/TP',
    tags: [{ text: 'Online', tone: 'success' }],
    sections: [
      {
        fields: [
          { label: 'Physical address', value: '15.15.255' },
          { label: 'Number of devices', value: '9600' }
        ]
      }
    ]
  },

  '/network/vpn': {
    icon: 'topology', title: 'VPN',
    sections: [
      {
        title: 'PPTP Tunnel',
        table: {
          columns: [{ key: 'name', title: 'Name' }, { key: 'status', title: 'Status' }, { key: 'localIp', title: 'Local IP' }, { key: 'remoteIp', title: 'Remote IP' }],
          rows: [
            { name: 'pptp_1', status: 'Disconnected', localIp: '-', remoteIp: '-' },
            { name: 'pptp_2', status: 'Connected', localIp: '-', remoteIp: '-' },
            { name: 'pptp_3', status: 'Connected', localIp: '-', remoteIp: '-' }
          ]
        }
      },
      {
        title: 'IPsec Tunnel',
        table: {
          columns: [{ key: 'name', title: 'Name' }, { key: 'status', title: 'Status' }, { key: 'localIp', title: 'Local IP' }, { key: 'remoteIp', title: 'Remote IP' }],
          rows: [
            { name: '-', status: 'Disconnected', localIp: '-', remoteIp: '-' },
            { name: '-', status: 'Disconnected', localIp: '-', remoteIp: '-' },
            { name: '-', status: 'Disconnected', localIp: '-', remoteIp: '-' }
          ]
        }
      }
    ]
  },

  '/network/ethernet-1': {
    sections: [
      {
        headcard: { icon: 'ethernet', title: 'ETH1', tags: [{ text: 'Connected', tone: 'success' }] },
        fields: [
          { label: 'Speed', value: '100Mbps' },
          { label: 'Full/half duplex', value: 'Full-duplex' },
          { label: 'Mode', value: 'Standalone Mode - WAN' },
          { label: 'Agreement', value: 'DHCP client' },
          { label: 'IP address', value: '192.168.40.1' },
          { label: 'Subnet mask', value: '8.8.8.8' },
          { label: 'Gateway', value: '-' },
          { label: 'DNS', value: '8.8.8.8' },
          { label: 'Duration', value: '4days,12h 56m 44s' }
        ]
      },
      {
        headcard: { icon: 'ethernet', title: 'ETH2', tags: [{ text: 'Connected', tone: 'success' }] },
        fields: [
          { label: 'Speed', value: '100Mbps' },
          { label: 'Full/half duplex', value: 'Full-duplex' },
          { label: 'Mode', value: 'Standalone Mode - WAN' },
          { label: 'Agreement', value: 'DHCP client' },
          { label: 'IP address', value: '192.168.40.1' },
          { label: 'Subnet mask', value: '8.8.8.8' },
          { label: 'Gateway', value: '-' },
          { label: 'DNS', value: '8.8.8.8' },
          { label: 'Duration', value: '4days,12h 56m 44s' }
        ]
      }
    ]
  },

  '/network/routing': {
    icon: 'log', title: 'Routing',
    sections: [
      {
        title: 'Routing Table',
        table: {
          columns: [
            { key: 'destination', title: 'Destination' }, { key: 'netmask', title: 'Netmask' },
            { key: 'gateway', title: 'Gateway' }, { key: 'iface', title: 'Interface' }, { key: 'metric', title: 'Metric' }
          ],
          rows: [
            { destination: '0.0.0.0', netmask: '0.0.0.0', gateway: '192.168.41.1', iface: 'eth 0', metric: '1' },
            { destination: '8.8.8.8', netmask: '255.255.255.255', gateway: '-', iface: 'Loopback', metric: '1' },
            { destination: '114.114.114.114', netmask: '255.255.255.255', gateway: '-', iface: '-', metric: '-' }
          ]
        }
      },
      {
        title: 'ARP Cache',
        table: {
          columns: [{ key: 'ip', title: 'IP' }, { key: 'mac', title: 'MAC' }, { key: 'iface', title: 'Interface' }],
          rows: [
            { ip: '0.0.0.0', mac: '10:7c:61:4f:4f:d3', iface: 'eth 0' },
            { ip: '8.8.8.8', mac: '10:7c:61:4f:4f:d3', iface: 'Loopback' },
            { ip: '114.114.114.114', mac: '10:7c:61:4f:4f:d3', iface: '-' }
          ]
        }
      }
    ]
  },

  '/network/host': {
    icon: 'device', title: 'Host List',
    sections: [
      {
        title: 'DHCP Leases',
        table: {
          columns: [{ key: 'ip', title: 'IP' }, { key: 'mac', title: 'MAC' }, { key: 'lease', title: 'Lease Remaining Time' }],
          rows: [
            { ip: '0.0.0.0', mac: '0.0.0.0', lease: '2025.02.12 13:23' },
            { ip: '8.8.8.8', mac: '255.255.255.255', lease: '2025.02.12 13:23' },
            { ip: '114.114.114.114', mac: '255.255.255.255', lease: '2025.02.12 13:23' }
          ]
        }
      },
      {
        title: 'MAC Binding',
        table: {
          columns: [{ key: 'ip', title: 'IP' }, { key: 'mac', title: 'MAC' }],
          rows: [
            { ip: '0.0.0.0', mac: '10:7c:61:4f:4f:d3' },
            { ip: '8.8.8.8', mac: '10:7c:61:4f:4f:d3' },
            { ip: '114.114.114.114', mac: '10:7c:61:4f:4f:d3' }
          ]
        }
      }
    ]
  },

  '/network/lorawan': {
    icon: 'lorawan', title: 'LoRawan',
    sections: [
      {
        title: 'RF channel settings',
        fields: [
          { label: 'LoRa bands', value: 'US911' },
          { label: 'Device number', value: '2334' },
          { label: 'LoRa frequency', value: '473.2MHz、573.2MHz、873.2MHz、443.2MHz\n488.2MHz、493.2MHz、973.2MHz、873.2MHz' }
        ]
      }
    ]
  }
};

/* 子路由别名：RS485-2/ETH2 子项点击时打开与主路由相同的合并抽屉（Figma 单抽屉展示两个端口）。 */
window.MS_EG71_PROTOCOL_DETAILS['/network/rs485-2'] = window.MS_EG71_PROTOCOL_DETAILS['/network/rs485-1'];
window.MS_EG71_PROTOCOL_DETAILS['/network/ethernet-2'] = window.MS_EG71_PROTOCOL_DETAILS['/network/ethernet-1'];
