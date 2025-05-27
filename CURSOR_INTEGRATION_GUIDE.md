# Cursor MCP 集成故障排除指南

## 🎯 正确的配置文件

请将以下内容复制到 `C:\Users\huawei\.cursor\mcp.json`:

```json
{
  "mcpServers": {
    "amazon-product-performance-analyzer": {
      "command": "node",
      "args": [
        "D:\\\\PPMCPServer\\\\dist\\\\index.js"
      ],
      "env": {}
    }
  }
}
```

## 🔧 常见问题和解决方案

### 1. MCP Server未注册成功

**可能原因和解决方案：**

#### A. 配置文件路径问题
- ✅ 确认配置文件位置：`C:\Users\huawei\.cursor\mcp.json`
- ✅ 如果目录不存在，请手动创建 `.cursor` 文件夹

#### B. JSON格式问题
- ✅ 确保JSON格式正确，注意双反斜杠 `\\\\`
- ✅ 使用JSON验证器检查语法

#### C. 路径问题
- ✅ 使用绝对路径：`D:\\\\PPMCPServer\\\\dist\\\\index.js`
- ✅ 确保 `dist/index.js` 文件存在

#### D. Cursor版本问题
- ✅ 确保使用最新版本的Cursor
- ✅ 检查Cursor是否支持MCP 2024-11-05协议

### 2. 重启和验证步骤

1. **完全关闭Cursor**
   ```
   - 关闭所有Cursor窗口
   - 检查任务管理器，确保没有Cursor进程
   ```

2. **重新启动Cursor**
   ```
   - 重新打开Cursor
   - 等待完全加载
   ```

3. **验证MCP Server**
   ```
   - 打开Cursor聊天界面
   - 输入: @amazon-product-performance-analyzer
   - 或直接问: "显示数据概览"
   ```

### 3. 调试方法

#### A. 检查Cursor开发者工具
1. 在Cursor中按 `Ctrl+Shift+I` 打开开发者工具
2. 查看Console标签页的错误信息
3. 搜索 "MCP" 或 "amazon-product-performance-analyzer" 相关错误

#### B. 检查MCP日志
Cursor可能在以下位置保存MCP日志：
- `%APPDATA%\Cursor\logs\`
- `C:\Users\huawei\AppData\Roaming\Cursor\logs\`

#### C. 手动测试MCP Server
运行我们的调试脚本：
```bash
node debug-mcp.mjs
```

### 4. 替代配置方案

如果上述方法不工作，尝试以下替代配置：

#### 方案A: 使用相对路径
```json
{
  "mcpServers": {
    "amazon-product-performance-analyzer": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "D:\\\\PPMCPServer",
      "env": {}
    }
  }
}
```

#### 方案B: 使用批处理文件
```json
{
  "mcpServers": {
    "amazon-product-performance-analyzer": {
      "command": "D:\\\\PPMCPServer\\\\start-mcp-server.bat",
      "args": [],
      "env": {}
    }
  }
}
```

### 5. 验证成功的标志

当MCP Server成功集成后，您应该看到：

1. **在Cursor聊天中**：
   - 可以使用 `@amazon-product-performance-analyzer` 前缀
   - 直接询问亚马逊数据分析问题会得到响应

2. **可用的功能**：
   - 数据上传和处理
   - 数据概览查询
   - ASIN表现分析
   - 广告分析
   - 盈利分析
   - 库存健康分析
   - 产品排名
   - 趋势分析
   - 自定义报告

### 6. 测试命令

成功集成后，尝试这些测试命令：

```
显示数据概览
```

```
分析销售额排名前5的ASIN
```

```
分析2025年5月24日到25日的广告表现
```

## 🆘 如果仍然无法工作

1. **检查Cursor版本**：确保使用支持MCP的Cursor版本
2. **重新编译**：运行 `npm run build` 重新编译项目
3. **检查权限**：确保Cursor有权限访问配置文件和MCP Server
4. **联系支持**：如果问题持续，可能需要查看Cursor的MCP文档或联系支持

## 📝 配置文件模板

将此内容保存为 `mcp.json` 并放在正确位置：

```json
{
  "mcpServers": {
    "amazon-product-performance-analyzer": {
      "command": "node",
      "args": [
        "D:\\\\PPMCPServer\\\\dist\\\\index.js"
      ],
      "env": {}
    }
  }
}
``` 