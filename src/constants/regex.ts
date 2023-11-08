export const dateRegex = new RegExp(
  /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/,
);

export const ISODateRegex = new RegExp(
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
);

export const ImageRegex = new RegExp(
  /^(user|admin|doctor|hospital)_[0-9]*_(\d{13})(|_\d{1}).png$/,
);
