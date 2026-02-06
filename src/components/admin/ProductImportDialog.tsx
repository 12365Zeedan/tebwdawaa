import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface ImportRow {
  name: string;
  name_ar: string;
  slug?: string;
  description?: string;
  description_ar?: string;
  price: number;
  original_price?: number | null;
  stock_quantity?: number;
  in_stock?: boolean;
  requires_prescription?: boolean;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  is_best_seller?: boolean;
  is_active?: boolean;
  image_url?: string;
  barcode?: string;
  category_slug?: string;
}

interface ValidationResult {
  row: number;
  data: ImportRow;
  errors: string[];
  isValid: boolean;
}

const REQUIRED_COLUMNS = ['name', 'name_ar', 'price'];

const TEMPLATE_COLUMNS = [
  'name', 'name_ar', 'slug', 'description', 'description_ar',
  'price', 'original_price', 'stock_quantity', 'in_stock',
  'requires_prescription', 'is_featured', 'is_new_arrival',
  'is_best_seller', 'is_active', 'image_url', 'barcode', 'category_slug',
];

interface ProductImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductImportDialog({ open, onOpenChange }: ProductImportDialogProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedRows, setParsedRows] = useState<ValidationResult[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const parseBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      return ['true', 'yes', '1', 'نعم'].includes(lower);
    }
    return false;
  };

  const validateRow = (row: any, index: number): ValidationResult => {
    const errors: string[] = [];

    if (!row.name || String(row.name).trim() === '') {
      errors.push('Name is required');
    }
    if (!row.name_ar || String(row.name_ar).trim() === '') {
      errors.push('Arabic name is required');
    }

    const price = Number(row.price);
    if (isNaN(price) || price < 0) {
      errors.push('Price must be a valid positive number');
    }

    const originalPrice = row.original_price != null && row.original_price !== '' 
      ? Number(row.original_price) 
      : null;
    if (originalPrice !== null && (isNaN(originalPrice) || originalPrice < 0)) {
      errors.push('Original price must be a valid positive number');
    }

    const stockQty = row.stock_quantity != null && row.stock_quantity !== '' 
      ? Number(row.stock_quantity) 
      : 0;
    if (isNaN(stockQty) || stockQty < 0) {
      errors.push('Stock quantity must be a valid non-negative number');
    }

    const data: ImportRow = {
      name: String(row.name || '').trim(),
      name_ar: String(row.name_ar || '').trim(),
      slug: row.slug ? String(row.slug).trim() : generateSlug(String(row.name || '')),
      description: row.description ? String(row.description).trim() : undefined,
      description_ar: row.description_ar ? String(row.description_ar).trim() : undefined,
      price: isNaN(price) ? 0 : price,
      original_price: originalPrice,
      stock_quantity: isNaN(stockQty) ? 0 : stockQty,
      in_stock: row.in_stock != null ? parseBoolean(row.in_stock) : true,
      requires_prescription: parseBoolean(row.requires_prescription),
      is_featured: parseBoolean(row.is_featured),
      is_new_arrival: parseBoolean(row.is_new_arrival),
      is_best_seller: parseBoolean(row.is_best_seller),
      is_active: row.is_active != null ? parseBoolean(row.is_active) : true,
      image_url: row.image_url ? String(row.image_url).trim() : undefined,
      barcode: row.barcode ? String(row.barcode).trim() : undefined,
      category_slug: row.category_slug ? String(row.category_slug).trim() : undefined,
    };

    return { row: index + 2, data, errors, isValid: errors.length === 0 };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast({
            title: language === 'ar' ? 'ملف فارغ' : 'Empty File',
            description: language === 'ar' ? 'الملف لا يحتوي على بيانات' : 'The file contains no data rows',
            variant: 'destructive',
          });
          return;
        }

        const validated = jsonData.map((row, i) => validateRow(row, i));
        setParsedRows(validated);
        setStep('preview');
      } catch {
        toast({
          title: language === 'ar' ? 'خطأ في قراءة الملف' : 'File Read Error',
          description: language === 'ar' ? 'تعذر قراءة الملف. تأكد من أنه ملف Excel صالح' : 'Could not read the file. Make sure it is a valid Excel file.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        name: 'Vitamin C 1000mg',
        name_ar: 'فيتامين سي 1000 مجم',
        slug: 'vitamin-c-1000mg',
        description: 'High potency Vitamin C supplement',
        description_ar: 'مكمل فيتامين سي عالي الفعالية',
        price: 29.99,
        original_price: 39.99,
        stock_quantity: 100,
        in_stock: true,
        requires_prescription: false,
        is_featured: true,
        is_new_arrival: false,
        is_best_seller: true,
        is_active: true,
        image_url: '',
        barcode: '1234567890123',
        category_slug: 'vitamins',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData, { header: TEMPLATE_COLUMNS });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');

    // Set column widths
    ws['!cols'] = TEMPLATE_COLUMNS.map((col) => ({
      wch: Math.max(col.length + 4, 15),
    }));

    XLSX.writeFile(wb, 'products_import_template.xlsx');
  };

  const handleImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setIsImporting(true);

    // Resolve category slugs to IDs
    const categorySlugs = [...new Set(validRows.map(r => r.data.category_slug).filter(Boolean))];
    let categoryMap: Record<string, string> = {};

    if (categorySlugs.length > 0) {
      const { data: cats } = await supabase
        .from('categories')
        .select('id, slug')
        .in('slug', categorySlugs);
      
      if (cats) {
        categoryMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));
      }
    }

    const productsToInsert = validRows.map(({ data }) => ({
      name: data.name,
      name_ar: data.name_ar,
      slug: data.slug || generateSlug(data.name),
      description: data.description || null,
      description_ar: data.description_ar || null,
      price: data.price,
      original_price: data.original_price || null,
      stock_quantity: data.stock_quantity ?? 0,
      in_stock: data.in_stock ?? true,
      requires_prescription: data.requires_prescription ?? false,
      is_featured: data.is_featured ?? false,
      is_new_arrival: data.is_new_arrival ?? false,
      is_best_seller: data.is_best_seller ?? false,
      is_active: data.is_active ?? true,
      image_url: data.image_url || null,
      barcode: data.barcode || null,
      category_id: data.category_slug ? categoryMap[data.category_slug] || null : null,
    }));

    // Insert in batches of 50
    let success = 0;
    let failed = 0;
    const batchSize = 50;

    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('products')
        .insert(batch)
        .select('id');

      if (error) {
        failed += batch.length;
        console.error('Batch insert error:', error);
      } else {
        success += data?.length || 0;
      }
    }

    setIsImporting(false);
    setImportResult({ success, failed });
    setStep('done');

    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });

    toast({
      title: language === 'ar' ? 'اكتمل الاستيراد' : 'Import Complete',
      description: language === 'ar'
        ? `تم استيراد ${success} منتج بنجاح${failed > 0 ? `، فشل ${failed}` : ''}`
        : `Successfully imported ${success} products${failed > 0 ? `, ${failed} failed` : ''}`,
    });
  };

  const handleReset = () => {
    setParsedRows([]);
    setImportResult(null);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {language === 'ar' ? 'استيراد المنتجات من Excel' : 'Import Products from Excel'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ar'
              ? 'قم برفع ملف Excel يحتوي على بيانات المنتجات لاستيرادها دفعة واحدة'
              : 'Upload an Excel file containing product data to import them in bulk'}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6 py-4">
            {/* Download Template */}
            <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-border rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground text-center">
                {language === 'ar'
                  ? 'قم بتنزيل القالب أولاً لمعرفة التنسيق المطلوب'
                  : 'Download the template first to see the required format'}
              </p>
              <Button variant="outline" onClick={handleDownloadTemplate} className="gap-2">
                <Download className="h-4 w-4" />
                {language === 'ar' ? 'تنزيل القالب' : 'Download Template'}
              </Button>
            </div>

            {/* Upload File */}
            <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5">
              <Upload className="h-10 w-10 text-primary/60" />
              <p className="text-sm text-muted-foreground text-center">
                {language === 'ar'
                  ? 'قم برفع ملف Excel (.xlsx أو .xls) يحتوي على بيانات المنتجات'
                  : 'Upload an Excel file (.xlsx or .xls) containing your product data'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                <Upload className="h-4 w-4" />
                {language === 'ar' ? 'اختيار ملف' : 'Choose File'}
              </Button>
            </div>

            {/* Column Info */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">
                {language === 'ar' ? 'الأعمدة المطلوبة:' : 'Required columns:'}
              </p>
              <p>
                <span className="font-mono bg-muted px-1 rounded">name</span>,{' '}
                <span className="font-mono bg-muted px-1 rounded">name_ar</span>,{' '}
                <span className="font-mono bg-muted px-1 rounded">price</span>
              </p>
              <p className="font-medium mt-2">
                {language === 'ar' ? 'الأعمدة الاختيارية:' : 'Optional columns:'}
              </p>
              <p className="text-muted-foreground">
                slug, description, description_ar, original_price, stock_quantity, in_stock, requires_prescription, is_featured, is_new_arrival, is_best_seller, is_active, image_url, barcode, category_slug
              </p>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* Summary */}
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                {language === 'ar' ? `إجمالي: ${parsedRows.length}` : `Total: ${parsedRows.length}`}
              </Badge>
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {language === 'ar' ? `صالح: ${validCount}` : `Valid: ${validCount}`}
              </Badge>
              {invalidCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {language === 'ar' ? `غير صالح: ${invalidCount}` : `Invalid: ${invalidCount}`}
                </Badge>
              )}
            </div>

            {/* Preview Table */}
            <ScrollArea className="flex-1 max-h-[400px] border rounded-lg">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="text-start px-3 py-2 font-medium text-muted-foreground">
                      {language === 'ar' ? 'صف' : 'Row'}
                    </th>
                    <th className="text-start px-3 py-2 font-medium text-muted-foreground">
                      {language === 'ar' ? 'الحالة' : 'Status'}
                    </th>
                    <th className="text-start px-3 py-2 font-medium text-muted-foreground">
                      {language === 'ar' ? 'الاسم' : 'Name'}
                    </th>
                    <th className="text-start px-3 py-2 font-medium text-muted-foreground">
                      {language === 'ar' ? 'الاسم (عربي)' : 'Name (AR)'}
                    </th>
                    <th className="text-start px-3 py-2 font-medium text-muted-foreground">
                      {language === 'ar' ? 'السعر' : 'Price'}
                    </th>
                    <th className="text-start px-3 py-2 font-medium text-muted-foreground">
                      {language === 'ar' ? 'الكمية' : 'Stock'}
                    </th>
                    <th className="text-start px-3 py-2 font-medium text-muted-foreground">
                      {language === 'ar' ? 'ملاحظات' : 'Notes'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((result) => (
                    <tr
                      key={result.row}
                      className={`border-t ${!result.isValid ? 'bg-destructive/5' : ''}`}
                    >
                      <td className="px-3 py-2">{result.row}</td>
                      <td className="px-3 py-2">
                        {result.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </td>
                      <td className="px-3 py-2 max-w-[150px] truncate">{result.data.name}</td>
                      <td className="px-3 py-2 max-w-[150px] truncate" dir="rtl">{result.data.name_ar}</td>
                      <td className="px-3 py-2">{result.data.price}</td>
                      <td className="px-3 py-2">{result.data.stock_quantity ?? 0}</td>
                      <td className="px-3 py-2 text-xs text-destructive">
                        {result.errors.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        )}

        {step === 'done' && importResult && (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">
                {language === 'ar' ? 'اكتمل الاستيراد!' : 'Import Complete!'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'ar'
                  ? `تم استيراد ${importResult.success} منتج بنجاح`
                  : `Successfully imported ${importResult.success} products`}
              </p>
              {importResult.failed > 0 && (
                <p className="text-destructive text-sm">
                  {language === 'ar'
                    ? `فشل استيراد ${importResult.failed} منتج`
                    : `${importResult.failed} products failed to import`}
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={handleReset}>
                {language === 'ar' ? 'رجوع' : 'Back'}
              </Button>
              <Button
                onClick={handleImport}
                disabled={validCount === 0 || isImporting}
                className="gap-2"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {language === 'ar' ? 'جاري الاستيراد...' : 'Importing...'}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    {language === 'ar'
                      ? `استيراد ${validCount} منتج`
                      : `Import ${validCount} Products`}
                  </>
                )}
              </Button>
            </>
          )}
          {step === 'done' && (
            <Button onClick={handleClose}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
