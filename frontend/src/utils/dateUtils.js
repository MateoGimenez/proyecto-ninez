// Tus campos "created" / "update" vienen como timestamp ISO desde Supabase.
export function formatDate(isoString, locale = 'es-AR') {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(isoString, locale = 'es-AR') {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
