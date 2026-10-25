import { OAuth2Client, UserRefreshClient } from "google-auth-library";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { pg } from "../../../db/knex";

export default async function gauth(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Access-Control-Allow-Headers, X-Requested-With"
  );
  if (req.method === "POST") {
    let clientId = process.env.GOOGLE_CLIENT_ID;
    let clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (req.body.brand) {
      const brand = await pg("gapis")
        .select("client_id", "client_secret")
        .where("code", req.body.brand)
        .first();
      if (brand) {
        clientId = brand.client_id;
        clientSecret = brand.client_secret;
      }
    }
    switch (req.query.action[0]) {
      case "token":
        const oAuth2Client = new OAuth2Client(
          clientId,
          clientSecret,
          "postmessage"
        );
        const { tokens } = await oAuth2Client.getToken(req.body.code);
        res.status(200).json({ data: tokens });
        break;
      case "refresh-token":
        const user = new UserRefreshClient(
          clientId,
          clientSecret,
          req.body.refresh_token
        );
        const { credentials } = await user.refreshAccessToken();
        res.status(200).json({ data: credentials });
        break;
    }
  } else if (req.method === "OPTIONS") {
    res.status(200).end();
  } else {
    res.status(405).json({ message: "method not allowed" });
  }
}
