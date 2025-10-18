const axios = require('axios');

class SportsApiService {
  constructor() {
    this.apiKey = process.env.ALLSPORTS_API_KEY;
    this.baseUrl = 'https://allsportsapi.com/api';
  }

  async fetchSouthAfricanFootball() {
    try {
      console.log('Fetching South African football data from AllSportsAPI...');
      
      // Try different endpoint format for AllSportsAPI
      const response = await axios.get(`${this.baseUrl}/football`, {
        params: {
          met: 'Livescore',
          APIkey: this.apiKey
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('AllSportsAPI Response Status:', response.status);
      console.log('AllSportsAPI Response Data Keys:', Object.keys(response.data || {}));

      if (!response.data || !response.data.result) {
        console.log('No football data received from AllSportsAPI, trying alternative endpoint...');
        
        // Try alternative endpoint
        const altResponse = await axios.get(`${this.baseUrl}/football`, {
          params: {
            met: 'Fixtures',
            APIkey: this.apiKey
          },
          timeout: 10000
        });

        if (!altResponse.data || !altResponse.data.result) {
          console.log('Alternative endpoint also failed, using mock data');
          return this.getMockSportsData();
        }

        // Use alternative response
        response.data = altResponse.data;
      }

      // Transform the data to match our article structure
      const sportsNews = response.data.result.slice(0, 10).map(match => ({
        title: `${match.event_home_team || 'Home'} vs ${match.event_away_team || 'Away'}`,
        description: `${match.league_name || 'Football'} match - ${match.event_status || 'Scheduled'}. ${match.event_stadium ? 'Venue: ' + match.event_stadium : ''}`,
        content: `Match between ${match.event_home_team} and ${match.event_away_team} in the ${match.league_name}. ${match.event_final_result || 'Match details will be updated.'}`,
        published_at: match.event_date || new Date().toISOString(),
        created_at: match.event_date || new Date().toISOString(),
        url_to_image: match.home_team_logo || match.away_team_logo || '/assets/sportsimages/football.jpeg',
        url: match.event_key ? `https://allsportsapi.com/match/${match.event_key}` : '#match-details',
        source: { name: 'AllSportsAPI Football' },
        category: 'sports',
        sport: 'Football',
        isExternal: false,
        match_status: match.event_final_result || match.event_status || 'Scheduled'
      }));

      console.log(`Transformed ${sportsNews.length} football matches from AllSportsAPI`);
      return sportsNews;

    } catch (error) {
      console.error('Error fetching from AllSportsAPI:', error.response?.status, error.response?.statusText || error.message);
      console.log('API Error details:', error.response?.data);
      
      // Return mock sports data as fallback
      return this.getMockSportsData();
    }
  }

  async fetchGeneralSports() {
    try {
      console.log('Fetching general sports data...');
      
      // Try to get basketball or other sports data
      const response = await axios.get(`${this.baseUrl}/basketball`, {
        params: {
          met: 'Fixtures',
          APIkey: this.apiKey
        },
        timeout: 10000
      });

      if (response.data && response.data.result) {
        const basketballNews = response.data.result.slice(0, 5).map(match => ({
          title: `Basketball: ${match.event_home_team || 'Home'} vs ${match.event_away_team || 'Away'}`,
          description: `Basketball match in ${match.league_name || 'League'} on ${new Date(match.event_date).toLocaleDateString()}`,
          content: `Basketball game between ${match.event_home_team} and ${match.event_away_team}`,
          published_at: match.event_date || new Date().toISOString(),
          created_at: match.event_date || new Date().toISOString(),
          url_to_image: '/assets/sportsimages/basketball.jpeg',
          url: `#basketball-${match.event_key || Date.now()}`,
          source: { name: 'AllSportsAPI - Basketball' },
          category: 'sports',
          sport: 'Basketball',
          isExternal: false
        }));

        return basketballNews;
      }

      return [];
    } catch (error) {
      console.error('Error fetching basketball data:', error.message);
      return [];
    }
  }

  getMockSportsData() {
    // Enhanced fallback mock data with more realistic South African sports content
    return [
      {
        title: 'Kaizer Chiefs vs Orlando Pirates - Soweto Derby',
        description: 'The biggest match in South African football as Chiefs take on Pirates in the legendary Soweto Derby at FNB Stadium.',
        content: 'The Soweto Derby between Kaizer Chiefs and Orlando Pirates is always a spectacle. Both teams are preparing for this crucial PSL encounter that could shape the title race.',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        url_to_image: '/assets/sportsimages/football.jpeg',
        url: '/sports', // Link back to sports page instead of placeholder
        source: { name: 'PSL Official' },
        category: 'sports',
        isExternal: false,
        match_status: 'Upcoming',
        sport: 'Football'
      },
      {
        title: 'Mamelodi Sundowns Extends League Lead',
        description: 'Sundowns secured a convincing 3-0 victory to maintain their position at the top of the PSL table.',
        content: 'Mamelodi Sundowns continued their impressive form with goals from Themba Zwane, Peter Shalulile, and Neo Maema in a dominant display.',
        published_at: new Date(Date.now() - 2*60*60*1000).toISOString(),
        created_at: new Date(Date.now() - 2*60*60*1000).toISOString(),
        url_to_image: '/assets/sportsimages/footballteam.jpeg',
        url: '/sports',
        source: { name: 'SuperSport' },
        category: 'sports',
        isExternal: false,
        match_status: 'Final: 3-0',
        sport: 'Football'
      },
      {
        title: 'Springboks Squad Announced for Rugby Championship',
        description: 'Coach Jacques Nienaber has named a strong 35-man squad for the upcoming Rugby Championship fixtures.',
        content: 'The Springboks squad features the return of several key players from injury, with exciting new caps also included for the tournament.',
        published_at: new Date(Date.now() - 4*60*60*1000).toISOString(),
        created_at: new Date(Date.now() - 4*60*60*1000).toISOString(),
        url_to_image: '/assets/sportsimages/logo.jpg',
        url: '/sports',
        source: { name: 'SA Rugby' },
        category: 'sports',
        isExternal: false,
        match_status: 'Squad News',
        sport: 'Rugby'
      },
      {
        title: 'Proteas Cricket Team Prepares for Australia Tour',
        description: 'The national cricket team has begun preparations for the challenging tour of Australia with intensive training camps.',
        content: 'Captain Temba Bavuma leads a balanced Proteas squad as they prepare for three Test matches and a T20 series Down Under.',
        published_at: new Date(Date.now() - 6*60*60*1000).toISOString(),
        created_at: new Date(Date.now() - 6*60*60*1000).toISOString(),
        url_to_image: '/assets/sportsimages/logo.jpg',
        url: '/sports',
        source: { name: 'Cricket SA' },
        category: 'sports',
        isExternal: false,
        match_status: 'Tour Preparation',
        sport: 'Cricket'
      },
      {
        title: 'Cape Town City Signs New Midfielder',
        description: 'The Citizens have strengthened their squad with the signing of a talented midfielder from the NFD.',
        content: 'Cape Town City FC announced the acquisition of the promising young player who impressed scouts during the lower division campaigns.',
        published_at: new Date(Date.now() - 8*60*60*1000).toISOString(),
        created_at: new Date(Date.now() - 8*60*60*1000).toISOString(),
        url_to_image: '/assets/sportsimages/footballteam.jpeg',
        url: '#city-signing',
        source: { name: 'CTCFC Media' },
        category: 'sports',
        isExternal: false,
        match_status: 'Transfer News',
        sport: 'Football'
      },
      {
        title: 'Limpopo Basketball Championships Begin',
        description: 'The provincial basketball tournament kicks off with 16 teams competing for the championship title.',
        content: 'Teams from across Limpopo will compete in the annual basketball championships at the University of Limpopo sports complex.',
        published_at: new Date(Date.now() - 10*60*60*1000).toISOString(),
        created_at: new Date(Date.now() - 10*60*60*1000).toISOString(),
        url_to_image: '/assets/sportsimages/basketball.jpeg',
        url: '#limpopo-basketball',
        source: { name: 'Limpopo Sports' },
        category: 'sports',
        isExternal: false,
        match_status: 'Tournament Starts',
        sport: 'Basketball'
      },
      {
        title: 'Tennis SA Junior Championships in Polokwane',
        description: 'Young tennis talents from across the country converge on Polokwane for the national junior championships.',
        content: 'The tournament will showcase the best junior tennis talent in South Africa, with several promising players from Limpopo participating.',
        published_at: new Date(Date.now() - 12*60*60*1000).toISOString(),
        created_at: new Date(Date.now() - 12*60*60*1000).toISOString(),
        url_to_image: '/assets/sportsimages/tennis.jpeg',
        url: '#junior-tennis',
        source: { name: 'Tennis SA' },
        category: 'sports',
        isExternal: false,
        match_status: 'Day 2 in Progress',
        sport: 'Tennis'
      },
      {
        title: 'Athletics SA Championships Preview',
        description: 'The premier track and field event of the year takes place in Pretoria with Olympic hopefuls in action.',
        content: 'Several athletes will be looking to secure qualifying times for international competitions at the national championships.',
        published_at: new Date(Date.now() - 14*60*60*1000).toISOString(),
        created_at: new Date(Date.now() - 14*60*60*1000).toISOString(),
        url_to_image: '/assets/sportsimages/logo.jpg',
        url: '#athletics-champs',
        source: { name: 'Athletics SA' },
        category: 'sports',
        isExternal: false,
        match_status: 'This Weekend',
        sport: 'Athletics'
      },
      {
        title: 'Sundowns Ladies Remain Unbeaten',
        description: 'The women\'s football team extended their perfect record with another commanding victory in the national league.',
        content: 'Mamelodi Sundowns Ladies showcased their quality once again, maintaining their position at the top of the women\'s league table.',
        published_at: new Date(Date.now() - 16*60*60*1000).toISOString(),
        created_at: new Date(Date.now() - 16*60*60*1000).toISOString(),
        url_to_image: '/assets/sportsimages/footballteam.jpeg',
        url: '#sundowns-ladies',
        source: { name: 'SAFA Women' },
        category: 'sports',
        isExternal: false,
        match_status: 'Final: 4-1',
        sport: 'Football'
      },
      {
        title: 'Swimming Galas Return to Limpopo Pools',
        description: 'Provincial swimming competitions resume after renovation of facilities, featuring age-group championships.',
        content: 'The updated aquatic facilities in Tzaneen will host the return of competitive swimming events in the province.',
        published_at: new Date(Date.now() - 18*60*60*1000).toISOString(),
        created_at: new Date(Date.now() - 18*60*60*1000).toISOString(),
        url_to_image: '/assets/sportsimages/logo.jpg',
        url: '#swimming-return',
        source: { name: 'Limpopo Aquatics' },
        category: 'sports',
        isExternal: false,
        match_status: 'Next Month',
        sport: 'Swimming'
      },
      {
        title: 'Orlando Pirates Eye Continental Glory',
        description: 'The Buccaneers prepare for their CAF Champions League campaign with high hopes and a strengthened squad.',
        content: 'Orlando Pirates have made strategic signings ahead of their continental campaign, aiming to make a strong impression in African football.',
        published_at: new Date(Date.now() - 20*60*60*1000).toISOString(),
        created_at: new Date(Date.now() - 20*60*60*1000).toISOString(),
        url_to_image: '/assets/sportsimages/football.jpeg',
        url: '#pirates-continental',
        source: { name: 'CAF Media' },
        category: 'sports',
        isExternal: false,
        match_status: 'Squad Building',
        sport: 'Football'
      },
      {
        title: 'Limpopo Golf Pro-Am Tournament Success',
        description: 'The annual golf tournament in Polokwane attracts professional and amateur players from across South Africa.',
        content: 'The scenic Polokwane Golf Club hosted another successful Pro-Am event, raising funds for local sports development programs.',
        published_at: new Date(Date.now() - 22*60*60*1000).toISOString(),
        created_at: new Date(Date.now() - 22*60*60*1000).toISOString(),
        url_to_image: '/assets/sportsimages/logo.jpg',
        url: '#golf-proam',
        source: { name: 'Limpopo Golf' },
        category: 'sports',
        isExternal: false,
        match_status: 'Tournament Complete',
        sport: 'Golf'
      }
    ];
  }

  async getAllSportsNews() {
    try {
      // Fetch multiple sports data
      const footballPromise = this.fetchSouthAfricanFootball();
      const basketballPromise = this.fetchGeneralSports();

      const [footballData, basketballData] = await Promise.allSettled([
        footballPromise,
        basketballPromise
      ]);

      let allSportsNews = [];

      if (footballData.status === 'fulfilled') {
        allSportsNews = allSportsNews.concat(footballData.value);
      }

      if (basketballData.status === 'fulfilled') {
        allSportsNews = allSportsNews.concat(basketballData.value);
      }

      // If no data from API, use mock data
      if (allSportsNews.length === 0) {
        allSportsNews = this.getMockSportsData();
      }

      // Sort by date (newest first)
      allSportsNews.sort((a, b) => {
        const dateA = new Date(a.published_at);
        const dateB = new Date(b.published_at);
        return dateB - dateA;
      });

      return allSportsNews.slice(0, 15); // Limit to 15 items
    } catch (error) {
      console.error('Error in getAllSportsNews:', error);
      return this.getMockSportsData();
    }
  }
}

module.exports = new SportsApiService();