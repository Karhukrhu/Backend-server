require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow your frontend to talk to this backend (Replace with your actual frontend URL in production!)
app.use(cors({ origin: 'https://karhukarhu.place' })); 

// Create a secure endpoint for your frontend to call
app.get('/api/steam-profile', async (req, res) => {
    try {
        // Get the Steam ID from the frontend request (e.g., ?steamid=76561198000000000)
        const steamId = req.query.steamid;

        if (!steamId) {
            return res.status(400).json({ error: 'Steam ID is required' });
        }

        // The API key is safely read from the .env file on the server
        const apiKey = process.env.STEAM_API_KEY;
        
        // Example: Fetching player summaries from Steam
        const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
        
        const response = await axios.get(url);
        
        // Send ONLY the data your frontend actually needs back to the browser
        const playerData = response.data.response.players[0];
        
        res.json({
            personaname: playerData.personaname,
            avatar: playerData.avatarmedium,
            profileurl: playerData.profileurl,
            // Add any other specific fields you need
        });

    } catch (error) {
        console.error('Error fetching Steam data:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from Steam' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running securely on http://localhost:${PORT}`);
});