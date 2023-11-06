require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json(), cors());
app.options('*', cors());

// New endpoint for triggering the Zoom OAuth token acquisition
app.post('/getToken', (req, res) => {
  const zoomOAuthTokenUrl = 'https://zoom.us/oauth/token';
  const clientId = process.env.ZOOM_CLIENT_ID; // Get the client ID from environment variable
  const clientSecret = process.env.ZOOM_CLIENT_SECRET; // Get the client secret from environment variable
  const requestBody = {
    code: req.body.authorizationCode, // Get the authorization code from the request body
    grant_type: 'authorization_code',
    redirect_uri: req.body.redirectUri, // Get the redirect URI from the request body
    code_verifier: req.body.codeVerifier, // Get the code verifier from the request body
  };
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
  };

  axios
    .post(zoomOAuthTokenUrl, requestBody, { headers })
    .then((response) => {
      console.log('Response from Zoom OAuth token endpoint:', response.data);
      res.json(response.data);
    })
    .catch((error) => {
      console.error('Error obtaining Zoom OAuth token:', error);
      res.status(500).json({ error: 'Failed to obtain OAuth token' });
    });
});

app.post('/getMeetings', (req, res) => {
  const zoomMeetingsListUrl = 'https://api.zoom.us/v2/users/me/meetings';

  // Get the Zoom API access token from the request body
  const zoomApiAccessToken = req.body.zoomApiAccessToken; // Assuming it's in the request body

  if (!zoomApiAccessToken) {
    return res.status(400).json({ error: 'Zoom API access token is missing in the request body' });
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${zoomApiAccessToken}`,
  };

  axios
    .get(zoomMeetingsListUrl, { headers })
    .then((response) => {
      console.log('Response from Zoom Meetings List API:', response.data);
      res.json(response.data);
    })
    .catch((error) => {
      console.error('Error fetching Zoom Meetings List:', error);
      res.status(500).json({ error: 'Failed to fetch Zoom Meetings List' });
    });
});

app.listen(port, () =>
  console.log(`Zoom Video SDK Auth Endpoint Sample Node.js listening on port ${port}!`)
);
