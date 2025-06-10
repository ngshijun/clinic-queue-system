export default async function handler(req, res) {
  const response = await fetch("http://protege.powerapi.powersoft.asia/auth/", {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
