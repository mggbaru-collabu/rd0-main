import Redis from "ioredis";

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var redis: Redis | undefined;
}

export const redis =
  global.redis ||
  new Redis(
    15815,
    "redis-15815.c252.ap-southeast-1-1.ec2.cloud.redislabs.com",
    {
      username: "default",
      password: "XhQ6NxrGSeQPwQUsboqi14z6O5UnaHvV",
    }
  );
if (process.env.NODE_ENV !== "production") {
  global.redis = redis;
}
