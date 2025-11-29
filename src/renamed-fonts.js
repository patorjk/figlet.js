export const renamedFonts = {
  "ANSI-Compact": "ANSI Compact",
};

export const getFontName = (name) => {
  return renamedFonts[name] ? renamedFonts[name] : name;
};
