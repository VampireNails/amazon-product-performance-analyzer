# Cursor MCP 配置说明

## 配置文件位置

Cursor的MCP配置文件通常位于：

### Windows:
```
%APPDATA%\Cursor\User\globalStorage\cursor.mcp\config.json
```

### macOS:
```
~/Library/Application Support/Cursor/User/globalStorage/cursor.mcp/config.json
```

### Linux:
```
~/.config/Cursor/User/globalStorage/cursor.mcp/config.json
```

## 配置内容

在配置文件中添加以下内容：

```json
{
  "mcpServers": {
    "amazon-product-performance-analyzer": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "D:\\PPMCPServer",
      "env": {}
    }
  }
}
```

## 验证配置

1. 重启Cursor
2. 在聊天界面中，您应该能看到MCP Server的工具
3. 可以使用以下命令测试：
   - `@amazon-product-performance-analyzer getDataOverview`
   - 或直接询问关于亚马逊产品数据分析的问题

## 使用示例

配置成功后，您可以在Cursor中这样使用：

```
请帮我分析test目录下的亚马逊产品数据
```

```
显示销售额排名前10的ASIN
```

```
分析2025年5月24-25日的广告表现
``` 