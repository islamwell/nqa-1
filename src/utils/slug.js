export const slugify = (str) => {
  const cleaned = (str || '')
    .toString()
    .normalize()
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F\u200B]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return encodeURIComponent(cleaned)
    .replace(/%20+/g, '-')
    .replace(/%E2%80%8B/gi, '');
};

export const slugifyLower = (str) => slugify(str).toLowerCase();
