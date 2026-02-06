import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoyaltyProgramTab } from '@/components/admin/discounts/LoyaltyProgramTab';
import { DiscountCodesTab } from '@/components/admin/discounts/DiscountCodesTab';
import { ProductOffersTab } from '@/components/admin/discounts/ProductOffersTab';
import { Gift, Tag, Percent, Users, Star, Megaphone } from 'lucide-react';

const AdminDiscounts = () => {
  const { language } = useLanguage();

  const tabs = [
    {
      value: 'loyalty',
      label: language === 'ar' ? 'برنامج الولاء' : 'Loyalty',
      icon: Gift,
    },
    {
      value: 'group-offers',
      label: language === 'ar' ? 'عروض المجموعات' : 'Group Offers',
      icon: Users,
    },
    {
      value: 'product-discounts',
      label: language === 'ar' ? 'خصومات المنتجات' : 'Product Discounts',
      icon: Percent,
    },
    {
      value: 'bogo',
      label: language === 'ar' ? 'عروض 1+1' : '1+1 Offers',
      icon: Star,
    },
    {
      value: 'discount-codes',
      label: language === 'ar' ? 'أكواد الخصم' : 'Discount Codes',
      icon: Tag,
    },
    {
      value: 'influencer-codes',
      label: language === 'ar' ? 'أكواد المؤثرين' : 'Influencer Codes',
      icon: Megaphone,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ar' ? 'الخصومات والعروض' : 'Discounts & Offers'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar'
              ? 'إدارة برامج الخصم والعروض الترويجية'
              : 'Manage discount programs and promotional offers'}
          </p>
        </div>

        <Tabs defaultValue="loyalty" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-2 data-[state=active]:bg-background"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="loyalty">
            <LoyaltyProgramTab />
          </TabsContent>

          <TabsContent value="group-offers">
            <ProductOffersTab offerType="group" />
          </TabsContent>

          <TabsContent value="product-discounts">
            <ProductOffersTab offerType="discount" />
          </TabsContent>

          <TabsContent value="bogo">
            <ProductOffersTab offerType="buy_one_get_one" />
          </TabsContent>

          <TabsContent value="discount-codes">
            <DiscountCodesTab isInfluencer={false} />
          </TabsContent>

          <TabsContent value="influencer-codes">
            <DiscountCodesTab isInfluencer={true} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDiscounts;
