 const form = document.getElementById('signupForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
const res = await fetch('http://localhost:5000/api/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email }),
});

if (!res.ok) {
  const errorText = await res.text();
  console.error("Server responded with error:", res.status, errorText);
  throw new Error("Server Error");
}

      const data = await res.json();
      document.getElementById('message').innerText = data.message;
    });