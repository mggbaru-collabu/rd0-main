import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { adminWhitelists } from "../../../config";
import { pg } from "./../../../db/knex";

export default async function accounts(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  switch (req.method) {
    case "GET":
      const result = await pg("infi_settings")
        .where("name", "accounts")
        .first();
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(200).json(result);
      break;
    case "POST":
      if (
        session &&
        adminWhitelists.indexOf(session.user!.email!.toLowerCase()) >= 0
      ) {
        await pg("infi_settings")
          .where("name", "accounts")
          .update("value", JSON.stringify(req.body.accounts));
        res.status(200).json({ message: "ok" });
      } else {
        res.status(401).json({ message: "unauthenticated" });
      }
      break;
    default:
      res.status(405).json({ message: "method not allowed" });
  }
}
