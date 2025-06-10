export function GET(request) {
  return new Response(process.env.API_TOKEN);
}