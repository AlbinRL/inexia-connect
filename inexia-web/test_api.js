const fetch = require('node-fetch');

async function test() {
  const user = { nom: "Test", prenom: "Test", email: "testuser999@example.com", password: "password123" };
  
  await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  });

  const loginRes = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: user.email, password: user.password })
  });

  const loginData = await loginRes.json();
  const token = loginData.access_token || loginData.token;
  const userId = loginData.user?.id || 1;
  console.log("Got token");

  const urls = [
    `http://localhost:3000/reservations/user/${userId}`,
    `http://localhost:3000/reservations/utilisateur/${userId}`,
    "http://localhost:3000/reservations/me",
    "http://localhost:3000/reservations"
  ];

  for (const url of urls) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`URL: ${url} -> Status: ${res.status}`);
  }
}

test().catch(console.error);
