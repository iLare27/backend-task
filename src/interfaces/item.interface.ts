export interface Item {
    market_hash_name: string;
    currency: string;
    suggested_price: number;
    item_page: string;
    market_page: string;
    min_price: number | null;
    max_price: number | null;
    mean_price: number | null;
    quantity: number;
    created_at: number;
    updated_at: number;
    min_tradable_price?: number | null;
    min_non_tradable_price?: number | null;
}
