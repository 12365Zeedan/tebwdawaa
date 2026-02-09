import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getStartDate, type TimePeriod } from '@/hooks/useSalesAnalytics';

export interface CategorySalesRow {
  categoryId: string;
  categoryName: string;
  categoryNameAr: string;
  totalQuantity: number;
  totalRevenue: number;
}

export function useCategorySales(period: TimePeriod) {
  return useQuery({
    queryKey: ['sales-per-category', period],
    queryFn: async (): Promise<CategorySalesRow[]> => {
      const start = getStartDate(period);

      const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select('id')
        .gte('created_at', start);
      if (ordersErr) throw ordersErr;
      if (!orders || orders.length === 0) return [];

      const orderIds = orders.map((o) => o.id);

      const { data: items, error: itemsErr } = await supabase
        .from('order_items')
        .select('product_id, quantity, total_price')
        .in('order_id', orderIds);
      if (itemsErr) throw itemsErr;
      if (!items || items.length === 0) return [];

      // Get unique product IDs
      const productIds = [...new Set(items.filter(i => i.product_id).map(i => i.product_id!))];
      if (productIds.length === 0) return [];

      // Fetch products with their categories
      const { data: products, error: productsErr } = await supabase
        .from('products')
        .select('id, category_id')
        .in('id', productIds);
      if (productsErr) throw productsErr;

      // Get category IDs
      const categoryIds = [...new Set((products || []).filter(p => p.category_id).map(p => p.category_id!))];

      // Fetch categories
      const { data: categories, error: catsErr } = await supabase
        .from('categories')
        .select('id, name, name_ar')
        .in('id', categoryIds.length > 0 ? categoryIds : ['__none__']);
      if (catsErr) throw catsErr;

      const categoryMap = new Map((categories || []).map(c => [c.id, c]));
      const productCategoryMap = new Map((products || []).map(p => [p.id, p.category_id]));

      // Aggregate by category
      const aggMap = new Map<string, CategorySalesRow>();
      for (const item of items) {
        const catId = item.product_id ? productCategoryMap.get(item.product_id) : null;
        const key = catId || '__uncategorized__';
        const cat = catId ? categoryMap.get(catId) : null;

        const existing = aggMap.get(key);
        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.totalRevenue += Number(item.total_price);
        } else {
          aggMap.set(key, {
            categoryId: key,
            categoryName: cat?.name || 'Uncategorized',
            categoryNameAr: cat?.name_ar || 'غير مصنف',
            totalQuantity: item.quantity,
            totalRevenue: Number(item.total_price),
          });
        }
      }

      return Array.from(aggMap.values());
    },
  });
}
