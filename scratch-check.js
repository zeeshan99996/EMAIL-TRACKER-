async function check() {
  const res = await fetch('https://email-tracker-teal-phi.vercel.app/dashboard', {
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
  });
  console.log('Status:', res.status);
  console.log('Age header:', res.headers.get('age'));
  console.log('X-Vercel-Id:', res.headers.get('x-vercel-id'));
  const html = await res.text();
  const scriptMatches = html.match(/\/static\/chunks\/[^"'\s]+/g) || [];
  console.log('Script matches count:', scriptMatches.length);
  for (const s of scriptMatches.slice(0, 8)) {
    console.log('Script:', s);
  }
}
check();
