# MCP Server 名称和工具名称更改

## 🔧 修复的问题

Cursor对MCP工具名称有长度限制：**服务器名称 + 工具名称不能超过60个字符**

## 📝 更改内容

### 服务器名称更改
- **原名称**: `amazon-product-performance-analyzer` (35字符)
- **新名称**: `amazon-analyzer` (15字符)

### 工具名称更改

| 原工具名称 | 新工具名称 | 原长度 | 新长度 | 状态 |
|-----------|-----------|--------|--------|------|
| `loadAndStoreReport` | `loadAndStoreReport` | 54 | 34 | ✅ 保持不变 |
| `getDataOverview` | `getDataOverview` | 50 | 30 | ✅ 保持不变 |
| `getAsinPerformanceSummary` | `getAsinSummary` | 60 | 30 | 🔧 已缩短 |
| `getAdvertisingPerformanceBreakdown` | `getAdBreakdown` | 69 | 28 | 🔧 已缩短 |
| `analyzeProfitability` | `analyzeProfitability` | 56 | 36 | ✅ 保持不变 |
| `getInventoryHealthAnalysis` | `getInventoryHealth` | 61 | 33 | 🔧 已缩短 |
| `rankProductsByMetric` | `rankProducts` | 56 | 27 | 🔧 已缩短 |
| `getMetricTrend` | `getMetricTrend` | 48 | 28 | ✅ 保持不变 |
| `generateCustomReport` | `customReport` | 57 | 27 | 🔧 已缩短 |

## 🎯 新的Cursor配置

请将以下配置复制到 `C:\Users\huawei\.cursor\mcp.json`:

```json
{
  "mcpServers": {
    "amazon-analyzer": {
      "command": "node",
      "args": [
        "D:\\\\PPMCPServer\\\\dist\\\\index.js"
      ],
      "env": {}
    }
  }
}
```

## 🔄 使用方法更新

### 在Cursor中的新用法

- **服务器前缀**: `@amazon-analyzer`
- **直接询问**: "显示数据概览"、"分析ASIN表现"等

### 工具功能对照

| 功能 | 新工具名称 | 用途 |
|------|-----------|------|
| 数据上传 | `loadAndStoreReport` | 处理Excel/CSV文件 |
| 数据概览 | `getDataOverview` | 查看数据库统计 |
| ASIN分析 | `getAsinSummary` | ASIN表现分析 |
| 广告分析 | `getAdBreakdown` | 广告表现分析 |
| 盈利分析 | `analyzeProfitability` | 盈利能力分析 |
| 库存分析 | `getInventoryHealth` | 库存健康分析 |
| 产品排名 | `rankProducts` | 按指标排名 |
| 趋势分析 | `getMetricTrend` | 时间序列分析 |
| 自定义报告 | `customReport` | 灵活数据导出 |

## ✅ 验证步骤

1. **更新配置文件**：使用上面的新配置
2. **重启Cursor**：完全关闭后重新启动
3. **测试连接**：在聊天中输入 `@amazon-analyzer`
4. **验证功能**：尝试 "显示数据概览"

所有工具功能保持不变，只是名称更短了！ 