const ONES_WORDS = [
  'không',
  'một',
  'hai',
  'ba',
  'bốn',
  'năm',
  'sáu',
  'bảy',
  'tám',
  'chín',
];

export function readNumberVietnamese(n: number): string {
  const num = Math.max(0, Math.min(100, Math.round(n)));
  if (num < 10) return ONES_WORDS[num];
  if (num === 10) return 'mười';
  if (num === 100) return 'một trăm';

  const tens = Math.floor(num / 10);
  const ones = num % 10;

  if (tens === 1) {
    if (ones === 5) return 'mười lăm';
    return `mười ${ONES_WORDS[ones]}`;
  }

  const tensPart = `${ONES_WORDS[tens]} mươi`;
  if (ones === 0) return tensPart;
  if (ones === 1) return `${tensPart} mốt`;
  if (ones === 5) return `${tensPart} lăm`;
  return `${tensPart} ${ONES_WORDS[ones]}`;
}

export function capitalizeFirst(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}
