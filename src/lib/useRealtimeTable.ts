import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Row = { id: string; created_at: string };

/**
 * 加载某张表的全部数据，并订阅 Realtime 变更，保持列表实时同步。
 * 用 Map 去重，避免「初次查询」和「实时推送」之间产生重复条目。
 */
export function useRealtimeTable<T extends Row>(table: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const map = new Map<string, T>();

    const commit = () => {
      const arr = Array.from(map.values()).sort(
        (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
      );
      setRows(arr);
    };

    supabase
      .from(table)
      .select("*")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error(`加载 ${table} 失败：`, error.message);
        (data ?? []).forEach((r) => map.set((r as T).id, r as T));
        commit();
        setLoading(false);
      });

    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload: any) => {
          if (payload.eventType === "INSERT")
            map.set((payload.new as T).id, payload.new as T);
          else if (payload.eventType === "UPDATE")
            map.set((payload.new as T).id, payload.new as T);
          else if (payload.eventType === "DELETE")
            map.delete((payload.old as T).id);
          commit();
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [table]);

  return { rows, loading };
}
