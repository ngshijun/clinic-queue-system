export default async function handler(req, res) {
  const response = await fetch("http://protege.powerapi.powersoft.asia/api/protege/get_last_queue_no/", {
    method: req.method,
    headers: req.headers,
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
