const payload = {
  company: "Amazon",
  role: "SDE",
  level: "INVALID_LEVEL_123", // Invalid level
  location: "Bangalore",
  currency: "INR",
  experience_years: 5,
  base_salary: 4500000,
  bonus: 500000,
  stock: 1000000,
  total_compensation: 99999999,
  source: "CONTRIBUTOR",
  confidence_score: 0.9
};

fetch('http://localhost:3000/api/ingest-salary', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
.then(res => res.json().then(data => ({ status: res.status, data })))
.then(result => console.log(JSON.stringify(result, null, 2)))
.catch(err => console.error(err));
