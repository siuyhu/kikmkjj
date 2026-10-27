/** 把 ISO 时间转成「刚刚 / x 分钟前 / x 小时前 / x 天前」 */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} 天前`;
  return new Date(iso).toLocaleDateString("zh-CN");
}

/** 计算距离目标日期的实时剩余（或已过去）时间 */
export function countdownParts(targetDate: string) {
  const [y, m, d] = targetDate.split("-").map(Number);
  const target = new Date(y, m - 1, d, 0, 0, 0).getTime();
  const diff = target - Date.now();
  const isPast = diff < 0;
  const abs = Math.abs(diff);
  return {
    isPast,
    days: Math.floor(abs / 86400000),
    hours: Math.floor((abs % 86400000) / 3600000),
    mins: Math.floor((abs % 3600000) / 60000),
    secs: Math.floor((abs % 60000) / 1000),
  };
}

/** YYYY-MM-DD → 2026年12月31日 */
export function formatTargetDate(targetDate: string): string {
  const [y, m, d] = targetDate.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}
