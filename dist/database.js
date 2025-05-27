import sqlite3 from 'sqlite3';
import { promisify } from 'util';
export class Database {
    db;
    constructor(dbPath = './product_performance.db') {
        this.db = new sqlite3.Database(dbPath);
        this.initTables();
    }
    async initTables() {
        const run = promisify(this.db.run.bind(this.db));
        // 创建产品表现数据表
        await run(`
      CREATE TABLE IF NOT EXISTS product_performance (
        date TEXT NOT NULL,
        asin TEXT NOT NULL,
        parent_asin TEXT,
        msku TEXT,
        store_name TEXT,
        country_code TEXT,
        selling_price_total REAL,
        title TEXT,
        auto_tags TEXT,
        listing_tags TEXT,
        person_in_charge TEXT,
        creation_timestamp TEXT,
        product_name_cn TEXT,
        sku_code TEXT,
        style_name TEXT,
        spu_code TEXT,
        model_number TEXT,
        category_level_1 TEXT,
        category_level_2 TEXT,
        category_level_3 TEXT,
        brand TEXT,
        developer_name TEXT,
        units_sold INTEGER,
        total_sales_amount REAL,
        total_orders INTEGER,
        units_sold_mom_change REAL,
        sales_amount_mom_change REAL,
        orders_mom_change REAL,
        units_sold_yoy_change REAL,
        sales_amount_yoy_change REAL,
        orders_yoy_change REAL,
        net_sales_amount REAL,
        b2b_units_sold INTEGER,
        b2b_sales_amount REAL,
        b2b_orders INTEGER,
        promo_units_sold INTEGER,
        promo_sales_amount REAL,
        promo_orders INTEGER,
        avg_selling_price REAL,
        avg_units_per_order REAL,
        promo_discount_amount REAL,
        fbm_shipping_revenue REAL,
        main_category_rank_raw TEXT,
        sub_category_rank_raw TEXT,
        refund_units INTEGER,
        refund_amount REAL,
        refund_rate REAL,
        rating_score REAL,
        review_count INTEGER,
        review_rate REAL,
        settlement_gross_profit REAL,
        order_gross_profit REAL,
        settlement_gross_margin_rate REAL,
        order_gross_margin_rate REAL,
        roi REAL,
        return_units INTEGER,
        return_rate REAL,
        fbm_sellable_units INTEGER,
        fba_sellable_units INTEGER,
        fba_reserved_transfer INTEGER,
        fba_in_transfer INTEGER,
        fba_inbound_receiving INTEGER,
        fba_total_inventory INTEGER,
        fba_reserved_customer_orders INTEGER,
        fba_inbound_shipped INTEGER,
        fba_planned_inbound INTEGER,
        fba_unsellable_units INTEGER,
        total_available_inventory INTEGER,
        fba_days_of_supply REAL,
        fbm_days_of_supply REAL,
        overseas_warehouse_available INTEGER,
        local_warehouse_available INTEGER,
        purchase_order_quantity INTEGER,
        monthly_sell_through_rate REAL,
        stockout_date TEXT,
        sessions_browser INTEGER,
        sessions_browser_percentage REAL,
        sessions_mobile INTEGER,
        sessions_mobile_percentage REAL,
        sessions_total INTEGER,
        sessions_percentage_of_total REAL,
        unit_session_percentage REAL,
        page_views_browser INTEGER,
        page_views_browser_percentage REAL,
        page_views_mobile INTEGER,
        page_views_mobile_percentage REAL,
        page_views_total INTEGER,
        page_views_percentage_of_total REAL,
        conversion_rate REAL,
        units_conversion_rate REAL,
        buybox_win_rate REAL,
        b2b_sessions_browser INTEGER,
        b2b_sessions_browser_percentage REAL,
        b2b_sessions_mobile INTEGER,
        b2b_sessions_mobile_percentage REAL,
        b2b_sessions_total INTEGER,
        b2b_sessions_percentage_of_total REAL,
        b2b_unit_session_percentage REAL,
        b2b_page_views_browser INTEGER,
        b2b_page_views_browser_percentage REAL,
        b2b_page_views_mobile INTEGER,
        b2b_page_views_mobile_percentage REAL,
        b2b_page_views_total INTEGER,
        b2b_page_views_percentage_of_total REAL,
        b2b_conversion_rate REAL,
        b2b_units_conversion_rate REAL,
        b2b_buybox_win_rate REAL,
        ad_spend REAL,
        sp_spend REAL,
        sd_spend REAL,
        sb_spend REAL,
        sbv_spend REAL,
        ad_sales REAL,
        sp_sales REAL,
        sd_sales REAL,
        sb_sales REAL,
        sbv_sales REAL,
        ad_orders INTEGER,
        sp_orders INTEGER,
        sd_orders INTEGER,
        sb_orders INTEGER,
        sbv_orders INTEGER,
        ad_order_percentage REAL,
        direct_sales_amount REAL,
        direct_orders INTEGER,
        impressions INTEGER,
        clicks INTEGER,
        ctr REAL,
        ad_conversion_rate REAL,
        cpc REAL,
        cpm REAL,
        roas REAL,
        acos REAL,
        acoas REAL,
        asoas REAL,
        cpo REAL,
        cpu REAL,
        organic_clicks INTEGER,
        organic_orders INTEGER,
        organic_conversion_rate REAL,
        total_acos REAL,
        organic_sales_amount REAL,
        overall_cvr REAL,
        PRIMARY KEY (date, asin)
      )
    `);
    }
    async upsert(tableName, record, uniqueKeys) {
        return new Promise((resolve, reject) => {
            // 检查记录是否存在
            const whereClause = uniqueKeys.map(key => `${key} = ?`).join(' AND ');
            const whereValues = uniqueKeys.map(key => record[key]);
            this.db.get(`SELECT 1 FROM ${tableName} WHERE ${whereClause}`, whereValues, (err, existing) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (existing) {
                    // 更新现有记录
                    const updateFields = Object.keys(record).filter(key => !uniqueKeys.includes(key));
                    const updateClause = updateFields.map(field => `${field} = ?`).join(', ');
                    const updateValues = updateFields.map(field => record[field]);
                    this.db.run(`UPDATE ${tableName} SET ${updateClause} WHERE ${whereClause}`, [...updateValues, ...whereValues], (err) => {
                        if (err)
                            reject(err);
                        else
                            resolve({ inserted: false });
                    });
                }
                else {
                    // 插入新记录
                    const fields = Object.keys(record);
                    const placeholders = fields.map(() => '?').join(', ');
                    const values = fields.map(field => record[field]);
                    this.db.run(`INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`, values, (err) => {
                        if (err)
                            reject(err);
                        else
                            resolve({ inserted: true });
                    });
                }
            });
        });
    }
    async query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows || []);
            });
        });
    }
    async queryOne(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    }
    close() {
        this.db.close();
    }
}
//# sourceMappingURL=database.js.map