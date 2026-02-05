 import React, { useState } from 'react';
 import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Globe, Search, Package, UserCircle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { useCart } from '@/contexts/CartContext';
 import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
 import { cn } from '@/lib/utils';
 
 export function Navbar() {
   const [isOpen, setIsOpen] = useState(false);
   const [showSearch, setShowSearch] = useState(false);
   const { language, setLanguage, t, direction } = useLanguage();
   const { totalItems } = useCart();
   const { user, isAdmin, signOut } = useAuth();
   const location = useLocation();
 
   const navLinks = [
     { href: '/', label: t('nav.home') },
     { href: '/products', label: t('nav.products') },
     { href: '/categories', label: t('nav.categories') },
     { href: '/blog', label: t('nav.blog') },
     { href: '/about', label: t('nav.about') },
   ];
 
   const isActive = (path: string) => location.pathname === path;
 
   return (
     <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
       <div className="container flex h-16 items-center justify-between">
         {/* Logo */}
         <Link to="/" className="flex items-center gap-2">
           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
             <span className="text-xl font-bold text-primary-foreground">P</span>
           </div>
           <span className="text-xl font-bold text-foreground">
             {language === 'ar' ? 'صيدلية' : 'PharmaCare'}
           </span>
         </Link>
 
         {/* Desktop Navigation */}
         <nav className="hidden md:flex items-center gap-1">
           {navLinks.map(link => (
             <Link
               key={link.href}
               to={link.href}
               className={cn(
                 'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                 isActive(link.href)
                   ? 'bg-primary text-primary-foreground'
                   : 'text-muted-foreground hover:text-foreground hover:bg-muted'
               )}
             >
               {link.label}
             </Link>
           ))}
         </nav>
 
         {/* Actions */}
         <div className="flex items-center gap-2">
           {/* Search Toggle */}
           <Button
             variant="ghost"
             size="icon"
             onClick={() => setShowSearch(!showSearch)}
             className="hidden md:flex"
           >
             <Search className="h-5 w-5" />
           </Button>
 
           {/* Language Toggle */}
           <Button
             variant="ghost"
             size="icon"
             onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
             className="relative"
           >
             <Globe className="h-5 w-5" />
             <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-primary text-primary-foreground rounded px-1">
               {language.toUpperCase()}
             </span>
           </Button>
 
           {/* Cart */}
           <Link to="/cart">
             <Button variant="ghost" size="icon" className="relative">
               <ShoppingCart className="h-5 w-5" />
               {totalItems > 0 && (
                 <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
                   {totalItems}
                 </span>
               )}
             </Button>
           </Link>
 
           {/* Auth / User Menu */}
           {user ? (
             <div className="hidden md:flex items-center gap-2">
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon">
                     <UserCircle className="h-5 w-5" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48">
                   <DropdownMenuItem asChild>
                     <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                       <User className="h-4 w-4" />
                       {language === 'ar' ? 'الملف الشخصي' : 'My Profile'}
                     </Link>
                   </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                     <Link to="/orders" className="flex items-center gap-2 cursor-pointer">
                       <Package className="h-4 w-4" />
                       {language === 'ar' ? 'طلباتي' : 'My Orders'}
                     </Link>
                   </DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem
                     onClick={() => signOut()}
                     className="text-destructive focus:text-destructive cursor-pointer"
                   >
                     {language === 'ar' ? 'خروج' : 'Logout'}
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
               {isAdmin && (
                 <Link to="/admin">
                   <Button variant="outline" size="sm" className="gap-2">
                     <User className="h-4 w-4" />
                     {t('nav.admin')}
                   </Button>
                 </Link>
               )}
             </div>
           ) : (
             <Link to="/auth" className="hidden md:block">
               <Button variant="outline" size="sm" className="gap-2">
                 <User className="h-4 w-4" />
                 {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
               </Button>
             </Link>
           )}
 
           {/* Mobile Menu Toggle */}
           <Button
             variant="ghost"
             size="icon"
             className="md:hidden"
             onClick={() => setIsOpen(!isOpen)}
           >
             {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
           </Button>
         </div>
       </div>
 
       {/* Search Bar */}
       {showSearch && (
         <div className="container py-3 border-t border-border/40 animate-fade-in">
           <div className="relative max-w-xl mx-auto">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               type="search"
               placeholder={t('products.search')}
               className={cn(
                 'pl-10 bg-muted/50',
                 direction === 'rtl' && 'pr-10 pl-4'
               )}
             />
           </div>
         </div>
       )}
 
       {/* Mobile Menu */}
       {isOpen && (
         <div className="md:hidden border-t border-border/40 animate-fade-in">
           <nav className="container py-4 flex flex-col gap-2">
             {navLinks.map(link => (
               <Link
                 key={link.href}
                 to={link.href}
                 onClick={() => setIsOpen(false)}
                 className={cn(
                   'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                   isActive(link.href)
                     ? 'bg-primary text-primary-foreground'
                     : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                 )}
               >
                 {link.label}
               </Link>
             ))}
             {user ? (
               <>
                 <Link
                   to="/profile"
                   onClick={() => setIsOpen(false)}
                   className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2"
                 >
                   <User className="h-4 w-4" />
                   {language === 'ar' ? 'الملف الشخصي' : 'My Profile'}
                 </Link>
                 <Link
                   to="/orders"
                   onClick={() => setIsOpen(false)}
                   className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2"
                 >
                   <Package className="h-4 w-4" />
                   {language === 'ar' ? 'طلباتي' : 'My Orders'}
                 </Link>
                 {isAdmin && (
                   <Link
                     to="/admin"
                     onClick={() => setIsOpen(false)}
                     className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2"
                   >
                     <User className="h-4 w-4" />
                     {t('nav.admin')}
                   </Link>
                 )}
                 <button
                   onClick={() => { signOut(); setIsOpen(false); }}
                   className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted text-left rtl:text-right"
                 >
                   {language === 'ar' ? 'خروج' : 'Logout'}
                 </button>
               </>
             ) : (
               <Link
                 to="/auth"
                 onClick={() => setIsOpen(false)}
                 className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2"
               >
                 <User className="h-4 w-4" />
                 {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
               </Link>
             )}
           </nav>
         </div>
       )}
     </header>
   );
 }
