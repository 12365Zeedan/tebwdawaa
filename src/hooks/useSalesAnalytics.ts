import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, startOfWeek, startOfMonth, startOfQuarter, startOfYear } from 'date-fns';

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type SortDirection = 'asc' | 'desc';

function getStartDate(period: TimePeriod): string {
  const now = new Date();
  switch (period) {
    case 'daily':
      return startOfDay(now).toISOString();
    case 'weekly':
      return startOfWeek(now, { weekStartsOn: 0 }).toISOString();
    case 'monthly':
      return startOfMonth(now).toISOString();
    case 'quarterly':
      return startOfQuarter(now).toISOString();
    case 'yearly':
      return startOfYear(now).toISOString();
  }
}

export interface TotalSalesData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
}

export function useTotalSales(period: TimePeriod) {
  return useQuery({
    queryKey: ['sales-total', period],
    queryFn: async (): Promise<TotalSalesData> => {
      const start = getStartDate(period);
      const { data, error } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', start);
      if (error) throw error;

      const orders = data || [];
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
      const totalOrders = orders.length;
      return {
        totalRevenue,
        totalOrders,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      };
    },
  });
}

export interface ProductSalesRow {
  productId: string;
  productName: string;
  productNameAr: string;
  totalQuantity: number;
  totalRevenue: number;
}

export function useProductSales(period: TimePeriod) {
  return useQuery({
    queryKey: ['sales-per-product', period],
    queryFn: async (): Promise<ProductSalesRow[]> => {
      const start = getStartDate(period);

      // Get order IDs within the period
      const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select('id')
        .gte('created_at', start);
      if (ordersErr) throw ordersErr;
      if (!orders || orders.length === 0) return [];

      const orderIds = orders.map((o) => o.id);

      // Get items for those orders
      const { data: items, error: itemsErr } = await supabase
        .from('order_items')
        .select('product_id, product_name, product_name_ar, quantity, total_price')
        .in('order_id', orderIds);
      if (itemsErr) throw itemsErr;

      const productMap = new Map<string, ProductSalesRow>();
      (items || []).forEach((item) => {
        const key = item.product_id || item.product_name;
        const existing = productMap.get(key);
        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.totalRevenue += Number(item.total_price);
        } else {
          productMap.set(key, {
            productId: item.product_id || '',
            productName: item.product_name,
            productNameAr: item.product_name_ar || item.product_name,
            totalQuantity: item.quantity,
            totalRevenue: Number(item.total_price),
          });
        }
      });

      return Array.from(productMap.values());
    },
  });
}

export interface BundlePair {
  productA: string;
  productB: string;
  count: number;
}

export function useFrequentlyBoughtTogether(period: TimePeriod) {
  return useQuery({
    queryKey: ['frequently-bought-together', period],
    queryFn: async (): Promise<BundlePair[]> => {
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
        .select('order_id, product_name')
        .in('order_id', orderIds);
      if (itemsErr) throw itemsErr;

      // Group items by order
      const orderGroups = new Map<string, string[]>();
      (items || []).forEach((item) => {
        const list = orderGroups.get(item.order_id) || [];
        if (!list.includes(item.product_name)) {
          list.push(item.product_name);
        }
        orderGroups.set(item.order_id, list);
      });

      // Count co-occurrences
      const pairMap = new Map<string, number>();
      orderGroups.forEach((products) => {
        if (products.length < 2) return;
        const sorted = [...products].sort();
        for (let i = 0; i < sorted.length; i++) {
          for (let j = i + 1; j < sorted.length; j++) {
            const key = `${sorted[i]}|||${sorted[j]}`;
            pairMap.set(key, (pairMap.get(key) || 0) + 1);
          }
        }
      });

      return Array.from(pairMap.entries())
        .map(([key, count]) => {
          const [productA, productB] = key.split('|||');
          return { productA, productB, count };
        })
        .filter((p) => p.count >= 1);
    },
  });
}
