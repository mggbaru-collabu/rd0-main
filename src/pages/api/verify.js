export default async function handler(req, res) {
  if (req.body.password === process.env.SECRET_KEY) {
    res.status(200).json({ message: "ok" });
  } else {
    res.status(400).json({ message: "wrong pwd" });
  }
}
