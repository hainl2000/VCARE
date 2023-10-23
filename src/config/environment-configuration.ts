export default () => ({
  jwt: {
    expire: process.env.JWT_EXPIRE,
    refresh_expire: process.env.JWT_REFRESH_EXPIRE,
  },
  bucket: {
    project: process.env.BUCKET_PROJECT_ID,
    name: process.env.BUCKET_NAME,
    url: process.env.URL_BUCKET,
  },
});
