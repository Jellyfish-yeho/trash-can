const categoryColors: Record<string, string> = {};
const palette = [
  "bg-rose-100 text-rose-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-teal-100 text-teal-700",
];
let colorIdx = 0;

export function getCategoryColor(cat: string): string {
  if (!categoryColors[cat]) {
    categoryColors[cat] = palette[colorIdx % palette.length];
    colorIdx++;
  }
  return categoryColors[cat];
}
