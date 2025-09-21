export const slugify = (str) => {
  const cleaned = (str || '')
    .toString()
    .normalize()
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return encodeURIComponent(cleaned)
    .replace(/%20+/g, '-')
    .replace(/%E2%80%8B/gi, '');
};

export const slugifyLower = (str) => slugify(str).toLowerCase();
