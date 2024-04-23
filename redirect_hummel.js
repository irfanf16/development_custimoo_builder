async function checkAndRedirect() {
  const countries = [ // To the designhummelus.com redirect countries
    'CA', 'MX', 'US', 'BZ', 'CR', 'SV', 'GT', 'HN', 'NI', 'PA', 'AI', 'AG', 'AW', 'BS', 'BB', 'BM', 'BQ', 'VG', 'KY', 'CU',
    'CW', 'DM', 'DO', 'GF', 'GD', 'GP', 'GY', 'HT', 'JM', 'MQ', 'MS', 'PR', 'KN', 'LC', 'MF', 'VC', 'SX', 'SR', 'TT', 'TC', 'VI'
  ];
  const no_redirect_countries = ['PK']

  const ip_request = await fetch("https://api.custimoo.com/api/ip-whitelist");
  const ip_whitelists = await ip_request.json();
  const request = await fetch("https://ipinfo.io/json?token=0589e0cd578afd");
  const jsonResponse = await request.json();

  if (!no_redirect_countries.includes(jsonResponse.country)) { // check if it is included in no_redirect_countries so then no redirects
    if (!ip_whitelists.includes(jsonResponse.ip)) { // check if it is included in IP white lists so then no redirects
      if (window.location.hostname !== 'designhummelus.com' && countries.includes(jsonResponse.country)) {
        window.location.href = 'https://designhummelus.com';
      } else if (window.location.hostname !== 'designhummel.com' && !countries.includes(jsonResponse.country)) {
        window.location.href = 'https://designhummel.com';
      }
    }
  }
}

checkAndRedirect();
