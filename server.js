require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow your frontend to talk to this backend
app.use(cors({ origin: 'https://karhukarhu.place' })); 

// ==========================================
// ENDPOINT 1: Get basic profile info
// ==========================================
app.get('/api/steam-profile', async (req, res) => {
    try {
        const steamId = req.query.steamid;

        if (!steamId) {
            return res.status(400).json({ error: 'Steam ID is required' });
        }

        const apiKey = process.env.STEAM_API_KEY;
        const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
        
        const response = await axios.get(url);
        const playerData = response.data.response.players[0];
        
        res.json({
            personaname: playerData.personaname,
            avatar: playerData.avatarmedium,
            profileurl: playerData.profileurl,
        });

    } catch (error) {
        console.error('Error fetching Steam data:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from Steam' });
    }
});

// ==========================================
// ENDPOINT 2: Get last played game (NEW!)
// ==========================================
app.get('/api/last-played', async (req, res) => {
    try {
        const steamId = req.query.steamid;
        if (!steamId) return res.status(400).json({ error: 'Steam ID required' });

        const apiKey = process.env.STEAM_API_KEY;
        
        // Ask Steam for the 1 most recently played game
        const url = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${apiKey}&steamid=${steamId}&count=1`;
        
        const response = await axios.get(url);
        const games = response.data.response.games;

        // Check if there is a recently played game
        if (games && games.length > 0) {
            const game = games[0]; 
            
            // Format the icon URL correctly
            const iconUrl = `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`;

            res.json({
                name: game.name,
                icon: iconUrl,
                playtime: game.playtime_2weeks 
            });
        } else {
            // Fallback if no games played in the last 2 weeks
            res.json({ name: "Nothing recently!", icon: null });
        }

    } catch (error) {
        console.error('Error fetching last played game:', error.message);
        res.status(500).json({ error: 'Failed to fetch game data' });
    }
});
// ==========================================
// ENDPOINT 3: Get Last.fm Recent Track (NEW!)
// ==========================================
app.get('/api/lastfm-track', async (req, res) => {
    try {
        // Get the Last.fm username from the frontend request
        const username = req.query.username; 
        if (!username) return res.status(400).json({ error: 'Last.fm username required' });

        const apiKey = process.env.LASTFM_API_KEY;
        
        // Last.fm API endpoint to get the 1 most recent track
        const url = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`;
        
        const response = await axios.get(url);
        const tracks = response.data.recenttracks.track;

        if (tracks && tracks.length > 0) {
            const track = tracks[0]; // Get the most recent one
            
            // Last.fm returns images in an array. We want the largest one (index 3).
            const imageUrl = track.image[3]['#text'] || track.image[2]['#text'] || '';
            
            // Check if the track is currently playing right now
            const isNowPlaying = track['@attr'] && track['@attr'].nowplaying === 'true';

            res.json({
                name: track.name,
                artist: track.artist['#text'] || track.artist, // Handles different API response formats
                album: track.album['#text'] || track.album,
                image: imageUrl,
                nowPlaying: isNowPlaying
            });
        } else {
            res.json({ name: "No recent tracks", artist: "", album: "", image: "", nowPlaying: false });
        }

    } catch (error) {
        console.error('Error fetching Last.fm data:', error.message);
        res.status(500).json({ error: 'Failed to fetch Last.fm data' });
    }
});
// ==========================================
// START THE SERVER
// ==========================================
app.listen(PORT, () => {
    console.log(`Backend server running securely on http://localhost:${PORT}`);
});