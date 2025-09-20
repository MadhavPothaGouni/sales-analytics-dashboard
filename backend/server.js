const express = require('express');
const path = require('path');
const app = express();

// Serve API routes
app.use('/api/analytics', require('./routes/analytics'));

// Serve static files from React frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch-all route for React frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
