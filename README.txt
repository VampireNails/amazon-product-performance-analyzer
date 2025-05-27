您好，Cursor。请根据以下定义构建一个名为 amazon-product-performance-analyzer 的 MCP Server。此 Server 用于处理亚马逊“产品表现ASIN”报告，进行数据清洗、存储，并提供一系列高级分析工具。

// -------------------------------------------------------------
// MCP Server: amazon-product-performance-analyzer
// Version: 2.0
// Description: Processes Amazon 'Product Performance by ASIN' reports.
// Data is loaded, rigorously cleansed according to a predefined schema (handling currency,
// percentages, dates, and resolving potential type inference issues), and then upserted
// into the 'product_performance' table based on the (date, asin) unique key.
// Provides a comprehensive suite of advanced tools for in-depth operational analysis,
// covering sales, advertising, profitability, and inventory health.
// -------------------------------------------------------------

await MCP("amazon-product-performance-analyzer").define({
  // 1. 数据库表结构定义
  table: {
    name: "product_performance",
    // 明确的字段定义优先于自动从表头推断
    // schemaPath: "./schemas/product_performance_schema.json", // 指向外部JSON Schema文件
    // 或者直接内嵌 schema 定义（如下，使用您之前提供的JSON格式）
    schema: {
      "fields": [
        {"name": "日期", "target_name": "date", "dtype": "datetime64[ns]", "preprocessing_notes": ""},
        {"name": "ASIN", "target_name": "asin", "dtype": "string", "preprocessing_notes": ""},
        {"name": "父ASIN", "target_name": "parent_asin", "dtype": "string", "preprocessing_notes": ""},
        {"name": "MSKU", "target_name": "msku", "dtype": "string", "preprocessing_notes": "多MSKU情况，建议保持原样或拆分为列表。"},
        {"name": "店铺", "target_name": "store_name", "dtype": "string", "preprocessing_notes": ""},
        {"name": "国家", "target_name": "country_code", "dtype": "string", "preprocessing_notes": ""},
        {"name": "售价(总价)", "target_name": "selling_price_total", "dtype": "float64", "preprocessing_notes": "移除货币符号(如`$`)和千位分隔符(如`,`)。多价格时，可考虑拆分或取平均/主要价格。"},
        {"name": "标题", "target_name": "title", "dtype": "string", "preprocessing_notes": ""},
        {"name": "自动标签", "target_name": "auto_tags", "dtype": "string", "preprocessing_notes": "可能为空"},
        {"name": "listing标签", "target_name": "listing_tags", "dtype": "string", "preprocessing_notes": "可能为空"},
        {"name": "负责人", "target_name": "person_in_charge", "dtype": "string", "preprocessing_notes": ""},
        {"name": "创建时间", "target_name": "creation_timestamp", "dtype": "datetime64[ns]", "preprocessing_notes": "可能包含时区信息，注意解析。"},
        {"name": "品名", "target_name": "product_name_cn", "dtype": "string", "preprocessing_notes": ""},
        {"name": "SKU", "target_name": "sku_code", "dtype": "string", "preprocessing_notes": ""},
        {"name": "款名", "target_name": "style_name", "dtype": "string", "preprocessing_notes": "可能为空"},
        {"name": "SPU", "target_name": "spu_code", "dtype": "string", "preprocessing_notes": "可能为空"},
        {"name": "型号", "target_name": "model_number", "dtype": "string", "preprocessing_notes": "可能为空"},
        {"name": "一级分类", "target_name": "category_level_1", "dtype": "string", "preprocessing_notes": ""},
        {"name": "二级分类", "target_name": "category_level_2", "dtype": "string", "preprocessing_notes": ""},
        {"name": "三级分类", "target_name": "category_level_3", "dtype": "string", "preprocessing_notes": "可能为空"},
        {"name": "品牌", "target_name": "brand", "dtype": "string", "preprocessing_notes": ""},
        {"name": "开发人", "target_name": "developer_name", "dtype": "string", "preprocessing_notes": ""},
        {"name": "销量", "target_name": "units_sold", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "销售额", "target_name": "total_sales_amount", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "订单量", "target_name": "total_orders", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "销量环比", "target_name": "units_sold_mom_change", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数 (如 50.00% -> 0.50)。"},
        {"name": "销量额环比", "target_name": "sales_amount_mom_change", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "订单量环比", "target_name": "orders_mom_change", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "销量同比", "target_name": "units_sold_yoy_change", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "销量额同比", "target_name": "sales_amount_yoy_change", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "订单量同比", "target_name": "orders_yoy_change", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "净销售额", "target_name": "net_sales_amount", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "B2B 销量", "target_name": "b2b_units_sold", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "B2B 销售额", "target_name": "b2b_sales_amount", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "B2B 订单量", "target_name": "b2b_orders", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "促销销量", "target_name": "promo_units_sold", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "促销销售额", "target_name": "promo_sales_amount", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "促销订单量", "target_name": "promo_orders", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "销售均价", "target_name": "avg_selling_price", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符 (如果存在)。"},
        {"name": "平均销量", "target_name": "avg_units_per_order", "dtype": "float64", "preprocessing_notes": ""},
        {"name": "促销折扣", "target_name": "promo_discount_amount", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符 (如果存在)。"},
        {"name": "FBM买家运费", "target_name": "fbm_shipping_revenue", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符 (如果存在)。"},
        {"name": "大类排名", "target_name": "main_category_rank_raw", "dtype": "string", "preprocessing_notes": "格式如 'Category:Rank'，工具内部按需解析。"},
        {"name": "小类排名", "target_name": "sub_category_rank_raw", "dtype": "string", "preprocessing_notes": "格式如 'Category:Rank'，工具内部按需解析。"},
        {"name": "退款量", "target_name": "refund_units", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "退款金额", "target_name": "refund_amount", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "退款率", "target_name": "refund_rate", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "评分", "target_name": "rating_score", "dtype": "float64", "preprocessing_notes": ""},
        {"name": "评论数", "target_name": "review_count", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "留评率", "target_name": "review_rate", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数 (如果存在)。"},
        {"name": "结算毛利润", "target_name": "settlement_gross_profit", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "订单毛利润", "target_name": "order_gross_profit", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "结算毛利率", "target_name": "settlement_gross_margin_rate", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "订单毛利率", "target_name": "order_gross_margin_rate", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "ROI", "target_name": "roi", "dtype": "float64", "preprocessing_notes": "移除`%` (如果以百分比形式存在)，转换为小数（表示为X倍时直接是数值）。"},
        {"name": "退货量", "target_name": "return_units", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "退货率", "target_name": "return_rate", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "FBM可售", "target_name": "fbm_sellable_units", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "FBA-可售", "target_name": "fba_sellable_units", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "FBA-待调仓", "target_name": "fba_reserved_transfer", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "FBA-调仓中", "target_name": "fba_in_transfer", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "FBA-入库中", "target_name": "fba_inbound_receiving", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "FBA库存", "target_name": "fba_total_inventory", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "FBA-待发货", "target_name": "fba_reserved_customer_orders", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "FBA-在途", "target_name": "fba_inbound_shipped", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "FBA-计划入库", "target_name": "fba_planned_inbound", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "FBA-不可售", "target_name": "fba_unsellable_units", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "可用库存", "target_name": "total_available_inventory", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "FBA可售天数预估", "target_name": "fba_days_of_supply", "dtype": "float64", "preprocessing_notes": "可能为整数或小数。"},
        {"name": "FBM可售天数预估", "target_name": "fbm_days_of_supply", "dtype": "float64", "preprocessing_notes": "可能为整数或小数。"},
        {"name": "海外仓可用", "target_name": "overseas_warehouse_available", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "本地可用", "target_name": "local_warehouse_available", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "采购量", "target_name": "purchase_order_quantity", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "月库销比", "target_name": "monthly_sell_through_rate", "dtype": "float64", "preprocessing_notes": "移除`%` (如果以百分比形式存在)，转换为小数。"},
        {"name": "断货时间", "target_name": "stockout_date", "dtype": "object", "preprocessing_notes": "可能为日期或文本 'N/A', 建议尝试转换为 datetime64[ns], 无效值转为 NaT。"},
        {"name": "Sessions-Browser", "target_name": "sessions_browser", "dtype": "int64", "preprocessing_notes": "移除千位分隔符 (如果存在)。"},
        {"name": "Sessions-Browser-Percentage", "target_name": "sessions_browser_percentage", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "Sessions-Mobile", "target_name": "sessions_mobile", "dtype": "int64", "preprocessing_notes": "移除千位分隔符 (如果存在)。"},
        {"name": "Sessions-Mobile-Percentage", "target_name": "sessions_mobile_percentage", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "Sessions-Total", "target_name": "sessions_total", "dtype": "int64", "preprocessing_notes": "移除千位分隔符 (如果存在)。"},
        {"name": "Sessions-Percentage", "target_name": "sessions_percentage_of_total", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数 (如果存在)。"},
        {"name": "Unit-Sessions-Percentage", "target_name": "unit_session_percentage", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "PV-Browser", "target_name": "page_views_browser", "dtype": "int64", "preprocessing_notes": "移除千位分隔符 (如果存在)。"},
        {"name": "PV-Browser-Percentage", "target_name": "page_views_browser_percentage", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "PV-Mobile", "target_name": "page_views_mobile", "dtype": "int64", "preprocessing_notes": "移除千位分隔符 (如果存在)。"},
        {"name": "PV-Mobile-Percentage", "target_name": "page_views_mobile_percentage", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "PV-Total", "target_name": "page_views_total", "dtype": "int64", "preprocessing_notes": "移除千位分隔符 (如果存在)。"},
        {"name": "PV-Percentage", "target_name": "page_views_percentage_of_total", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数 (如果存在)。"},
        {"name": "CVR", "target_name": "conversion_rate", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "销量CVR", "target_name": "units_conversion_rate", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "Buybox赢得率", "target_name": "buybox_win_rate", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "Sessions-Browser(B2B)", "target_name": "b2b_sessions_browser", "dtype": "int64", "preprocessing_notes": "移除千位分隔符 (如果存在)。"},
        {"name": "Sessions-Browser-Percentage(B2B)", "target_name": "b2b_sessions_browser_percentage", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "Sessions-Mobile(B2B)", "target_name": "b2b_sessions_mobile", "dtype": "int64", "preprocessing_notes": "移除千位分隔符 (如果存在)。"},
        {"name": "Sessions-Mobile-Percentage(B2B)", "target_name": "b2b_sessions_mobile_percentage", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "Sessions-Total(B2B)", "target_name": "b2b_sessions_total", "dtype": "int64", "preprocessing_notes": "移除千位分隔符 (如果存在)。"},
        {"name": "Sessions-Percentage(B2B)", "target_name": "b2b_sessions_percentage_of_total", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数 (如果存在)。"},
        {"name": "Unit-Sessions-Percentage(B2B)", "target_name": "b2b_unit_session_percentage", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "PV-Browser(B2B)", "target_name": "b2b_page_views_browser", "dtype": "int64", "preprocessing_notes": "移除千位分隔符 (如果存在)。"},
        {"name": "PV-Browser-Percentage(B2B)", "target_name": "b2b_page_views_browser_percentage", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "PV-Mobile(B2B)", "target_name": "b2b_page_views_mobile", "dtype": "int64", "preprocessing_notes": "移除千位分隔符 (如果存在)。"},
        {"name": "PV-Mobile-Percentage(B2B)", "target_name": "b2b_page_views_mobile_percentage", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "PV-Total(B2B)", "target_name": "b2b_page_views_total", "dtype": "int64", "preprocessing_notes": "移除千位分隔符 (如果存在)。"},
        {"name": "PV-Percentage(B2B)", "target_name": "b2b_page_views_percentage_of_total", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数 (如果存在)。"},
        {"name": "CVR(B2B)", "target_name": "b2b_conversion_rate", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数 (如果存在，可能为0或空)。"},
        {"name": "销量CVR(B2B)", "target_name": "b2b_units_conversion_rate", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数 (如果存在，可能为0或空)。"},
        {"name": "Buybox赢得率(B2B)", "target_name": "b2b_buybox_win_rate", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数 (如果存在)。"},
        {"name": "广告花费", "target_name": "ad_spend", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "SP广告费", "target_name": "sp_spend", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "SD广告费", "target_name": "sd_spend", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "SB广告费", "target_name": "sb_spend", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "SBV广告费", "target_name": "sbv_spend", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "广告销售额", "target_name": "ad_sales", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "SP广告销售额", "target_name": "sp_sales", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "SD广告销售额", "target_name": "sd_sales", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "SB广告销售额", "target_name": "sb_sales", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "SBV广告销售额", "target_name": "sbv_sales", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "广告订单量", "target_name": "ad_orders", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "SP广告订单量", "target_name": "sp_orders", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "SD广告订单量", "target_name": "sd_orders", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "SB广告订单量", "target_name": "sb_orders", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "SBV广告订单量", "target_name": "sbv_orders", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "广告订单占比", "target_name": "ad_order_percentage", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "直接成交销售额", "target_name": "direct_sales_amount", "dtype": "float64", "preprocessing_notes": "移除货币符号和千位分隔符。"},
        {"name": "直接成交订单量", "target_name": "direct_orders", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "展示", "target_name": "impressions", "dtype": "int64", "preprocessing_notes": "移除千位分隔符 (如果存在)。"},
        {"name": "点击", "target_name": "clicks", "dtype": "int64", "preprocessing_notes": "移除千位分隔符 (如果存在)。"},
        {"name": "CTR", "target_name": "ctr", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "广告CVR", "target_name": "ad_conversion_rate", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "CPC", "target_name": "cpc", "dtype": "float64", "preprocessing_notes": "移除货币符号 (如果存在)。"},
        {"name": "CPM", "target_name": "cpm", "dtype": "float64", "preprocessing_notes": "移除货币符号 (如果存在)。"},
        {"name": "ROAS", "target_name": "roas", "dtype": "float64", "preprocessing_notes": ""},
        {"name": "ACOS", "target_name": "acos", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"},
        {"name": "ACoAS", "target_name": "acoas", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"}, // 通常指 Account/Overall ACOS
        {"name": "ASoAS", "target_name": "asoas", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"}, // 通常指 ASIN/Specific ACOS
        {"name": "CPO", "target_name": "cpo", "dtype": "float64", "preprocessing_notes": "移除货币符号 (如果存在)。"},
        {"name": "CPU", "target_name": "cpu", "dtype": "float64", "preprocessing_notes": "移除货币符号 (如果存在)。"},
        {"name": "自然点击量", "target_name": "organic_clicks", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "自然订单量", "target_name": "organic_orders", "dtype": "int64", "preprocessing_notes": ""},
        {"name": "自然CVR", "target_name": "organic_conversion_rate", "dtype": "float64", "preprocessing_notes": "移除`%`，转换为小数。"}
      ]
    },
    uniqueKeys: [["date", "asin"]] // 使用转换后的目标字段名
  },

  // 2. 工具集
  tools: {
    // 工具1: 上传、清洗并存储报表数据
    loadAndStoreReport: {
      description: "上传并处理单个或多个 ‘产品表现ASIN’ 报表文件。数据将根据预定义Schema进行清洗、转换，并按 (date, asin) 唯一键进行去重更新或插入。",
      args: {
        files:      { type: "array", itemType: "file", required: true, description: "一个或多个产品表现报表文件 (Excel/CSV)" },
        sheetIndex: { type: "int",   default: 0, description: "Excel文件中工作表的索引 (仅当文件为Excel时)" }
      },
      returns: {
        total_files_processed: "int",
        total_rows_read: "int",
        inserted_rows: "int",
        updated_rows: "int",
        error_rows: "int",
        errors: { type: "array", itemType: "object", description: "处理失败的行及原因列表" } // 更详细的错误反馈
      },
      // 内部实现:
      // 1. 遍历 files 列表。
      // 2. 对每个文件：
      //    a. 根据文件扩展名判断是CSV还是Excel。
      //    b. 加载数据到Pandas DataFrame。
      //    c. 根据 table.schema 中的定义，对每一列进行重命名 (name -> target_name) 和数据类型转换及预处理。
      //    d. 计算辅助列：TACOS, 自然销售额, 自然订单量, 总转化率 (存储为新列，如 total_acos, organic_sales, organic_orders, overall_cvr)。
      // 3. 合并所有处理后的DataFrames。
      // 4. 使用 (date, asin) 作为唯一键，执行upsert操作到数据库。
      // 5. 返回处理结果统计。
    },

    // 工具2: 数据概览
    getDataOverview: {
      description: "提供数据库中产品表现数据的基本概览。",
      args: {},
      returns: {
        total_records: "int",
        distinct_asins: "int",
        date_range_min: "date",
        date_range_max: "date",
        missing_values_summary: { type: "object", description: "各字段缺失值统计" },
        key_numeric_stats: { type: "object", description: "关键数值字段的描述性统计" }
      }
    },

    // 工具3: ASIN维度表现分析 (增强版)
    getAsinPerformanceSummary: {
      description: "获取指定ASIN在特定时间范围内的综合表现数据。如果未指定ASIN，则返回所有ASIN的汇总。",
      args: {
        asins:      { type: "array", itemType: "string", required: false, description: "ASIN列表，为空则分析所有ASIN" },
        start_date: { type: "date",   required: true },
        end_date:   { type: "date",   required: true }
      },
      returns: [{ // 返回一个对象列表，每个对象代表一个ASIN的汇总
        asin: "string",
        parent_asin: "string",
        title: "string",
        total_units_sold: "int",
        total_sales_amount: "float",
        total_orders: "int",
        net_sales_amount: "float",
        avg_selling_price: "float",
        rating_score: "float",
        review_count: "int",
        refund_rate: "float",
        return_rate: "float",
        sessions_total: "int",
        unit_session_percentage: "float",
        page_views_total: "int",
        conversion_rate: "float", // 总体 CVR
        buybox_win_rate: "float",
        ad_sales: "float",
        ad_spend: "float",
        ad_orders: "int",
        acos: "float",
        roas: "float",
        total_acos: "float", // TACOS
        organic_sales_amount: "float",
        organic_orders: "int",
        organic_conversion_rate: "float",
        order_gross_profit: "float",
        order_gross_margin_rate: "float",
        roi: "float"
      }]
    },

    // 工具4: 广告活动分析 (增强版，按类型细分)
    getAdvertisingPerformanceBreakdown: {
      description: "分析指定ASIN或全部ASIN在特定时间范围内的广告表现，可按广告类型细分。",
      args: {
        asins:      { type: "array", itemType: "string", required: false, description: "ASIN列表，为空则分析所有ASIN" },
        start_date: { type: "date",   required: true },
        end_date:   { type: "date",   required: true },
        ad_type:    { type: "string", enum: ["SP", "SB", "SD", "SBV", "All"], default: "All", description: "广告类型" }
      },
      returns: [{ // 返回一个对象列表，每个对象代表一个ASIN（或总体）在指定广告类型下的表现
        group_key: "string", // ASIN 或 "Overall"
        ad_type_analyzed: "string", // SP, SB, SD, SBV, or All
        total_ad_spend: "float",
        total_ad_sales: "float",
        total_ad_orders: "int",
        avg_acos: "float",
        avg_roas: "float",
        avg_ctr: "float",
        avg_cpc: "float",
        avg_ad_conversion_rate: "float",
        // 如果 ad_type 为 "All"，可以额外提供各类型占比
        sp_spend_share: "float", // (optional)
        sb_spend_share: "float", // (optional)
        // ... etc.
      }]
    },

    // 工具5: 盈利能力分析
    analyzeProfitability: {
      description: "分析指定ASIN或按负责人/品牌分组的盈利能力。",
      args: {
        asins:        { type: "array", itemType: "string", required: false },
        start_date:   { type: "date",   required: true },
        end_date:     { type: "date",   required: true },
        group_by_field: { type: "string", enum: ["person_in_charge", "brand", "asin", "parent_asin", "none"], default: "asin", description: "分组依据" }
      },
      returns: [{
        group_value: "string", // 如具体ASIN, 负责人名, 品牌名
        total_order_gross_profit: "float",
        avg_order_gross_margin_rate: "float",
        total_settlement_gross_profit: "float",
        avg_settlement_gross_margin_rate: "float",
        avg_roi: "float",
        estimated_net_profit_after_ads: "float" // (订单毛利润 - 广告花费)
      }]
    },

    // 工具6: 库存健康分析
    getInventoryHealthAnalysis: {
      description: "分析当前FBA和FBM库存健康状况，预警风险。",
      args: {
        // date: { type: "date", required: true, description: "分析特定日期的库存，默认为最新日期" }, // 最好能自动取最新
        low_stock_threshold_days: { type: "int", default: 10, description: "FBA可售天数低于此值视为低库存" },
        overstock_threshold_days: { type: "int", default: 90, description: "FBA可售天数高于此值视为潜在滞销" }
      },
      returns: {
        latest_data_date: "date",
        fba_summary: {
          total_fba_inventory: "int",
          total_fba_sellable_units: "int",
          total_fba_reserved_transfer: "int",
          total_fba_in_transfer: "int",
          total_fba_inbound_receiving: "int"
        },
        low_stock_asins: [{
          asin: "string",
          fba_sellable_units: "int",
          fba_days_of_supply: "float",
          monthly_sell_through_rate: "float"
        }],
        overstock_asins: [{
          asin: "string",
          fba_sellable_units: "int",
          fba_days_of_supply: "float",
          monthly_sell_through_rate: "float"
        }],
        fbm_summary: {
          total_fbm_sellable_units: "int"
        }
      }
    },

    // 工具7: 产品排名与比较
    rankProductsByMetric: {
      description: "根据指定指标对ASIN进行排名。",
      args: {
        start_date: { type: "date",   required: true },
        end_date:   { type: "date",   required: true },
        metric_to_rank: {
          type: "string",
          required: true,
          enum: [ // 列举关键可排序的指标 (数据库中的target_name)
            "total_sales_amount", "units_sold", "order_gross_profit", "order_gross_margin_rate", "roi",
            "acos", "roas", "total_acos", "conversion_rate", "sessions_total"
          ],
          description: "用于排名的指标"
        },
        ranking_order: { type: "string", enum: ["asc", "desc"], default: "desc", description: "升序(asc)或降序(desc)" },
        top_n:         { type: "int",    default: 10, description: "返回排名前N的ASIN" }
      },
      returns: [{
        asin: "string",
        title: "string", // 增加标题方便识别
        metric_value: "float" // 对应 ranking_metric 的值
        // 可以考虑再附带几个核心指标作为参考
      }]
    },

    // 工具8: 趋势分析
    getMetricTrend: {
      description: "查询指定ASIN的一个或多个指标在时间范围内的趋势。",
      args: {
        asin:       { type: "string", required: true },
        metrics:    { type: "array",  itemType: "string", required: true, description: "要查询趋势的指标列表 (target_name)" },
        start_date: { type: "date",   required: true },
        end_date:   { type: "date",   required: true },
        granularity:{ type: "string", enum: ["daily", "weekly", "monthly"], default: "daily", description: "时间聚合粒度" }
      },
      returns: [{
        date_bucket: "date", // 或 period_start_date
        // metrics 的每个值都会成为这里的 key
        // e.g., units_sold: "int", acos: "float", ...
      }]
    },

    // 工具9: 自定义报告导出
    generateCustomReport: {
      description: "根据用户选择的字段、筛选条件生成自定义报告。",
      args: {
        fields:     { type: "array",  itemType: "string", required: true, description: "需要导出的字段列表 (target_name)" },
        filters:    { type: "object", required: false, description: "筛选条件 (例如 {asin: ['B0...'], store_name: 'BOYAO(NA)-US', date_range: {start, end}})" },
        output_format: { type: "string", enum: ["json", "csv_string"], default: "json", description: "输出格式" }
      },
      returns: {
        report_data: "object" // 如果是json, 直接是数据对象/数组; 如果是csv_string, 是CSV内容的字符串
      }
    }
  }
});