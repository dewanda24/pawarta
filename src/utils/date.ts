/**
 * Format tanggal standar Indonesia menggunakan Intl.DateTimeFormat native
 */
export function formatIndonesianDate(
  date: Date | string | number | null | undefined,
  includeTime = true
): string {
  if (!date) return '-';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(includeTime
      ? {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }
      : {}),
  };

  return new Intl.DateTimeFormat('id-ID', options).format(d);
}
