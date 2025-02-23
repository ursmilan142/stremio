const { addonBuilder } = require('stremio-addon-sdk');
const axios = require('axios');

const builder = new addonBuilder({
    id: 'org.example.milanaddon',
    version: '1.0.0',
    name: 'Milan Addon',
    logo: 'https://raw.githubusercontent.com/ursmilan142/stremio/53c8ee3a76cea216687d49292d37250f2cb2ee86/logo.jpg',
    description: 'An addon that provides streaming links.',
    catalogs: [],
    resources: ['stream'],
    types: ['movie'],
});

builder.defineStreamHandler(async ({ type, id }) => {
    if (type === 'movie') {
        try {
            // Fixed URL (removed duplicate https://)
            const response = await axios.get(`https://milan-s-addon.onrender.com/get_m3u8_url?tmdb_id=${id}`);
            
            const data = response.data;
            
            // Added better error handling
            if (data && data.variants) {
                return {
                    streams: Object.entries(data.variants).map(([resolution, variant]) => ({
                        title: `VidLink - ${resolution} (${variant.bandwidth}bps)`,
                        url: variant.url,
                        // Recommended to add these properties for better Stremio compatibility
                        behaviorHints: {
                            proxyHeaders: true,
                            notWebReady: true
                        }
                    })),
                };
            }
        } catch (error) {
            console.error('Error fetching streams:', error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
        }
    }
    return { streams: [] };
});

module.exports = builder.getInterface();
