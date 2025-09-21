export const slugify = (str) => (
  encodeURIComponent((str || '').toString().trim()).replace(/%20+/g, '-')
);

export const slugifyLower = (str) => slugify(str).toLowerCase();
