import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';
import { Database } from './database.js';
// schema 字段定义（完整字段，来自README）
const productPerformanceSchema = {
    fields: [
        { name: '日期', target_name: 'date', dtype: 'datetime64[ns]', preprocessing_notes: '' },
        { name: 'ASIN', target_name: 'asin', dtype: 'string', preprocessing_notes: '' },
        { name: '父ASIN', target_name: 'parent_asin', dtype: 'string', preprocessing_notes: '' },
        { name: 'MSKU', target_name: 'msku', dtype: 'string', preprocessing_notes: '多MSKU情况，建议保持原样或拆分为列表。' },
        { name: '店铺', target_name: 'store_name', dtype: 'string', preprocessing_notes: '' },
        { name: '国家', target_name: 'country_code', dtype: 'string', preprocessing_notes: '' },
        { name: '售价(总价)', target_name: 'selling_price_total', dtype: 'float64', preprocessing_notes: '移除货币符号(如`$`)和千位分隔符(如`,`)。多价格时，可考虑拆分或取平均/主要价格。' },
        { name: '标题', target_name: 'title', dtype: 'string', preprocessing_notes: '' },
        { name: '自动标签', target_name: 'auto_tags', dtype: 'string', preprocessing_notes: '可能为空' },
        { name: 'listing标签', target_name: 'listing_tags', dtype: 'string', preprocessing_notes: '可能为空' },
        { name: '负责人', target_name: 'person_in_charge', dtype: 'string', preprocessing_notes: '' },
        { name: '创建时间', target_name: 'creation_timestamp', dtype: 'datetime64[ns]', preprocessing_notes: '可能包含时区信息，注意解析。' },
        { name: '品名', target_name: 'product_name_cn', dtype: 'string', preprocessing_notes: '' },
        { name: 'SKU', target_name: 'sku_code', dtype: 'string', preprocessing_notes: '' },
        { name: '款名', target_name: 'style_name', dtype: 'string', preprocessing_notes: '可能为空' },
        { name: 'SPU', target_name: 'spu_code', dtype: 'string', preprocessing_notes: '可能为空' },
        { name: '型号', target_name: 'model_number', dtype: 'string', preprocessing_notes: '可能为空' },
        { name: '一级分类', target_name: 'category_level_1', dtype: 'string', preprocessing_notes: '' },
        { name: '二级分类', target_name: 'category_level_2', dtype: 'string', preprocessing_notes: '' },
        { name: '三级分类', target_name: 'category_level_3', dtype: 'string', preprocessing_notes: '可能为空' },
        { name: '品牌', target_name: 'brand', dtype: 'string', preprocessing_notes: '' },
        { name: '开发人', target_name: 'developer_name', dtype: 'string', preprocessing_notes: '' },
        { name: '销量', target_name: 'units_sold', dtype: 'int64', preprocessing_notes: '' },
        { name: '销售额', target_name: 'total_sales_amount', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: '订单量', target_name: 'total_orders', dtype: 'int64', preprocessing_notes: '' },
        { name: '销量环比', target_name: 'units_sold_mom_change', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数 (如 50.00% -> 0.50)。' },
        { name: '销量额环比', target_name: 'sales_amount_mom_change', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: '订单量环比', target_name: 'orders_mom_change', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: '销量同比', target_name: 'units_sold_yoy_change', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: '销量额同比', target_name: 'sales_amount_yoy_change', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: '订单量同比', target_name: 'orders_yoy_change', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: '净销售额', target_name: 'net_sales_amount', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: 'B2B 销量', target_name: 'b2b_units_sold', dtype: 'int64', preprocessing_notes: '' },
        { name: 'B2B 销售额', target_name: 'b2b_sales_amount', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: 'B2B 订单量', target_name: 'b2b_orders', dtype: 'int64', preprocessing_notes: '' },
        { name: '促销销量', target_name: 'promo_units_sold', dtype: 'int64', preprocessing_notes: '' },
        { name: '促销销售额', target_name: 'promo_sales_amount', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: '促销订单量', target_name: 'promo_orders', dtype: 'int64', preprocessing_notes: '' },
        { name: '销售均价', target_name: 'avg_selling_price', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符 (如果存在)。' },
        { name: '平均销量', target_name: 'avg_units_per_order', dtype: 'float64', preprocessing_notes: '' },
        { name: '促销折扣', target_name: 'promo_discount_amount', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符 (如果存在)。' },
        { name: 'FBM买家运费', target_name: 'fbm_shipping_revenue', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符 (如果存在)。' },
        { name: '大类排名', target_name: 'main_category_rank_raw', dtype: 'string', preprocessing_notes: '格式如 \'Category:Rank\',工具内部按需解析。' },
        { name: '小类排名', target_name: 'sub_category_rank_raw', dtype: 'string', preprocessing_notes: '格式如 \'Category:Rank\',工具内部按需解析。' },
        { name: '退款量', target_name: 'refund_units', dtype: 'int64', preprocessing_notes: '' },
        { name: '退款金额', target_name: 'refund_amount', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: '退款率', target_name: 'refund_rate', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: '评分', target_name: 'rating_score', dtype: 'float64', preprocessing_notes: '' },
        { name: '评论数', target_name: 'review_count', dtype: 'int64', preprocessing_notes: '' },
        { name: '留评率', target_name: 'review_rate', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数 (如果存在)。' },
        { name: '结算毛利润', target_name: 'settlement_gross_profit', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: '订单毛利润', target_name: 'order_gross_profit', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: '结算毛利率', target_name: 'settlement_gross_margin_rate', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: '订单毛利率', target_name: 'order_gross_margin_rate', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: 'ROI', target_name: 'roi', dtype: 'float64', preprocessing_notes: '移除`%` (如果以百分比形式存在)，转换为小数（表示为X倍时直接是数值）。' },
        { name: '退货量', target_name: 'return_units', dtype: 'int64', preprocessing_notes: '' },
        { name: '退货率', target_name: 'return_rate', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: 'FBM可售', target_name: 'fbm_sellable_units', dtype: 'int64', preprocessing_notes: '' },
        { name: 'FBA-可售', target_name: 'fba_sellable_units', dtype: 'int64', preprocessing_notes: '' },
        { name: 'FBA-待调仓', target_name: 'fba_reserved_transfer', dtype: 'int64', preprocessing_notes: '' },
        { name: 'FBA-调仓中', target_name: 'fba_in_transfer', dtype: 'int64', preprocessing_notes: '' },
        { name: 'FBA-入库中', target_name: 'fba_inbound_receiving', dtype: 'int64', preprocessing_notes: '' },
        { name: 'FBA库存', target_name: 'fba_total_inventory', dtype: 'int64', preprocessing_notes: '' },
        { name: 'FBA-待发货', target_name: 'fba_reserved_customer_orders', dtype: 'int64', preprocessing_notes: '' },
        { name: 'FBA-在途', target_name: 'fba_inbound_shipped', dtype: 'int64', preprocessing_notes: '' },
        { name: 'FBA-计划入库', target_name: 'fba_planned_inbound', dtype: 'int64', preprocessing_notes: '' },
        { name: 'FBA-不可售', target_name: 'fba_unsellable_units', dtype: 'int64', preprocessing_notes: '' },
        { name: '可用库存', target_name: 'total_available_inventory', dtype: 'int64', preprocessing_notes: '' },
        { name: 'FBA可售天数预估', target_name: 'fba_days_of_supply', dtype: 'float64', preprocessing_notes: '可能为整数或小数。' },
        { name: 'FBM可售天数预估', target_name: 'fbm_days_of_supply', dtype: 'float64', preprocessing_notes: '可能为整数或小数。' },
        { name: '海外仓可用', target_name: 'overseas_warehouse_available', dtype: 'int64', preprocessing_notes: '' },
        { name: '本地可用', target_name: 'local_warehouse_available', dtype: 'int64', preprocessing_notes: '' },
        { name: '采购量', target_name: 'purchase_order_quantity', dtype: 'int64', preprocessing_notes: '' },
        { name: '月库销比', target_name: 'monthly_sell_through_rate', dtype: 'float64', preprocessing_notes: '移除`%` (如果以百分比形式存在)，转换为小数。' },
        { name: '断货时间', target_name: 'stockout_date', dtype: 'object', preprocessing_notes: '可能为日期或文本 \'N/A\', 建议尝试转换为 datetime64[ns], 无效值转为 NaT。' },
        { name: 'Sessions-Browser', target_name: 'sessions_browser', dtype: 'int64', preprocessing_notes: '移除千位分隔符 (如果存在)。' },
        { name: 'Sessions-Browser-Percentage', target_name: 'sessions_browser_percentage', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: 'Sessions-Mobile', target_name: 'sessions_mobile', dtype: 'int64', preprocessing_notes: '移除千位分隔符 (如果存在)。' },
        { name: 'Sessions-Mobile-Percentage', target_name: 'sessions_mobile_percentage', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: 'Sessions-Total', target_name: 'sessions_total', dtype: 'int64', preprocessing_notes: '移除千位分隔符 (如果存在)。' },
        { name: 'Sessions-Percentage', target_name: 'sessions_percentage_of_total', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数 (如果存在)。' },
        { name: 'Unit-Sessions-Percentage', target_name: 'unit_session_percentage', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: 'PV-Browser', target_name: 'page_views_browser', dtype: 'int64', preprocessing_notes: '移除千位分隔符 (如果存在)。' },
        { name: 'PV-Browser-Percentage', target_name: 'page_views_browser_percentage', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: 'PV-Mobile', target_name: 'page_views_mobile', dtype: 'int64', preprocessing_notes: '移除千位分隔符 (如果存在)。' },
        { name: 'PV-Mobile-Percentage', target_name: 'page_views_mobile_percentage', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: 'PV-Total', target_name: 'page_views_total', dtype: 'int64', preprocessing_notes: '移除千位分隔符 (如果存在)。' },
        { name: 'PV-Percentage', target_name: 'page_views_percentage_of_total', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数 (如果存在)。' },
        { name: 'CVR', target_name: 'conversion_rate', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: '销量CVR', target_name: 'units_conversion_rate', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: 'Buybox赢得率', target_name: 'buybox_win_rate', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: 'Sessions-Browser(B2B)', target_name: 'b2b_sessions_browser', dtype: 'int64', preprocessing_notes: '移除千位分隔符 (如果存在)。' },
        { name: 'Sessions-Browser-Percentage(B2B)', target_name: 'b2b_sessions_browser_percentage', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: 'Sessions-Mobile(B2B)', target_name: 'b2b_sessions_mobile', dtype: 'int64', preprocessing_notes: '移除千位分隔符 (如果存在)。' },
        { name: 'Sessions-Mobile-Percentage(B2B)', target_name: 'b2b_sessions_mobile_percentage', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: 'Sessions-Total(B2B)', target_name: 'b2b_sessions_total', dtype: 'int64', preprocessing_notes: '移除千位分隔符 (如果存在)。' },
        { name: 'Sessions-Percentage(B2B)', target_name: 'b2b_sessions_percentage_of_total', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数 (如果存在)。' },
        { name: 'Unit-Sessions-Percentage(B2B)', target_name: 'b2b_unit_session_percentage', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: 'PV-Browser(B2B)', target_name: 'b2b_page_views_browser', dtype: 'int64', preprocessing_notes: '移除千位分隔符 (如果存在)。' },
        { name: 'PV-Browser-Percentage(B2B)', target_name: 'b2b_page_views_browser_percentage', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: 'PV-Mobile(B2B)', target_name: 'b2b_page_views_mobile', dtype: 'int64', preprocessing_notes: '移除千位分隔符 (如果存在)。' },
        { name: 'PV-Mobile-Percentage(B2B)', target_name: 'b2b_page_views_mobile_percentage', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: 'PV-Total(B2B)', target_name: 'b2b_page_views_total', dtype: 'int64', preprocessing_notes: '移除千位分隔符 (如果存在)。' },
        { name: 'PV-Percentage(B2B)', target_name: 'b2b_page_views_percentage_of_total', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数 (如果存在)。' },
        { name: 'CVR(B2B)', target_name: 'b2b_conversion_rate', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数 (如果存在，可能为0或空)。' },
        { name: '销量CVR(B2B)', target_name: 'b2b_units_conversion_rate', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数 (如果存在，可能为0或空)。' },
        { name: 'Buybox赢得率(B2B)', target_name: 'b2b_buybox_win_rate', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数 (如果存在)。' },
        { name: '广告花费', target_name: 'ad_spend', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: 'SP广告费', target_name: 'sp_spend', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: 'SD广告费', target_name: 'sd_spend', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: 'SB广告费', target_name: 'sb_spend', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: 'SBV广告费', target_name: 'sbv_spend', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: '广告销售额', target_name: 'ad_sales', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: 'SP广告销售额', target_name: 'sp_sales', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: 'SD广告销售额', target_name: 'sd_sales', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: 'SB广告销售额', target_name: 'sb_sales', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: 'SBV广告销售额', target_name: 'sbv_sales', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: '广告订单量', target_name: 'ad_orders', dtype: 'int64', preprocessing_notes: '' },
        { name: 'SP广告订单量', target_name: 'sp_orders', dtype: 'int64', preprocessing_notes: '' },
        { name: 'SD广告订单量', target_name: 'sd_orders', dtype: 'int64', preprocessing_notes: '' },
        { name: 'SB广告订单量', target_name: 'sb_orders', dtype: 'int64', preprocessing_notes: '' },
        { name: 'SBV广告订单量', target_name: 'sbv_orders', dtype: 'int64', preprocessing_notes: '' },
        { name: '广告订单占比', target_name: 'ad_order_percentage', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: '直接成交销售额', target_name: 'direct_sales_amount', dtype: 'float64', preprocessing_notes: '移除货币符号和千位分隔符。' },
        { name: '直接成交订单量', target_name: 'direct_orders', dtype: 'int64', preprocessing_notes: '' },
        { name: '展示', target_name: 'impressions', dtype: 'int64', preprocessing_notes: '移除千位分隔符 (如果存在)。' },
        { name: '点击', target_name: 'clicks', dtype: 'int64', preprocessing_notes: '移除千位分隔符 (如果存在)。' },
        { name: 'CTR', target_name: 'ctr', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: '广告CVR', target_name: 'ad_conversion_rate', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: 'CPC', target_name: 'cpc', dtype: 'float64', preprocessing_notes: '移除货币符号 (如果存在)。' },
        { name: 'CPM', target_name: 'cpm', dtype: 'float64', preprocessing_notes: '移除货币符号 (如果存在)。' },
        { name: 'ROAS', target_name: 'roas', dtype: 'float64', preprocessing_notes: '' },
        { name: 'ACOS', target_name: 'acos', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' },
        { name: 'ACoAS', target_name: 'acoas', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' }, // 通常指 Account/Overall ACOS
        { name: 'ASoAS', target_name: 'asoas', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' }, // 通常指 ASIN/Specific ACOS
        { name: 'CPO', target_name: 'cpo', dtype: 'float64', preprocessing_notes: '移除货币符号 (如果存在)。' },
        { name: 'CPU', target_name: 'cpu', dtype: 'float64', preprocessing_notes: '移除货币符号 (如果存在)。' },
        { name: '自然点击量', target_name: 'organic_clicks', dtype: 'int64', preprocessing_notes: '' },
        { name: '自然订单量', target_name: 'organic_orders', dtype: 'int64', preprocessing_notes: '' },
        { name: '自然CVR', target_name: 'organic_conversion_rate', dtype: 'float64', preprocessing_notes: '移除`%`，转换为小数。' }
    ]
};
function preprocessValue(value, dtype, notes) {
    // 处理空值和N/A
    if (value == null || String(value).trim() === '' || String(value).toLowerCase() === 'n/a') {
        // 特殊处理stockout_date的N/A情况
        if (notes.includes('NaT') || notes.includes('无效值转为 NaT')) {
            return null;
        }
        return null;
    }
    let strValue = String(value).trim();
    // 移除货币符号（$, ¥, €, £等）
    if (notes.includes('移除货币符号')) {
        strValue = strValue.replace(/[$¥€£￥]/g, '');
    }
    // 移除千位分隔符
    if (notes.includes('千位分隔符') || notes.includes('移除千位分隔符')) {
        strValue = strValue.replace(/,/g, '');
    }
    // 处理百分比：移除%并转换为小数
    if (notes.includes('移除`%`，转换为小数') || notes.includes('转换为小数')) {
        if (strValue.includes('%')) {
            strValue = strValue.replace(/%/g, '');
            const num = parseFloat(strValue);
            return isNaN(num) ? null : num / 100;
        }
    }
    // 只移除%符号但不转换（某些特殊情况）
    if (notes.includes('移除`%`') && !notes.includes('转换为小数')) {
        strValue = strValue.replace(/%/g, '');
    }
    // 数据类型转换
    if (dtype.startsWith('float') || dtype === 'float64') {
        // 先移除可能的千位分隔符
        strValue = strValue.replace(/,/g, '');
        const num = parseFloat(strValue);
        return isNaN(num) ? null : num;
    }
    if (dtype.startsWith('int') || dtype === 'int64') {
        // 移除千位分隔符后转换为整数
        strValue = strValue.replace(/,/g, '');
        const num = parseInt(strValue, 10);
        return isNaN(num) ? null : num;
    }
    if (dtype.startsWith('datetime') || dtype === 'datetime64[ns]') {
        // 处理日期格式，支持多种格式
        try {
            // 尝试解析各种日期格式
            let date;
            // 处理常见的日期格式
            if (strValue.includes('/')) {
                // MM/DD/YYYY 或 DD/MM/YYYY 格式
                date = new Date(strValue);
            }
            else if (strValue.includes('-')) {
                // YYYY-MM-DD 格式
                date = new Date(strValue);
            }
            else if (strValue.match(/^\d{8}$/)) {
                // YYYYMMDD 格式
                const year = strValue.substring(0, 4);
                const month = strValue.substring(4, 6);
                const day = strValue.substring(6, 8);
                date = new Date(`${year}-${month}-${day}`);
            }
            else {
                date = new Date(strValue);
            }
            return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
        }
        catch (e) {
            return null;
        }
    }
    if (dtype === 'object' && notes.includes('NaT')) {
        // 特殊处理stockout_date
        if (strValue.toLowerCase() === 'n/a')
            return null;
        try {
            const date = new Date(strValue);
            return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
        }
        catch (e) {
            return null;
        }
    }
    // 默认返回字符串
    return strValue;
}
async function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
}
// 自动扫描test目录下的所有报表文件
function getTestDirectoryFiles() {
    const testDir = path.resolve('./test');
    if (!fs.existsSync(testDir)) {
        return [];
    }
    const files = fs.readdirSync(testDir);
    const supportedExtensions = ['.xlsx', '.xls', '.csv'];
    return files
        .filter(file => supportedExtensions.includes(path.extname(file).toLowerCase()))
        .map(file => path.join(testDir, file));
}
// 初始化数据库
const db = new Database('./product_performance.db');
// 创建MCP Server
const server = new McpServer({
    name: 'amazon-analyzer',
    version: '2.0.0'
});
// 工具1: 上传并处理报表数据
server.tool('loadAndStoreReport', {
    filePaths: z.array(z.string()).describe('报表文件路径列表'),
    sheetIndex: z.number().default(0).describe('Excel文件中工作表的索引')
}, async ({ filePaths, sheetIndex }) => {
    let total_files_processed = 0;
    let total_rows_read = 0;
    let inserted_rows = 0;
    let updated_rows = 0;
    let error_rows = 0;
    let errors = [];
    for (const filePath of filePaths) {
        total_files_processed++;
        let raw_rows = [];
        try {
            const ext = path.extname(filePath).toLowerCase();
            const fileBuffer = fs.readFileSync(filePath);
            if (ext === '.xlsx' || ext === '.xls') {
                const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
                const sheet = workbook.Sheets[workbook.SheetNames[sheetIndex]];
                raw_rows = xlsx.utils.sheet_to_json(sheet, { defval: null });
            }
            else if (ext === '.csv') {
                raw_rows = await readCSV(filePath);
            }
            else {
                throw new Error('不支持的文件类型: ' + ext);
            }
        }
        catch (e) {
            error_rows++;
            errors.push({ row_index: -1, file_name: filePath, error_message: e.message });
            continue;
        }
        total_rows_read += raw_rows.length;
        for (let i = 0; i < raw_rows.length; i++) {
            const raw_row = raw_rows[i];
            let record = {};
            try {
                // 数据清洗和字段映射
                for (const field of productPerformanceSchema.fields) {
                    const rawValue = raw_row[field.name];
                    record[field.target_name] = preprocessValue(rawValue, field.dtype, field.preprocessing_notes);
                }
                // 计算辅助列
                // TACOS = 广告花费 / 总销售额
                record.total_acos = (record.total_sales_amount && record.total_sales_amount > 0 && record.ad_spend != null)
                    ? record.ad_spend / record.total_sales_amount : null;
                // 自然销售额 = 总销售额 - 广告销售额
                record.organic_sales_amount = (record.total_sales_amount != null && record.ad_sales != null)
                    ? Math.max(0, record.total_sales_amount - record.ad_sales) : null;
                // 自然订单量 = 总订单量 - 广告订单量
                record.organic_orders = (record.total_orders != null && record.ad_orders != null)
                    ? Math.max(0, record.total_orders - record.ad_orders) : null;
                // 总转化率 = 总订单量 / 总会话数
                record.overall_cvr = (record.sessions_total && record.sessions_total > 0 && record.total_orders != null)
                    ? record.total_orders / record.sessions_total : null;
                const result = await db.upsert('product_performance', record, ['date', 'asin']);
                if (result.inserted)
                    inserted_rows++;
                else
                    updated_rows++;
            }
            catch (e) {
                error_rows++;
                errors.push({ row_index: i, file_name: filePath, error_message: e.message, data: raw_row });
            }
        }
    }
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    total_files_processed,
                    total_rows_read,
                    inserted_rows,
                    updated_rows,
                    error_rows,
                    errors
                }, null, 2)
            }]
    };
});
// 工具1.5: 自动加载test目录下的所有文件
server.tool('loadTestFiles', {
    sheetIndex: z.number().default(0).describe('Excel文件中工作表的索引')
}, async ({ sheetIndex }) => {
    const filePaths = getTestDirectoryFiles();
    if (filePaths.length === 0) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        error: 'test目录不存在或没有找到支持的报表文件（.xlsx, .xls, .csv）',
                        auto_scanned: true,
                        total_files_processed: 0,
                        total_rows_read: 0,
                        inserted_rows: 0,
                        updated_rows: 0,
                        error_rows: 0,
                        errors: []
                    }, null, 2)
                }]
        };
    }
    let total_files_processed = 0;
    let total_rows_read = 0;
    let inserted_rows = 0;
    let updated_rows = 0;
    let error_rows = 0;
    let errors = [];
    for (const filePath of filePaths) {
        total_files_processed++;
        let raw_rows = [];
        try {
            const ext = path.extname(filePath).toLowerCase();
            const fileBuffer = fs.readFileSync(filePath);
            if (ext === '.xlsx' || ext === '.xls') {
                const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
                const sheet = workbook.Sheets[workbook.SheetNames[sheetIndex]];
                raw_rows = xlsx.utils.sheet_to_json(sheet, { defval: null });
            }
            else if (ext === '.csv') {
                raw_rows = await readCSV(filePath);
            }
            else {
                throw new Error('不支持的文件类型: ' + ext);
            }
        }
        catch (e) {
            error_rows++;
            errors.push({ row_index: -1, file_name: filePath, error_message: e.message });
            continue;
        }
        total_rows_read += raw_rows.length;
        for (let i = 0; i < raw_rows.length; i++) {
            const raw_row = raw_rows[i];
            let record = {};
            try {
                // 数据清洗和字段映射
                for (const field of productPerformanceSchema.fields) {
                    const rawValue = raw_row[field.name];
                    record[field.target_name] = preprocessValue(rawValue, field.dtype, field.preprocessing_notes);
                }
                // 计算辅助列
                // TACOS = 广告花费 / 总销售额
                record.total_acos = (record.total_sales_amount && record.total_sales_amount > 0 && record.ad_spend != null)
                    ? record.ad_spend / record.total_sales_amount : null;
                // 自然销售额 = 总销售额 - 广告销售额
                record.organic_sales_amount = (record.total_sales_amount != null && record.ad_sales != null)
                    ? Math.max(0, record.total_sales_amount - record.ad_sales) : null;
                // 自然订单量 = 总订单量 - 广告订单量
                record.organic_orders = (record.total_orders != null && record.ad_orders != null)
                    ? Math.max(0, record.total_orders - record.ad_orders) : null;
                // 总转化率 = 总订单量 / 总会话数
                record.overall_cvr = (record.sessions_total && record.sessions_total > 0 && record.total_orders != null)
                    ? record.total_orders / record.sessions_total : null;
                const result = await db.upsert('product_performance', record, ['date', 'asin']);
                if (result.inserted)
                    inserted_rows++;
                else
                    updated_rows++;
            }
            catch (e) {
                error_rows++;
                errors.push({ row_index: i, file_name: filePath, error_message: e.message, data: raw_row });
            }
        }
    }
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    auto_scanned: true,
                    scanned_files: filePaths,
                    total_files_processed,
                    total_rows_read,
                    inserted_rows,
                    updated_rows,
                    error_rows,
                    errors
                }, null, 2)
            }]
    };
});
// 工具2: 数据概览
server.tool('getDataOverview', {}, async () => {
    const total_records_res = await db.queryOne('SELECT COUNT(*) as cnt FROM product_performance');
    const total_records = total_records_res ? total_records_res.cnt : 0;
    const distinct_asins_res = await db.queryOne('SELECT COUNT(DISTINCT asin) as cnt FROM product_performance');
    const distinct_asins = distinct_asins_res ? distinct_asins_res.cnt : 0;
    const date_minmax = await db.queryOne('SELECT MIN(date) as min_date, MAX(date) as max_date FROM product_performance');
    const missing_values_summary = {};
    for (const field of productPerformanceSchema.fields) {
        const r = await db.queryOne(`SELECT COUNT(*) as cnt FROM product_performance WHERE ${field.target_name} IS NULL`);
        missing_values_summary[field.target_name] = r ? r.cnt : 0;
    }
    const key_numeric_fields = ['units_sold', 'total_sales_amount', 'total_orders', 'net_sales_amount', 'avg_selling_price', 'rating_score', 'review_count', 'refund_rate', 'return_rate', 'sessions_total', 'conversion_rate', 'ad_sales', 'ad_spend', 'acos', 'roas', 'order_gross_profit', 'order_gross_margin_rate', 'roi', 'total_acos', 'organic_sales_amount', 'organic_orders', 'overall_cvr'];
    const key_numeric_stats = {};
    for (const field of key_numeric_fields) {
        const stat = await db.queryOne(`SELECT COUNT(${field}) as count, AVG(${field}) as mean, SUM(${field}) as sum, MIN(${field}) as min, MAX(${field}) as max FROM product_performance WHERE ${field} IS NOT NULL`);
        key_numeric_stats[field] = stat || { count: 0, mean: null, sum: null, min: null, max: null };
    }
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    total_records,
                    distinct_asins,
                    date_range_min: date_minmax ? date_minmax.min_date : null,
                    date_range_max: date_minmax ? date_minmax.max_date : null,
                    missing_values_summary,
                    key_numeric_stats
                }, null, 2)
            }]
    };
});
// 工具3: ASIN表现分析
server.tool('getAsinSummary', {
    asins: z.array(z.string()).optional().describe('ASIN列表，为空则分析所有ASIN'),
    start_date: z.string().describe('开始日期'),
    end_date: z.string().describe('结束日期')
}, async ({ asins, start_date, end_date }) => {
    let whereClauses = ['date >= ?', 'date <= ?'];
    let params = [start_date, end_date];
    if (asins && asins.length > 0) {
        whereClauses.push(`asin IN (${asins.map(() => '?').join(',')})`);
        params.push(...asins);
    }
    const sql = `
      SELECT 
        asin,
        MAX(parent_asin) as parent_asin,
        MAX(title) as title,
        SUM(units_sold) as total_units_sold,
        SUM(total_sales_amount) as total_sales_amount,
        SUM(total_orders) as total_orders,
        SUM(net_sales_amount) as net_sales_amount,
        CASE WHEN SUM(units_sold) > 0 THEN SUM(total_sales_amount) / SUM(units_sold) ELSE NULL END as avg_selling_price,
        AVG(rating_score) as rating_score,
        MAX(review_count) as review_count,
        CASE WHEN SUM(units_sold) > 0 THEN SUM(refund_units) / SUM(units_sold) ELSE NULL END as refund_rate,
        CASE WHEN SUM(units_sold) > 0 THEN SUM(return_units) / SUM(units_sold) ELSE NULL END as return_rate,
        SUM(sessions_total) as sessions_total,
        CASE WHEN SUM(sessions_total) > 0 THEN SUM(units_sold) / SUM(sessions_total) ELSE NULL END as unit_session_percentage,
        SUM(page_views_total) as page_views_total,
        CASE WHEN SUM(sessions_total) > 0 THEN SUM(total_orders) / SUM(sessions_total) ELSE NULL END as conversion_rate,
        AVG(buybox_win_rate) as buybox_win_rate,
        SUM(ad_sales) as ad_sales,
        SUM(ad_spend) as ad_spend,
        SUM(ad_orders) as ad_orders,
        CASE WHEN SUM(ad_sales) > 0 THEN SUM(ad_spend) / SUM(ad_sales) ELSE NULL END as acos,
        CASE WHEN SUM(ad_spend) > 0 THEN SUM(ad_sales) / SUM(ad_spend) ELSE NULL END as roas,
        CASE WHEN SUM(total_sales_amount) > 0 THEN SUM(ad_spend) / SUM(total_sales_amount) ELSE NULL END as total_acos,
        SUM(total_sales_amount) - SUM(ad_sales) as organic_sales_amount,
        SUM(total_orders) - SUM(ad_orders) as organic_orders,
        CASE WHEN SUM(sessions_total) > 0 THEN (SUM(total_orders) - SUM(ad_orders)) / SUM(sessions_total) ELSE NULL END as organic_conversion_rate,
        SUM(order_gross_profit) as order_gross_profit,
        CASE WHEN SUM(total_sales_amount) > 0 THEN SUM(order_gross_profit) / SUM(total_sales_amount) ELSE NULL END as order_gross_margin_rate,
        AVG(roi) as roi 
      FROM product_performance 
      WHERE ${whereClauses.join(' AND ')} 
      GROUP BY asin
    `;
    const results = await db.query(sql, params);
    return {
        content: [{
                type: 'text',
                text: JSON.stringify(results, null, 2)
            }]
    };
});
// 工具4: 广告表现分析
server.tool('getAdBreakdown', {
    asins: z.array(z.string()).optional().describe('ASIN列表'),
    start_date: z.string().describe('开始日期'),
    end_date: z.string().describe('结束日期'),
    ad_type: z.enum(['SP', 'SB', 'SD', 'SBV', 'All']).default('All').describe('广告类型')
}, async ({ asins, start_date, end_date, ad_type }) => {
    let whereClauses = ['date >= ?', 'date <= ?'];
    let params = [start_date, end_date];
    if (asins && asins.length > 0) {
        whereClauses.push(`asin IN (${asins.map(() => '?').join(',')})`);
        params.push(...asins);
    }
    let selectFields = '';
    let groupKey = asins && asins.length === 1 ? asins[0] : 'Overall';
    if (ad_type === 'All') {
        selectFields = `
        SUM(ad_spend) as total_ad_spend,
        SUM(ad_sales) as total_ad_sales,
        SUM(ad_orders) as total_ad_orders,
        AVG(acos) as avg_acos,
        AVG(roas) as avg_roas,
        AVG(ctr) as avg_ctr,
        AVG(cpc) as avg_cpc,
        AVG(ad_conversion_rate) as avg_ad_conversion_rate,
        CASE WHEN SUM(ad_spend) > 0 THEN SUM(sp_spend) / SUM(ad_spend) ELSE NULL END as sp_spend_share,
        CASE WHEN SUM(ad_spend) > 0 THEN SUM(sb_spend) / SUM(ad_spend) ELSE NULL END as sb_spend_share,
        CASE WHEN SUM(ad_spend) > 0 THEN SUM(sd_spend) / SUM(ad_spend) ELSE NULL END as sd_spend_share,
        CASE WHEN SUM(ad_spend) > 0 THEN SUM(sbv_spend) / SUM(ad_spend) ELSE NULL END as sbv_spend_share
      `;
    }
    else {
        const typePrefix = ad_type.toLowerCase();
        selectFields = `
        SUM(${typePrefix}_spend) as total_ad_spend,
        SUM(${typePrefix}_sales) as total_ad_sales,
        SUM(${typePrefix}_orders) as total_ad_orders,
        CASE WHEN SUM(${typePrefix}_sales) > 0 THEN SUM(${typePrefix}_spend) / SUM(${typePrefix}_sales) ELSE NULL END as avg_acos,
        CASE WHEN SUM(${typePrefix}_spend) > 0 THEN SUM(${typePrefix}_sales) / SUM(${typePrefix}_spend) ELSE NULL END as avg_roas,
        AVG(ctr) as avg_ctr,
        AVG(cpc) as avg_cpc,
        AVG(ad_conversion_rate) as avg_ad_conversion_rate,
        NULL as sp_spend_share,
        NULL as sb_spend_share,
        NULL as sd_spend_share,
        NULL as sbv_spend_share
      `;
    }
    const sql = `
      SELECT 
        '${groupKey}' as group_key,
        '${ad_type}' as ad_type_analyzed,
        ${selectFields}
      FROM product_performance 
      WHERE ${whereClauses.join(' AND ')}
      ${asins && asins.length === 1 ? '' : 'GROUP BY 1, 2'}
    `;
    const results = await db.query(sql, params);
    return {
        content: [{
                type: 'text',
                text: JSON.stringify(results, null, 2)
            }]
    };
});
// 工具5: 盈利能力分析
server.tool('analyzeProfitability', {
    asins: z.array(z.string()).optional().describe('ASIN列表'),
    start_date: z.string().describe('开始日期'),
    end_date: z.string().describe('结束日期'),
    group_by_field: z.enum(['person_in_charge', 'brand', 'asin', 'parent_asin', 'none']).default('asin').describe('分组依据')
}, async ({ asins, start_date, end_date, group_by_field }) => {
    let whereClauses = ['date >= ?', 'date <= ?'];
    let params = [start_date, end_date];
    if (asins && asins.length > 0) {
        whereClauses.push(`asin IN (${asins.map(() => '?').join(',')})`);
        params.push(...asins);
    }
    let groupByClause = '';
    let selectGroupField = '';
    if (group_by_field !== 'none') {
        groupByClause = `GROUP BY ${group_by_field}`;
        selectGroupField = `${group_by_field} as group_value,`;
    }
    else {
        selectGroupField = `'Overall' as group_value,`;
    }
    const sql = `
      SELECT 
        ${selectGroupField}
        SUM(order_gross_profit) as total_order_gross_profit,
        AVG(order_gross_margin_rate) as avg_order_gross_margin_rate,
        SUM(settlement_gross_profit) as total_settlement_gross_profit,
        AVG(settlement_gross_margin_rate) as avg_settlement_gross_margin_rate,
        AVG(roi) as avg_roi,
        SUM(order_gross_profit) - SUM(ad_spend) as estimated_net_profit_after_ads
      FROM product_performance 
      WHERE ${whereClauses.join(' AND ')}
      ${groupByClause}
    `;
    const results = await db.query(sql, params);
    return {
        content: [{
                type: 'text',
                text: JSON.stringify(results, null, 2)
            }]
    };
});
// 工具6: 库存健康分析
server.tool('getInventoryHealth', {
    low_stock_threshold_days: z.number().default(10).describe('FBA可售天数低于此值视为低库存'),
    overstock_threshold_days: z.number().default(90).describe('FBA可售天数高于此值视为潜在滞销')
}, async ({ low_stock_threshold_days, overstock_threshold_days }) => {
    // 获取最新日期的数据
    const latest_date_res = await db.queryOne('SELECT MAX(date) as latest_date FROM product_performance');
    const latest_date = latest_date_res ? latest_date_res.latest_date : null;
    if (!latest_date) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({ error: '没有找到数据' }, null, 2)
                }]
        };
    }
    // FBA汇总信息
    const fba_summary = await db.queryOne(`
      SELECT 
        SUM(fba_total_inventory) as total_fba_inventory,
        SUM(fba_sellable_units) as total_fba_sellable_units,
        SUM(fba_reserved_transfer) as total_fba_reserved_transfer,
        SUM(fba_in_transfer) as total_fba_in_transfer,
        SUM(fba_inbound_receiving) as total_fba_inbound_receiving
      FROM product_performance 
      WHERE date = ?
    `, [latest_date]);
    // 低库存ASIN
    const low_stock_asins = await db.query(`
      SELECT 
        asin,
        fba_sellable_units,
        fba_days_of_supply,
        monthly_sell_through_rate
      FROM product_performance 
      WHERE date = ? AND fba_days_of_supply < ? AND fba_days_of_supply IS NOT NULL
      ORDER BY fba_days_of_supply ASC
    `, [latest_date, low_stock_threshold_days]);
    // 滞销库存ASIN
    const overstock_asins = await db.query(`
      SELECT 
        asin,
        fba_sellable_units,
        fba_days_of_supply,
        monthly_sell_through_rate
      FROM product_performance 
      WHERE date = ? AND fba_days_of_supply > ? AND fba_days_of_supply IS NOT NULL
      ORDER BY fba_days_of_supply DESC
    `, [latest_date, overstock_threshold_days]);
    // FBM汇总信息
    const fbm_summary = await db.queryOne(`
      SELECT 
        SUM(fbm_sellable_units) as total_fbm_sellable_units
      FROM product_performance 
      WHERE date = ?
    `, [latest_date]);
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    latest_data_date: latest_date,
                    fba_summary: fba_summary || {},
                    low_stock_asins: low_stock_asins || [],
                    overstock_asins: overstock_asins || [],
                    fbm_summary: fbm_summary || {}
                }, null, 2)
            }]
    };
});
// 工具7: 产品排名
server.tool('rankProducts', {
    start_date: z.string().describe('开始日期'),
    end_date: z.string().describe('结束日期'),
    metric_to_rank: z.enum(['total_sales_amount', 'units_sold', 'order_gross_profit', 'order_gross_margin_rate', 'roi', 'acos', 'roas', 'total_acos', 'conversion_rate', 'sessions_total']).describe('用于排名的指标'),
    ranking_order: z.enum(['asc', 'desc']).default('desc').describe('升序或降序'),
    top_n: z.number().default(10).describe('返回排名前N的ASIN')
}, async ({ start_date, end_date, metric_to_rank, ranking_order, top_n }) => {
    const sql = `
      SELECT 
        asin,
        MAX(title) as title,
        ${metric_to_rank === 'order_gross_margin_rate' || metric_to_rank === 'conversion_rate' || metric_to_rank === 'roi' || metric_to_rank === 'acos' || metric_to_rank === 'roas' || metric_to_rank === 'total_acos'
        ? `AVG(${metric_to_rank})`
        : `SUM(${metric_to_rank})`} as metric_value
      FROM product_performance 
      WHERE date >= ? AND date <= ? AND ${metric_to_rank} IS NOT NULL
      GROUP BY asin
      ORDER BY metric_value ${ranking_order}
      LIMIT ?
    `;
    const results = await db.query(sql, [start_date, end_date, top_n]);
    return {
        content: [{
                type: 'text',
                text: JSON.stringify(results, null, 2)
            }]
    };
});
// 工具8: 趋势分析
server.tool('getMetricTrend', {
    asin: z.string().describe('ASIN'),
    metrics: z.array(z.string()).describe('要查询趋势的指标列表'),
    start_date: z.string().describe('开始日期'),
    end_date: z.string().describe('结束日期'),
    granularity: z.enum(['daily', 'weekly', 'monthly']).default('daily').describe('时间聚合粒度')
}, async ({ asin, metrics, start_date, end_date, granularity }) => {
    let dateGrouping = 'date';
    if (granularity === 'weekly') {
        dateGrouping = "strftime('%Y-W%W', date)";
    }
    else if (granularity === 'monthly') {
        dateGrouping = "strftime('%Y-%m', date)";
    }
    const metricSelects = metrics.map(metric => `AVG(${metric}) as ${metric}`).join(', ');
    const sql = `
      SELECT 
        ${dateGrouping} as date_bucket,
        ${metricSelects}
      FROM product_performance 
      WHERE asin = ? AND date >= ? AND date <= ?
      GROUP BY ${dateGrouping}
      ORDER BY date_bucket
    `;
    const results = await db.query(sql, [asin, start_date, end_date]);
    return {
        content: [{
                type: 'text',
                text: JSON.stringify(results, null, 2)
            }]
    };
});
// 工具9: 自定义报告
server.tool('customReport', {
    fields: z.array(z.string()).describe('需要导出的字段列表'),
    filters: z.record(z.any()).optional().describe('筛选条件'),
    output_format: z.enum(['json', 'csv_string']).default('json').describe('输出格式')
}, async ({ fields, filters, output_format }) => {
    let whereClauses = [];
    let params = [];
    // 处理筛选条件
    if (filters) {
        for (const [key, value] of Object.entries(filters)) {
            if (Array.isArray(value)) {
                whereClauses.push(`${key} IN (${value.map(() => '?').join(',')})`);
                params.push(...value);
            }
            else if (typeof value === 'object' && value !== null) {
                // 处理日期范围等复杂条件
                if ('start' in value && 'end' in value) {
                    whereClauses.push(`${key} >= ? AND ${key} <= ?`);
                    params.push(value.start, value.end);
                }
            }
            else {
                whereClauses.push(`${key} = ?`);
                params.push(value);
            }
        }
    }
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const sql = `SELECT ${fields.join(', ')} FROM product_performance ${whereClause}`;
    const results = await db.query(sql, params);
    if (output_format === 'csv_string') {
        // 转换为CSV格式
        if (results.length === 0) {
            return {
                content: [{
                        type: 'text',
                        text: fields.join(',') + '\n'
                    }]
            };
        }
        const csvHeader = fields.join(',');
        const csvRows = results.map(row => fields.map(field => {
            const value = row[field];
            return value === null || value === undefined ? '' : String(value);
        }).join(','));
        return {
            content: [{
                    type: 'text',
                    text: csvHeader + '\n' + csvRows.join('\n')
                }]
        };
    }
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({ report_data: results }, null, 2)
            }]
    };
});
// 启动服务器
const transport = new StdioServerTransport();
await server.connect(transport);
//# sourceMappingURL=index.js.map