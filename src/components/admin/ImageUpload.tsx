 import React, { useState, useRef } from 'react';
 import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { supabase } from '@/integrations/supabase/client';
 import { useToast } from '@/hooks/use-toast';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { cn } from '@/lib/utils';
 
 interface ImageUploadProps {
   value?: string | null;
   onChange: (url: string | null) => void;
   bucket?: string;
   folder?: string;
   className?: string;
 }
 
 export function ImageUpload({
   value,
   onChange,
   bucket = 'product-images',
   folder = 'products',
   className,
 }: ImageUploadProps) {
   const { language } = useLanguage();
   const { toast } = useToast();
   const [isUploading, setIsUploading] = useState(false);
   const [dragActive, setDragActive] = useState(false);
   const inputRef = useRef<HTMLInputElement>(null);
 
   const handleFile = async (file: File) => {
     if (!file.type.startsWith('image/')) {
       toast({
         title: language === 'ar' ? 'خطأ' : 'Error',
         description: language === 'ar' ? 'يرجى اختيار ملف صورة' : 'Please select an image file',
         variant: 'destructive',
       });
       return;
     }
 
     if (file.size > 5 * 1024 * 1024) {
       toast({
         title: language === 'ar' ? 'خطأ' : 'Error',
         description: language === 'ar' ? 'حجم الصورة يجب أن يكون أقل من 5MB' : 'Image size must be less than 5MB',
         variant: 'destructive',
       });
       return;
     }
 
     setIsUploading(true);
 
     try {
       const fileExt = file.name.split('.').pop();
       const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
 
       const { error: uploadError } = await supabase.storage
         .from(bucket)
         .upload(fileName, file);
 
       if (uploadError) throw uploadError;
 
       const { data: { publicUrl } } = supabase.storage
         .from(bucket)
         .getPublicUrl(fileName);
 
       onChange(publicUrl);
 
       toast({
         title: language === 'ar' ? 'تم الرفع' : 'Uploaded',
         description: language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully',
       });
     } catch (error: any) {
       toast({
         title: language === 'ar' ? 'خطأ في الرفع' : 'Upload Error',
         description: error.message,
         variant: 'destructive',
       });
     } finally {
       setIsUploading(false);
     }
   };
 
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) handleFile(file);
   };
 
   const handleDrag = (e: React.DragEvent) => {
     e.preventDefault();
     e.stopPropagation();
     if (e.type === 'dragenter' || e.type === 'dragover') {
       setDragActive(true);
     } else if (e.type === 'dragleave') {
       setDragActive(false);
     }
   };
 
   const handleDrop = (e: React.DragEvent) => {
     e.preventDefault();
     e.stopPropagation();
     setDragActive(false);
     const file = e.dataTransfer.files?.[0];
     if (file) handleFile(file);
   };
 
   const handleRemove = async () => {
     if (value) {
       // Extract file path from URL for deletion
       try {
         const url = new URL(value);
         const pathParts = url.pathname.split('/storage/v1/object/public/');
         if (pathParts[1]) {
           const [bucketName, ...filePath] = pathParts[1].split('/');
           if (bucketName === bucket) {
             await supabase.storage.from(bucket).remove([filePath.join('/')]);
           }
         }
       } catch {
         // Ignore deletion errors, just clear the value
       }
     }
     onChange(null);
   };
 
   return (
     <div className={cn('space-y-2', className)}>
       <input
         ref={inputRef}
         type="file"
         accept="image/*"
         onChange={handleInputChange}
         className="hidden"
       />
 
       {value ? (
         <div className="relative group">
           <img
             src={value}
             alt="Product"
             className="w-full h-48 object-cover rounded-lg border"
           />
           <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
             <Button
               type="button"
               variant="secondary"
               size="sm"
               onClick={() => inputRef.current?.click()}
               disabled={isUploading}
             >
               {isUploading ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                 <Upload className="h-4 w-4" />
               )}
               <span className="ms-1">{language === 'ar' ? 'تغيير' : 'Change'}</span>
             </Button>
             <Button
               type="button"
               variant="destructive"
               size="sm"
               onClick={handleRemove}
             >
               <X className="h-4 w-4" />
               <span className="ms-1">{language === 'ar' ? 'حذف' : 'Remove'}</span>
             </Button>
           </div>
         </div>
       ) : (
         <div
           onDragEnter={handleDrag}
           onDragLeave={handleDrag}
           onDragOver={handleDrag}
           onDrop={handleDrop}
           onClick={() => inputRef.current?.click()}
           className={cn(
             'h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors',
             dragActive
               ? 'border-primary bg-primary/5'
               : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
           )}
         >
           {isUploading ? (
             <>
               <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
               <p className="text-sm text-muted-foreground">
                 {language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
               </p>
             </>
           ) : (
             <>
               <ImageIcon className="h-8 w-8 text-muted-foreground" />
               <p className="text-sm text-muted-foreground text-center px-4">
                 {language === 'ar'
                   ? 'اسحب وأفلت صورة أو انقر للاختيار'
                   : 'Drag & drop an image or click to select'}
               </p>
               <p className="text-xs text-muted-foreground">
                 {language === 'ar' ? 'الحد الأقصى: 5MB' : 'Max size: 5MB'}
               </p>
             </>
           )}
         </div>
       )}
     </div>
   );
 }