import { useEffect, useState } from "react";
import { listItems } from "./api";

type Row = { id: string; created_at: string };

/**
 * 轮询加载某张表的数据（替代 Realtime，因为 Supabase 在国内不可直连）。
 * 默认每 5 秒刷新一次，实现“近实时”同步。
 */
export function usePollingTable<T extends Row>(table: string, intervalMs = 5000) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await listItems<T>(table);
        if (!active) return;
        setRows(data);
        setLoading(false);
      } catch (err) {
        console.error(`加载 ${table} 失败：`, err);
        if (active) setLoading(false);
      }
    }

    load();
    const t = setInterval(load, intervalMs);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [table, intervalMs]);

  return { rows, loading };
}
