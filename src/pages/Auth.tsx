 import React, { useState, useEffect } from 'react';
 import { useNavigate, useSearchParams } from 'react-router-dom';
 import { MainLayout } from '@/components/layout/MainLayout';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { useAuth } from '@/contexts/AuthContext';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { lovable } from '@/integrations/lovable/index';
import { Separator } from '@/components/ui/separator';
 
 const Auth = () => {
   const { t, language } = useLanguage();
   const { signIn, signUp, user, isLoading: authLoading } = useAuth();
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const { toast } = useToast();
   
   const [isLoading, setIsLoading] = useState(false);
   const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'login');
   
   // Form states
   const [loginEmail, setLoginEmail] = useState('');
   const [loginPassword, setLoginPassword] = useState('');
   const [signupEmail, setSignupEmail] = useState('');
   const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setSocialLoading(provider);
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast({
          title: language === 'ar' ? 'خطأ في تسجيل الدخول' : 'Login Error',
          description: error.message || String(error),
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: language === 'ar' ? 'خطأ في تسجيل الدخول' : 'Login Error',
        description: err?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setSocialLoading(null);
    }
  };
 
   useEffect(() => {
     if (user && !authLoading) {
       navigate('/');
     }
   }, [user, authLoading, navigate]);
 
   const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsLoading(true);
     
     const { error } = await signIn(loginEmail, loginPassword);
     
     if (error) {
       toast({
         title: language === 'ar' ? 'خطأ في تسجيل الدخول' : 'Login Error',
         description: error.message,
         variant: 'destructive'
       });
     } else {
       toast({
         title: language === 'ar' ? 'مرحباً بك' : 'Welcome back!',
         description: language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Successfully logged in'
       });
       navigate('/');
     }
     
     setIsLoading(false);
   };
 
   const handleSignup = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsLoading(true);
     
     const { error } = await signUp(signupEmail, signupPassword, signupName);
     
     if (error) {
       toast({
         title: language === 'ar' ? 'خطأ في إنشاء الحساب' : 'Signup Error',
         description: error.message,
         variant: 'destructive'
       });
     } else {
       toast({
         title: language === 'ar' ? 'تم إنشاء الحساب' : 'Account Created',
         description: language === 'ar' 
           ? 'يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب' 
           : 'Please check your email to verify your account'
       });
     }
     
     setIsLoading(false);
   };
 
   if (authLoading) {
     return (
       <MainLayout>
         <div className="flex items-center justify-center min-h-[60vh]">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       </MainLayout>
     );
   }
 
   return (
     <MainLayout>
       <div className="container max-w-md py-16">
         <Card className="border-border/50 shadow-lg">
           <CardHeader className="text-center">
             <CardTitle className="text-2xl font-bold">
               {language === 'ar' ? 'مرحباً بك' : 'Welcome'}
             </CardTitle>
             <CardDescription>
               {language === 'ar' 
                 ? 'سجل الدخول أو أنشئ حساباً جديداً'
                 : 'Sign in to your account or create a new one'}
             </CardDescription>
           </CardHeader>
           <CardContent>
             <Tabs value={activeTab} onValueChange={setActiveTab}>
               <TabsList className="grid w-full grid-cols-2 mb-6">
                 <TabsTrigger value="login">
                   {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                 </TabsTrigger>
                 <TabsTrigger value="signup">
                   {language === 'ar' ? 'حساب جديد' : 'Sign Up'}
                 </TabsTrigger>
               </TabsList>
               
               <TabsContent value="login">
                 <form onSubmit={handleLogin} className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="login-email">
                       {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                     </Label>
                     <div className="relative">
                       <Mail className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input
                         id="login-email"
                         type="email"
                         value={loginEmail}
                         onChange={(e) => setLoginEmail(e.target.value)}
                         placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                         className="pl-10 rtl:pl-3 rtl:pr-10"
                         required
                       />
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <Label htmlFor="login-password">
                       {language === 'ar' ? 'كلمة المرور' : 'Password'}
                     </Label>
                     <div className="relative">
                       <Lock className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input
                         id="login-password"
                         type="password"
                         value={loginPassword}
                         onChange={(e) => setLoginPassword(e.target.value)}
                         placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                         className="pl-10 rtl:pl-3 rtl:pr-10"
                         required
                       />
                     </div>
                   </div>
                   
                   <Button type="submit" className="w-full" disabled={isLoading}>
                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                   </Button>
                 </form>
               </TabsContent>
               
               <TabsContent value="signup">
                 <form onSubmit={handleSignup} className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="signup-name">
                       {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                     </Label>
                     <div className="relative">
                       <User className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input
                         id="signup-name"
                         type="text"
                         value={signupName}
                         onChange={(e) => setSignupName(e.target.value)}
                         placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                         className="pl-10 rtl:pl-3 rtl:pr-10"
                       />
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <Label htmlFor="signup-email">
                       {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                     </Label>
                     <div className="relative">
                       <Mail className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input
                         id="signup-email"
                         type="email"
                         value={signupEmail}
                         onChange={(e) => setSignupEmail(e.target.value)}
                         placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                         className="pl-10 rtl:pl-3 rtl:pr-10"
                         required
                       />
                     </div>
                   </div>
                   
                   <div className="space-y-2">
                     <Label htmlFor="signup-password">
                       {language === 'ar' ? 'كلمة المرور' : 'Password'}
                     </Label>
                     <div className="relative">
                       <Lock className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input
                         id="signup-password"
                         type="password"
                         value={signupPassword}
                         onChange={(e) => setSignupPassword(e.target.value)}
                         placeholder={language === 'ar' ? 'أنشئ كلمة مرور قوية' : 'Create a strong password'}
                         className="pl-10 rtl:pl-3 rtl:pr-10"
                         minLength={6}
                         required
                       />
                     </div>
                   </div>
                   
                   <Button type="submit" className="w-full" disabled={isLoading}>
                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     {language === 'ar' ? 'إنشاء حساب' : 'Create Account'}
                   </Button>
                 </form>
               </TabsContent>
             </Tabs>
           </CardContent>
         </Card>
       </div>
     </MainLayout>
   );
 };
 
 export default Auth;