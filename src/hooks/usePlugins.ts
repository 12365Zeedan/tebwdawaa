import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InstalledPlugin {
  id: string;
  plugin_key: string;
  is_active: boolean;
  settings: Record<string, unknown>;
  installed_at: string;
  updated_at: string;
}

export function usePlugins() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: installedPlugins = [], isLoading } = useQuery({
    queryKey: ["installed-plugins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("installed_plugins")
        .select("*")
        .order("installed_at", { ascending: false });
      if (error) throw error;
      return (data || []) as InstalledPlugin[];
    },
  });

  const installPlugin = useMutation({
    mutationFn: async (pluginKey: string) => {
      const { error } = await supabase
        .from("installed_plugins")
        .insert({ plugin_key: pluginKey, is_active: false });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installed-plugins"] });
      toast({ title: "Plugin installed successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to install plugin", description: error.message, variant: "destructive" });
    },
  });

  const uninstallPlugin = useMutation({
    mutationFn: async (pluginKey: string) => {
      const { error } = await supabase
        .from("installed_plugins")
        .delete()
        .eq("plugin_key", pluginKey);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installed-plugins"] });
      toast({ title: "Plugin uninstalled" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to uninstall plugin", description: error.message, variant: "destructive" });
    },
  });

  const togglePlugin = useMutation({
    mutationFn: async ({ pluginKey, isActive }: { pluginKey: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("installed_plugins")
        .update({ is_active: isActive })
        .eq("plugin_key", pluginKey);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installed-plugins"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update plugin", description: error.message, variant: "destructive" });
    },
  });

  const isInstalled = (key: string) => installedPlugins.some((p) => p.plugin_key === key);
  const isActive = (key: string) => installedPlugins.find((p) => p.plugin_key === key)?.is_active ?? false;
  const getPlugin = (key: string) => installedPlugins.find((p) => p.plugin_key === key);

  return {
    installedPlugins,
    isLoading,
    installPlugin,
    uninstallPlugin,
    togglePlugin,
    isInstalled,
    isActive,
    getPlugin,
  };
}
