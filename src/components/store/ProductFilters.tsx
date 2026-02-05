import React from 'react';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Category } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

export interface ProductFilters {
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  requiresPrescription?: boolean;
  categoryId?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'name';
}

interface ProductFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  categories?: Category[];
  maxPriceLimit?: number;
}

export const ProductFiltersSheet: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  maxPriceLimit = 1000,
}) => {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = {
    filters: language === 'ar' ? 'الفلاتر' : 'Filters',
    priceRange: language === 'ar' ? 'نطاق السعر' : 'Price Range',
    min: language === 'ar' ? 'الحد الأدنى' : 'Min',
    max: language === 'ar' ? 'الحد الأقصى' : 'Max',
    inStockOnly: language === 'ar' ? 'متوفر فقط' : 'In Stock Only',
    prescriptionOnly: language === 'ar' ? 'يحتاج وصفة طبية' : 'Prescription Required',
    category: language === 'ar' ? 'الفئة' : 'Category',
    allCategories: language === 'ar' ? 'جميع الفئات' : 'All Categories',
    sortBy: language === 'ar' ? 'ترتيب حسب' : 'Sort By',
    newest: language === 'ar' ? 'الأحدث' : 'Newest',
    priceLowHigh: language === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High',
    priceHighLow: language === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low',
    rating: language === 'ar' ? 'التقييم' : 'Rating',
    name: language === 'ar' ? 'الاسم' : 'Name',
    clearAll: language === 'ar' ? 'مسح الكل' : 'Clear All',
    apply: language === 'ar' ? 'تطبيق' : 'Apply',
  };

  const [localFilters, setLocalFilters] = React.useState<ProductFilters>(filters);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || maxPriceLimit,
  ]);

  React.useEffect(() => {
    setLocalFilters(filters);
    setPriceRange([filters.minPrice || 0, filters.maxPrice || maxPriceLimit]);
  }, [filters, maxPriceLimit]);

  const activeFilterCount = [
    filters.minPrice !== undefined && filters.minPrice > 0,
    filters.maxPrice !== undefined && filters.maxPrice < maxPriceLimit,
    filters.inStockOnly,
    filters.requiresPrescription,
    filters.categoryId,
    filters.sortBy && filters.sortBy !== 'newest',
  ].filter(Boolean).length;

  const handleClearAll = () => {
    const clearedFilters: ProductFilters = {};
    setLocalFilters(clearedFilters);
    setPriceRange([0, maxPriceLimit]);
    onFiltersChange(clearedFilters);
  };

  const handleApply = () => {
    const newFilters: ProductFilters = {
      ...localFilters,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < maxPriceLimit ? priceRange[1] : undefined,
    };
    onFiltersChange(newFilters);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          {t.filters}
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side={isRTL ? 'left' : 'right'} className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t.filters}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Sort By */}
          <div className="space-y-2">
            <Label>{t.sortBy}</Label>
            <Select
              value={localFilters.sortBy || 'newest'}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, sortBy: value as ProductFilters['sortBy'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t.newest}</SelectItem>
                <SelectItem value="price_asc">{t.priceLowHigh}</SelectItem>
                <SelectItem value="price_desc">{t.priceHighLow}</SelectItem>
                <SelectItem value="rating">{t.rating}</SelectItem>
                <SelectItem value="name">{t.name}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>{t.category}</Label>
            <Select
              value={localFilters.categoryId || 'all'}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, categoryId: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCategories}</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {language === 'ar' ? cat.name_ar : cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <Label>{t.priceRange}</Label>
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              max={maxPriceLimit}
              step={10}
              className="py-4"
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">{t.min}</Label>
                <Input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([Number(e.target.value), priceRange[1]])
                  }
                  min={0}
                  max={priceRange[1]}
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">{t.max}</Label>
                <Input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
                  min={priceRange[0]}
                  max={maxPriceLimit}
                />
              </div>
            </div>
          </div>

          {/* Stock Filter */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="inStockOnly"
              checked={localFilters.inStockOnly || false}
              onCheckedChange={(checked) =>
                setLocalFilters({ ...localFilters, inStockOnly: checked as boolean })
              }
            />
            <Label htmlFor="inStockOnly" className="cursor-pointer">
              {t.inStockOnly}
            </Label>
          </div>

          {/* Prescription Filter */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="prescriptionOnly"
              checked={localFilters.requiresPrescription || false}
              onCheckedChange={(checked) =>
                setLocalFilters({ ...localFilters, requiresPrescription: checked as boolean })
              }
            />
            <Label htmlFor="prescriptionOnly" className="cursor-pointer">
              {t.prescriptionOnly}
            </Label>
          </div>
        </div>

        <SheetFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClearAll} className="flex-1">
            {t.clearAll}
          </Button>
          <Button onClick={handleApply} className="flex-1">
            {t.apply}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// Inline sort select for quick access
export const ProductSortSelect: React.FC<{
  value?: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const { language } = useLanguage();

  const t = {
    sortBy: language === 'ar' ? 'ترتيب حسب' : 'Sort By',
    newest: language === 'ar' ? 'الأحدث' : 'Newest',
    priceLowHigh: language === 'ar' ? 'السعر: الأقل' : 'Price: Low',
    priceHighLow: language === 'ar' ? 'السعر: الأعلى' : 'Price: High',
    rating: language === 'ar' ? 'التقييم' : 'Rating',
    name: language === 'ar' ? 'الاسم' : 'Name',
  };

  return (
    <Select value={value || 'newest'} onValueChange={onChange}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder={t.sortBy} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">{t.newest}</SelectItem>
        <SelectItem value="price_asc">{t.priceLowHigh}</SelectItem>
        <SelectItem value="price_desc">{t.priceHighLow}</SelectItem>
        <SelectItem value="rating">{t.rating}</SelectItem>
        <SelectItem value="name">{t.name}</SelectItem>
      </SelectContent>
    </Select>
  );
};
