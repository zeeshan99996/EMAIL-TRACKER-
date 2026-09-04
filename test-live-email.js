async function test() {
  const res = await fetch('https://email-tracker-teal-phi.vercel.app/api/v1/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ek_live_demo123456789',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: 'muhammadzeeshan0477@gmail.com',
      subject: 'Live Real-Time Email Test',
      html: '<p>Testing live tracking <a href="https://erhatechnologies.com">Our Website</a></p>'
    })
  });
  const data = await res.json();
  console.log('API Result:', data);

  // Now check dashboard API
  const dashRes = await fetch('https://email-tracker-teal-phi.vercel.app/api/v1/dashboard');
  const dashData = await dashRes.json();
  console.log('Dashboard Data Summary:', dashData.summary);
  console.log('Total emails in dashboard:', dashData.emails ? dashData.emails.length : 0);
}
test();
