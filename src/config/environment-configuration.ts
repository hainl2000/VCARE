export default () => ({
  jwt: {
    expire: process.env.JWT_EXPIRE,
    refresh_expire: process.env.JWT_REFRESH_EXPIRE,
  },
});
