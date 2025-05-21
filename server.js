const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static('public')); // Serve frontend from /public

const serviceAccount = require(path.join(__dirname, 'userConfig.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();

app.get('/users', async (req, res) => {
  try {
    let allUsers = [];

    const listAllUsers = async (nextPageToken) => {
      const result = await auth.listUsers(1000, nextPageToken);
      allUsers = allUsers.concat(
        result.users.map(user => ({
          email: user.email,
          displayName: user.displayName || '',
          country: user.customClaims?.country || '',
        }))
      );

      if (result.pageToken) {
        await listAllUsers(result.pageToken);
      }
    };

    await listAllUsers();
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.listen(5050, () => {
  console.log('🚀 Server running on http://localhost:5050');
});
