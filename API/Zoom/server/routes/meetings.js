const express = require('express');
const router = express.Router();    
const axios = require('axios');
const tokenManager = require('../util/tokenmanager');

// API endpoint to fetch meetings 
router.get('/meetings', async (req, res) => {
    try {
        const token = await tokenManager.getToken();
        console.log('Fetching meetings with token:', token);  
        const response = await axios.get('https://api.zoom.us/v2/users/me/meetings', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Meetings response:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching meetings', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error fetching meetings' });
    }
});

// API endpoint to create meetings
router.post('/createMeeting', async (req, res) => {
    const { topic, start_time, type, duration, timezone, agenda, attendees } = req.body;

    try {
        const token = await tokenManager.getToken();

        // Request to Zoom API to create a meeting
        const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
            topic,
            type,
            start_time,
            duration,
            timezone,
            agenda,
            settings: {
                host_video: true,
                participant_video: true,
                join_before_host: false,
                mute_upon_entry: true,
                watermark: false,
                use_pmi: false,
                approval_type: 0,
                audio: 'both',
                auto_recording: 'cloud'
            }
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error creating meeting:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error creating meeting' });
    }
});


// API endpoint to delete a meeting
router.delete('/meetings/:id', async (req, res) => {
    const meetingId = req.params.id;

    try {
        const token = await tokenManager.getToken();

        // Request to Zoom API to delete the meeting
        await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        res.status(204).send(); // No content
    } catch (error) {
        console.error('Error deleting meeting:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error deleting meeting' });
    }
});


module.exports = router;
