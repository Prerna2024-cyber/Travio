(async () => {
  try {
    const url = 'http://localhost:5000/api/ride-requests/69591635aa19bd6c19976b7a/request';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' })
    });
    console.log('STATUS', res.status);
    const text = await res.text();
    console.log('BODY:\n', text.slice(0, 1000));
  } catch (err) {
    console.error('ERR', err.message);
  }
})();
