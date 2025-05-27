import { z } from 'zod';
export interface FieldMapping {
    name: string;
    target_name: string;
    dtype: string;
    preprocessing_notes: string;
}
export interface ProductPerformanceRecord {
    date: string;
    asin: string;
    parent_asin?: string;
    msku?: string;
    store_name?: string;
    country_code?: string;
    selling_price_total?: number;
    title?: string;
    auto_tags?: string;
    listing_tags?: string;
    person_in_charge?: string;
    creation_timestamp?: string;
    product_name_cn?: string;
    sku_code?: string;
    style_name?: string;
    spu_code?: string;
    model_number?: string;
    category_level_1?: string;
    category_level_2?: string;
    category_level_3?: string;
    brand?: string;
    developer_name?: string;
    units_sold?: number;
    total_sales_amount?: number;
    total_orders?: number;
    units_sold_mom_change?: number;
    sales_amount_mom_change?: number;
    orders_mom_change?: number;
    units_sold_yoy_change?: number;
    sales_amount_yoy_change?: number;
    orders_yoy_change?: number;
    net_sales_amount?: number;
    b2b_units_sold?: number;
    b2b_sales_amount?: number;
    b2b_orders?: number;
    promo_units_sold?: number;
    promo_sales_amount?: number;
    promo_orders?: number;
    avg_selling_price?: number;
    avg_units_per_order?: number;
    promo_discount_amount?: number;
    fbm_shipping_revenue?: number;
    main_category_rank_raw?: string;
    sub_category_rank_raw?: string;
    refund_units?: number;
    refund_amount?: number;
    refund_rate?: number;
    rating_score?: number;
    review_count?: number;
    review_rate?: number;
    settlement_gross_profit?: number;
    order_gross_profit?: number;
    settlement_gross_margin_rate?: number;
    order_gross_margin_rate?: number;
    roi?: number;
    return_units?: number;
    return_rate?: number;
    fbm_sellable_units?: number;
    fba_sellable_units?: number;
    fba_reserved_transfer?: number;
    fba_in_transfer?: number;
    fba_inbound_receiving?: number;
    fba_total_inventory?: number;
    fba_reserved_customer_orders?: number;
    fba_inbound_shipped?: number;
    fba_planned_inbound?: number;
    fba_unsellable_units?: number;
    total_available_inventory?: number;
    fba_days_of_supply?: number;
    fbm_days_of_supply?: number;
    overseas_warehouse_available?: number;
    local_warehouse_available?: number;
    purchase_order_quantity?: number;
    monthly_sell_through_rate?: number;
    stockout_date?: string;
    sessions_browser?: number;
    sessions_browser_percentage?: number;
    sessions_mobile?: number;
    sessions_mobile_percentage?: number;
    sessions_total?: number;
    sessions_percentage_of_total?: number;
    unit_session_percentage?: number;
    page_views_browser?: number;
    page_views_browser_percentage?: number;
    page_views_mobile?: number;
    page_views_mobile_percentage?: number;
    page_views_total?: number;
    page_views_percentage_of_total?: number;
    conversion_rate?: number;
    units_conversion_rate?: number;
    buybox_win_rate?: number;
    b2b_sessions_browser?: number;
    b2b_sessions_browser_percentage?: number;
    b2b_sessions_mobile?: number;
    b2b_sessions_mobile_percentage?: number;
    b2b_sessions_total?: number;
    b2b_sessions_percentage_of_total?: number;
    b2b_unit_session_percentage?: number;
    b2b_page_views_browser?: number;
    b2b_page_views_browser_percentage?: number;
    b2b_page_views_mobile?: number;
    b2b_page_views_mobile_percentage?: number;
    b2b_page_views_total?: number;
    b2b_page_views_percentage_of_total?: number;
    b2b_conversion_rate?: number;
    b2b_units_conversion_rate?: number;
    b2b_buybox_win_rate?: number;
    ad_spend?: number;
    sp_spend?: number;
    sd_spend?: number;
    sb_spend?: number;
    sbv_spend?: number;
    ad_sales?: number;
    sp_sales?: number;
    sd_sales?: number;
    sb_sales?: number;
    sbv_sales?: number;
    ad_orders?: number;
    sp_orders?: number;
    sd_orders?: number;
    sb_orders?: number;
    sbv_orders?: number;
    ad_order_percentage?: number;
    direct_sales_amount?: number;
    direct_orders?: number;
    impressions?: number;
    clicks?: number;
    ctr?: number;
    ad_conversion_rate?: number;
    cpc?: number;
    cpm?: number;
    roas?: number;
    acos?: number;
    acoas?: number;
    asoas?: number;
    cpo?: number;
    cpu?: number;
    organic_clicks?: number;
    organic_orders?: number;
    organic_conversion_rate?: number;
    total_acos?: number;
    organic_sales_amount?: number;
    overall_cvr?: number;
}
export interface SchemaField {
    name: string;
    target_name: string;
    dtype: string;
    preprocessing_notes: string;
}
export interface LoadReportResult {
    total_files_processed: number;
    total_rows_read: number;
    inserted_rows: number;
    updated_rows: number;
    error_rows: number;
    errors: Array<{
        row_index: number;
        file_name: string;
        error_message: string;
        data?: any;
    }>;
}
export interface DataOverview {
    total_records: number;
    distinct_asins: number;
    date_range_min: string | null;
    date_range_max: string | null;
    missing_values_summary: Record<string, number>;
    key_numeric_stats: Record<string, {
        count: number;
        mean: number | null;
        sum: number | null;
        min: number | null;
        max: number | null;
    }>;
}
export interface AsinPerformanceSummary {
    asin: string;
    parent_asin?: string;
    title?: string;
    total_units_sold: number;
    total_sales_amount: number;
    total_orders: number;
    net_sales_amount: number;
    avg_selling_price?: number;
    rating_score?: number;
    review_count?: number;
    refund_rate?: number;
    return_rate?: number;
    sessions_total: number;
    unit_session_percentage?: number;
    page_views_total: number;
    conversion_rate?: number;
    buybox_win_rate?: number;
    ad_sales: number;
    ad_spend: number;
    ad_orders: number;
    acos?: number;
    roas?: number;
    total_acos?: number;
    organic_sales_amount: number;
    organic_orders: number;
    organic_conversion_rate?: number;
    order_gross_profit: number;
    order_gross_margin_rate?: number;
    roi?: number;
}
export interface AdvertisingPerformanceBreakdown {
    group_key: string;
    ad_type_analyzed: string;
    total_ad_spend: number;
    total_ad_sales: number;
    total_ad_orders: number;
    avg_acos?: number;
    avg_roas?: number;
    avg_ctr?: number;
    avg_cpc?: number;
    avg_ad_conversion_rate?: number;
    sp_spend_share?: number;
    sb_spend_share?: number;
    sd_spend_share?: number;
    sbv_spend_share?: number;
}
export interface ProfitabilityAnalysis {
    group_value: string;
    total_order_gross_profit: number;
    avg_order_gross_margin_rate?: number;
    total_settlement_gross_profit: number;
    avg_settlement_gross_margin_rate?: number;
    avg_roi?: number;
    estimated_net_profit_after_ads: number;
}
export interface InventoryHealthAnalysis {
    latest_data_date: string;
    fba_summary: {
        total_fba_inventory: number;
        total_fba_sellable_units: number;
        total_fba_reserved_transfer: number;
        total_fba_in_transfer: number;
        total_fba_inbound_receiving: number;
    };
    low_stock_asins: Array<{
        asin: string;
        fba_sellable_units: number;
        fba_days_of_supply?: number;
        monthly_sell_through_rate?: number;
    }>;
    overstock_asins: Array<{
        asin: string;
        fba_sellable_units: number;
        fba_days_of_supply?: number;
        monthly_sell_through_rate?: number;
    }>;
    fbm_summary: {
        total_fbm_sellable_units: number;
    };
}
export interface ProductRanking {
    asin: string;
    title?: string;
    metric_value: number;
}
export interface MetricTrend {
    date_bucket: string;
    [key: string]: any;
}
export interface CustomReportResult {
    report_data: any[] | string;
}
export declare const LoadReportArgsSchema: z.ZodObject<{
    files: z.ZodArray<z.ZodString, "many">;
    sheetIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    files: string[];
    sheetIndex: number;
}, {
    files: string[];
    sheetIndex?: number | undefined;
}>;
export declare const GetAsinPerformanceSummaryArgsSchema: z.ZodObject<{
    asins: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    start_date: z.ZodString;
    end_date: z.ZodString;
}, "strip", z.ZodTypeAny, {
    start_date: string;
    end_date: string;
    asins?: string[] | undefined;
}, {
    start_date: string;
    end_date: string;
    asins?: string[] | undefined;
}>;
export declare const GetAdvertisingPerformanceBreakdownArgsSchema: z.ZodObject<{
    asins: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    start_date: z.ZodString;
    end_date: z.ZodString;
    ad_type: z.ZodDefault<z.ZodEnum<["SP", "SB", "SD", "SBV", "All"]>>;
}, "strip", z.ZodTypeAny, {
    start_date: string;
    end_date: string;
    ad_type: "SP" | "SB" | "SD" | "SBV" | "All";
    asins?: string[] | undefined;
}, {
    start_date: string;
    end_date: string;
    asins?: string[] | undefined;
    ad_type?: "SP" | "SB" | "SD" | "SBV" | "All" | undefined;
}>;
export declare const AnalyzeProfitabilityArgsSchema: z.ZodObject<{
    asins: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    start_date: z.ZodString;
    end_date: z.ZodString;
    group_by_field: z.ZodDefault<z.ZodEnum<["person_in_charge", "brand", "asin", "parent_asin", "none"]>>;
}, "strip", z.ZodTypeAny, {
    start_date: string;
    end_date: string;
    group_by_field: "person_in_charge" | "brand" | "asin" | "parent_asin" | "none";
    asins?: string[] | undefined;
}, {
    start_date: string;
    end_date: string;
    asins?: string[] | undefined;
    group_by_field?: "person_in_charge" | "brand" | "asin" | "parent_asin" | "none" | undefined;
}>;
export declare const GetInventoryHealthAnalysisArgsSchema: z.ZodObject<{
    low_stock_threshold_days: z.ZodDefault<z.ZodNumber>;
    overstock_threshold_days: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    low_stock_threshold_days: number;
    overstock_threshold_days: number;
}, {
    low_stock_threshold_days?: number | undefined;
    overstock_threshold_days?: number | undefined;
}>;
export declare const RankProductsByMetricArgsSchema: z.ZodObject<{
    start_date: z.ZodString;
    end_date: z.ZodString;
    metric_to_rank: z.ZodEnum<["total_sales_amount", "units_sold", "order_gross_profit", "order_gross_margin_rate", "roi", "acos", "roas", "total_acos", "conversion_rate", "sessions_total"]>;
    ranking_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    top_n: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    start_date: string;
    end_date: string;
    metric_to_rank: "total_sales_amount" | "units_sold" | "order_gross_profit" | "order_gross_margin_rate" | "roi" | "acos" | "roas" | "total_acos" | "conversion_rate" | "sessions_total";
    ranking_order: "asc" | "desc";
    top_n: number;
}, {
    start_date: string;
    end_date: string;
    metric_to_rank: "total_sales_amount" | "units_sold" | "order_gross_profit" | "order_gross_margin_rate" | "roi" | "acos" | "roas" | "total_acos" | "conversion_rate" | "sessions_total";
    ranking_order?: "asc" | "desc" | undefined;
    top_n?: number | undefined;
}>;
export declare const GetMetricTrendArgsSchema: z.ZodObject<{
    asin: z.ZodString;
    metrics: z.ZodArray<z.ZodString, "many">;
    start_date: z.ZodString;
    end_date: z.ZodString;
    granularity: z.ZodDefault<z.ZodEnum<["daily", "weekly", "monthly"]>>;
}, "strip", z.ZodTypeAny, {
    start_date: string;
    end_date: string;
    asin: string;
    metrics: string[];
    granularity: "daily" | "weekly" | "monthly";
}, {
    start_date: string;
    end_date: string;
    asin: string;
    metrics: string[];
    granularity?: "daily" | "weekly" | "monthly" | undefined;
}>;
export declare const GenerateCustomReportArgsSchema: z.ZodObject<{
    fields: z.ZodArray<z.ZodString, "many">;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    output_format: z.ZodDefault<z.ZodEnum<["json", "csv_string"]>>;
}, "strip", z.ZodTypeAny, {
    fields: string[];
    output_format: "json" | "csv_string";
    filters?: Record<string, any> | undefined;
}, {
    fields: string[];
    filters?: Record<string, any> | undefined;
    output_format?: "json" | "csv_string" | undefined;
}>;
//# sourceMappingURL=types.d.ts.map