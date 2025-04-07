const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Allows the server to parse incoming JSON data.

const keysFilePath = './keys.json'; // Path to your keys storage file (keys.json).

// Ensure keys.json exists
if (!fs.existsSync(keysFilePath)) {
  fs.writeFileSync(keysFilePath, JSON.stringify({}));
}

// Function to read keys from keys.json
function readKeys() {
  return JSON.parse(fs.readFileSync(keysFilePath, 'utf8'));
}

// Function to write keys to keys.json
function writeKeys(data) {
  fs.writeFileSync(keysFilePath, JSON.stringify(data, null, 2));
}

// Endpoint to validate keys and tokens
app.post('/verify-key', (req, res) => {
  const { key, token } = req.body;

  // Check if the key and token are provided
  if (!key || !token) {
    return res.status(400).json({ success: false, message: 'Key or token missing' });
  }

  // Read the keys file
  const keysData = readKeys();

  // Check if the key is valid (exists in the keys file)
  if (keysData[key] && keysData[key].token === token) {
    return res.status(200).json({ success: true, message: 'Key validated successfully' });
  }

  // If the key/token is not valid
  return res.status(400).json({ success: false, message: 'Invalid key or token' });
});

// Endpoint to generate a new key and token
app.post('/generate-key', (req, res) => {
  const newKey = generateKey();
  const newToken = generateToken();

  // Save the new key and token in keys.json
  const keysData = readKeys();
  keysData[newKey] = { token: newToken, createdAt: Date.now() };
  writeKeys(keysData);

  // Send the new key and token to the client
  res.status(200).json({ key: newKey, token: newToken });
});

// Function to generate a random key (32 characters)
function generateKey() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Function to generate a random token (32 characters)
function generateToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
