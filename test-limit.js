fetch('http://localhost:3000/api/salaries?limit=500')
.then(res => res.json().then(data => ({ status: res.status, meta: data.meta })))
.then(result => console.log(JSON.stringify(result, null, 2)))
.catch(err => console.error(err));
