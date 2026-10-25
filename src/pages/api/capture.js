const crypto = require("crypto");
// const { redis, Transaction } = require("./../../db");
const { redis } = require("../../db/redis");
const { pg } = require("../../db/knex");

async function execute(key, name, amount) {
  if (process.env.NODE_ENV === "development") {
    console.log(key, name, amount);
  } else {
    try {
      await pg
        .insert({
          key,
          name,
          amount,
        })
        .into("transactions");
    } catch (e) {
      console.log(key, name, amount, e.message);
    }
  }
}

export default async function handler(req, res) {
  let id = req?.body?.id || "empty";

  if (await redis.exists(id)) {
    res.status(200).json({ message: `OK already` });
    return;
  }
  await redis.set(id, "OK", "EX", 5);

  const diff = new Date().getTime() / 1000 - req.headers["x-timestamp"];
  if (diff < 0 || diff > 400 || Number.isNaN(diff)) {
    res.status(403).json({ message: `Wrong TimeStamp` });
    return;
  }
  const text =
    req.method +
    req.body.id +
    req.body.message +
    req.body.index +
    req.headers["x-timestamp"];

  const xAuthentication = crypto
    .createHmac("sha256", process.env.SECRET_KEY)
    .update(text)
    .digest("base64");

  if (xAuthentication !== req.headers["x-authentication"]) {
    res.status(403).json({ message: `Wrong HashMac` });
    return;
  }

  if (req.method === "POST") {
    const regex1 = /Hei, (.*) baru saja Kirim DANA ke kamu Rp(.*) !/;
    const regex2 =
      /Berhasil top up saldo Rp(.*) dari (.*). Lihat detailnya di sini!/;
    const regex3 = /Berhasil mengirim Rp(.*) ke (.*) - (.*) disini./;
    const regex4 =
      /Kamu menerima Rp(.*) dari (.*) dengan biaya admin. Cek detailnya di sini./;
    let message = req?.body?.message || "";
    // index
    let danaIndex = req?.body?.index || 0;

    let name = null;
    let amount = null;

    // name, amount
    if (message.match(regex1)) {
      name = message.replace(regex1, "$1");
      amount = message.replace(regex1, "$2").replaceAll(".", "");
    } else if (message.match(regex2)) {
      name = message.replace(regex2, "$2");
      amount = message.replace(regex2, "$1").replaceAll(".", "");
    } else if (message.match(regex3)) {
      name = message.replace(regex3, "$2");
      amount = "-" + message.replace(regex3, "$1").replaceAll(".", "");
    } else if (message.match(regex4)) {
      name = message.replace(regex4, "$2");
      amount = (
        parseInt(message.replace(regex4, "$1").replaceAll(".", "")) + 100
      ).toString();
    }

    if (amount !== null && name !== null && id !== "empty") {
      execute(danaIndex, name, amount)
        .then(() => {})
        .catch((e) => {
          console.log(req.body, e);
        });
    } else {
      console.log(`${field} not set`);
      console.log(req.body);
    }
    res.status(200).json({ message: "ok" });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
