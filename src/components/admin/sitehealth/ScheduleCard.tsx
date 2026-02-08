import { useState, useEffect } from "react";
import { Clock, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";

interface ScheduleCardProps {
  schedule: {
    is_active: boolean;
    frequency: string;
    check_categories: string[];
    notify_on_issues: boolean;
  } | null;
  onSave: (data: {
    is_active: boolean;
    frequency: string;
    check_categories: string[];
    notify_on_issues: boolean;
  }) => void;
  isSaving: boolean;
}

const categories = [
  { key: "performance", labelEn: "Performance", labelAr: "الأداء" },
  { key: "security", labelEn: "Security", labelAr: "الأمان" },
  { key: "seo", labelEn: "SEO", labelAr: "تحسين محركات البحث" },
  { key: "accessibility", labelEn: "Accessibility", labelAr: "إمكانية الوصول" },
  { key: "database", labelEn: "Database", labelAr: "قاعدة البيانات" },
  { key: "general", labelEn: "General", labelAr: "عام" },
];

export function ScheduleCard({ schedule, onSave, isSaving }: ScheduleCardProps) {
  const { language } = useLanguage();
  const [isActive, setIsActive] = useState(schedule?.is_active ?? false);
  const [frequency, setFrequency] = useState(schedule?.frequency ?? "daily");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    schedule?.check_categories ?? ["performance", "security", "seo", "accessibility"]
  );
  const [notifyOnIssues, setNotifyOnIssues] = useState(schedule?.notify_on_issues ?? true);

  useEffect(() => {
    if (schedule) {
      setIsActive(schedule.is_active);
      setFrequency(schedule.frequency);
      setSelectedCategories(schedule.check_categories);
      setNotifyOnIssues(schedule.notify_on_issues);
    }
  }, [schedule]);

  const toggleCategory = (key: string) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            {language === "ar" ? "الفحص المجدول" : "Scheduled Scans"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <Label htmlFor="schedule-active">
            {language === "ar" ? "تفعيل الفحص التلقائي" : "Enable Auto Scanning"}
          </Label>
          <Switch
            id="schedule-active"
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
              <SelectItem value="hourly">{language === "ar" ? "كل ساعة" : "Hourly"}</SelectItem>
              <SelectItem value="daily">{language === "ar" ? "يومياً" : "Daily"}</SelectItem>
              <SelectItem value="weekly">{language === "ar" ? "أسبوعياً" : "Weekly"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{language === "ar" ? "الفئات المشمولة" : "Categories to Check"}</Label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <div key={cat.key} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${cat.key}`}
                  checked={selectedCategories.includes(cat.key)}
                  onCheckedChange={() => toggleCategory(cat.key)}
                />
                <Label htmlFor={`cat-${cat.key}`} className="text-sm font-normal cursor-pointer">
                  {language === "ar" ? cat.labelAr : cat.labelEn}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="notify-issues">
            {language === "ar" ? "إشعار عند وجود مشاكل" : "Notify on Issues"}
          </Label>
          <Switch
            id="notify-issues"
            checked={notifyOnIssues}
            onCheckedChange={setNotifyOnIssues}
          />
        </div>

        <Button
          className="w-full gap-2"
          onClick={() =>
            onSave({
              is_active: isActive,
              frequency,
              check_categories: selectedCategories,
              notify_on_issues: notifyOnIssues,
            })
          }
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
          {isSaving
            ? language === "ar" ? "جاري الحفظ..." : "Saving..."
            : language === "ar" ? "حفظ الإعدادات" : "Save Schedule"}
        </Button>
      </CardContent>
    </Card>
  );
}
