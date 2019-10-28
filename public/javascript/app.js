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
      resultsElem.innerHTML = `Your short URL is: ${results.shortUrl}`;
    })  
    .catch(error => {
      console.log(error);
      error.json()
        .then((error) => resultsElem.innerHTML = error.message)
    })
});