import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { useShippingZones, type ShippingZone, type ShippingZoneInput } from '@/hooks/useShippingZones';
import { ShippingZoneFormDialog } from './ShippingZoneFormDialog';

export function ShippingZonesCard() {
  const { language } = useLanguage();
  const { zones, isLoading, createZone, updateZone, deleteZone, toggleZone } = useShippingZones();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async (data: ShippingZoneInput) => {
    await createZone.mutateAsync(data);
  };

  const handleUpdate = async (data: ShippingZoneInput) => {
    if (!editingZone) return;
    await updateZone.mutateAsync({ id: editingZone.id, ...data });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteZone.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const openCreate = () => {
    setEditingZone(null);
    setDialogOpen(true);
  };

  const openEdit = (zone: ShippingZone) => {
    setEditingZone(zone);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {language === 'ar' ? 'مناطق الشحن' : 'Shipping Zones'}
              </CardTitle>
              <CardDescription className="mt-1">
                {language === 'ar'
                  ? 'أسعار شحن مختلفة حسب المنطقة الجغرافية'
                  : 'Different shipping rates based on geographic region'}
              </CardDescription>
            </div>
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              {language === 'ar' ? 'إضافة منطقة' : 'Add Zone'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : zones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>{language === 'ar' ? 'لا توجد مناطق شحن' : 'No shipping zones yet'}</p>
              <p className="text-xs mt-1">
                {language === 'ar'
                  ? 'أضف مناطق شحن لتحديد أسعار مختلفة حسب المنطقة'
                  : 'Add shipping zones to set different rates per region'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'ar' ? 'المنطقة' : 'Zone'}</TableHead>
                    <TableHead>{language === 'ar' ? 'المناطق' : 'Regions'}</TableHead>
                    <TableHead>{language === 'ar' ? 'السعر' : 'Rate'}</TableHead>
                    <TableHead>{language === 'ar' ? 'شحن مجاني' : 'Free Threshold'}</TableHead>
                    <TableHead>{language === 'ar' ? 'مدة التوصيل' : 'Delivery'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead className="text-right">{language === 'ar' ? 'إجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">
                        {language === 'ar' ? zone.name_ar : zone.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {zone.regions.slice(0, 3).map((r) => (
                            <Badge key={r} variant="secondary" className="text-xs">
                              {r}
                            </Badge>
                          ))}
                          {zone.regions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{zone.regions.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{zone.shipping_rate}</TableCell>
                      <TableCell>
                        {zone.free_shipping_threshold != null ? zone.free_shipping_threshold : '—'}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {zone.estimated_days_min}-{zone.estimated_days_max}{' '}
                          {language === 'ar' ? 'أيام' : 'days'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={zone.is_active}
                          onCheckedChange={(checked) =>
                            toggleZone.mutate({ id: zone.id, is_active: checked })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(zone)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(zone.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ShippingZoneFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        zone={editingZone}
        onSubmit={editingZone ? handleUpdate : handleCreate}
        isSubmitting={createZone.isPending || updateZone.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'حذف منطقة الشحن' : 'Delete Shipping Zone'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar'
                ? 'هل أنت متأكد من حذف هذه المنطقة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this zone? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {language === 'ar' ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
