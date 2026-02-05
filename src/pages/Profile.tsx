 import React, { useEffect } from 'react';
 import { Navigate } from 'react-router-dom';
 import { User, MapPin, Phone, Loader2, Save } from 'lucide-react';
 import { z } from 'zod';
 import { useForm } from 'react-hook-form';
 import { zodResolver } from '@hookform/resolvers/zod';
 
 import { MainLayout } from '@/components/layout/MainLayout';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Skeleton } from '@/components/ui/skeleton';
 import { Separator } from '@/components/ui/separator';
 import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
 } from '@/components/ui/form';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { useAuth } from '@/contexts/AuthContext';
 import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
 
 const profileSchema = z.object({
   fullName: z.string().min(2, 'Name must be at least 2 characters').optional().or(z.literal('')),
   fullNameAr: z.string().optional().or(z.literal('')),
   phone: z.string().optional().or(z.literal('')),
   street: z.string().optional().or(z.literal('')),
   city: z.string().optional().or(z.literal('')),
   country: z.string().optional().or(z.literal('')),
   postalCode: z.string().optional().or(z.literal('')),
 });
 
 type ProfileFormData = z.infer<typeof profileSchema>;
 
 const Profile = () => {
   const { language, t } = useLanguage();
   const { user, isLoading: authLoading } = useAuth();
   const { data: profile, isLoading: profileLoading } = useProfile();
   const updateProfile = useUpdateProfile();
 
   const form = useForm<ProfileFormData>({
     resolver: zodResolver(profileSchema),
     defaultValues: {
       fullName: '',
       fullNameAr: '',
       phone: '',
       street: '',
       city: '',
       country: 'Saudi Arabia',
       postalCode: '',
     },
   });
 
   // Populate form when profile loads
   useEffect(() => {
     if (profile) {
       const address = profile.default_shipping_address as {
         street?: string;
         city?: string;
         country?: string;
         postalCode?: string;
       } | null;
 
       form.reset({
         fullName: profile.full_name || '',
         fullNameAr: profile.full_name_ar || '',
         phone: profile.phone || '',
         street: address?.street || '',
         city: address?.city || '',
         country: address?.country || 'Saudi Arabia',
         postalCode: address?.postalCode || '',
       });
     }
   }, [profile, form]);
 
   const onSubmit = async (data: ProfileFormData) => {
     const hasAddress = data.street || data.city || data.postalCode;
     
     await updateProfile.mutateAsync({
       full_name: data.fullName || null,
       full_name_ar: data.fullNameAr || null,
       phone: data.phone || null,
       default_shipping_address: hasAddress
         ? {
             street: data.street || '',
             city: data.city || '',
             country: data.country || 'Saudi Arabia',
             postalCode: data.postalCode || '',
           }
         : null,
     });
   };
 
   // Redirect if not logged in
   if (!authLoading && !user) {
     return <Navigate to="/auth" replace />;
   }
 
   const isLoading = authLoading || profileLoading;
 
   return (
     <MainLayout>
       <div className="container py-8 md:py-12 max-w-2xl">
         <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
           {language === 'ar' ? 'الملف الشخصي' : 'My Profile'}
         </h1>
         <p className="text-muted-foreground mb-8">
           {language === 'ar'
             ? 'إدارة معلوماتك الشخصية وعنوان الشحن الافتراضي'
             : 'Manage your personal information and default shipping address'}
         </p>
 
         {isLoading ? (
           <div className="space-y-6">
             <Skeleton className="h-48 w-full rounded-xl" />
             <Skeleton className="h-64 w-full rounded-xl" />
           </div>
         ) : (
           <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
               {/* Personal Information */}
               <div className="bg-card rounded-xl border border-border/50 p-6 shadow-soft space-y-4">
                 <div className="flex items-center gap-2 mb-4">
                   <User className="h-5 w-5 text-primary" />
                   <h2 className="text-xl font-semibold text-foreground">
                     {language === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
                   </h2>
                 </div>
 
                 <div className="grid sm:grid-cols-2 gap-4">
                   <FormField
                     control={form.control}
                     name="fullName"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>
                           {language === 'ar' ? 'الاسم الكامل (إنجليزي)' : 'Full Name (English)'}
                         </FormLabel>
                         <FormControl>
                           <Input placeholder="John Doe" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={form.control}
                     name="fullNameAr"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>
                           {language === 'ar' ? 'الاسم الكامل (عربي)' : 'Full Name (Arabic)'}
                         </FormLabel>
                         <FormControl>
                           <Input placeholder="أحمد محمد" dir="rtl" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                 </div>
 
                 <FormField
                   control={form.control}
                   name="phone"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel className="flex items-center gap-2">
                         <Phone className="h-4 w-4" />
                         {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                       </FormLabel>
                       <FormControl>
                         <Input placeholder="+966 5XX XXX XXXX" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
 
                 <div className="pt-2">
                   <p className="text-sm text-muted-foreground">
                     {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}:{' '}
                     <span className="font-medium text-foreground">{user?.email}</span>
                   </p>
                 </div>
               </div>
 
               {/* Default Shipping Address */}
               <div className="bg-card rounded-xl border border-border/50 p-6 shadow-soft space-y-4">
                 <div className="flex items-center gap-2 mb-4">
                   <MapPin className="h-5 w-5 text-primary" />
                   <h2 className="text-xl font-semibold text-foreground">
                     {language === 'ar' ? 'عنوان الشحن الافتراضي' : 'Default Shipping Address'}
                   </h2>
                 </div>
                 <p className="text-sm text-muted-foreground -mt-2 mb-4">
                   {language === 'ar'
                     ? 'سيتم استخدام هذا العنوان تلقائياً عند الدفع'
                     : 'This address will be pre-filled at checkout'}
                 </p>
 
                 <FormField
                   control={form.control}
                   name="street"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>{language === 'ar' ? 'العنوان' : 'Street Address'}</FormLabel>
                       <FormControl>
                         <Input
                           placeholder={
                             language === 'ar'
                               ? 'شارع الملك فهد، مبنى 123'
                               : '123 Main Street, Building A'
                           }
                           {...field}
                         />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
 
                 <div className="grid sm:grid-cols-2 gap-4">
                   <FormField
                     control={form.control}
                     name="city"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>{language === 'ar' ? 'المدينة' : 'City'}</FormLabel>
                         <FormControl>
                           <Input placeholder={language === 'ar' ? 'الرياض' : 'Riyadh'} {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={form.control}
                     name="postalCode"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>{language === 'ar' ? 'الرمز البريدي' : 'Postal Code'}</FormLabel>
                         <FormControl>
                           <Input placeholder="12345" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                 </div>
 
                 <FormField
                   control={form.control}
                   name="country"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>{language === 'ar' ? 'الدولة' : 'Country'}</FormLabel>
                       <FormControl>
                         <Input {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
               </div>
 
               {/* Submit Button */}
               <Button
                 type="submit"
                 className="w-full gap-2 shadow-glow"
                 size="lg"
                 disabled={updateProfile.isPending}
               >
                 {updateProfile.isPending ? (
                   <>
                     <Loader2 className="h-4 w-4 animate-spin" />
                     {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                   </>
                 ) : (
                   <>
                     <Save className="h-4 w-4" />
                     {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                   </>
                 )}
               </Button>
             </form>
           </Form>
         )}
       </div>
     </MainLayout>
   );
 };
 
 export default Profile;