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

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                  {language === 'ar' ? 'أو' : 'OR'}
                </span>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => handleSocialLogin('google')}
                  disabled={!!socialLoading}
                >
                  {socialLoading === 'google' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  {language === 'ar' ? 'المتابعة مع Google' : 'Continue with Google'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => handleSocialLogin('apple')}
                  disabled={!!socialLoading}
                >
                  {socialLoading === 'apple' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                  )}
                  {language === 'ar' ? 'المتابعة مع Apple' : 'Continue with Apple'}
                </Button>
              </div>
            </CardContent>
         </Card>
       </div>
     </MainLayout>
   );
 };
 
 export default Auth;