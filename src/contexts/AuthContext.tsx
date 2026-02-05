 import React, { createContext, useContext, useEffect, useState } from 'react';
 import { User, Session } from '@supabase/supabase-js';
 import { supabase } from '@/integrations/supabase/client';
 
 interface AuthContextType {
   user: User | null;
   session: Session | null;
   isLoading: boolean;
   isAdmin: boolean;
   signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
   signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
   signOut: () => Promise<void>;
 }
 
 const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
 export function AuthProvider({ children }: { children: React.ReactNode }) {
   const [user, setUser] = useState<User | null>(null);
   const [session, setSession] = useState<Session | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [isAdmin, setIsAdmin] = useState(false);
 
   useEffect(() => {
     // Set up auth state listener BEFORE checking session
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       async (event, session) => {
         setSession(session);
         setUser(session?.user ?? null);
         
         if (session?.user) {
           // Check if user is admin - use setTimeout to avoid blocking
           setTimeout(async () => {
             const { data } = await supabase
               .from('user_roles')
               .select('role')
               .eq('user_id', session.user.id)
               .eq('role', 'admin')
               .maybeSingle();
             setIsAdmin(!!data);
           }, 0);
         } else {
           setIsAdmin(false);
         }
         
         setIsLoading(false);
       }
     );
 
     // Check for existing session
     supabase.auth.getSession().then(({ data: { session } }) => {
       setSession(session);
       setUser(session?.user ?? null);
       setIsLoading(false);
     });
 
     return () => subscription.unsubscribe();
   }, []);
 
   const signUp = async (email: string, password: string, fullName?: string) => {
     const { error } = await supabase.auth.signUp({
       email,
       password,
       options: {
         emailRedirectTo: window.location.origin,
         data: { full_name: fullName }
       }
     });
     return { error: error as Error | null };
   };
 
   const signIn = async (email: string, password: string) => {
     const { error } = await supabase.auth.signInWithPassword({ email, password });
     return { error: error as Error | null };
   };
 
   const signOut = async () => {
     await supabase.auth.signOut();
     setIsAdmin(false);
   };
 
   return (
     <AuthContext.Provider value={{ user, session, isLoading, isAdmin, signUp, signIn, signOut }}>
       {children}
     </AuthContext.Provider>
   );
 }
 
 export function useAuth() {
   const context = useContext(AuthContext);
   if (context === undefined) {
     throw new Error('useAuth must be used within an AuthProvider');
   }
   return context;
 }