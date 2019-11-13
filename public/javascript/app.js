const createFormElem = document.getElementById('createForm');

createFormElem.addEventListener('submit', (event) => {
  event.preventDefault();
  const longUrl = document.getElementById('longUrl').value;
  const resultsElem = document.getElementById('results');
  fetch('/create', { method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }, body: JSON.stringify({ longUrl: longUrl })})
    .then(response => {
      if (!response.ok) {
        throw response;
      }
      return response.json()
    })
    .then(results => {
      resultsElem.innerHTML = `<div class="success">Your short URL is: <a href="${results.shortUrl}">${results.shortUrl}</div>`;
    })  
    .catch(error => {
      error.json()
        .then((error) => resultsElem.innerHTML = `<div class="error">${error.message}</div>`);
    })
});