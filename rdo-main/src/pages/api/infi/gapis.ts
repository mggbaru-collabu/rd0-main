import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { adminWhitelists } from "../../../config";
import { pg } from "../../../db/knex";

export default async function gapis(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      const result = await pg("gapis").select("code", "client_id");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(200).json(result);
      break;
    default:
      res.status(405).json({ message: "method not allowed" });
  }
}
