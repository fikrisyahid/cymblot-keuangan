export default function generateSoftColor({
  index,
  total,
}: {
  index: number;
  total: number;
}) {
  const hue = (index / total) * 360;
  const saturation = 50;
  const lightness = 70;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
