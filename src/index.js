export default {
  async scheduled(event, env, ctx) {
    // Parse the accounts from environment variable
    const accounts = JSON.parse(env.SPOTIFY_ACCOUNTS || '[]');
    
    if (accounts.length === 0) {
      console.error('No Spotify accounts configured');
      return;
    }

    switch (event.cron) {
      case '0 */1 * * *': // Every hour
        // Refresh access tokens for all accounts
        await Promise.all(
          accounts.map(async (account, index) => {
            try {
              const response = await fetch(
                `https://accounts.spotify.com/api/token?grant_type=refresh_token&refresh_token=${account.refreshToken}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: 'Basic ' + account.clientAuth,
                  },
                },
              );

              const tokenData = await response.json();
              if (!tokenData?.access_token) {
                console.error(`Failed to refresh access token for account ${index}`);
                return;
              }

              await env.spotifyAccessToken.put(`spotifyAccessToken_${index}`, tokenData.access_token);
              console.log(`Refreshed token for account ${index}`);
            } catch (error) {
              console.error(`Error refreshing token for account ${index}:`, error);
            }
          })
        );
        break;

      case '*/10 * * * *': // Every 10 minutes
        // Get last played tracks from all accounts and find the most recent one
        const lastPlayedTracks = await Promise.all(
          accounts.map(async (account, index) => {
            try {
              const accessToken = await env.spotifyAccessToken.get(`spotifyAccessToken_${index}`);
              
              if (!accessToken) {
                console.warn(`No access token available for account ${index}`);
                return null;
              }
              
              const data = await (
                await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                  },
                })
              ).json();

              if (!data.items?.[0]) {
                console.warn(`No recently played tracks found for account ${index}`);
                return null;
              }

              return {
                accountIndex: index,
                timestamp: new Date().toISOString(),
                name: data.items[0].track.name,
                artist: data.items[0].track.artists[0].name,
                album_cover: data.items[0].track.album.images[2].url,
                url: data.items[0].track.external_urls.spotify,
                duration_ms: data.items[0].track.duration_ms,
                played_at: data.items[0].played_at,
                played_at_time: new Date(data.items[0].played_at).getTime(),
              };
            } catch (error) {
              console.error(`Error fetching last played for account ${index}:`, error);
              return null;
            }
          })
        );

        // Filter out null results and find the most recently played track
        const validTracks = lastPlayedTracks.filter(track => track !== null);
        
        if (validTracks.length === 0) {
          console.error('No valid recently played tracks found from any account');
          return;
        }

        // Sort by played_at timestamp (newest first)
        validTracks.sort((a, b) => b.played_at_time - a.played_at_time);
        const mostRecentTrack = validTracks[0];
        
        // Remove internal properties before saving
        delete mostRecentTrack.played_at_time;

        await env.lastPlayedJSON.put(
          'lastPlayedJSON',
          JSON.stringify(mostRecentTrack).toString(),
        );
        
        console.log(`Updated last played with track "${mostRecentTrack.name}" by ${mostRecentTrack.artist}`);
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
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': 'https://hallin.media',
          },
        });
      }

      return new Response(lastPlayed, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=600',
          'Access-Control-Allow-Origin': 'https://hallin.media',
        },
      });
    } catch (error) {
      console.error('Error in fetch:', error);
      return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
        status: error.status || 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': 'https://hallin.media',
        },
      });
    }
  },
};
