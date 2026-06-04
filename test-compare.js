fetch('http://localhost:3000/api/compare?s1=8fd4600e-4ba4-4df9-8b92-25384bad8466&s2=8fd4600e-4ba4-4df9-8b92-25384bad8466')
.then(res => res.json().then(data => ({ status: res.status, data })))
.then(result => console.log(JSON.stringify(result, null, 2)))
.catch(err => console.error(err));
