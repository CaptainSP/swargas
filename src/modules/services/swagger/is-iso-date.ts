export function isIsoDate(str) {
  if (str.includes("T")) {
    // this is datetime
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str)) return false;
  } else {
    // this is date only
    if (!/\d{4}-\d{2}-\d{2}/.test(str)) return false;
  }
  const d = new Date(str);
  return (
    d instanceof Date && !isNaN(d.getTime()) && d.toISOString().startsWith(str)
  ); // valid date
}
