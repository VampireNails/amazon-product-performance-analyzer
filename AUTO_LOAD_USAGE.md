# 自动加载test目录功能使用说明

## 🎯 功能概述

amazon-analyzer MCP Server 现在支持自动读取 `test` 目录下的所有报表文件，无需手动指定文件路径。

## 📁 支持的文件格式

- `.xlsx` - Excel 2007+ 格式
- `.xls` - Excel 97-2003 格式  
- `.csv` - 逗号分隔值格式

## 🚀 使用方法

### 方法1：使用 loadTestFiles 工具（推荐）

```
@amazon-analyzer.loadTestFiles
```

这个工具会：
- 自动扫描 `test` 目录下的所有支持格式文件
- 按顺序处理每个文件
- 返回详细的处理统计信息

### 方法2：使用 loadAndStoreReport 工具

如果你需要指定特定文件或使用不同的工作表索引：

```
@amazon-analyzer.loadAndStoreReport
filePaths: ["test/文件1.xlsx", "test/文件2.csv"]
sheetIndex: 0
```

## 📊 当前test目录状态

目前 `test` 目录包含以下文件：
- `产品表现ASIN（2025-05-24~2025-05-24，全部广告）-785489212251774976.xlsx`
- `产品表现ASIN（2025-05-25~2025-05-25，全部广告）-785488188157460480.xlsx`

## ✅ 处理结果

成功处理后，你会看到类似以下的统计信息：

```json
{
  "auto_scanned": true,
  "scanned_files": ["绝对路径/文件1.xlsx", "绝对路径/文件2.xlsx"],
  "total_files_processed": 2,
  "total_rows_read": 820,
  "inserted_rows": 820,
  "updated_rows": 0,
  "error_rows": 0,
  "errors": []
}
```

## 🔍 数据验证

处理完成后，可以使用以下命令查看数据概览：

```
显示数据概览
```

或者直接调用：

```
@amazon-analyzer.getDataOverview
```

## 📝 注意事项

1. **文件路径**：工具会自动使用绝对路径，确保在任何工作目录下都能正常工作
2. **去重处理**：相同日期和ASIN的记录会自动更新，避免重复数据
3. **错误处理**：如果某个文件处理失败，会继续处理其他文件，并在结果中报告错误
4. **工作表选择**：默认读取第一个工作表（索引0），可通过 `sheetIndex` 参数调整

## 🛠️ 故障排除

如果遇到问题：

1. **文件不存在**：确保文件在 `test` 目录下且格式正确
2. **权限问题**：确保文件可读
3. **格式错误**：检查Excel文件是否损坏或CSV格式是否正确
4. **字段不匹配**：确保报表包含所需的字段（参考README.txt中的字段定义）

## 🔄 重新处理

如果需要重新处理相同的文件：
- 相同日期和ASIN的记录会被更新
- 新的记录会被插入
- 不会产生重复数据 