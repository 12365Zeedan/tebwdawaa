import React, { useState, useRef } from 'react';
import { Upload, Trash2, Copy, Image as ImageIcon, Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBlogMedia, useUploadBlogMedia, useDeleteBlogMedia } from '@/hooks/useBlogMedia';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function BlogMediaTab() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [deleteFile, setDeleteFile] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const { data: files, isLoading } = useBlogMedia();
  const uploadMedia = useUploadBlogMedia();
  const deleteMedia = useDeleteBlogMedia();

  const filteredFiles = files?.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    for (let i = 0; i < fileList.length; i++) {
      await uploadMedia.mutateAsync(fileList[i]);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast({ title: isAr ? 'تم نسخ الرابط' : 'URL copied to clipboard' });
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDelete = () => {
    if (deleteFile) deleteMedia.mutate(deleteFile, { onSuccess: () => setDeleteFile(null) });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          {isAr ? 'إدارة الصور والملفات المستخدمة في المدونة' : 'Manage images and files used in blog posts'}
        </p>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <Button className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploadMedia.isPending}>
            <Upload className="h-4 w-4" />
            {uploadMedia.isPending ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'رفع ملف' : 'Upload File')}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={isAr ? 'البحث في الملفات...' : 'Search files...'}
          className="bg-muted/50 pl-10"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : filteredFiles && filteredFiles.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group relative aspect-square rounded-xl border border-border/50 bg-card overflow-hidden shadow-soft hover:shadow-md transition-shadow"
            >
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  onClick={() => handleCopyUrl(file.url)}
                >
                  {copiedUrl === file.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => setDeleteFile(file.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {/* File info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white truncate">{file.name}</p>
                <p className="text-xs text-white/70">{formatSize(file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/50 shadow-soft p-12 text-center">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            {search
              ? (isAr ? 'لا توجد ملفات مطابقة' : 'No matching files found')
              : (isAr ? 'لا توجد ملفات بعد. ابدأ بالرفع!' : 'No files yet. Start uploading!')}
          </p>
        </div>
      )}

      <AlertDialog open={!!deleteFile} onOpenChange={() => setDeleteFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isAr ? 'حذف الملف' : 'Delete File'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAr ? 'هل أنت متأكد من حذف هذا الملف؟ قد يؤثر ذلك على المقالات التي تستخدمه.' : 'Are you sure? This may affect posts using this file.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isAr ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">{isAr ? 'حذف' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
