import { NextApiRequest, NextApiResponse } from "next";
import { redis } from "../../../db/redis";
import { getSession } from "next-auth/react";
import { Dayjs } from "dayjs";

export default async function sheets(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  if (session) {
    const { action } = req.query;
    if (action.length === 1 && req.method === "GET") {
      const result = await redis.hgetall(`${action[0]}`);
      res.status(200).json({ data: result });
    } else if (
      action.length === 1 &&
      req.method === "POST" &&
      action[0].match(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)
    ) {
      const keys = action[0].split("-");
      const hashKey = keys[0] + "-" + keys[1];
      await redis.hset(hashKey, {
        [action[0]]: req.body,
      });

      const expireDate = new Date(parseInt(keys[0]), parseInt(keys[1]) + 1);
      await redis.expireat(hashKey, expireDate.getTime() / 1000);

      res.status(200).json({ message: "ok" });
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  } else {
    res.status(401).json({ message: "Unauthenticated" });
  }
}
