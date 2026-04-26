export function formatErrorDetail(err: any, fallback: string = "An error occurred"): string {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") {
    return detail;
  } else if (Array.isArray(detail)) {
    return detail.map((d: any) => {
      const loc = Array.isArray(d.loc) ? d.loc.join(".") : "";
      return loc ? `Error in ${loc}: ${d.msg}` : d.msg;
    }).join(" | ");
  }
  return fallback;
}
