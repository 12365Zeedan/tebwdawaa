import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { RestoreOptions } from "@/components/admin/backup/BackupRestoreCard";

const DB_TABLES = [
  "products",
  "categories",
  "orders",
  "order_items",
  "profiles",
  "blog_posts",
  "blog_categories",
  "blog_comments",
  "blog_pages",
  "discount_codes",
  "product_offers",
  "product_reviews",
  "shipping_zones",
  "newsletter_subscribers",
  "customer_loyalty_points",
  "loyalty_points_history",
  "loyalty_settings",
  "installed_plugins",
  "app_settings",
  "wishlists",
  "payment_transactions",
  "order_tracking_events",
  "stock_history",
  "user_roles",
] as const;

export type BackupScope = "full" | "database" | "storage" | "settings";

export function useBackups() {
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);

  // Fetch backup history
  const { data: backups = [], isLoading: isLoadingBackups } = useQuery({
    queryKey: ["site-backups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_backups")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Fetch schedule
  const { data: schedule } = useQuery({
    queryKey: ["backup-schedule"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backup_schedules")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Run a backup
  const runBackup = useCallback(
    async (scope: BackupScope = "full", notes?: string) => {
      setIsRunning(true);
      setBackupProgress(0);

      const startTime = Date.now();
      const tablesToBackup =
        scope === "full" || scope === "database" ? [...DB_TABLES] : [];

      // Create the backup record
      const { data: backupRecord, error: insertError } = await supabase
        .from("site_backups")
        .insert({
          backup_type: "manual",
          backup_scope: scope,
          status: "in_progress",
          tables_included: tablesToBackup,
          notes: notes || null,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError || !backupRecord) {
        toast.error("Failed to start backup");
        setIsRunning(false);
        return;
      }

      try {
        const allData: Record<string, unknown[]> = {};
        let totalSize = 0;

        for (let i = 0; i < tablesToBackup.length; i++) {
          const table = tablesToBackup[i];
          await new Promise((r) => setTimeout(r, 200)); // visual delay
          try {
            const { data, error } = await supabase
              .from(table)
              .select("*")
              .limit(1000);
            if (!error && data) {
              allData[table] = data;
              totalSize += JSON.stringify(data).length;
            }
          } catch {
            // skip tables we can't access
          }
          setBackupProgress(Math.round(((i + 1) / tablesToBackup.length) * 90));
        }

        // Build JSON export
        const exportData = {
          version: "1.0",
          created_at: new Date().toISOString(),
          scope,
          tables: allData,
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: "application/json",
        });
        const fileSize = blob.size;

        // Trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup-${scope}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setBackupProgress(100);

        // Update backup record
        await supabase
          .from("site_backups")
          .update({
            status: "completed",
            file_size_bytes: fileSize,
            completed_at: new Date().toISOString(),
          })
          .eq("id", backupRecord.id);

        queryClient.invalidateQueries({ queryKey: ["site-backups"] });
        toast.success(
          `Backup completed! ${(fileSize / 1024).toFixed(1)} KB exported in ${((Date.now() - startTime) / 1000).toFixed(1)}s`
        );
      } catch (err) {
        await supabase
          .from("site_backups")
          .update({
            status: "failed",
            error_message: err instanceof Error ? err.message : "Unknown error",
          })
          .eq("id", backupRecord.id);

        queryClient.invalidateQueries({ queryKey: ["site-backups"] });
        toast.error("Backup failed");
      } finally {
        setIsRunning(false);
      }
    },
    [queryClient]
  );

  // Save schedule
  const saveSchedule = useMutation({
    mutationFn: async (scheduleData: {
      is_active: boolean;
      frequency: string;
      backup_scope: string;
      retention_days: number;
      notify_on_complete: boolean;
      notify_on_failure: boolean;
    }) => {
      if (schedule?.id) {
        const { error } = await supabase
          .from("backup_schedules")
          .update(scheduleData)
          .eq("id", schedule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("backup_schedules")
          .insert(scheduleData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backup-schedule"] });
      toast.success("Schedule saved");
    },
    onError: () => toast.error("Failed to save schedule"),
  });

  // Delete a backup record
  const deleteBackup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("site_backups")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-backups"] });
      toast.success("Backup record deleted");
    },
  });

  // Restore from backup
  const restoreBackup = useCallback(
    async (options: RestoreOptions) => {
      const { tables: selectedTables, data: backupData, selectedColumns } = options;
      setIsRestoring(true);
      setRestoreProgress(0);

      const startTime = Date.now();
      let restoredCount = 0;
      let failedTables: string[] = [];

      for (let i = 0; i < selectedTables.length; i++) {
        const table = selectedTables[i];
        const rows = backupData.tables[table];

        if (!Array.isArray(rows) || rows.length === 0) {
          restoredCount++;
          setRestoreProgress(
            Math.round(((i + 1) / selectedTables.length) * 100)
          );
          continue;
        }

        await new Promise((r) => setTimeout(r, 150));

        try {
          const columnsForTable = selectedColumns?.[table];
          const isPartialRestore = columnsForTable && columnsForTable.length > 0;

          if (isPartialRestore) {
            // Partial column restore: update only selected columns per row
            for (let j = 0; j < rows.length; j++) {
              const row = rows[j] as Record<string, unknown>;
              if (!row.id) continue;

              const updateData: Record<string, unknown> = {};
              for (const col of columnsForTable) {
                if (col !== "id" && col in row) {
                  updateData[col] = row[col];
                }
              }

              if (Object.keys(updateData).length > 0) {
                await supabase
                  .from(table as any)
                  .update(updateData as any)
                  .eq("id", row.id as string);
              }
            }
          } else {
            // Full table restore: delete existing, insert all
            const { error: deleteError } = await supabase
              .from(table as any)
              .delete()
              .neq("id", "00000000-0000-0000-0000-000000000000");

            if (deleteError) {
              console.error(`Failed to clear ${table}:`, deleteError);
              failedTables.push(table);
              setRestoreProgress(
                Math.round(((i + 1) / selectedTables.length) * 100)
              );
              continue;
            }

            // Insert backup data in batches of 100
            const batchSize = 100;
            for (let j = 0; j < rows.length; j += batchSize) {
              const batch = rows.slice(j, j + batchSize);
              const { error: insertError } = await supabase
                .from(table as any)
                .insert(batch as any);

              if (insertError) {
                console.error(`Failed to insert into ${table}:`, insertError);
                failedTables.push(table);
                break;
              }
            }
          }

          restoredCount++;
        } catch (err) {
          console.error(`Error restoring ${table}:`, err);
          failedTables.push(table);
        }

        setRestoreProgress(
          Math.round(((i + 1) / selectedTables.length) * 100)
        );
      }

      setIsRestoring(false);
      queryClient.invalidateQueries();

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      if (failedTables.length === 0) {
        toast.success(
          `Restore completed! ${restoredCount} tables restored in ${duration}s`
        );
      } else {
        toast.warning(
          `Restore finished with ${failedTables.length} errors. ${restoredCount - failedTables.length} tables restored, ${failedTables.length} failed.`
        );
      }
    },
    [queryClient]
  );

  return {
    backups,
    isLoadingBackups,
    isRunning,
    backupProgress,
    isRestoring,
    restoreProgress,
    schedule,
    runBackup,
    restoreBackup,
    saveSchedule,
    deleteBackup,
  };
}
