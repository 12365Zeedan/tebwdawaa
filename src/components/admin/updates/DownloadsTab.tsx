import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { useThemeDownloads } from "@/hooks/useThemeLicenses";
import { useThemeVersions } from "@/hooks/useThemeVersions";
import { useThemeLicenses } from "@/hooks/useThemeLicenses";
import { useMemo } from "react";

export function DownloadsTab() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { data: downloads = [], isLoading } = useThemeDownloads();
  const { data: versions = [] } = useThemeVersions();
  const { data: licenses = [] } = useThemeLicenses();

  const versionMap = useMemo(() => {
    const map = new Map<string, string>();
    versions.forEach(v => map.set(v.id, `v${v.version}`));
    return map;
  }, [versions]);

  const licenseMap = useMemo(() => {
    const map = new Map<string, { name: string; email: string; key: string }>();
    licenses.forEach(l => map.set(l.id, { name: l.customer_name, email: l.customer_email, key: l.license_key }));
    return map;
  }, [licenses]);

  const platformColors: Record<string, string> = {
    wordpress: "bg-blue-500/10 text-blue-600",
    shopify: "bg-green-500/10 text-green-600",
    salla: "bg-purple-500/10 text-purple-600",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {isAr ? "سجل التحميلات" : "Download History"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : downloads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Download className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">{isAr ? "لا توجد تحميلات بعد" : "No downloads yet"}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isAr ? "العميل" : "Customer"}</TableHead>
                <TableHead>{isAr ? "الإصدار" : "Version"}</TableHead>
                <TableHead>{isAr ? "المنصة" : "Platform"}</TableHead>
                <TableHead>{isAr ? "التاريخ" : "Date"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {downloads.map(d => {
                const license = licenseMap.get(d.license_id);
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      {license ? (
                        <div>
                          <p className="text-sm font-medium">{license.name}</p>
                          <p className="text-xs text-muted-foreground">{license.email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {versionMap.get(d.version_id) || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={platformColors[d.platform] || ""}>
                        {d.platform === "wordpress" ? "WordPress" : d.platform === "shopify" ? "Shopify" : "Salla"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(d.downloaded_at), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
