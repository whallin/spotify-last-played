export default {
  async scheduled(event, env, ctx) {
    switch (event.cron) {
      case '0 */1 * * *': // Every hour
        // Refresh access token
        await (async () => {
          const response = await fetch(
            `https://accounts.spotify.com/api/token?grant_type=refresh_token&refresh_token=${env.SPOTIFY_REFRESH_TOKEN}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic ' + env.SPOTIFY_CLIENT_IDSECRET_AUTH64,
              },
            },
          );

          const tokenData = await response.json();
          if (!tokenData?.access_token) {
            console.error('Failed to refresh access token');
            return;
          }

          await env.spotifyAccessToken.put('spotifyAccessToken', tokenData.access_token);
        })();
        break;

      case '*/10 * * * *': // Every 10 minutes
        // Get last played
        await (async () => {
          const data = await (
            await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await env.spotifyAccessToken.get('spotifyAccessToken')}`,
              },
            })
          ).json();

          if (!data.items?.[0]) {
            console.error('No recently played tracks found');
            return;
          }

          await env.lastPlayedJSON.put(
            'lastPlayedJSON',
            JSON.stringify({
              timestamp: new Date().toISOString(),
              name: data.items[0].track.name,
              artist: data.items[0].track.artists[0].name,
              album_cover: data.items[0].track.album.images[2].url,
              url: data.items[0].track.external_urls.spotify,
              duration_ms: data.items[0].track.duration_ms,
              played_at: data.items[0].played_at,
            }).toString(),
          );
        })();
        break;
    }
  },

  // Return the last played data
  async fetch(request, env, ctx) {
    try {
      const lastPlayed = await env.lastPlayedJSON.get('lastPlayedJSON');

      if (!lastPlayed) {
        console.warn('No last played data available');
        return new Response(JSON.stringify({ error: 'No data available' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      return new Response(lastPlayed, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=600',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('Error in fetch:', error);
      return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
        status: error.status || 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
