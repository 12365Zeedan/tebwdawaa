import React, { useState } from 'react';
import { Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useProductOffers,
  useCreateProductOffer,
  useUpdateProductOffer,
  useDeleteProductOffer,
  ProductOffer,
} from '@/hooks/useDiscounts';
import { ProductOfferFormDialog } from './ProductOfferFormDialog';

interface ProductOffersTabProps {
  offerType: 'discount' | 'buy_one_get_one' | 'group';
}

const offerTypeLabels = {
  discount: { en: 'Product Discounts', ar: 'خصومات المنتجات' },
  buy_one_get_one: { en: '1+1 Offers', ar: 'عروض 1+1' },
  group: { en: 'Group Offers', ar: 'عروض المجموعات' },
};

export function ProductOffersTab({ offerType }: ProductOffersTabProps) {
  const { language } = useLanguage();
  const { data: offers, isLoading } = useProductOffers();
  const createOffer = useCreateProductOffer();
  const updateOffer = useUpdateProductOffer();
  const deleteOffer = useDeleteProductOffer();
  const [editingOffer, setEditingOffer] = useState<ProductOffer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredOffers = offers?.filter((o) => o.offer_type === offerType) ?? [];
  const labels = offerTypeLabels[offerType];

  if (isLoading) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {language === 'ar' ? labels.ar : labels.en}
        </h3>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => {
            setEditingOffer(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {language === 'ar' ? 'إضافة عرض' : 'Add Offer'}
        </Button>
      </div>

      {filteredOffers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {language === 'ar' ? 'لا توجد عروض بعد' : 'No offers yet'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOffers.map((offer) => {
            const isExpired = offer.expires_at && new Date(offer.expires_at) < new Date();
            return (
              <Card key={offer.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">
                          {language === 'ar' ? offer.name_ar : offer.name}
                        </span>
                        {offerType === 'discount' && (
                          <Badge variant="secondary">{offer.discount_percentage}% OFF</Badge>
                        )}
                        {offerType === 'buy_one_get_one' && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            {language === 'ar' ? '1+1 مجاني' : 'Buy 1 Get 1'}
                          </Badge>
                        )}
                        {offerType === 'group' && offer.group_price && (
                          <Badge variant="secondary">
                            {offer.min_quantity}x = {offer.group_price} SAR
                          </Badge>
                        )}
                        {isExpired && <Badge variant="destructive">{language === 'ar' ? 'منتهي' : 'Expired'}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? offer.description_ar || offer.description : offer.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          {language === 'ar' ? 'المنتجات' : 'Products'}: {offer.product_ids.length}
                        </span>
                        {offer.expires_at && (
                          <span>
                            {language === 'ar' ? 'ينتهي' : 'Expires'}: {new Date(offer.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={offer.is_active}
                        onCheckedChange={(checked) => updateOffer.mutate({ id: offer.id, is_active: checked })}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingOffer(offer);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteOffer.mutate(offer.id)}
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

      <ProductOfferFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingOffer={editingOffer}
        offerType={offerType}
        onCreate={(data) => {
          createOffer.mutate(data);
          setIsDialogOpen(false);
        }}
        onUpdate={(data) => {
          updateOffer.mutate(data);
          setIsDialogOpen(false);
        }}
        isPending={createOffer.isPending || updateOffer.isPending}
      />
    </div>
  );
}
