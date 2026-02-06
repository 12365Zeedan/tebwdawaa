import React, { useState } from 'react';
import { Plus, Trash2, Edit, Loader2, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useDiscountCodes,
  useCreateDiscountCode,
  useUpdateDiscountCode,
  useDeleteDiscountCode,
  DiscountCode,
} from '@/hooks/useDiscounts';
import { DiscountCodeFormDialog } from './DiscountCodeFormDialog';

interface DiscountCodesTabProps {
  isInfluencer?: boolean;
}

export function DiscountCodesTab({ isInfluencer = false }: DiscountCodesTabProps) {
  const { language } = useLanguage();
  const { data: codes, isLoading } = useDiscountCodes();
  const createCode = useCreateDiscountCode();
  const updateCode = useUpdateDiscountCode();
  const deleteCode = useDeleteDiscountCode();
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCodes = codes?.filter((c) => c.is_influencer === isInfluencer) ?? [];

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const title = isInfluencer
    ? language === 'ar' ? 'أكواد المؤثرين' : 'Influencer Codes'
    : language === 'ar' ? 'أكواد الخصم' : 'Discount Codes';

  if (isLoading) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => {
            setEditingCode(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {language === 'ar' ? 'إضافة كود' : 'Add Code'}
        </Button>
      </div>

      {filteredCodes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {language === 'ar' ? 'لا توجد أكواد بعد' : 'No codes yet'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredCodes.map((code) => {
            const isExpired = code.expires_at && new Date(code.expires_at) < new Date();
            const isLimitReached = code.usage_limit !== null && code.usage_count >= code.usage_limit;

            return (
              <Card key={code.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="px-2 py-1 bg-muted rounded font-mono text-sm font-bold">
                          {code.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleCopy(code.code, code.id)}
                        >
                          {copiedId === code.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        {code.discount_type === 'percentage' ? (
                          <Badge variant="secondary">{code.discount_value}%</Badge>
                        ) : (
                          <Badge variant="secondary">{code.discount_value} SAR</Badge>
                        )}
                        {isExpired && <Badge variant="destructive">{language === 'ar' ? 'منتهي' : 'Expired'}</Badge>}
                        {isLimitReached && <Badge variant="outline">{language === 'ar' ? 'مستنفد' : 'Exhausted'}</Badge>}
                        {isInfluencer && code.influencer_name && (
                          <Badge variant="outline">
                            {language === 'ar' ? code.influencer_name_ar || code.influencer_name : code.influencer_name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? code.description_ar || code.description : code.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {language === 'ar' ? 'الاستخدام' : 'Used'}: {code.usage_count}
                          {code.usage_limit ? `/${code.usage_limit}` : ''}
                        </span>
                        {code.min_order_amount > 0 && (
                          <span>
                            {language === 'ar' ? 'الحد الأدنى' : 'Min'}: {code.min_order_amount} SAR
                          </span>
                        )}
                        {code.expires_at && (
                          <span>
                            {language === 'ar' ? 'ينتهي' : 'Expires'}: {new Date(code.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={code.is_active}
                        onCheckedChange={(checked) => updateCode.mutate({ id: code.id, is_active: checked })}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingCode(code);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteCode.mutate(code.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <DiscountCodeFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingCode={editingCode}
        isInfluencer={isInfluencer}
        onCreate={(data) => {
          createCode.mutate(data);
          setIsDialogOpen(false);
        }}
        onUpdate={(data) => {
          updateCode.mutate(data);
          setIsDialogOpen(false);
        }}
        isPending={createCode.isPending || updateCode.isPending}
      />
    </div>
  );
}
