import React from 'react';
import { Plus, Search, Edit, Trash2, MoreVertical } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockProducts } from '@/data/mockData';
import { cn } from '@/lib/utils';

const AdminProducts = () => {
  const { language, t, direction } = useLanguage();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('admin.products')}</h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إدارة منتجات المتجر' : 'Manage store products'}
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {language === 'ar' ? 'إضافة منتج' : 'Add Product'}
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className={cn(
            'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
            direction === 'rtl' ? 'right-3' : 'left-3'
          )} />
          <Input
            type="search"
            placeholder={t('products.search')}
            className={cn('bg-muted/50', direction === 'rtl' ? 'pr-10' : 'pl-10')}
          />
        </div>

        {/* Products Table */}
        <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'المنتج' : 'Product'}
                  </th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'الفئة' : 'Category'}
                  </th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'السعر' : 'Price'}
                  </th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="text-start px-6 py-3 text-sm font-medium text-muted-foreground">
                    {language === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockProducts.map((product) => {
                  const name = language === 'ar' ? product.nameAr : product.name;
                  const category = language === 'ar' ? product.categoryAr : product.category;
                  
                  return (
                    <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-foreground">{name}</p>
                            <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{category}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {product.price} {t('common.currency')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={product.inStock ? 'default' : 'destructive'}>
                          {product.inStock 
                            ? (language === 'ar' ? 'متوفر' : 'In Stock')
                            : (language === 'ar' ? 'نفذ' : 'Out of Stock')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
