import React from 'react';
import { format } from 'date-fns';
import {
  Clock, Package, Truck, CheckCircle, XCircle,
  MapPin, FileText, Hash
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrderTracking, type TrackingEvent } from '@/hooks/useOrderTracking';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const statusMeta: Record<string, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  labelEn: string;
  labelAr: string;
}> = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500/10 border-yellow-500/30',
    labelEn: 'Pending',
    labelAr: 'قيد الانتظار',
  },
  processing: {
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    labelEn: 'Processing',
    labelAr: 'قيد المعالجة',
  },
  shipped: {
    icon: Truck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    labelEn: 'Shipped',
    labelAr: 'تم الشحن',
  },
  delivered: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10 border-green-500/30',
    labelEn: 'Delivered',
    labelAr: 'تم التوصيل',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-500/10 border-red-500/30',
    labelEn: 'Cancelled',
    labelAr: 'ملغي',
  },
};

interface OrderTrackingTimelineProps {
  orderId: string;
  currentStatus?: string;
}

export function OrderTrackingTimeline({ orderId, currentStatus }: OrderTrackingTimelineProps) {
  const { language } = useLanguage();
  const { data: events, isLoading } = useOrderTracking(orderId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Build combined timeline: tracking events + fallback from current status
  const allStatuses = ['pending', 'processing', 'shipped', 'delivered'];
  const statusOrder = currentStatus === 'cancelled'
    ? ['pending', 'cancelled']
    : allStatuses;

  // If no tracking events exist, show a progress-style view based on current status
  if (!events || events.length === 0) {
    const currentIdx = statusOrder.indexOf(currentStatus || 'pending');

    return (
      <div className="space-y-0">
        {statusOrder.map((status, idx) => {
          const meta = statusMeta[status] || statusMeta.pending;
          const Icon = meta.icon;
          const isCompleted = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          const isLast = idx === statusOrder.length - 1;

          return (
            <div key={status} className="flex gap-4">
              {/* Timeline line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                    isCompleted
                      ? `${meta.bgColor} ${meta.color}`
                      : 'bg-muted/50 border-border text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 h-12 transition-all',
                      isCompleted && !isCurrent ? meta.color.replace('text-', 'bg-') : 'bg-border'
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pb-12 last:pb-0 pt-2">
                <p
                  className={cn(
                    'font-semibold text-sm',
                    isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {language === 'ar' ? meta.labelAr : meta.labelEn}
                </p>
                {isCurrent && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {language === 'ar' ? 'الحالة الحالية' : 'Current status'}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Show actual tracking events timeline
  return (
    <div className="space-y-0">
      {events.map((event, idx) => {
        const meta = statusMeta[event.status] || statusMeta.pending;
        const Icon = meta.icon;
        const isLast = idx === events.length - 1;

        return (
          <div key={event.id} className="flex gap-4">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0',
                  meta.bgColor, meta.color
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              {!isLast && (
                <div className={cn('w-0.5 flex-1 min-h-[2rem]', meta.color.replace('text-', 'bg-'))} />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-6', isLast ? 'pb-0' : '')}>
              <p className="font-semibold text-sm text-foreground">
                {language === 'ar' ? meta.labelAr : meta.labelEn}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(event.created_at), 'PPP p')}
              </p>

              {/* Extra details */}
              <div className="mt-2 space-y-1.5">
                {event.tracking_number && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Hash className="h-3 w-3" />
                    <span className="font-mono">{event.tracking_number}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.notes && (
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{event.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
