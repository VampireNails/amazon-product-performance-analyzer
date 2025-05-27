import { z } from 'zod';
// Zod schemas for validation
export const LoadReportArgsSchema = z.object({
    files: z.array(z.string()),
    sheetIndex: z.number().default(0)
});
export const GetAsinPerformanceSummaryArgsSchema = z.object({
    asins: z.array(z.string()).optional(),
    start_date: z.string(),
    end_date: z.string()
});
export const GetAdvertisingPerformanceBreakdownArgsSchema = z.object({
    asins: z.array(z.string()).optional(),
    start_date: z.string(),
    end_date: z.string(),
    ad_type: z.enum(["SP", "SB", "SD", "SBV", "All"]).default("All")
});
export const AnalyzeProfitabilityArgsSchema = z.object({
    asins: z.array(z.string()).optional(),
    start_date: z.string(),
    end_date: z.string(),
    group_by_field: z.enum(["person_in_charge", "brand", "asin", "parent_asin", "none"]).default("asin")
});
export const GetInventoryHealthAnalysisArgsSchema = z.object({
    low_stock_threshold_days: z.number().default(10),
    overstock_threshold_days: z.number().default(90)
});
export const RankProductsByMetricArgsSchema = z.object({
    start_date: z.string(),
    end_date: z.string(),
    metric_to_rank: z.enum([
        "total_sales_amount", "units_sold", "order_gross_profit", "order_gross_margin_rate", "roi",
        "acos", "roas", "total_acos", "conversion_rate", "sessions_total"
    ]),
    ranking_order: z.enum(["asc", "desc"]).default("desc"),
    top_n: z.number().default(10)
});
export const GetMetricTrendArgsSchema = z.object({
    asin: z.string(),
    metrics: z.array(z.string()),
    start_date: z.string(),
    end_date: z.string(),
    granularity: z.enum(["daily", "weekly", "monthly"]).default("daily")
});
export const GenerateCustomReportArgsSchema = z.object({
    fields: z.array(z.string()),
    filters: z.record(z.any()).optional(),
    output_format: z.enum(["json", "csv_string"]).default("json")
});
//# sourceMappingURL=types.js.map