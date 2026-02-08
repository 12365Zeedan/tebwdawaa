import { useState, useEffect } from "react";
import { Clock, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

interface BackupScheduleCardProps {
  schedule: {
    is_active: boolean;
    frequency: string;
    backup_scope: string;
    retention_days: number;
    notify_on_complete: boolean;
    notify_on_failure: boolean;
  } | null;
  onSave: (data: {
    is_active: boolean;
    frequency: string;
    backup_scope: string;
    retention_days: number;
    notify_on_complete: boolean;
    notify_on_failure: boolean;
  }) => void;
  isSaving: boolean;
}

export function BackupScheduleCard({
  schedule,
  onSave,
  isSaving,
}: BackupScheduleCardProps) {
  const { language } = useLanguage();
  const [isActive, setIsActive] = useState(schedule?.is_active ?? false);
  const [frequency, setFrequency] = useState(schedule?.frequency ?? "daily");
  const [scope, setScope] = useState(schedule?.backup_scope ?? "full");
  const [retentionDays, setRetentionDays] = useState(
    schedule?.retention_days ?? 30
  );
  const [notifyComplete, setNotifyComplete] = useState(
    schedule?.notify_on_complete ?? true
  );
  const [notifyFailure, setNotifyFailure] = useState(
    schedule?.notify_on_failure ?? true
  );

  useEffect(() => {
    if (schedule) {
      setIsActive(schedule.is_active);
      setFrequency(schedule.frequency);
      setScope(schedule.backup_scope);
      setRetentionDays(schedule.retention_days);
      setNotifyComplete(schedule.notify_on_complete);
      setNotifyFailure(schedule.notify_on_failure);
    }
  }, [schedule]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            {language === "ar" ? "النسخ الاحتياطي المجدول" : "Scheduled Backups"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <Label htmlFor="backup-active">
            {language === "ar"
              ? "تفعيل النسخ الاحتياطي التلقائي"
              : "Enable Auto Backup"}
          </Label>
          <Switch
            id="backup-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>

        <div className="space-y-2">
          <Label>{language === "ar" ? "التكرار" : "Frequency"}</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">
                {language === "ar" ? "يومياً" : "Daily"}
              </SelectItem>
              <SelectItem value="weekly">
                {language === "ar" ? "أسبوعياً" : "Weekly"}
              </SelectItem>
              <SelectItem value="monthly">
                {language === "ar" ? "شهرياً" : "Monthly"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{language === "ar" ? "نطاق النسخة" : "Backup Scope"}</Label>
          <Select value={scope} onValueChange={setScope}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">
                {language === "ar" ? "نسخة كاملة" : "Full Backup"}
              </SelectItem>
              <SelectItem value="database">
                {language === "ar" ? "قاعدة البيانات فقط" : "Database Only"}
              </SelectItem>
              <SelectItem value="settings">
                {language === "ar" ? "الإعدادات فقط" : "Settings Only"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>
            {language === "ar"
              ? "الاحتفاظ بالنسخ (أيام)"
              : "Retention Period (days)"}
          </Label>
          <Input
            type="number"
            value={retentionDays}
            onChange={(e) =>
              setRetentionDays(Math.max(1, parseInt(e.target.value) || 1))
            }
            min={1}
            max={365}
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            {language === "ar" ? "الإشعارات" : "Notifications"}
          </Label>
          <div className="flex items-center justify-between">
            <Label htmlFor="notify-complete" className="text-sm font-normal">
              {language === "ar"
                ? "إشعار عند الاكتمال"
                : "Notify on completion"}
            </Label>
            <Switch
              id="notify-complete"
              checked={notifyComplete}
              onCheckedChange={setNotifyComplete}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notify-failure" className="text-sm font-normal">
              {language === "ar" ? "إشعار عند الفشل" : "Notify on failure"}
            </Label>
            <Switch
              id="notify-failure"
              checked={notifyFailure}
              onCheckedChange={setNotifyFailure}
            />
          </div>
        </div>

        <Button
          className="w-full gap-2"
          onClick={() =>
            onSave({
              is_active: isActive,
              frequency,
              backup_scope: scope,
              retention_days: retentionDays,
              notify_on_complete: notifyComplete,
              notify_on_failure: notifyFailure,
            })
          }
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
          {isSaving
            ? language === "ar"
              ? "جاري الحفظ..."
              : "Saving..."
            : language === "ar"
              ? "حفظ الجدول"
              : "Save Schedule"}
        </Button>
      </CardContent>
    </Card>
  );
}
