function cloneSeed(obj) {
  return typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));
}

function escAttr(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function bulletsHtmlFromText(value, emptyText = 'No details yet.') {
  const items = String(value || '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
  if (!items.length) return `<div style="color: var(--text-muted); font-size: 0.82rem;">${escAttr(emptyText)}</div>`;
  return `<ul style="margin:0; padding-left:18px;">${items.map((x) => `<li>${escAttr(x)}</li>`).join('')}</ul>`;
}

/** First YYYY-MM-DD from a stored date or datetime string (for type="date"). */
function normalizeDateInputValue(v) {
  if (v == null || v === '') return '';
  const s = String(v).trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : '';
}

// App Data (seed → mutable copies; optional load from PostgreSQL via /api/state)
const SEED_ARCS = [
  {
    id: 'arc-health',
    title: 'Cindy Health & Fitness: The Build Up',
    status: 'active',
    type: 'Arc',
    date: 'Spring 2026',
    location: 'Miami / LA Gyms',
    goals: ['Build physical stamina for the massive tours', 'Inspire audience to get healthy', 'Transform physique'],
    clothing: ['Athleisure wear', 'Sweatbands', 'Custom gym shoes'],
    activities: [
      '100-day fitness challenge',
      'Training with professional athletes',
      'Diet and meal prep streams'
    ],
    prompts: [
      'Reacting to her own lack of stamina',
      'Trying weird fitness trends'
    ],
    narrative: 'Before she can take on the intense travel schedule of the NBA and NFL arena tours, Cindy needs to get in shape. This arc focuses on her physical and mental transformation, proving she can commit to the grind.',
    clippingNarrative: 'Show the struggle and the progress. Funny moments of her failing at workouts, mixed with genuine growth and hype moments.',
    trailerIdeas: 'Rocky-style training montage but heavily comedic. Cutting between her on a treadmill and hyping herself up in the mirror.',
    posterIdeas: 'Before/After graphic style, but the "After" is just slightly more confident.',
    budget: '$50,000 (Trainers & Nutritionists)'
  },
  {
    id: 'arc-nhl',
    title: 'Cindy x NHL: The Ultimate Arena Tour',
    status: 'planning',
    type: 'Arc',
    date: 'Winter 2026',
    location: 'NHL Arenas (USA/Canada)',
    goals: ['Official NHL partnership', 'Rate all 32 arenas', 'Bring Gen-Z to hockey'],
    clothing: ['Custom NHL jerseys', 'Oversized streetwear jackets', 'Beanies'],
    activities: [
      'Rating arena food',
      'Rating the ambiance and music',
      'Meeting the best players on the ice',
      'Testing the most comfortable seats',
      'Interviewing the most passionate fans'
    ],
    prompts: [
      '"Who really has the best hotdogs in the NHL?"',
      'Trying to ice skate for the first time',
      'Chirping with the enforcers'
    ],
    narrative: 'Hockey has a reputation for being traditional. Cindy is coming in to see which arena truly has the best vibes, food, and fans, bridging the gap between streaming culture and the ice.',
    clippingNarrative: 'Focus on Cindy reacting to the cold, her attempts at skating, and her brutal honesty when rating stadium food.',
    trailerIdeas: 'Fast-paced cuts of hockey hits, sirens sounding, mixed with Cindy screaming in the stands holding a giant pretzel. Text: "THE COLDEST ARC YET".',
    posterIdeas: 'Cindy in a half-unzipped custom hockey jersey, missing a tooth (edited), holding a glowing neon hockey stick.',
    budget: '$120,000'
  },
  {
    id: 'arc-nba',
    title: 'Cindy x NBA: The Season Opener Stadium Tour',
    status: 'planning',
    type: 'Arc',
    date: 'Oct 2026 (Next Season)',
    location: 'All 30 NBA Arenas',
    goals: ['Rate every NBA stadium experience', 'Crossover to mainstream basketball audience'],
    clothing: ['Courtside high-fashion', 'Vintage NBA jackets', 'Sneakerhead fits'],
    activities: [
      'Courtside food reviews',
      'Rating the halftime shows and ambiance',
      'Interacting with the craziest fans',
      'Testing the VIP/Courtside seats',
      'Post-game locker room access with star players'
    ],
    prompts: [
      'Asking players who has the best drip in the league',
      'Rating fans shoes on the street outside the arena'
    ],
    narrative: "When the season starts next year, Cindy is going on a massive tour to every team's stadium to definitively rank who has the best food, ambiance, players, fans, and most comfortable seats.",
    clippingNarrative: 'Show the scale of the tour. Highlight interactions with massive NBA stars, showcasing mutual respect and funny courtside antics.',
    trailerIdeas: "Dramatic sports documentary style. Black and white footage of empty arenas, lighting up neon green one by one as Cindy walks in.",
    posterIdeas: 'Split face graphic: Half Cindy, Half an NBA superstar, with a neon basketball bridging the gap.',
    budget: '$300,000 (Production & Travel)',
    linkedStreams: []
  },
  {
    id: 'arc-nfl',
    title: 'Cindy x NFL: Tailgate Takeovers',
    status: 'planning',
    type: 'Arc',
    date: 'Fall 2026',
    location: 'NFL Stadiums',
    goals: ['Capture the craziest tailgate culture', 'Show stadium fan culture with respect and energy'],
    clothing: ['Face paint', 'Custom shoulder pads over hoodies', 'Team-specific gear'],
    activities: [
      'Crashing the biggest tailgates (Bills Mafia, Raiders)',
      'Eating crazy parking lot food',
      'Throwing passes with starting QBs'
    ],
    prompts: [
      'Jumping through a folding table',
      'Debating the most passionate fans'
    ],
    narrative: 'Football is religion in America. Cindy is diving headfirst into the most intense fanbases to see if she can survive the wildest tailgates in the NFL.',
    clippingNarrative: 'Focus on pure chaos. Cindy amidst thousands of screaming fans, eating massive BBQ plates, and participating in crazy tailgate traditions.',
    trailerIdeas: 'Cindy stepping out of an RV into a sea of face-painted fans, smoke grenades going off.',
    posterIdeas: 'Cindy wearing a helmet that is way too big for her, holding a football like a trophy in a smoky parking lot.',
    budget: '$150,000'
  },
  {
    id: 'arc-f1',
    title: 'Cindy x F1: The Global Grid',
    status: 'planning',
    type: 'Arc',
    date: 'Summer 2027',
    location: 'Monaco, Vegas, Miami',
    goals: ['Access the ultra-luxury sports market', 'Global exposure'],
    clothing: ['Custom racing suits', 'Designer sunglasses', 'Paddock club casual'],
    activities: [
      'Paddock club luxury reviews',
      'Riding in a two-seater F1 car',
      'Interviewing drivers on the grid walk'
    ],
    prompts: [
      'Asking billionaires what they do for a living',
      'Trying to understand British racing slang'
    ],
    narrative: 'Taking the stream to the absolute peak of luxury and speed. From the chaos of the internet to the refined, elite world of Formula 1.',
    clippingNarrative: 'Fish-out-of-water comedy. Cindy in ultra-high-end environments, interacting with billionaires and elite drivers, bringing her signature energy to the grid.',
    trailerIdeas: 'Slow motion shots of F1 cars flying by, cut with Cindy trying to pop champagne on a yacht.',
    posterIdeas: 'Cindy in a neon-green racing suit, holding a steering wheel, looking completely out of place but confident.',
    linkedStreams: [],
    budget: '$500,000+'
  },
  {
    id: 'arc-college-takeovers',
    title: 'College Takeovers with Alabama Barker',
    status: 'planning',
    type: 'Arc',
    date: '2026 tour (4 stops)',
    location: 'USC (LA) · University of Miami · University of Alabama · UT Austin',
    goals: [
      'Four campus-scale takeovers with Alabama Barker as the through-line',
      'Each stop books a headliner (or crew) born in that state — CA, FL, AL, TX',
      'Tour feel: routing, production, and state-pride story beats across all four colleges'
    ],
    clothing: ['Campus streetwear', 'SEC / Pac-12 / Big 12 nods in palette', 'Heat-ready Miami fits vs. layered Bama nights'],
    activities: [
      'USC — California-born headliner (or collective) on the bill',
      'University of Miami — Florida-born headliner on the bill',
      'University of Alabama — Alabama-born headliner on the bill',
      'UT Austin — Texas-born headliner on the bill',
      'Barker segments: handoffs, crowd energy checks, and “prove you’re from here” moments with each opener'
    ],
    prompts: [
      'State vs. state crowd chant (good-natured) before the hometown act',
      'Barker + local Greek / band row sampling (where permitted)'
    ],
    narrative: 'A four-school takeover tour — USC, the U (Miami), Alabama, and Texas — built around Alabama Barker. Every market gets a performer rooted in that state so the show feels native to the campus, not flown in blind.',
    clippingNarrative: 'Travel montages between four iconic quads, Barker bridging sets, hometown hero walkouts, and “this one’s for [state]” peaks.',
    trailerIdeas: 'Four-way split title card → four campus establishing shots → one shared chant; Barker on the mic: “Same tour. Four states. Your people on stage.”',
    posterIdeas: 'Four panels (palm / neon / crimson / burnt orange) with Barker center; small map line connecting the four pins.',
    budget: 'TBD (four-market routing + artist guarantees)'
  },
  {
    id: 'stream-1',
    title: 'Summer Prep: Networking in LA',
    status: 'active',
    type: 'IRL',
    date: 'This Summer',
    location: 'LA Exclusive Events',
    security: 'Big Mike + 2',
    driver: 'John',
    segments: [
      { title: 'Dinner with Agency Execs', duration: '2 hrs', goals: 'Make connections for the NBA/NHL arcs', narrative: 'Show the business side, serious but funny moments.' },
      { title: 'Paparazzi Walk', duration: '30 mins', goals: 'Generate hype and headlines', narrative: 'Cindy acting like an A-lister, funny interactions with photographers.' }
    ]
  },
  {
    id: 'stream-2',
    title: 'Sports Knowledge Test',
    status: 'active',
    type: 'Desktop',
    date: 'Next Wednesday 9PM',
    location: 'Miami Setup',
    segments: [
      { title: 'Rating Stadium Foods Online', duration: '1 hr', goals: 'Prep for the upcoming stadium tours', narrative: 'Outrageous reactions to crazy stadium foods.' },
      { title: 'Learning Hockey Rules', duration: '45 mins', goals: 'Prepare for NHL arc', narrative: 'Cindy completely failing to understand icing and offsides.' }
    ]
  },
  {
    id: 'stream-3',
    title: 'Meeting the NBA Contacts',
    status: 'planning',
    type: 'Collab',
    date: 'Sunday 5PM',
    location: 'Miami Basketball Court',
    collabWith: 'LaMelo Ball',
    security: 'Big Mike',
    driver: 'John',
    segments: [
      { title: 'Pitching the Stadium Tour', duration: '1 hr', goals: 'Get the player cosign', narrative: 'Players laughing at Cindy\'s ambitious stadium tour plans.' }
    ]
  }
];
let arcsData = [];

const SEED_GOALS = [
  {
    id: 'goal-1',
    category: 'NBA Integration',
    title: 'Get invited to NBA Celebrity All-Star Game',
    status: 'In Progress',
    linkedArcs: ['arc-health', 'arc-nba'],
    linkedStreams: ['stream-3'],
    description: 'Leverage the stadium tours and health transformation to secure a roster spot in the All-Star game.',
    actionItems: [
      'Network with NBA front offices during stadium visits',
      'Post daily basketball training progress'
    ]
  },
  {
    id: 'goal-2',
    category: 'NBA Integration',
    title: 'Get NBA Celebrity All Star Game MVP',
    status: 'Planning',
    linkedArcs: ['arc-health'],
    linkedStreams: [],
    description: 'Once invited, Cindy needs to physically prepare to dominate the court and win MVP.',
    actionItems: [
      'Hire professional shooting coach',
      'Play 1v1s against lower-tier influencers for practice'
    ]
  },
  { id: 'goal-3', category: 'Streaming Awards', title: 'Best IRL Streamer', status: 'In Progress', linkedArcs: [], linkedStreams: [], description: 'Win the Best IRL Streamer award at the Streamer Awards.', actionItems: ['Maintain high quality IRL broadcasts', 'Innovate new IRL setups'] },
  { id: 'goal-4', category: 'Streaming Awards', title: 'Best Just Chatting Streamer', status: 'Planning', linkedArcs: [], linkedStreams: [], description: 'Dominate the Just Chatting category through engaging narratives.', actionItems: ['Host weekly structured chatting segments'] },
  { id: 'goal-5', category: 'Streaming Awards', title: 'Best Variety Streamer', status: 'Planning', linkedArcs: [], linkedStreams: [], description: 'Showcase diverse content formats beyond traditional IRL or gaming.', actionItems: ['Integrate high-production arcs (NHL, NBA)'] },
  { id: 'goal-6', category: 'Streaming Awards', title: 'Streamer of the Year', status: 'In Progress', linkedArcs: ['arc-nhl', 'arc-nba'], linkedStreams: [], description: 'The ultimate goal: become the undeniable face of streaming for the year.', actionItems: ['Consistent virality', 'High-impact collabs that feel earned'] },
  { id: 'goal-7', category: 'Streaming Awards', title: 'Best Streamed Series', status: 'Planning', linkedArcs: ['arc-nhl', 'arc-nba'], linkedStreams: [], description: 'Win an award for the best episodic streamed content.', actionItems: ['Structure the stadium tours as seasonal content'] },
  { id: 'goal-8', category: 'Streaming Awards', title: 'Best Sports Streamer', status: 'Planning', linkedArcs: ['arc-nhl', 'arc-nba'], linkedStreams: [], description: 'Solidify Cindy as the premier sports streamer.', actionItems: ['Collaborate with active professional athletes'] },
  { id: 'goal-9', category: 'Streaming Awards', title: 'Best Streamed Collab', status: 'Planning', linkedArcs: [], linkedStreams: [], description: 'Execute a historic collaboration that breaks viewership records.', actionItems: ['Secure an A-list celebrity collab'] },
  { id: 'goal-10', category: 'Streaming Awards', title: 'Best Marathon Stream', status: 'Planning', linkedArcs: [], linkedStreams: [], description: 'Host a massive, continuous marathon stream.', actionItems: ['Plan a 24-48 hour subathon with structured events'] },
  { id: 'goal-11', category: 'Streaming Awards', title: 'Best Reality Streamer', status: 'Planning', linkedArcs: [], linkedStreams: [], description: 'Blur the line between reality TV and live streaming.', actionItems: ['Use multi-cam setups for major IRL events'] },
  { id: 'goal-12', category: 'Streaming Awards', title: 'Best Stream Duo', status: 'Planning', linkedArcs: [], linkedStreams: [], description: 'Form a legendary streaming duo for specific segments.', actionItems: ['Find a permanent co-host for specific arcs'] }
];
let goalsData = [];

const SEED_CALENDAR = [];
let calendarEvents = cloneSeed(SEED_CALENDAR);
const displayedCalendarDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

const SEED_NARRATIVES = [];
let narratives = cloneSeed(SEED_NARRATIVES);

let segmentBankData = [];

function normClipUrl(u) {
  return String(u || '').trim().toLowerCase();
}

function normalizeStandalonePostedClip(c) {
  if (!c || typeof c !== 'object') return null;
  const url = String(c.url || '').trim().slice(0, 2000);
  if (!url || !/^https?:\/\//i.test(url)) return null;
  const tags = Array.isArray(c.tags)
    ? c.tags.map((t) => String(t).trim()).filter(Boolean)
    : String(c.tags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  const people = Array.isArray(c.people)
    ? c.people.map((p) => String(p).trim()).filter(Boolean)
    : String(c.people || '')
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
  const row = {
    title: String(c.title || '').trim().slice(0, 200),
    url,
    tags,
    people,
  };
  if (c.submittedAt) row.submittedAt = String(c.submittedAt);
  return row;
}

function normalizeSegmentBankEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id =
    raw.id != null && String(raw.id).trim()
      ? String(raw.id)
      : `standalone-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const postedSrc = Array.isArray(raw.postedClips) ? raw.postedClips : [];
  const firstLegacyClipUrl = postedSrc.map((c) => String(c?.url || '').trim()).find(Boolean) || '';
  let clipBankUrl = String(raw.clipBankUrl ?? raw.clipBankLink ?? '').trim();
  if (!clipBankUrl && firstLegacyClipUrl) clipBankUrl = firstLegacyClipUrl;
  const link = raw.segmentUrl ?? raw.segmentLink ?? raw.link ?? '';
  const clipBankNorm = normClipUrl(clipBankUrl);
  const postedClips = [];
  const seen = new Set();
  for (const c of postedSrc) {
    const n = normalizeStandalonePostedClip(c);
    if (!n) continue;
    if (normClipUrl(n.url) === clipBankNorm) continue;
    const lu = normClipUrl(n.url);
    if (seen.has(lu)) continue;
    seen.add(lu);
    postedClips.push(n);
  }
  return {
    id,
    title: String(raw.title ?? ''),
    segmentUrl: String(link),
    clipBankUrl,
    postedClips,
  };
}

const SEED_REACH_OUT_CONTACTS = {
  __version: 3,
  artists: {
    'R&B': [],
    Rapper: [],
    Singer: [],
    Pop: [],
  },
  athletes: {
    NBA: {
      'Atlanta Hawks': [],
      'Boston Celtics': [],
      'Brooklyn Nets': [],
      'Charlotte Hornets': [],
      'Chicago Bulls': [],
      'Cleveland Cavaliers': [],
      'Dallas Mavericks': [],
      'Denver Nuggets': [],
      'Detroit Pistons': [],
      'Golden State Warriors': [],
      'Houston Rockets': [],
      'Indiana Pacers': [],
      'LA Clippers': [],
      'Los Angeles Lakers': [],
      'Memphis Grizzlies': [],
      'Miami Heat': [],
      'Milwaukee Bucks': [],
      'Minnesota Timberwolves': [],
      'New Orleans Pelicans': [],
      'New York Knicks': [],
      'Oklahoma City Thunder': [],
      'Orlando Magic': [],
      'Philadelphia 76ers': [],
      'Phoenix Suns': [],
      'Portland Trail Blazers': [],
      'Sacramento Kings': [],
      'San Antonio Spurs': [],
      'Toronto Raptors': [],
      'Utah Jazz': [],
      'Washington Wizards': [],
      'Unassigned NBA': [],
    },
    NFL: {
      'Arizona Cardinals': [],
      'Atlanta Falcons': [],
      'Baltimore Ravens': [],
      'Buffalo Bills': [],
      'Carolina Panthers': [],
      'Chicago Bears': [],
      'Cincinnati Bengals': [],
      'Cleveland Browns': [],
      'Dallas Cowboys': [],
      'Denver Broncos': [],
      'Detroit Lions': [],
      'Green Bay Packers': [],
      'Houston Texans': [],
      'Indianapolis Colts': [],
      'Jacksonville Jaguars': [],
      'Kansas City Chiefs': [],
      'Las Vegas Raiders': [],
      'Los Angeles Chargers': [],
      'Los Angeles Rams': [],
      'Miami Dolphins': [],
      'Minnesota Vikings': [],
      'New England Patriots': [],
      'New Orleans Saints': [],
      'New York Giants': [],
      'New York Jets': [],
      'Philadelphia Eagles': [],
      'Pittsburgh Steelers': [],
      'San Francisco 49ers': [],
      'Seattle Seahawks': [],
      'Tampa Bay Buccaneers': [],
      'Tennessee Titans': [],
      'Washington Commanders': [],
      'Unassigned NFL': [],
    },
    NHL: {
      'Anaheim Ducks': [],
      'Arizona Coyotes': [],
      'Boston Bruins': [],
      'Buffalo Sabres': [],
      'Calgary Flames': [],
      'Carolina Hurricanes': [],
      'Chicago Blackhawks': [],
      'Colorado Avalanche': [],
      'Columbus Blue Jackets': [],
      'Dallas Stars': [],
      'Detroit Red Wings': [],
      'Edmonton Oilers': [],
      'Florida Panthers': [],
      'Los Angeles Kings': [],
      'Minnesota Wild': [],
      'Montreal Canadiens': [],
      'Nashville Predators': [],
      'New Jersey Devils': [],
      'New York Islanders': [],
      'New York Rangers': [],
      'Ottawa Senators': [],
      'Philadelphia Flyers': [],
      'Pittsburgh Penguins': [],
      'San Jose Sharks': [],
      'Seattle Kraken': [],
      'St. Louis Blues': [],
      'Tampa Bay Lightning': [],
      'Toronto Maple Leafs': [],
      'Vancouver Canucks': [],
      'Vegas Golden Knights': [],
      'Washington Capitals': [],
      'Winnipeg Jets': [],
      'Unassigned NHL': [],
    },
    Boxing: {
      Heavyweight: [],
      Cruiserweight: [],
      'Light Heavyweight': [],
      SuperMiddleweight: [],
      Middleweight: [],
      Welterweight: [],
      Lightweight: [],
      Featherweight: [],
      'Unassigned Boxing': [],
    },
    UFC: {
      Heavyweight: [],
      'Light Heavyweight': [],
      Middleweight: [],
      Welterweight: [],
      Lightweight: [],
      Featherweight: [],
      Bantamweight: [],
      Flyweight: [],
      "Women's Strawweight": [],
      "Women's Flyweight": [],
      "Women's Bantamweight": [],
      'Unassigned UFC': [],
    },
    Olympian: {
      TrackAndField: [],
      Swimming: [],
      Gymnastics: [],
      CombatSports: [],
      WinterSports: [],
      TeamSports: [],
      'Unassigned Olympian': [],
    },
  },
  actors: {
    Film: [],
    TV: [],
    Comedy: [],
    General: [],
  },
  streamers: {
    Twitch: [],
    Kick: [],
  },
  youtubers: {
    General: [],
    Podcast: [],
  },
};
let reachOutContactsData = {};

const SEED_MEDIA = [
  {
    platform: 'YouTube',
    id: 'media-youtube',
    icon: 'fa-youtube',
    handle: 'Cindy',
    strategy: 'Long-form VODs, High-budget Arc recaps',
    goal: '10M Subs by 2027',
    management: [
      'Dedicated editor for long-form content',
      'Thumbnail A/B testing on all major uploads',
      'Publishing every Sunday at 3PM EST',
      'Establish Vlog channel for secondary content'
    ],
    creation: [
      'Streaming VODs',
      'Weekly recaps',
      'Monthly recaps'
    ]
  },
  {
    platform: 'Instagram',
    id: 'media-ig',
    icon: 'fa-instagram',
    handle: '@cindy',
    strategy: 'Grid for trailers, Stories for posters, Reels for highlights and arcs',
    goal: 'Stay top-of-mind and aligned with main streams and storylines',
    management: [
      'Put stories in highlights so people can go back'
    ],
    creation: [
      'Stories: Posters of upcoming streams',
      'Reels: Trailers and arc moments',
      'Posts: High production dumps'
    ]
  },
  {
    platform: 'TikTok',
    id: 'media-tiktok',
    icon: 'fa-tiktok',
    handle: '@cindy',
    strategy: '',
    goal: 'Bring more viewers into live streams with clips and trends',
    management: [],
    creation: [],
    /** One URL per line in UI — trend videos to recreate (solo) */
    tiktokSoloTrendLinks: [],
    /** One URL per line in UI — trend videos to recreate (collab) */
    tiktokCollabTrendLinks: [],
  },
  {
    platform: 'X / Twitter',
    id: 'media-x',
    icon: 'fa-x-twitter',
    handle: '@Cindy',
    strategy: '"People forget that they forget." Run Weekly/Monthly recaps to maintain narrative memory.',
    goal: 'Dominate daily trending',
    management: [
      'Weekly recap threads posted every Monday morning',
      'Monthly "Season Recap" videos posted on the 1st of the month'
    ],
    creation: [
      'Posters',
      'Trailers',
      'Weekly recaps',
      'Monthly recaps'
    ]
  },
  {
    platform: 'Snapchat',
    id: 'media-snapchat',
    icon: 'fa-snapchat',
    handle: 'cindy',
    strategy: 'Raw behind-the-scenes and day-in-the-life moments',
    goal: 'Daily touchpoints with people who already follow the story',
    management: [
      'Post 10-15 snaps daily to stay at the top of feeds',
      'Point back to streams and arcs when it fits naturally'
    ],
    creation: [
      'Workout',
      'Eating',
      'Self-care',
      'Traveling',
      'Behind the scenes',
      'Funny moments',
      'On stream'
    ]
  }
];
let mediaAssets = cloneSeed(SEED_MEDIA);

const SEED_NETWORK = [];
let networkData = [];
const networkFilters = { query: '', tag: '', name: '', sort: 'name_asc' };
/** '' = all arcs; otherwise past | current | future (matches getArcTimelineStatus().key) */
const arcTimelineFilter = { timeline: '' };
let arcListSelectedId = null;

const NETWORK_PHOTO_BY_NAME = {};

// --- Persistence: Express server saves JSON to server/data/state.json; localStorage backup if offline ---
/** Bump to clear persisted network + reach-out once (e.g. legacy roster from another property). */
const CONTACT_DATA_RESET_REVISION = 1;
const LS_KEY = 'cindy-app-state-v2';
let __saveDbTimer = null;
let __lastSavedJson = '';
const AUTO_SAVE_MS = 25000;

/** @type {{ id?: string, email?: string, username?: string, role: string, displayName: string } | null} */
window.__authUser = null;
/** True when server runs without required auth (local file mode / no DATABASE_URL). */
window.__authDisabled = false;
/** True when /api/me failed (wrong origin or server down). */
window.__authOffline = false;

function getAuthRole() {
  return window.__authUser?.role || null;
}

function isClipperRole() {
  return getAuthRole() === 'clipper';
}

function canEditLeadContent() {
  const r = getAuthRole();
  return r === 'lead' || r === 'coordinator';
}

function syncAuthChrome() {
  document.body.classList.toggle('role-clipper', isClipperRole());
  document.body.classList.toggle('role-editor', canEditLeadContent());
  const profileCard = document.querySelector('.sidebar .user-profile');
  if (profileCard) profileCard.style.pointerEvents = isClipperRole() ? 'none' : '';
  const nameEl = document.getElementById('sidebar-user-name');
  const roleEl = document.getElementById('sidebar-user-role');
  if (nameEl) nameEl.textContent = window.__authUser?.displayName || '—';
  if (roleEl) {
    if (window.__authDisabled) {
      roleEl.textContent = window.__authOffline ? 'App server unreachable' : 'No sign-in configured';
    } else {
      const labels = { lead: 'Lead', coordinator: 'Creative Coordinator', clipper: 'Clipper' };
      roleEl.textContent = labels[getAuthRole()] || 'Guest';
    }
  }
  const lo = document.getElementById('auth-logout-btn');
  if (lo) lo.style.display = window.__authDisabled ? 'none' : '';
}

let __authLoginFormWired = false;
function setupAuthLoginForm() {
  if (__authLoginFormWired) return;
  __authLoginFormWired = true;
  const loginForm = document.getElementById('auth-login-form');
  const registerForm = document.getElementById('auth-register-form');
  const loginErr = document.getElementById('auth-login-error');
  const registerErr = document.getElementById('auth-register-error');
  const panelLogin = document.getElementById('auth-panel-login');
  const panelRegister = document.getElementById('auth-panel-register');
  const tabLogin = document.getElementById('auth-tab-login');
  const tabRegister = document.getElementById('auth-tab-register');

  function showAuthTab(which) {
    const isReg = which === 'register';
    if (panelLogin) panelLogin.style.display = isReg ? 'none' : '';
    if (panelRegister) panelRegister.style.display = isReg ? '' : 'none';
    tabLogin?.classList.toggle('active', !isReg);
    tabRegister?.classList.toggle('active', isReg);
    if (loginErr) loginErr.textContent = '';
    if (registerErr) registerErr.textContent = '';
  }

  tabLogin?.addEventListener('click', () => showAuthTab('login'));
  tabRegister?.addEventListener('click', () => showAuthTab('register'));

  if (!loginForm) return;
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (loginErr) loginErr.textContent = '';
    const loginId = String(document.getElementById('auth-login-username')?.value || '').trim();
    const password = String(document.getElementById('auth-login-password')?.value || '');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginId, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (loginErr) {
          if (data.error === 'invalid_credentials') loginErr.textContent = 'Wrong username or password.';
          else if (data.error === 'database_required_for_accounts') loginErr.textContent = 'Server needs a database for accounts.';
          else if (data.error === 'auth_not_configured')
            loginErr.textContent = 'Sign-in is not ready on this server yet (database / auth init).';
          else loginErr.textContent = 'Sign-in failed.';
        }
        return;
      }
      window.__authUser = data.user || null;
      document.getElementById('auth-login-overlay')?.classList.remove('active');
      startMainApplication();
    } catch {
      if (loginErr) loginErr.textContent = 'Could not reach server.';
    }
  });

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (registerErr) registerErr.textContent = '';
    const email = String(registerForm.elements.email?.value || '').trim();
    const username = String(registerForm.elements.username?.value || '').trim();
    const password = String(registerForm.elements.password?.value || '');
    const password2 = String(registerForm.elements.password2?.value || '');
    if (password !== password2) {
      if (registerErr) registerErr.textContent = 'Passwords do not match.';
      return;
    }
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (registerErr) {
          if (data.error === 'email_taken') registerErr.textContent = 'That email is already registered.';
          else if (data.error === 'username_taken') registerErr.textContent = 'That username is taken.';
          else if (data.error === 'invalid_username')
            registerErr.textContent = 'Username: 3–32 characters, letters, numbers, and underscore only.';
          else if (data.error === 'invalid_email') registerErr.textContent = 'Enter a valid email.';
          else if (data.error === 'invalid_password') registerErr.textContent = 'Use at least 8 characters.';
          else if (data.error === 'database_required_for_accounts') registerErr.textContent = 'Server needs a database for accounts.';
          else if (data.error === 'auth_not_configured')
            registerErr.textContent = 'Registration is not ready on this server yet (database / auth init).';
          else registerErr.textContent = 'Registration failed.';
        }
        return;
      }
      window.__authUser = data.user || null;
      document.getElementById('auth-login-overlay')?.classList.remove('active');
      startMainApplication();
    } catch {
      if (registerErr) registerErr.textContent = 'Could not reach server.';
    }
  });

  document.getElementById('auth-logout-btn')?.addEventListener('click', async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch {
      /* ignore */
    }
    window.location.reload();
  });
}

let __mainAppStarted = false;

function setDbStatus(text, kind) {
  const el = document.getElementById('db-status');
  if (!el) return;
  el.textContent = text;
  el.classList.remove('db-status--ok', 'db-status--warn', 'db-status--err');
  if (kind === 'ok') el.classList.add('db-status--ok');
  else if (kind === 'warn') el.classList.add('db-status--warn');
  else if (kind === 'err') el.classList.add('db-status--err');
}

function serializeAppState() {
  return {
    version: 1,
    contactDataResetRevision: CONTACT_DATA_RESET_REVISION,
    arcsData,
    goalsData,
    calendarEvents,
    narratives,
    mediaAssets,
    networkData,
    reachOutContactsData,
    segmentBankData,
  };
}

function applyAppState(payload) {
  if (!payload || typeof payload !== 'object') return;
  if (Array.isArray(payload.arcsData)) {
    arcsData = payload.arcsData.map((a) => {
      if (!a || typeof a !== 'object') return a;
      const { selling: _removed, ...rest } = a;
      return rest;
    });
  }
  if (Array.isArray(payload.goalsData)) goalsData = payload.goalsData;
  if (Array.isArray(payload.calendarEvents)) calendarEvents = payload.calendarEvents;
  if (Array.isArray(payload.narratives)) narratives = payload.narratives;
  if (Array.isArray(payload.mediaAssets)) mediaAssets = payload.mediaAssets;
  if (Array.isArray(payload.networkData)) networkData = payload.networkData;
  if (Array.isArray(payload.segmentBankData)) {
    segmentBankData = payload.segmentBankData.map(normalizeSegmentBankEntry).filter(Boolean);
  } else {
    segmentBankData = [];
  }
  if (payload.reachOutContactsData && typeof payload.reachOutContactsData === 'object') {
    reachOutContactsData = payload.reachOutContactsData;
  }
  if (Number(payload.contactDataResetRevision) !== CONTACT_DATA_RESET_REVISION) {
    networkData = [];
    reachOutContactsData = cloneSeed(SEED_REACH_OUT_CONTACTS);
  }
}

/** If disk/local backup predates a new built-in arc, append it once. */
function ensureCollegeTakeoverArc() {
  if (arcsData.some((a) => a.id === 'arc-college-takeovers')) return;
  const seed = SEED_ARCS.find((a) => a.id === 'arc-college-takeovers');
  if (seed) arcsData.push(cloneSeed(seed));
}

function ensureF1LinkedStreams() {
  const liveF1 = arcsData.find((a) => a.id === 'arc-f1');
  const seedF1 = SEED_ARCS.find((a) => a.id === 'arc-f1');
  if (!liveF1 || !seedF1 || !Array.isArray(seedF1.linkedStreams)) return;
  if (!Array.isArray(liveF1.linkedStreams)) liveF1.linkedStreams = [];
  if (seedF1.linkedStreams.length === 0) return;
  if (liveF1.linkedStreams.length === 0) {
    liveF1.linkedStreams = cloneSeed(seedF1.linkedStreams);
    return;
  }
  const known = new Set(liveF1.linkedStreams.map((s) => s.title));
  seedF1.linkedStreams.forEach((s) => {
    if (!known.has(s.title)) liveF1.linkedStreams.push(cloneSeed(s));
  });
}

function ensureSeedNetworkPeople() {
  if (!Array.isArray(networkData)) return;
  const known = new Set(
    networkData
      .map((p) => String(p?.name || '').trim().toLowerCase())
      .filter(Boolean)
  );
  SEED_NETWORK.forEach((person) => {
    const key = String(person?.name || '').trim().toLowerCase();
    if (!key || known.has(key)) return;
    networkData.push(cloneSeed(person));
    known.add(key);
  });
}

function ensureNetworkPhotoDefaults() {
  if (!Array.isArray(networkData)) return;
  networkData.forEach((person) => {
    if (!person || typeof person !== 'object') return;
    const key = String(person.name || '').trim().toLowerCase();
    if (!key) return;
    if (person.photo && String(person.photo).trim()) return;
    const known = NETWORK_PHOTO_BY_NAME[key];
    if (known) person.photo = known;
  });
}

function normalizeReachOutContactsData() {
  if (!reachOutContactsData || typeof reachOutContactsData !== 'object') {
    reachOutContactsData = cloneSeed(SEED_REACH_OUT_CONTACTS);
    return;
  }
  const seed = cloneSeed(SEED_REACH_OUT_CONTACTS);
  if (!reachOutContactsData.__version) reachOutContactsData.__version = 1;

  Object.keys(seed).forEach((topKey) => {
    if (topKey === '__version') return;
    if (!reachOutContactsData[topKey] || typeof reachOutContactsData[topKey] !== 'object' || Array.isArray(reachOutContactsData[topKey])) {
      reachOutContactsData[topKey] = cloneSeed(seed[topKey]);
      return;
    }
    // Keep only allowed seeded sub-buckets for each group.
    Object.keys(reachOutContactsData[topKey]).forEach((existingSubKey) => {
      if (existingSubKey !== '__version' && !(existingSubKey in seed[topKey])) {
        delete reachOutContactsData[topKey][existingSubKey];
      }
    });

    Object.keys(seed[topKey]).forEach((subKey) => {
      const seedSub = seed[topKey][subKey];
      const curSub = reachOutContactsData[topKey][subKey];

      if (Array.isArray(seedSub)) {
        if (!Array.isArray(curSub)) reachOutContactsData[topKey][subKey] = [];
        return;
      }
      if (!seedSub || typeof seedSub !== 'object') {
        if (!(subKey in reachOutContactsData[topKey])) reachOutContactsData[topKey][subKey] = seedSub;
        return;
      }

      // Nested bucket (league/team style)
      if (Array.isArray(curSub)) {
        const migrated = cloneSeed(seedSub);
        const unassignedKey = Object.keys(migrated).find((k) => /^unassigned/i.test(k)) || `Unassigned ${subKey}`;
        if (!(unassignedKey in migrated)) migrated[unassignedKey] = [];
        migrated[unassignedKey] = [...new Set(curSub.map((x) => String(x || '').trim()).filter(Boolean))];
        reachOutContactsData[topKey][subKey] = migrated;
      } else if (!curSub || typeof curSub !== 'object') {
        reachOutContactsData[topKey][subKey] = cloneSeed(seedSub);
      } else {
        Object.keys(seedSub).forEach((leafKey) => {
          if (!Array.isArray(reachOutContactsData[topKey][subKey][leafKey])) {
            reachOutContactsData[topKey][subKey][leafKey] = [];
          }
        });
      }
    });
  });

  reachOutContactsData.__version = seed.__version;
}

function renderSegmentBankBoard() {
  const board = document.getElementById('segment-bank-board-main');
  if (!board) return;
  if (!segmentBankData.length) {
    board.innerHTML = isClipperRole()
      ? '<p style="color:var(--text-muted); font-size:0.9rem;">No standalone segments yet.</p>'
      : '<p style="color:var(--text-muted); font-size:0.9rem;">No standalone segments yet. Use <strong>New Segment</strong> to add one.</p>';
    return;
  }
  board.innerHTML = segmentBankData
    .map((raw) => {
      const s = normalizeSegmentBankEntry(raw) || raw;
      const sid = String(s.id);
      const submitEnc = encodeURIComponent(sid);
      const vod = s.segmentUrl || '';
      const clipBank = s.clipBankUrl || '';
      const ro = isClipperRole();
      const clips = Array.isArray(s.postedClips) ? s.postedClips : [];
      const clipsListHtml =
        clips.length > 0
          ? `<div style="margin-top:14px;"><div class="info-label" style="display:block; margin-bottom:6px;">Clips in bank (${clips.length})</div><ul style="margin:0; padding-left:18px; color:var(--text-main); font-size:0.88rem; line-height:1.45;">${clips
              .map(
                (c) =>
                  `<li style="margin-bottom:4px;"><a href="${escAttr(c.url)}" target="_blank" rel="noopener noreferrer">${escAttr(String(c.title || '').trim() || c.url)}</a></li>`
              )
              .join('')}</ul></div>`
          : '';
      return `
        <div class="glass-panel" style="padding:14px 16px; min-width:0;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:12px; flex-wrap:wrap;">
            <div style="flex:1 1 220px; min-width:0;">
              <label class="info-label" style="display:block; margin-bottom:4px; font-size:0.75rem; color:var(--text-muted);">Segment name</label>
              <input class="form-input" style="width:100%;" placeholder="Name this segment" value="${escAttr(s.title || '')}" ${ro ? 'readonly' : `oninput='updateStandaloneSegmentBankField(${JSON.stringify(sid)}, "title", this.value)'`} />
            </div>
            ${ro ? '' : `<button type="button" class="btn btn-outline btn-sm" style="flex-shrink:0; margin-top:18px;" title="Remove segment" onclick='removeStandaloneSegmentBankEntry(${JSON.stringify(sid)})'><i class="fa-solid fa-trash"></i></button>`}
          </div>
          <label class="info-label" style="display:block; margin-bottom:4px; font-size:0.75rem; color:var(--text-muted);">Segment link (VOD, timestamp, or context URL)</label>
          <div style="display:grid; grid-template-columns:minmax(0,1fr) auto auto; gap:8px; align-items:center; margin-bottom:14px;">
            <input type="url" class="form-input segment-bank-segment-url" style="width:100%; min-width:0;" placeholder="https://..." value="${escAttr(vod)}" ${ro ? 'readonly' : `oninput='updateStandaloneSegmentBankField(${JSON.stringify(sid)}, "segmentUrl", this.value)'`} />
            <button type="button" class="btn btn-outline btn-sm" style="flex-shrink:0;" title="Play in app" onclick="void window.openMediaEmbedPreview(this.closest('.glass-panel').querySelector('.segment-bank-segment-url').value)"><i class="fa-solid fa-play"></i></button>
            <a href="${escAttr(vod || '#')}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="flex-shrink:0;" title="Open link"
              onclick="const row=this.closest('div'); const v=(row?.querySelector('.segment-bank-segment-url')?.value||'').trim(); if(!v){event.preventDefault();return;} this.href=v;"><i class="fa-solid fa-up-right-from-square"></i></a>
          </div>
          <label class="info-label" style="display:block; margin-bottom:4px; font-size:0.75rem; color:var(--text-muted);">Clip bank link (folder, e.g. Google Drive)</label>
          <div style="display:grid; grid-template-columns:minmax(0,1fr) auto auto; gap:8px; align-items:center;">
            <input type="url" class="form-input segment-bank-clip-bank-url" style="width:100%; min-width:0;" placeholder="https://drive.google.com/..." value="${escAttr(clipBank)}" ${ro ? 'readonly' : `oninput='updateStandaloneSegmentBankField(${JSON.stringify(sid)}, "clipBankUrl", this.value)'`} />
            <button type="button" class="btn btn-outline btn-sm" style="flex-shrink:0;" title="Play in app (if embeddable)" onclick="void window.openMediaEmbedPreview(this.closest('.glass-panel').querySelector('.segment-bank-clip-bank-url').value)"><i class="fa-solid fa-play"></i></button>
            <a href="${escAttr(clipBank || '#')}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="flex-shrink:0;" title="Open clip bank"
              onclick="const row=this.closest('div'); const v=(row?.querySelector('.segment-bank-clip-bank-url')?.value||'').trim(); if(!v){event.preventDefault();return;} this.href=v;"><i class="fa-solid fa-up-right-from-square"></i></a>
          </div>
          ${ro ? '<p style="margin:10px 0 0; font-size:0.82rem; color:var(--text-muted);">Segment details are view-only for your role. You can still submit clips below.</p>' : ''}
          ${clipsListHtml}
          <div style="margin-top:14px; padding-top:12px; border-top:1px solid var(--border-color);" data-segment-submit-card="${submitEnc}">
            <div class="info-label" style="display:block; margin-bottom:6px;">Submit a clip</div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin:0 0 10px; line-height:1.45;">Paste a public clip URL (YouTube, TikTok, X, etc.). It appears in the Clip Bank for this segment for the whole team.</p>
            <label class="info-label" style="display:block; margin-bottom:4px;">Clip title</label>
            <input type="text" class="form-input ssc-title" placeholder="e.g. Highlight — blind date" autocomplete="off" />
            <label class="info-label" style="display:block; margin:8px 0 4px;">Clip URL</label>
            <input type="url" class="form-input ssc-url" placeholder="https://..." />
            <label class="info-label" style="display:block; margin:8px 0 4px;">Tags <span style="text-transform:none; color:var(--text-muted);">(optional)</span></label>
            <input type="text" class="form-input ssc-tags" placeholder="funny, viral" />
            <p class="segment-submit-feedback" style="min-height:1.2em; font-size:0.82rem; margin-top:8px; color:var(--text-muted);"></p>
            <button type="button" class="btn btn-primary btn-sm" style="margin-top:12px;" onclick="submitStandaloneSegmentClipFromRow(${JSON.stringify(sid)})"><i class="fa-solid fa-paper-plane"></i> Submit clip</button>
          </div>
        </div>`;
    })
    .join('');
}

window.addNewStandaloneSegment = function () {
  if (isClipperRole()) return;
  segmentBankData.push(
    normalizeSegmentBankEntry({
      id: `standalone-${Date.now()}`,
      title: '',
      segmentUrl: '',
      clipBankUrl: '',
    })
  );
  renderSegmentBankBoard();
  scheduleSaveAppStateToDb();
};

function findSegmentBankIndexById(segmentId) {
  const want = String(segmentId);
  return segmentBankData.findIndex((s) => s && String(s.id) === want);
}

window.updateStandaloneSegmentBankField = function (segmentId, field, value) {
  if (isClipperRole()) return;
  const idx = findSegmentBankIndexById(segmentId);
  if (idx < 0) return;
  const seg = segmentBankData[idx];
  if (field === 'title') seg.title = String(value ?? '');
  if (field === 'segmentUrl') seg.segmentUrl = String(value ?? '');
  if (field === 'clipBankUrl') seg.clipBankUrl = String(value ?? '');
  scheduleSaveAppStateToDb();
  if (field === 'clipBankUrl' || field === 'title') renderClippersBoard();
};

window.removeStandaloneSegmentBankEntry = function (segmentId) {
  if (isClipperRole()) return;
  const idx = findSegmentBankIndexById(segmentId);
  if (idx < 0) return;
  segmentBankData.splice(idx, 1);
  renderSegmentBankBoard();
  renderClippersBoard();
  scheduleSaveAppStateToDb();
};

function segmentSubmitFeedback(segmentId, text, isError) {
  const root = document.querySelector(`[data-segment-submit-card="${encodeURIComponent(String(segmentId))}"]`);
  const el = root?.querySelector('.segment-submit-feedback');
  if (el) {
    el.textContent = text || '';
    el.style.color = isError ? '#f87171' : 'var(--text-muted)';
  }
  if (text) setDbStatus(text, isError ? 'err' : 'ok');
}

function formatClipSubmitSaveError(msg) {
  const m = String(msg || '').trim();
  if (m === 'workspace_not_initialized') {
    return 'Workspace is not ready on the server yet. Ask a lead to open the app and save once, then try again.';
  }
  if (m === 'unauthorized') return 'Sign in again, then submit the clip.';
  return m ? `Save failed: ${m}` : 'Save failed. Check your connection and try again.';
}

window.submitStandaloneSegmentClipFromRow = async function (segmentId) {
  const sid = String(segmentId);
  const enc = encodeURIComponent(sid);
  const root = document.querySelector(`[data-segment-submit-card="${enc}"]`);
  if (!root) return;
  segmentSubmitFeedback(sid, '', false);
  const title = String(root.querySelector('.ssc-title')?.value || '').trim();
  const url = String(root.querySelector('.ssc-url')?.value || '').trim();
  const tagsRaw = String(root.querySelector('.ssc-tags')?.value || '').trim();
  if (!url) {
    segmentSubmitFeedback(sid, 'Add a clip URL before submitting.', true);
    return;
  }
  if (!/^https?:\/\//i.test(url)) {
    segmentSubmitFeedback(sid, 'Clip URL must start with http:// or https://', true);
    return;
  }
  const idx = findSegmentBankIndexById(sid);
  if (idx < 0) {
    segmentSubmitFeedback(sid, 'This segment is no longer in the list. Reload the page.', true);
    return;
  }
  const seg = segmentBankData[idx];
  if (!Array.isArray(seg.postedClips)) seg.postedClips = [];
  const lu = normClipUrl(url);
  if (seg.postedClips.some((c) => normClipUrl(c?.url) === lu)) {
    segmentSubmitFeedback(sid, 'That URL is already in this segment’s clip bank.', true);
    return;
  }
  const clipBankFolder = String(seg.clipBankUrl || '').trim();
  if (clipBankFolder && normClipUrl(url) === normClipUrl(clipBankFolder)) {
    segmentSubmitFeedback(sid, 'Use a clip link, not the same URL as the clip bank folder.', true);
    return;
  }
  const tags = tagsRaw
    ? tagsRaw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const clip = {
    title: title.slice(0, 200) || 'Clip',
    url: url.slice(0, 2000),
    tags,
    people: [],
    submittedAt: new Date().toISOString(),
  };
  const prevLen = seg.postedClips.length;
  seg.postedClips.push(clip);
  const tIn = root.querySelector('.ssc-title');
  const uIn = root.querySelector('.ssc-url');
  const gIn = root.querySelector('.ssc-tags');
  if (tIn) tIn.value = '';
  if (uIn) uIn.value = '';
  if (gIn) gIn.value = '';
  renderSegmentBankBoard();
  renderClippersBoard();
  window.__lastPutStateError = '';
  const ok = await saveAppStateToDb({ silent: true, throwOnFail: true });
  if (!ok) {
    if (seg.postedClips.length > prevLen) seg.postedClips.pop();
    renderSegmentBankBoard();
    renderClippersBoard();
    segmentSubmitFeedback(sid, formatClipSubmitSaveError(window.__lastPutStateError), true);
    return;
  }
  segmentSubmitFeedback(sid, 'Clip saved — it appears in Clip Bank below.', false);
};

function refreshAllViews() {
  renderCalendar();
  renderStreams();
  renderArcs();
  renderNarratives();
  renderClippersBoard();
  renderAssets();
  renderGoals();
  renderNetwork();
  renderReachOutContacts();
  renderSegmentBankBoard();
  syncAuthChrome();
  if (isClipperRole()) enterClipperRestrictedShell();
}

function setupMediaSubtabs() {
  const selector = document.getElementById('media-subtab-selector');
  if (!selector) return;
  const buttons = selector.querySelectorAll('[data-media-subtab]');
  const panes = document.querySelectorAll('#tab-media .media-subtab-pane');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-media-subtab');
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      panes.forEach((pane) => {
        const isMatch = pane.id === `media-pane-${target}`;
        pane.style.display = isMatch ? '' : 'none';
        if (isMatch) pane.classList.add('active');
        else pane.classList.remove('active');
      });
    });
  });
}

function setupClippersSubtabs() {
  const selector = document.getElementById('clippers-subtab-selector');
  if (!selector) return;
  const buttons = selector.querySelectorAll('[data-clippers-subtab]');
  const panes = document.querySelectorAll('#media-pane-clippers .clippers-subtab-pane');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-clippers-subtab');
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      panes.forEach((pane) => {
        const isMatch = pane.id === `clippers-pane-${target}`;
        pane.style.display = isMatch ? '' : 'none';
        if (isMatch) pane.classList.add('active');
        else pane.classList.remove('active');
      });
    });
  });
}

function setupNetworkSubtabs() {
  const selector = document.getElementById('network-subtab-selector');
  if (!selector) return;
  const buttons = selector.querySelectorAll('[data-network-subtab]');
  const panes = document.querySelectorAll('#tab-network .network-subtab-pane');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-network-subtab');
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      panes.forEach((pane) => {
        const isMatch = pane.id === `network-pane-${target}`;
        pane.style.display = isMatch ? '' : 'none';
        if (isMatch) pane.classList.add('active');
        else pane.classList.remove('active');
      });
    });
  });
}

function setupCreativeDirectorTabs() {
  const selector = document.getElementById('creative-director-tab-selector');
  if (!selector) return;
  const buttons = selector.querySelectorAll('[data-creative-director-tab]');
  const panes = document.querySelectorAll('#creative-director-modal .creative-director-pane');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-creative-director-tab');
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      panes.forEach((pane) => {
        const isMatch = pane.id === `creative-director-pane-${target}`;
        pane.style.display = isMatch ? '' : 'none';
        if (isMatch) pane.classList.add('active');
        else pane.classList.remove('active');
      });
    });
  });
}

function setupAboutMeSectionTabs() {
  const pane = document.getElementById('creative-director-pane-about-me');
  if (!pane) return;
  const buttons = pane.querySelectorAll('[data-about-me-section]');
  const sections = pane.querySelectorAll('.about-me-section-pane');
  if (!buttons.length || !sections.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-about-me-section');
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      sections.forEach((section) => {
        const isMatch = section.id === `about-me-section-${target}`;
        section.classList.toggle('active', isMatch);
      });
    });
  });
}

let __activeNetworkDetailIndex = -1;

function closeNetworkDetailModal() {
  const modal = document.getElementById('network-detail-modal');
  if (modal) modal.classList.remove('active');
  __activeNetworkDetailIndex = -1;
}

function renderNetworkDetailModal(index) {
  const person = networkData[index];
  if (!person) return;
  const titleEl = document.getElementById('network-detail-title');
  const streamsEl = document.getElementById('network-detail-streams');
  const clipsEl = document.getElementById('network-detail-clips');
  const ideasEl = document.getElementById('network-detail-ideas');
  const notesEl = document.getElementById('network-detail-notes');
  if (!titleEl || !streamsEl || !clipsEl || !ideasEl || !notesEl) return;

  titleEl.innerHTML = `<i class="fa-solid fa-id-card"></i> ${escAttr(person.name)} — History`;
  const relatedStreams = getPersonRelatedStreams(person.name);
  const relatedClips = getPersonTaggedClips(person.name);
  streamsEl.innerHTML = relatedStreams.length
    ? relatedStreams
      .map((s) => {
        const vod = String(s.fullVodUrl || '').trim();
        const vodLink = vod
          ? `<a href="${escAttr(vod)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="flex-shrink:0;" onclick="event.stopPropagation();">VOD</a>`
          : `<span style="font-size:0.75rem; color:var(--text-muted);">No VOD yet</span>`;
        return `<div style="display:flex; justify-content:space-between; align-items:center; gap:8px; border:1px solid var(--border-color); border-radius:8px; padding:8px; min-width:0;">
            <div style="min-width:0;">
              <div style="font-size:0.86rem; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escAttr(s.title || 'Untitled stream')}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${escAttr(s.date || 'TBD')}</div>
            </div>
            ${vodLink}
          </div>`;
      })
      .join('')
    : `<div style="font-size:0.82rem; color:var(--text-muted);">No streams linked yet.</div>`;

  clipsEl.innerHTML = relatedClips.length
    ? relatedClips
      .map((c) => {
        const link = String(c.url || '').trim();
        const clipActions = link
          ? `<div style="display:flex; gap:6px; flex-shrink:0; align-items:center;">
                <button type="button" class="btn btn-outline btn-sm" title="Play in app" onclick="event.stopPropagation(); void window.openMediaEmbedPreview(${JSON.stringify(link)});"><i class="fa-solid fa-play"></i></button>
                <a href="${escAttr(link)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" onclick="event.stopPropagation();">Open</a>
              </div>`
          : `<span style="font-size:0.75rem; color:var(--text-muted);">No link</span>`;
        return `<div style="display:flex; justify-content:space-between; align-items:center; gap:8px; border:1px solid var(--border-color); border-radius:8px; padding:8px; min-width:0;">
            <div style="min-width:0;">
              <div style="font-size:0.86rem; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escAttr(c.title || 'Untitled clip')}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escAttr(c.streamTitle || 'Unknown stream')}</div>
            </div>
            ${clipActions}
          </div>`;
      })
      .join('')
    : `<div style="font-size:0.82rem; color:var(--text-muted);">No clips tagged with this contact yet.</div>`;

  ideasEl.value = Array.isArray(person.ideas) ? person.ideas.join('\n') : String(person.ideas || '');
  notesEl.value = String(person.notes || '');
}

function setupNetworkDetailModal() {
  const modal = document.getElementById('network-detail-modal');
  const closeBtn = document.getElementById('network-detail-close-btn');
  const cancelBtn = document.getElementById('network-detail-cancel-btn');
  const saveBtn = document.getElementById('network-detail-save-btn');
  const ideasEl = document.getElementById('network-detail-ideas');
  const notesEl = document.getElementById('network-detail-notes');
  if (!modal || !closeBtn || !cancelBtn || !saveBtn || !ideasEl || !notesEl) return;
  closeBtn.addEventListener('click', closeNetworkDetailModal);
  cancelBtn.addEventListener('click', closeNetworkDetailModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeNetworkDetailModal();
  });
  saveBtn.addEventListener('click', () => {
    const person = networkData[__activeNetworkDetailIndex];
    if (!person) return;
    person.ideas = String(ideasEl.value || '')
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);
    person.notes = String(notesEl.value || '').trim();
    scheduleSaveAppStateToDb();
    saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
    setTimeout(() => {
      saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Notes';
    }, 900);
  });
}

let __quickFormOnSubmit = null;

function closeQuickFormModal() {
  const modal = document.getElementById('quick-form-modal');
  if (modal) modal.classList.remove('active');
  __quickFormOnSubmit = null;
}

function setupQuickFormModal() {
  const modal = document.getElementById('quick-form-modal');
  const closeBtn = document.getElementById('quick-form-close-btn');
  const cancelBtn = document.getElementById('quick-form-cancel-btn');
  const form = document.getElementById('quick-form-body');
  if (!modal || !closeBtn || !cancelBtn || !form) return;
  closeBtn.addEventListener('click', closeQuickFormModal);
  cancelBtn.addEventListener('click', closeQuickFormModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeQuickFormModal();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!__quickFormOnSubmit) return;
    const values = {};
    form.querySelectorAll('[name]').forEach((el) => {
      values[el.name] = el.value;
    });
    const shouldClose = __quickFormOnSubmit(values);
    if (shouldClose !== false) closeQuickFormModal();
  });
}

function openQuickFormModal({ title, fields, submitLabel = 'Save', onSubmit }) {
  const modal = document.getElementById('quick-form-modal');
  const titleEl = document.getElementById('quick-form-title');
  const body = document.getElementById('quick-form-body');
  const submitBtn = document.getElementById('quick-form-submit-btn');
  if (!modal || !titleEl || !body || !submitBtn) return;
  titleEl.textContent = title || 'Form';
  submitBtn.textContent = submitLabel;
  body.innerHTML = fields
    .map((f) => {
      const baseLabel = `<label for="qf-${f.name}">${f.label}</label>`;
      if (f.type === 'textarea') {
        return `<div class="form-group">${baseLabel}<textarea id="qf-${f.name}" name="${f.name}" class="form-input" placeholder="${f.placeholder || ''}" style="min-height:88px; resize: vertical;">${escAttr(f.value || '')}</textarea></div>`;
      }
      if (f.type === 'select') {
        const optionsHtml = (f.options || [])
          .map((opt) => {
            const value = typeof opt === 'object' && opt !== null ? opt.value : opt;
            const label = typeof opt === 'object' && opt !== null ? opt.label : opt;
            return `<option value="${escAttr(value)}" ${String(f.value || '') === String(value) ? 'selected' : ''}>${escAttr(label)}</option>`;
          })
          .join('');
        return `<div class="form-group">${baseLabel}<select id="qf-${f.name}" name="${f.name}" class="form-input" style="appearance: auto; background: rgba(0,0,0,0.5);">${optionsHtml}</select></div>`;
      }
      return `<div class="form-group">${baseLabel}<input id="qf-${f.name}" name="${f.name}" type="${f.type || 'text'}" class="form-input" placeholder="${f.placeholder || ''}" value="${escAttr(f.value || '')}" /></div>`;
    })
    .join('');
  __quickFormOnSubmit = onSubmit;
  modal.classList.add('active');
  const firstInput = body.querySelector('input, textarea, select');
  if (firstInput) firstInput.focus();
}

function createGoalViaForm(defaultCategory = '') {
  openQuickFormModal({
    title: 'Create Goal',
    submitLabel: 'Create Goal',
    fields: [
      { name: 'category', label: 'Category', type: 'text', value: defaultCategory || 'General', placeholder: 'e.g. Streaming Awards' },
      { name: 'title', label: 'Goal Title', type: 'text', placeholder: 'Enter title...' },
      { name: 'status', label: 'Status', type: 'select', value: 'Planning', options: ['Planning', 'In Progress'] },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What does success look like?' },
      { name: 'actionItems', label: 'Action Items', type: 'textarea', placeholder: 'One item per line' },
    ],
    onSubmit: (values) => {
      const title = String(values.title || '').trim();
      if (!title) {
        setDbStatus('Goal title is required.', 'warn');
        return false;
      }
      const category = String(values.category || '').trim() || 'General';
      const actionItems = String(values.actionItems || '')
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean);
      goalsData.push({
        id: `goal-${Date.now()}`,
        category,
        title,
        status: values.status === 'In Progress' ? 'In Progress' : 'Planning',
        linkedArcs: [],
        linkedStreams: [],
        description: String(values.description || '').trim(),
        actionItems,
      });
      renderGoals();
      renderCategoryDetail(category);
      scheduleSaveAppStateToDb();
      return true;
    },
  });
}

window.editGoalById = function (goalId) {
  const goal = goalsData.find((g) => g.id === goalId);
  if (!goal) return;
  openQuickFormModal({
    title: 'Edit Goal',
    submitLabel: 'Save Goal',
    fields: [
      { name: 'title', label: 'Title', type: 'text', value: goal.title || '' },
      { name: 'description', label: 'Description', type: 'textarea', value: goal.description || '' },
      { name: 'actions', label: 'Action Items (one per line)', type: 'textarea', value: Array.isArray(goal.actionItems) ? goal.actionItems.join('\n') : '' },
    ],
    onSubmit: (values) => {
      goal.title = String(values.title || '').trim() || goal.title;
      goal.description = String(values.description || '').trim();
      goal.actionItems = String(values.actions || '')
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean);
      renderGoals();
      if (goal.category) renderCategoryDetail(goal.category);
      scheduleSaveAppStateToDb();
      return true;
    },
  });
};

window.deleteGoalById = function (goalId) {
  const idx = goalsData.findIndex((g) => g.id === goalId);
  if (idx < 0) return;
  const goal = goalsData[idx];
  const ok = window.confirm(`Delete goal "${goal.title}"?`);
  if (!ok) return;
  goalsData.splice(idx, 1);
  renderGoals();
  scheduleSaveAppStateToDb();
};

window.editGoalCategory = function (category) {
  const cat = String(category || '').trim();
  if (!cat) return;
  const inCategory = goalsData.filter((g) => String(g.category || '').trim() === cat);
  if (!inCategory.length) return;
  openQuickFormModal({
    title: 'Edit Goal Category',
    submitLabel: 'Save Category',
    fields: [{ name: 'category', label: 'Category Name', type: 'text', value: cat }],
    onSubmit: (values) => {
      const next = String(values.category || '').trim();
      if (!next) return false;
      inCategory.forEach((g) => {
        g.category = next;
      });
      goalListSelectedCategory = next;
      renderGoals();
      renderCategoryDetail(next);
      scheduleSaveAppStateToDb();
      return true;
    },
  });
};

window.deleteGoalCategory = function (category) {
  const cat = String(category || '').trim();
  if (!cat) return;
  const count = goalsData.filter((g) => String(g.category || '').trim() === cat).length;
  if (!count) return;
  const ok = window.confirm(`Delete category "${cat}" and its ${count} goal(s)?`);
  if (!ok) return;
  goalsData = goalsData.filter((g) => String(g.category || '').trim() !== cat);
  if (goalListSelectedCategory === cat) goalListSelectedCategory = null;
  renderGoals();
  scheduleSaveAppStateToDb();
};

function createNetworkPersonViaForm() {
  openQuickFormModal({
    title: 'Add Network Person',
    submitLabel: 'Add Person',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Person name' },
      { name: 'city', label: 'City', type: 'text', placeholder: 'City', value: 'TBD' },
      { name: 'tags', label: 'Tags', type: 'text', placeholder: 'Comma-separated (NBA, Athlete)' },
      { name: 'ideas', label: 'Stream Ideas', type: 'textarea', placeholder: 'One idea per line' },
    ],
    onSubmit: (values) => {
      const name = String(values.name || '').trim();
      if (!name) {
        setDbStatus('Name is required to add a person.', 'warn');
        return false;
      }
      networkData.push({
        name,
        city: String(values.city || '').trim() || 'TBD',
        tags: String(values.tags || '')
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean),
        contacts: [],
        ideas: String(values.ideas || '')
          .split('\n')
          .map((x) => x.trim())
          .filter(Boolean),
      });
      renderNetwork();
      scheduleSaveAppStateToDb();
      return true;
    },
  });
}

function formatContactsForTextarea(contacts) {
  if (!Array.isArray(contacts)) return '';
  return contacts
    .map((c) => String(c?.handle || '').trim())
    .filter(Boolean)
    .join('\n');
}

function defaultAvatarForName(name) {
  const seed = encodeURIComponent(String(name || 'Person'));
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
}

function parseContactsFromTextarea(raw) {
  return String(raw || '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((handle) => {
      const lower = handle.toLowerCase();
      if (lower.includes('@') || lower.includes('instagram') || lower.includes('ig')) {
        return { type: 'brands', icon: 'fa-instagram', handle };
      }
      if (lower.includes('@x') || lower.includes('twitter') || lower.includes('x.com')) {
        return { type: 'brands', icon: 'fa-x-twitter', handle };
      }
      if (lower.includes('@yt') || lower.includes('youtube') || lower.includes('youtu')) {
        return { type: 'brands', icon: 'fa-youtube', handle };
      }
      if (lower.includes('mail') || lower.includes('@') || lower.includes('.com')) {
        return { type: 'solid', icon: 'fa-envelope', handle };
      }
      return { type: 'solid', icon: 'fa-address-book', handle };
    });
}

function editNetworkPersonViaForm(index) {
  const person = networkData[index];
  if (!person) return;
  openQuickFormModal({
    title: `Edit Contact: ${person.name || 'Person'}`,
    submitLabel: 'Save',
    fields: [
      { name: 'name', label: 'Name', type: 'text', value: String(person.name || '') },
      { name: 'city', label: 'City', type: 'text', value: String(person.city || '') },
      { name: 'photo', label: 'Photo URL', type: 'url', value: String(person.photo || ''), placeholder: 'https://...' },
      { name: 'tags', label: 'Tags', type: 'text', value: Array.isArray(person.tags) ? person.tags.join(', ') : String(person.tags || '') },
      {
        name: 'contacts',
        label: 'Contacts (one per line)',
        type: 'textarea',
        value: formatContactsForTextarea(person.contacts),
        placeholder: '@handle, email, phone, manager note...',
      },
      {
        name: 'ideas',
        label: 'Stream Ideas (one per line)',
        type: 'textarea',
        value: Array.isArray(person.ideas) ? person.ideas.join('\n') : String(person.ideas || ''),
      },
    ],
    onSubmit: (values) => {
      const name = String(values.name || '').trim();
      if (!name) {
        setDbStatus('Name is required.', 'warn');
        return false;
      }
      person.name = name;
      person.city = String(values.city || '').trim() || 'TBD';
      person.photo = String(values.photo || '').trim();
      person.tags = String(values.tags || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      person.contacts = parseContactsFromTextarea(values.contacts);
      person.ideas = String(values.ideas || '')
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean);
      renderNetwork();
      scheduleSaveAppStateToDb();
      return true;
    },
  });
}

function normalizeNameForMatch(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokensForName(value) {
  return normalizeNameForMatch(value)
    .split(' ')
    .filter((t) => t.length >= 3);
}

function isLikelySamePersonName(a, b) {
  const na = normalizeNameForMatch(a);
  const nb = normalizeNameForMatch(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const ta = tokensForName(na);
  const tb = tokensForName(nb);
  if (!ta.length || !tb.length) return false;
  const overlap = ta.filter((t) => tb.includes(t));
  return overlap.length >= 1;
}

function getPersonRelatedStreams(personName) {
  const needle = String(personName || '').trim().toLowerCase();
  if (!needle) return [];
  const streams = getUnifiedStreams();
  return streams.filter((stream) => {
    const collab = collabWithFieldAsSearchBlob(stream.collabWith);
    const goals = String(stream.goals || '').toLowerCase();
    const title = String(stream.title || '').toLowerCase();
    const logistics = String(stream.logistics || '').toLowerCase();
    if (collab.includes(needle) || goals.includes(needle) || title.includes(needle) || logistics.includes(needle)) return true;
    if (!Array.isArray(stream.segments)) return false;
    return stream.segments.some((seg) =>
      [seg?.title, seg?.goals, seg?.narrative]
        .map((v) => String(v || '').toLowerCase())
        .some((v) => v.includes(needle)) ||
      (Array.isArray(seg?.postedClips) &&
        seg.postedClips.some((clip) => {
          const people = Array.isArray(clip?.people) ? clip.people : String(clip?.people || '').split(',');
          return people.some((p) => isLikelySamePersonName(p, personName));
        }))
    );
  });
}

function getPersonTaggedClips(personName) {
  const needle = String(personName || '').trim().toLowerCase();
  if (!needle) return [];
  const clips = getClipBankEntries(getUnifiedStreams());
  return clips.filter(
    (clip) =>
      Array.isArray(clip.people) &&
      clip.people.some((p) => isLikelySamePersonName(p, personName))
  );
}

function getNetworkPersonMetrics(person) {
  const streams = getPersonRelatedStreams(person?.name || '');
  const clips = getPersonTaggedClips(person?.name || '');
  let recentStreamTs = null;
  streams.forEach((s) => {
    const parsed = parseStreamDateValue(s);
    if (!parsed) return;
    const ts = parsed.getTime();
    if (recentStreamTs == null || ts > recentStreamTs) recentStreamTs = ts;
  });
  return {
    streamCount: streams.length,
    clipCount: clips.length,
    recentStreamTs,
  };
}

function showNetworkPersonDetail(index) {
  const modal = document.getElementById('network-detail-modal');
  if (!modal) return;
  __activeNetworkDetailIndex = index;
  renderNetworkDetailModal(index);
  modal.classList.add('active');
}

function getUnifiedStreams() {
  const directStreams = arcsData.filter((a) => a.type !== 'Arc');
  const linkedStreams = [];
  arcsData
    .filter((a) => a.type === 'Arc' && Array.isArray(a.linkedStreams) && a.linkedStreams.length > 0)
    .forEach((arc) => {
      arc.linkedStreams.forEach((ls, idx) => {
        linkedStreams.push({
          ...ls,
          id: `${arc.id}-linked-${idx}`,
          status: arc.status || 'planning',
          parentArc: arc,
          linkedIndex: idx,
          type: ls.type || 'Linked',
          date: ls.date || arc.date || 'TBD',
          location: ls.location || arc.location || 'TBD',
        });
      });
    });
  return [...directStreams, ...linkedStreams];
}

function formatMonthYear(d) {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatWeekRangeFromDate(d) {
  const start = new Date(d);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  const startStr = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return `${startStr} to ${endStr}`;
}

function normalizeRecapPeriodLinks(raw, fallbackPeriods) {
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object') {
    return raw.map((item) => ({
      period: String(item.period || ''),
      url: String(item.url || ''),
    }));
  }
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'string') {
    return raw.map((url, idx) => ({
      period: fallbackPeriods[idx] || `Period ${idx + 1}`,
      url: String(url || ''),
    }));
  }
  return fallbackPeriods.map((period) => ({ period, url: '' }));
}

let activeClipStreamKey = '';
let goalListSelectedCategory = null;
const clipBankFilters = { text: '', tag: '', person: '' };
let activeClipStreamBucket = 'future';
const CINDY_PLATFORM_PHOTO = '';

function getClipStreamKey(stream) {
  return `${stream.parentArc ? stream.parentArc.id : 'root'}::${stream.id}::${Number.isInteger(stream.linkedIndex) ? stream.linkedIndex : -1}`;
}

function parseStreamDateValue(stream) {
  const raw = String(stream?.date || '').trim();
  if (!raw || raw.toLowerCase() === 'tbd') return null;
  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) return direct;
  const firstPart = raw.split(' - ')[0].trim();
  const fallback = new Date(firstPart);
  if (!Number.isNaN(fallback.getTime())) return fallback;
  return null;
}

function getClipStreamTimeBucket(stream) {
  const parsed = parseStreamDateValue(stream);
  if (parsed) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const streamDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
    if (streamDay < today) return 'past';
    if (streamDay > today) return 'future';
    return 'current';
  }
  const status = String(stream?.status || '').toLowerCase();
  if (status === 'active' || status === 'in progress') return 'current';
  if (status === 'planning') return 'future';
  return 'current';
}

function getArcTimelineStatus(arc) {
  const parsed = parseStreamDateValue(arc);
  if (parsed) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const arcDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
    if (arcDay < today) return { key: 'past', label: 'Past' };
    if (arcDay > today) return { key: 'future', label: 'Future' };
    return { key: 'current', label: 'Current' };
  }

  // Fallback for season-based dates like "Spring 2026" or "Winter 2026"
  const rawDate = String(arc?.date || '').toLowerCase();
  const yearMatch = rawDate.match(/\b(20\d{2})\b/);
  const year = yearMatch ? Number(yearMatch[1]) : null;
  const now = new Date();
  if (year && (rawDate.includes('spring') || rawDate.includes('summer') || rawDate.includes('fall') || rawDate.includes('autumn') || rawDate.includes('winter'))) {
    let start = null;
    let end = null;
    if (rawDate.includes('spring')) {
      start = new Date(year, 2, 1).getTime();
      end = new Date(year, 4, 31).getTime();
    } else if (rawDate.includes('summer')) {
      start = new Date(year, 5, 1).getTime();
      end = new Date(year, 7, 31).getTime();
    } else if (rawDate.includes('fall') || rawDate.includes('autumn')) {
      start = new Date(year, 8, 1).getTime();
      end = new Date(year, 10, 30).getTime();
    } else if (rawDate.includes('winter')) {
      start = new Date(year, 11, 1).getTime();
      end = new Date(year + 1, 1, 28).getTime();
    }
    if (start != null && end != null) {
      const nowMs = now.getTime();
      if (nowMs < start) return { key: 'future', label: 'Future' };
      if (nowMs > end) return { key: 'past', label: 'Past' };
      return { key: 'current', label: 'Current' };
    }
  }

  // Last fallback: map older status values.
  const legacy = String(arc?.status || '').toLowerCase();
  if (legacy === 'planning') return { key: 'future', label: 'Future' };
  if (legacy === 'completed' || legacy === 'past' || legacy === 'done') return { key: 'past', label: 'Past' };
  return { key: 'current', label: 'Current' };
}

function getClipStreamRecord(streamId, parentArcId, linkedIndex) {
  if (parentArcId && parentArcId !== 'null') {
    const parent = arcsData.find((a) => a.id === parentArcId);
    if (!parent || !Array.isArray(parent.linkedStreams)) return null;
    if (Number.isInteger(linkedIndex) && linkedIndex >= 0) return parent.linkedStreams[linkedIndex];
    return null;
  }
  return arcsData.find((a) => a.id === streamId) || null;
}

/** Returns an 11-char YouTube video id when the URL is a known YouTube shape, else null. */
function extractYouTubeVideoId(rawUrl) {
  const u = String(rawUrl || '').trim();
  if (!u) return null;
  try {
    const href = /^https?:\/\//i.test(u) ? u : `https://${u}`;
    const url = new URL(href);
    const host = url.hostname.replace(/^www\./i, '').toLowerCase();
    const isYtId = (id) => id && /^[a-zA-Z0-9_-]{11}$/.test(id);
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return isYtId(id) ? id : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const v = url.searchParams.get('v');
      if (isYtId(v)) return v;
      const parts = url.pathname.split('/').filter(Boolean);
      for (let i = 0; i < parts.length; i++) {
        if (['embed', 'shorts', 'live', 'v'].includes(parts[i]) && parts[i + 1]) {
          if (isYtId(parts[i + 1])) return parts[i + 1];
        }
      }
    }
  } catch {
    /* invalid URL */
  }
  return null;
}

/** Thumbnail URL for clip bank cards (YouTube only; other hosts use placeholder in UI). */
function getClipBankThumbnailUrl(rawUrl) {
  const id = extractYouTubeVideoId(rawUrl);
  if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  return null;
}

/** For clip bank placeholder art: YouTube gets a real thumb; TikTok gets brand icon; other = film icon. */
function getClipBankClipHost(rawUrl) {
  if (extractYouTubeVideoId(rawUrl)) return 'youtube';
  const u = String(rawUrl || '').trim();
  if (!u) return 'other';
  try {
    const href = /^https?:\/\//i.test(u) ? u : `https://${u}`;
    const host = new URL(href).hostname.replace(/^www\./i, '').toLowerCase();
    if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) return 'tiktok';
  } catch {
    /* invalid URL */
  }
  return 'other';
}

function getClipBankEntries(streams) {
  const entries = [];
  streams.forEach((stream) => {
    (stream.segments || []).forEach((seg, segIndex) => {
      const posted = Array.isArray(seg.postedClips) ? seg.postedClips : [];
      posted.forEach((clip, clipIndex) => {
        const tags = Array.isArray(clip.tags)
          ? clip.tags.map((t) => String(t).trim()).filter(Boolean)
          : String(clip.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
        const people = Array.isArray(clip.people)
          ? clip.people.map((p) => String(p).trim()).filter(Boolean)
          : String(clip.people || '').split(',').map((p) => p.trim()).filter(Boolean);
        entries.push({
          streamTitle: stream.title,
          segmentTitle: seg.title || `Segment ${segIndex + 1}`,
          url: String(clip.url || ''),
          title: String(clip.title || ''),
          tags,
          people,
          clipIndex,
        });
      });
    });
  });
  (Array.isArray(segmentBankData) ? segmentBankData : []).forEach((seg) => {
    const bankSegTitle = String(seg.title || 'Untitled segment').trim() || 'Untitled segment';
    const folder = String(seg.clipBankUrl || '').trim();
    const posted = Array.isArray(seg.postedClips) ? seg.postedClips : [];
    posted.forEach((clip) => {
      const url = String(clip?.url || '').trim();
      if (!url) return;
      const tags = Array.isArray(clip.tags)
        ? clip.tags.map((t) => String(t).trim()).filter(Boolean)
        : String(clip.tags || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      const people = Array.isArray(clip.people)
        ? clip.people.map((p) => String(p).trim()).filter(Boolean)
        : String(clip.people || '')
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean);
      entries.push({
        streamTitle: bankSegTitle,
        segmentTitle: 'Segment bank',
        url,
        title: String(clip.title || '').trim() || 'Clip',
        tags,
        people,
        clipIndex: 0,
      });
    });
    if (!folder) return;
    entries.push({
      streamTitle: bankSegTitle,
      segmentTitle: 'Clip bank (folder)',
      url: folder,
      title: 'Open clip bank',
      tags: [],
      people: [],
      clipIndex: 0,
    });
  });
  return entries;
}

function renderClippersBoard() {
  const board = document.getElementById('clippers-segment-board');
  const bankBoard = document.getElementById('clip-bank-board');
  if (!board || !bankBoard) return;
  const streams = getUnifiedStreams();
  if (streams.length === 0) {
    board.innerHTML = `<div class="glass-panel" style="padding:16px; color:var(--text-muted);">No streams available yet. Add streams in Streams first.</div>`;
    bankBoard.innerHTML = '';
    return;
  }
  const groupedStreams = { past: [], current: [], future: [] };
  streams.forEach((stream) => {
    const bucket = getClipStreamTimeBucket(stream);
    groupedStreams[bucket].push(stream);
  });
  const availableBuckets = ['past', 'current', 'future'];
  if (!availableBuckets.includes(activeClipStreamBucket)) activeClipStreamBucket = 'future';
  let visibleStreams = groupedStreams[activeClipStreamBucket] || [];
  const visibleKeys = new Set(visibleStreams.map((s) => getClipStreamKey(s)));
  if (!visibleKeys.has(activeClipStreamKey)) activeClipStreamKey = '';
  const activeStream = visibleStreams.find((s) => getClipStreamKey(s) === activeClipStreamKey) || null;
  const activeSegments = activeStream && Array.isArray(activeStream.segments) ? activeStream.segments : [];
  const clipBankLocked = isClipperRole();
  const vodAngleReadOnly = isClipperRole();
  const showClippersDetailOnly = Boolean(activeStream) && isMobileDetailDockLayout();
  const clippersBackBtn = showClippersDetailOnly
    ? `<button type="button" class="btn btn-outline btn-sm mobile-detail-back-btn" onclick="document.getElementById('tab-media')?.classList.remove('clippers-mgmt-detail-open')"><i class="fa-solid fa-arrow-left"></i> Back to list</button>`
    : '';

  board.innerHTML = `
    <div class="campaigns-layout clippers-mgmt-layout">
      <div class="glass-panel" style="padding: 12px;">
        <div style="font-size:0.78rem; text-transform:uppercase; color:var(--text-muted); margin-bottom:10px;">Streams</div>
        <div style="display:flex; gap:6px; margin-bottom:8px;">
          <button type="button" onclick="setClipManagementBucket('past')" class="btn btn-outline btn-sm" style="flex:1; border-color:${activeClipStreamBucket === 'past' ? 'rgba(204,255,0,0.6)' : 'var(--border-color)'}; background:${activeClipStreamBucket === 'past' ? 'rgba(204,255,0,0.1)' : 'transparent'};">Past</button>
          <button type="button" onclick="setClipManagementBucket('current')" class="btn btn-outline btn-sm" style="flex:1; border-color:${activeClipStreamBucket === 'current' ? 'rgba(204,255,0,0.6)' : 'var(--border-color)'}; background:${activeClipStreamBucket === 'current' ? 'rgba(204,255,0,0.1)' : 'transparent'};">Present</button>
          <button type="button" onclick="setClipManagementBucket('future')" class="btn btn-outline btn-sm" style="flex:1; border-color:${activeClipStreamBucket === 'future' ? 'rgba(204,255,0,0.6)' : 'var(--border-color)'}; background:${activeClipStreamBucket === 'future' ? 'rgba(204,255,0,0.1)' : 'transparent'};">Future</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; max-height: 560px; overflow:auto;">
          ${visibleStreams.length
      ? visibleStreams
        .map((stream) => {
          const keyValue = getClipStreamKey(stream);
          const isActive = keyValue === activeClipStreamKey;
          return `<button type="button" onclick="setActiveClipManagementStream('${keyValue}')" class="btn btn-outline btn-sm" style="text-align:left; justify-content:flex-start; border-color:${isActive ? 'rgba(204,255,0,0.6)' : 'var(--border-color)'}; background:${isActive ? 'rgba(204,255,0,0.1)' : 'transparent'};">
                      ${escAttr(stream.title)}
                    </button>`;
        })
        .join('')
      : `<div style="font-size:0.82rem; color:var(--text-muted); border:1px dashed var(--border-color); border-radius:8px; padding:10px;">No streams in this time bucket.</div>`
    }
        </div>
      </div>
      <div class="glass-panel detail-panel clippers-mgmt-detail-panel" style="padding: 16px; min-width: 0;">
        ${activeStream
      ? `
              ${clippersBackBtn}
              <div style="display:flex; justify-content:space-between; gap:10px; align-items:center; margin-bottom:12px;">
                <h4 style="margin:0; font-size:1rem;">${escAttr(activeStream.title)}</h4>
                ${activeStream.parentArc ? `<span style="color:var(--text-muted); font-size:0.82rem;">From arc: ${escAttr(activeStream.parentArc.title)}</span>` : ''}
              </div>
              <div style="display:grid; grid-template-columns:minmax(0,1fr) auto auto; gap:8px; align-items:center; margin-bottom:10px;">
                <input class="form-input stream-full-vod-url" style="width:100%;" placeholder="Full stream VOD URL" value="${escAttr(activeStream.fullVodUrl || '')}"
                  ${vodAngleReadOnly ? 'readonly' : `oninput="updateStreamClipField('${activeStream.id}', ${activeStream.parentArc ? `'${activeStream.parentArc.id}'` : 'null'}, ${Number.isInteger(activeStream.linkedIndex) ? activeStream.linkedIndex : -1}, 'fullVodUrl', this.value)"`} />
                <button type="button" class="btn btn-outline btn-sm" style="flex-shrink:0;" title="Play in app" onclick="void window.openMediaEmbedPreview(this.closest('div').querySelector('.stream-full-vod-url').value)"><i class="fa-solid fa-play"></i></button>
                <a href="${escAttr(activeStream.fullVodUrl || '#')}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="flex-shrink:0;" onclick="if(!(this.closest('div').querySelector('.stream-full-vod-url').value||'').trim()){event.preventDefault();return;} this.href=this.closest('div').querySelector('.stream-full-vod-url').value.trim();"><i class="fa-solid fa-up-right-from-square"></i></a>
              </div>
            `
      : `<div style="font-size:0.9rem; color:var(--text-muted); border:1px dashed var(--border-color); border-radius:8px; padding:10px; margin-bottom:10px;">Select a stream to manage full VOD, segment VODs, and posted clips.</div>`
    }
        <div style="display:flex; flex-direction:column; gap:10px; min-width:0;">
          ${activeSegments
      .map((seg, segIndex) => {
        const vod = seg.clipVodUrl || '';
        const angle = seg.clipDesiredAngle || '';
        const postedClips = Array.isArray(seg.postedClips) ? seg.postedClips : [];
        return `
                <div style="border:1px solid var(--border-color); border-radius:8px; padding:10px; background:rgba(255,255,255,0.02); min-width:0;">
                  <div style="font-size:0.82rem; color:var(--primary); margin-bottom:8px;">Segment ${segIndex + 1}: ${escAttr(seg.title || 'Untitled')}</div>
                  <div style="display:grid; grid-template-columns:minmax(0,1fr) auto auto; gap:8px; align-items:center; margin-bottom:8px;">
                    <input class="form-input segment-vod-url" style="width:100%;" placeholder="Segment VOD URL" value="${escAttr(vod)}"
                      ${vodAngleReadOnly ? 'readonly' : `oninput="updateSegmentClipperFields('${activeStream.id}', ${activeStream.parentArc ? `'${activeStream.parentArc.id}'` : 'null'}, ${Number.isInteger(activeStream.linkedIndex) ? activeStream.linkedIndex : -1}, ${segIndex}, 'clipVodUrl', this.value)"`} />
                    <button type="button" class="btn btn-outline btn-sm" style="flex-shrink:0;" title="Play in app" onclick="void window.openMediaEmbedPreview(this.closest('div').querySelector('.segment-vod-url').value)"><i class="fa-solid fa-play"></i></button>
                    <a href="${escAttr(vod || '#')}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="flex-shrink:0;" onclick="if(!(this.closest('div').querySelector('.segment-vod-url').value||'').trim()){event.preventDefault();return;} this.href=this.closest('div').querySelector('.segment-vod-url').value.trim();"><i class="fa-solid fa-up-right-from-square"></i></a>
                  </div>
                  <textarea class="form-input" style="width:100%; min-height:72px; resize:vertical; margin-bottom:8px;" placeholder="Desired angle for clippers"
                    ${vodAngleReadOnly ? 'readonly' : `oninput="updateSegmentClipperFields('${activeStream.id}', ${activeStream.parentArc ? `'${activeStream.parentArc.id}'` : 'null'}, ${Number.isInteger(activeStream.linkedIndex) ? activeStream.linkedIndex : -1}, ${segIndex}, 'clipDesiredAngle', this.value)"`}>${escAttr(angle)}</textarea>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <strong style="font-size:0.82rem;">Posted Clips</strong>
                    ${clipBankLocked ? '' : `<button type="button" class="btn btn-outline btn-sm" onclick="addPostedClip('${activeStream.id}', ${activeStream.parentArc ? `'${activeStream.parentArc.id}'` : 'null'}, ${Number.isInteger(activeStream.linkedIndex) ? activeStream.linkedIndex : -1}, ${segIndex})"><i class="fa-solid fa-plus"></i> Add clip</button>`}
                  </div>
                  <div style="display:flex; flex-direction:column; gap:8px; min-width:0;">
                    ${postedClips
            .map(
              (clip, clipIndex) => `
                        <div class="posted-clip-row">
                          <input class="form-input" style="min-width:0;width:100%;box-sizing:border-box;" placeholder="Clip title" value="${escAttr(clip.title || '')}"
                            ${clipBankLocked ? 'readonly' : `oninput="updatePostedClipField('${activeStream.id}', ${activeStream.parentArc ? `'${activeStream.parentArc.id}'` : 'null'}, ${Number.isInteger(activeStream.linkedIndex) ? activeStream.linkedIndex : -1}, ${segIndex}, ${clipIndex}, 'title', this.value)"`} />
                          <input type="url" class="form-input posted-clip-url" style="min-width:0;width:100%;box-sizing:border-box;" placeholder="Clip URL" value="${escAttr(clip.url || '')}"
                            ${clipBankLocked ? 'readonly' : `oninput="updatePostedClipField('${activeStream.id}', ${activeStream.parentArc ? `'${activeStream.parentArc.id}'` : 'null'}, ${Number.isInteger(activeStream.linkedIndex) ? activeStream.linkedIndex : -1}, ${segIndex}, ${clipIndex}, 'url', this.value)"`} />
                          <input class="form-input" style="min-width:0;width:100%;box-sizing:border-box;" placeholder="Tags (funny, wild)" value="${escAttr(Array.isArray(clip.tags) ? clip.tags.join(', ') : (clip.tags || ''))}"
                            ${clipBankLocked ? 'readonly' : `oninput="updatePostedClipField('${activeStream.id}', ${activeStream.parentArc ? `'${activeStream.parentArc.id}'` : 'null'}, ${Number.isInteger(activeStream.linkedIndex) ? activeStream.linkedIndex : -1}, ${segIndex}, ${clipIndex}, 'tags', this.value)"`} />
                          <input class="form-input" style="min-width:0;width:100%;box-sizing:border-box;" placeholder="People (Iggy, Von Miller)" value="${escAttr(Array.isArray(clip.people) ? clip.people.join(', ') : (clip.people || ''))}"
                            ${clipBankLocked ? 'readonly' : `oninput="updatePostedClipField('${activeStream.id}', ${activeStream.parentArc ? `'${activeStream.parentArc.id}'` : 'null'}, ${Number.isInteger(activeStream.linkedIndex) ? activeStream.linkedIndex : -1}, ${segIndex}, ${clipIndex}, 'people', this.value)"`} />
                          <button type="button" class="btn btn-outline btn-sm" style="flex-shrink:0;" title="Play in app" onclick="void window.openMediaEmbedPreview(this.closest('.posted-clip-row').querySelector('.posted-clip-url').value)"><i class="fa-solid fa-play"></i></button>
                          <a href="${escAttr(clip.url || '#')}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="flex-shrink:0;" title="Open link" onclick="if(!(this.closest('.posted-clip-row').querySelector('.posted-clip-url').value||'').trim()){event.preventDefault();return;} this.href=this.closest('.posted-clip-row').querySelector('.posted-clip-url').value.trim();"><i class="fa-solid fa-up-right-from-square"></i></a>
                          ${clipBankLocked ? '' : `<button type="button" class="btn btn-outline btn-sm" style="flex-shrink:0;" onclick="removePostedClip('${activeStream.id}', ${activeStream.parentArc ? `'${activeStream.parentArc.id}'` : 'null'}, ${Number.isInteger(activeStream.linkedIndex) ? activeStream.linkedIndex : -1}, ${segIndex}, ${clipIndex})"><i class="fa-solid fa-xmark"></i></button>`}
                        </div>`
            )
            .join('')}
                    ${postedClips.length === 0 ? `<div style="font-size:0.82rem; color:var(--text-muted);">No clips posted yet for this segment.</div>` : ''}
                    ${clipBankLocked ? '<div style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;">Posted clips are view-only for your role.</div>' : ''}
                  </div>
                </div>
              `;
      })
      .join('')}
          ${activeSegments.length === 0
      ? `<div style="font-size:0.86rem; color:var(--text-muted); border:1px dashed var(--border-color); border-radius:8px; padding:10px;">No segments on this stream yet.</div>`
      : ''
    }
        </div>
      </div>
    </div>
  `;
  const mediaTab = document.getElementById('tab-media');
  if (mediaTab) {
    if (showClippersDetailOnly) mediaTab.classList.add('clippers-mgmt-detail-open');
    else mediaTab.classList.remove('clippers-mgmt-detail-open');
  }

  const entries = getClipBankEntries(streams);
  const allTags = [...new Set(entries.flatMap((e) => e.tags))].sort((a, b) => a.localeCompare(b));
  const allPeople = [...new Set(entries.flatMap((e) => e.people))].sort((a, b) => a.localeCompare(b));
  const query = clipBankFilters.text.trim().toLowerCase();
  const filtered = entries.filter((entry) => {
    const inQuery =
      !query ||
      entry.title.toLowerCase().includes(query) ||
      entry.streamTitle.toLowerCase().includes(query) ||
      entry.tags.some((t) => t.toLowerCase().includes(query)) ||
      entry.people.some((p) => p.toLowerCase().includes(query));
    const inTag = !clipBankFilters.tag || entry.tags.includes(clipBankFilters.tag);
    const inPerson = !clipBankFilters.person || entry.people.includes(clipBankFilters.person);
    return inQuery && inTag && inPerson;
  });

  bankBoard.innerHTML = `
    <div class="glass-panel" style="padding:16px;">
      ${clipBankLocked ? '<p style="margin:0 0 12px; font-size:0.82rem; color:var(--text-muted);">Search and open clips below. Submit new links from <strong>Segment Bank</strong> — they appear here automatically.</p>' : ''}
      <div class="clip-bank-filters-grid">
        <input class="form-input" placeholder="Search by stream, tag, person..." value="${escAttr(clipBankFilters.text)}" oninput="setClipBankFilter('text', this.value)" />
        <select class="form-input" style="appearance:auto; background: rgba(0,0,0,0.5);" onchange="setClipBankFilter('tag', this.value)">
          <option value="">All tags</option>
          ${allTags.map((tag) => `<option value="${escAttr(tag)}" ${clipBankFilters.tag === tag ? 'selected' : ''}>${escAttr(tag)}</option>`).join('')}
        </select>
        <select class="form-input" style="appearance:auto; background: rgba(0,0,0,0.5);" onchange="setClipBankFilter('person', this.value)">
          <option value="">All people</option>
          ${allPeople.map((p) => `<option value="${escAttr(p)}" ${clipBankFilters.person === p ? 'selected' : ''}>${escAttr(p)}</option>`).join('')}
        </select>
      </div>
      <div class="clip-bank-scroll" style="max-height: 520px; overflow: auto; min-width: 0;">
        ${filtered.length
      ? `<div class="clip-bank-grid">` +
      filtered
        .map((clip) => {
          const thumb = getClipBankThumbnailUrl(clip.url);
          const hostKind = getClipBankClipHost(clip.url);
          const href = escAttr(clip.url);
          const thumbImg = thumb
            ? `<img src="${escAttr(thumb)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`
            : '';
          const phClass =
            hostKind === 'tiktok'
              ? 'clip-bank-card-thumb-placeholder clip-bank-card-thumb-placeholder--tiktok'
              : 'clip-bank-card-thumb-placeholder';
          const phIcon =
            hostKind === 'tiktok'
              ? '<i class="fa-brands fa-tiktok clip-bank-card-thumb-icon clip-bank-card-thumb-icon--tiktok"></i>'
              : '<i class="fa-solid fa-film clip-bank-card-thumb-icon"></i>';
          return `
                <div role="button" tabindex="0" class="clip-bank-card" onclick="void window.openMediaEmbedPreview(${JSON.stringify(clip.url)})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();void window.openMediaEmbedPreview(${JSON.stringify(clip.url)});}">
                  <div class="clip-bank-card-thumb">
                    <div class="${phClass}" aria-hidden="true">${phIcon}</div>
                    ${thumbImg}
                  </div>
                  <div class="clip-bank-card-body">
                    <div class="clip-bank-card-title">${escAttr(clip.title || 'Untitled clip')}</div>
                    <div class="clip-bank-card-meta">${escAttr(clip.streamTitle)} · ${escAttr(clip.segmentTitle)}</div>
                    <div class="clip-bank-card-tags">
                      ${clip.tags.map((tag) => `<span class="tag">${escAttr(tag)}</span>`).join('')}
                      ${clip.people.map((person) => `<span class="tag clip-bank-card-person">${escAttr(person)}</span>`).join('')}
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:8px;">
                      <a href="${href}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="font-size:0.75rem; padding:4px 10px;" onclick="event.stopPropagation();">Open</a>
                    </div>
                  </div>
                </div>`;
        })
        .join('') +
      `</div>`
      : `<div style="font-size:0.9rem; color:var(--text-muted); padding: 8px 0;">No clips match these filters yet.</div>`
    }
      </div>
    </div>
  `;
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.arcsData)) {
      applyAppState(data);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

async function loadAppStateFromDb() {
  try {
    const res = await fetch('/api/state', { credentials: 'include' });
    if (res.status === 401) return false;
    if (!res.ok) return loadFromLocalStorage();
    const data = await res.json();
    if (data && data.arcsData && Array.isArray(data.arcsData)) {
      applyAppState(data);
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(data));
      } catch {
        /* quota */
      }
      return true;
    }
  } catch {
    /* not served over http or server down */
  }
  return loadFromLocalStorage();
}

async function saveAppStateToDb(options = {}) {
  const silent = Boolean(options.silent);
  const throwOnFail = Boolean(options.throwOnFail);
  const body = serializeAppState();
  const json = JSON.stringify(body);
  try {
    localStorage.setItem(LS_KEY, json);
  } catch {
    /* quota */
  }
  try {
    const res = await fetch('/api/state', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: json,
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || res.statusText);
    __lastSavedJson = json;
    if (!silent) setDbStatus(`Saved to disk · ${new Date().toLocaleTimeString()}`, 'ok');
    else setDbStatus(`Auto-saved · ${new Date().toLocaleTimeString()}`, 'ok');
    return true;
  } catch (e) {
    __lastSavedJson = json;
    const errMsg = e && e.message ? String(e.message) : 'Network or server error';
    if (throwOnFail) {
      window.__lastPutStateError = errMsg;
      return false;
    }
    if (!silent) {
      setDbStatus(`Saved in this browser only (use http://localhost:3847 for disk file)`, 'warn');
    } else {
      setDbStatus(`Auto-saved (browser) · ${new Date().toLocaleTimeString()}`, 'warn');
    }
    return true;
  }
}

function scheduleSaveAppStateToDb() {
  if (isClipperRole()) return;
  clearTimeout(__saveDbTimer);
  __saveDbTimer = setTimeout(() => void saveAppStateToDb({ silent: true }), 500);
}

async function autoSaveIfChanged() {
  if (isClipperRole()) return;
  const json = JSON.stringify(serializeAppState());
  if (json === __lastSavedJson) return;
  await saveAppStateToDb({ silent: true });
}

function startAutoSave() {
  __lastSavedJson = JSON.stringify(serializeAppState());
  setInterval(() => void autoSaveIfChanged(), AUTO_SAVE_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void autoSaveIfChanged();
  });
  window.addEventListener('beforeunload', () => {
    if (isClipperRole()) {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(serializeAppState()));
      } catch {
        /* ignore */
      }
      return;
    }
    const json = JSON.stringify(serializeAppState());
    try {
      localStorage.setItem(LS_KEY, json);
    } catch {
      /* ignore */
    }
    try {
      navigator.sendBeacon('/api/state', new Blob([json], { type: 'application/json' }));
    } catch {
      /* ignore */
    }
  });
}

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const tabPanes = document.querySelectorAll('.tab-pane');
const pageTitle = document.getElementById('page-title');
const pageDesc = document.getElementById('page-desc');
const mainActionBtn = document.getElementById('main-action-btn');

// Page metadata
const pages = {
  calendar: {
    title: 'Calendar Overview',
    desc: 'Manage upcoming streams, posters, and trailers schedule.',
    btnText: 'Add Event',
    btnIcon: 'fa-plus'
  },
  streams: {
    title: 'Streams',
    desc: 'Detailed stream management and preparation.',
    btnText: 'New',
    btnIcon: 'fa-video'
  },
  arcs: {
    title: 'Arcs',
    desc: 'Long-term narrative arcs and campaigns.',
    btnText: 'New',
    btnIcon: 'fa-bolt'
  },
  goals: {
    title: 'Goals & Objectives',
    desc: 'Track and manage ecosystem-wide goals.',
    btnText: 'New Goal',
    btnIcon: 'fa-plus'
  },
  media: {
    title: 'Media & Narrative',
    desc: 'Asset distribution, platform focus, and narrative orientation.',
    btnText: 'New Directive',
    btnIcon: 'fa-bullhorn'
  },
  network: {
    title: 'Network Directory',
    desc: 'Manage contacts, locations, and collab ideas.',
    btnText: 'Add Person',
    btnIcon: 'fa-plus'
  }
};

// Initialize App
function enterClipperRestrictedShell() {
  if (!isClipperRole()) return;
  const mediaLabel = document.querySelector('.nav-item[data-tab="media"] span');
  if (mediaLabel) mediaLabel.textContent = 'Clipping';
  const mediaNav = document.querySelector('.nav-item[data-tab="media"]');
  if (mediaNav) mediaNav.click();
  requestAnimationFrame(() => {
    const clipBtn = document.querySelector('#media-subtab-selector [data-media-subtab="clippers"]');
    if (clipBtn) clipBtn.click();
    const pt = document.getElementById('page-title');
    const pd = document.getElementById('page-desc');
    const ma = document.getElementById('main-action-btn');
    if (pt) pt.textContent = 'Clipping';
    if (pd) pd.textContent = 'Streams, clip bank, and segment bank — read-only for your role.';
    if (ma) ma.style.display = 'none';
  });
}

function startMainApplication() {
  if (__mainAppStarted) return;
  __mainAppStarted = true;
  document.documentElement.classList.add('auth-remote-unlocked');
  setupNavigation();
  syncAuthChrome();
  renderCalendar();
  renderStreams();
  renderArcs();
  renderNarratives();
  renderClippersBoard();
  renderAssets();
  renderGoals();
  renderNetwork();
  renderReachOutContacts();
  setupMediaSubtabs();
  setupClippersSubtabs();
  enterClipperRestrictedShell();
  setupNetworkSubtabs();
  setupCreativeDirectorTabs();
  setupAboutMeSectionTabs();
  setupModal();
  setupTikTokTrendPreviewModal();
  setupSegmentBankModal();
  setupQuickFormModal();
  setupNetworkDetailModal();
  startAutoSave();

  let detailDockResizeTimer;
  const onDetailDockLayoutChange = () => {
    clearTimeout(detailDockResizeTimer);
    detailDockResizeTimer = setTimeout(() => {
      if (!isMobileDetailDockLayout()) {
        restoreAllDetailPanelsToColumns();
      } else {
        scheduleDetailDockRetry(syncStreamDetailDock);
        scheduleDetailDockRetry(syncArcDetailDock);
        scheduleDetailDockRetry(syncAssetDetailDock);
        scheduleDetailDockRetry(syncGoalDetailDock);
      }
    }, 150);
  };
  window.addEventListener('resize', onDetailDockLayoutChange);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onDetailDockLayoutChange);
  }

  // Load persisted state in the background; do not block UI on network.
  void (async () => {
    const loaded = await Promise.race([
      loadAppStateFromDb(),
      new Promise((resolve) => setTimeout(() => resolve(false), 2500)),
    ]);
    if (!loaded) return;
    // ensureCollegeTakeoverArc();
    // ensureF1LinkedStreams();
    // ensureSeedNetworkPeople();
    // ensureNetworkPhotoDefaults();
    // normalizeReachOutContactsData();
    refreshAllViews();
  })();

  const newGoalBtn = document.getElementById('new-goal-btn');
  if (newGoalBtn) {
    newGoalBtn.addEventListener('click', () => {
      createGoalViaForm();
    });
  }

  const addPersonBtn = document.getElementById('add-person-btn');
  if (addPersonBtn) {
    addPersonBtn.addEventListener('click', () => {
      createNetworkPersonViaForm();
    });
  }

  const addReachoutContactBtn = document.getElementById('add-reachout-contact-btn');
  if (addReachoutContactBtn) {
    addReachoutContactBtn.addEventListener('click', () => {
      addReachOutContactViaForm();
    });
  }

  const networkFilterBtn = document.getElementById('network-filter-btn');
  if (networkFilterBtn) {
    networkFilterBtn.addEventListener('click', () => {
      const allTags = [...new Set(networkData.flatMap((p) => (Array.isArray(p.tags) ? p.tags : []).map((t) => String(t).trim()).filter(Boolean)))].sort((a, b) =>
        a.localeCompare(b)
      );
      const allNames = [...new Set(networkData.map((p) => String(p?.name || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
      openQuickFormModal({
        title: 'Filter Network',
        submitLabel: 'Apply Filter',
        fields: [
          { name: 'query', label: 'Name contains', type: 'text', placeholder: 'Leave empty to reset', value: networkFilters.query },
          { name: 'name', label: 'Exact name', type: 'select', value: networkFilters.name, options: ['', ...allNames] },
          { name: 'tag', label: 'Tag', type: 'select', value: networkFilters.tag, options: ['', ...allTags] },
          {
            name: 'sort',
            label: 'Sort by',
            type: 'select',
            value: networkFilters.sort,
            options: [
              { value: 'name_asc', label: 'Name (A-Z)' },
              { value: 'recent_streamed_with', label: 'Most Recently Streamed With' },
              { value: 'most_streamed_with', label: 'Most Streamed With' },
              { value: 'most_clips_with', label: 'Most Clips With' },
            ],
          },
        ],
        onSubmit: (values) => {
          networkFilters.query = String(values.query || '').trim();
          networkFilters.name = String(values.name || '').trim();
          networkFilters.tag = String(values.tag || '').trim();
          networkFilters.sort = String(values.sort || 'name_asc').trim() || 'name_asc';
          renderNetwork();
          return true;
        },
      });
    });
  }

  const networkSortBtn = document.getElementById('network-sort-btn');
  if (networkSortBtn) {
    networkSortBtn.addEventListener('click', () => {
      openQuickFormModal({
        title: 'Sort Network',
        submitLabel: 'Apply Sort',
        fields: [
          {
            name: 'sort',
            label: 'Sort by',
            type: 'select',
            value: networkFilters.sort,
            options: [
              { value: 'name_asc', label: 'Name (A-Z)' },
              { value: 'recent_streamed_with', label: 'Most Recently Streamed With' },
              { value: 'most_streamed_with', label: 'Most Streamed With' },
              { value: 'most_clips_with', label: 'Most Clips With' },
            ],
          },
        ],
        onSubmit: (values) => {
          networkFilters.sort = String(values.sort || 'name_asc').trim() || 'name_asc';
          renderNetwork();
          return true;
        },
      });
    });
  }

  const arcTimelineBtns = document.querySelectorAll('#tab-arcs .arc-timeline-btn');
  arcTimelineBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = String(btn.getAttribute('data-arc-timeline') || '').trim().toLowerCase();
      arcTimelineFilter.timeline = v === 'past' || v === 'current' || v === 'future' ? v : '';
      renderArcs();
    });
  });

  const notificationsBtn = document.getElementById('notifications-btn');
  if (notificationsBtn) {
    notificationsBtn.addEventListener('click', () => {
      openQuickFormModal({
        title: 'Notifications',
        submitLabel: 'Close',
        fields: [{ name: 'note', label: 'Status', type: 'textarea', value: 'Notifications are enabled. No new alerts right now.' }],
        onSubmit: () => true,
      });
    });
  }

  if (mainActionBtn) {
    mainActionBtn.addEventListener('click', () => {
      const activeTab = document.querySelector('.nav-item.active')?.getAttribute('data-tab') || 'calendar';
      if (activeTab === 'goals') {
        createGoalViaForm();
        return;
      }
      if (activeTab === 'network') {
        createNetworkPersonViaForm();
      }
    });
  }
}

async function bootApplication() {
  setupAuthLoginForm();
  let me;
  try {
    const r = await fetch('/api/me', { credentials: 'include' });
    me = await r.json();
    if (!r.ok) throw new Error('bad');
  } catch {
    me = {
      authDisabled: true,
      offline: true,
      authHint: 'Could not reach the app server — open the site from the Node server (e.g. http://localhost:3847/index.html) so sign-in can load.',
      user: { id: 'local', email: '', role: 'lead', displayName: 'Offline' },
    };
  }
  function isLocalAppHost() {
    const h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h.endsWith('.local');
  }
  const serverAuthDisabled = Boolean(me.authDisabled);
  window.__authOffline = Boolean(me.offline);
  window.__authHint = typeof me.authHint === 'string' ? me.authHint : '';
  window.__authServerAuthOffOnProd = !window.__authOffline && serverAuthDisabled && !isLocalAppHost();

  if (window.__authOffline) {
    window.__authDisabled = false;
    window.__authUser = null;
  } else if (serverAuthDisabled && isLocalAppHost()) {
    window.__authDisabled = true;
    window.__authUser = me.user || null;
  } else if (window.__authServerAuthOffOnProd) {
    window.__authDisabled = false;
    window.__authUser = null;
  } else {
    window.__authDisabled = false;
    window.__authUser = me.user || null;
  }

  const overlay = document.getElementById('auth-login-overlay');
  const mis = document.getElementById('auth-misconfig-banner');
  if (mis) {
    if (window.__authServerAuthOffOnProd) {
      mis.style.display = 'block';
      mis.textContent =
        'This URL is still served without a database-backed session on the server. In Render (or your host), set DATABASE_URL for Postgres, save, and redeploy. Until then, register and sign-in cannot succeed. After redeploy, reload this page.';
    } else if (window.__authOffline) {
      mis.style.display = 'block';
      mis.textContent = window.__authHint || 'Cannot reach the app server from this page. Use the hosted URL or start the local server (e.g. port 3847).';
    } else {
      mis.style.display = 'none';
      mis.textContent = '';
    }
  }
  if (!window.__authDisabled && !window.__authUser) {
    overlay?.classList.add('active');
    return;
  }
  overlay?.classList.remove('active');
  startMainApplication();
}

document.addEventListener('DOMContentLoaded', () => {
  void bootApplication();
});

// Navigation Logic
function setupNavigation() {
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      if (isClipperRole() && tabId !== 'media') return;
      clearMobileCardDetailScreens();
      // Update Active State
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      // Switch Tabs
      tabPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === `tab-${tabId}`) {
          pane.classList.add('active');
        }
      });

      requestAnimationFrame(() => {
        if (tabId === 'streams') {
          streamListSelectedKey = null;
          hideDetailPanel('stream-detail', '#tab-streams .campaign-detail-col');
          renderStreams();
        } else if (tabId === 'arcs') {
          arcListSelectedId = null;
          hideDetailPanel('arc-detail', '#tab-arcs .campaign-detail-col');
          renderArcs();
        } else if (tabId === 'media') {
          assetListSelectedKey = null;
          activeClipStreamKey = '';
          const mediaTab = document.getElementById('tab-media');
          if (mediaTab) mediaTab.classList.remove('clippers-mgmt-detail-open');
          hideDetailPanel('asset-detail', '#media-pane-social .campaign-detail-col');
          renderAssets();
          renderClippersBoard();
        } else if (tabId === 'goals') {
          goalListSelectedCategory = null;
          hideDetailPanel('goal-detail', '#tab-goals .campaign-detail-col');
          renderGoals();
        }
        if (tabId === 'streams') scheduleDetailDockRetry(syncStreamDetailDock);
        else if (tabId === 'arcs') scheduleDetailDockRetry(syncArcDetailDock);
        else if (tabId === 'media') scheduleDetailDockRetry(syncAssetDetailDock);
        else if (tabId === 'goals') scheduleDetailDockRetry(syncGoalDetailDock);
      });

      // Update Header
      if (isClipperRole()) {
        if (mainActionBtn) mainActionBtn.style.display = 'none';
        if (tabId === 'media') {
          pageTitle.textContent = 'Clipping';
          pageDesc.textContent = 'Streams, clip bank, and segment bank — read-only for your role.';
        }
      } else {
        if (mainActionBtn) {
          mainActionBtn.style.display = '';
          const pageData = pages[tabId];
          pageTitle.textContent = pageData.title;
          pageDesc.textContent = pageData.desc;
          mainActionBtn.innerHTML = `<i class="fa-solid ${pageData.btnIcon}"></i> ${pageData.btnText}`;
        }
      }
    });
  });
}

// Render Calendar
function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  const monthLabel = document.querySelector('#tab-calendar .current-month');
  const navButtons = document.querySelectorAll('#tab-calendar .calendar-nav .icon-btn');
  grid.innerHTML = '';

  if (monthLabel) {
    monthLabel.textContent = displayedCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  if (navButtons.length >= 2) {
    navButtons[0].onclick = () => {
      displayedCalendarDate.setMonth(displayedCalendarDate.getMonth() - 1);
      renderCalendar();
    };
    navButtons[1].onclick = () => {
      displayedCalendarDate.setMonth(displayedCalendarDate.getMonth() + 1);
      renderCalendar();
    };
  }

  const year = displayedCalendarDate.getFullYear();
  const month = displayedCalendarDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getEventDayForDisplayedMonth = (ev) => {
    const parsed = new Date(String(ev.time || '').trim());
    if (!Number.isNaN(parsed.getTime())) {
      if (parsed.getFullYear() !== year || parsed.getMonth() !== month) return null;
      return parsed.getDate();
    }
    return Number.isInteger(ev.day) ? ev.day : null;
  };

  for (let i = 0; i < firstDayOfWeek; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    grid.appendChild(emptyDay);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day';
    const now = new Date();
    if (i === now.getDate() && month === now.getMonth() && year === now.getFullYear()) day.classList.add('today');

    let dayHtml = `<div class="day-number">${i}</div>`;

    const dayEvents = calendarEvents.filter((e) => getEventDayForDisplayedMonth(e) === i);
    if (dayEvents.length > 0) {
      dayHtml += `<div class="events-container">`;
      dayEvents.forEach(e => {
        const index = calendarEvents.indexOf(e);
        dayHtml += `<div class="event-badge event-${e.color}" onclick="openCalendarEvent(${index})" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    <i class="fa-solid ${e.type === 'stream' ? 'fa-video' : 'fa-image'}"></i> ${e.title}
                </div>`;
      });
      dayHtml += `</div>`;
    }

    day.innerHTML = dayHtml;
    grid.appendChild(day);
  }
}

window.openCalendarEvent = function (index) {
  const ev = calendarEvents[index];
  const mainView = document.getElementById('calendar-main-view');
  const detailView = document.getElementById('calendar-detail-view');
  const detailPanel = document.getElementById('calendar-event-detail');

  if (mainView && detailView && detailPanel) {
    mainView.style.display = 'none';
    detailView.style.display = 'block';

    const streams = getUnifiedStreams();
    let matched = null;
    if (ev.streamId) {
      matched = streams.find((s) => s.id === ev.streamId) || null;
    }
    if (!matched) {
      const eventTitle = String(ev.title || '').trim().toLowerCase();
      const eventTime = String(ev.time || '').trim();
      matched =
        streams.find((s) => {
          const sameTitle = String(s.title || '').trim().toLowerCase() === eventTitle;
          if (!sameTitle) return false;
          if (!eventTime) return true;
          return String(s.date || '').trim() === eventTime;
        }) || null;
    }

    if (matched) {
      renderDetail(matched, 'calendar-event-detail', matched.parentArc || null);
      return;
    }

    detailPanel.innerHTML = `
          <div class="detail-header">
              <h2>${ev.title}</h2>
              <div class="detail-tags">
                  <span class="tag"><i class="fa-regular fa-calendar"></i> ${ev.time ? String(ev.time).split(' ')[0] : `Day ${ev.day}`}</span>
                  ${ev.time ? `<span class="tag"><i class="fa-regular fa-clock"></i> ${ev.time}</span>` : ''}
                  <span class="tag" style="background: rgba(255,255,255,0.1); text-transform: uppercase;">${ev.type}</span>
              </div>
          </div>
          <div class="detail-grid">
              <div class="info-group" style="grid-column: 1 / -1;">
                  <div class="info-label"><i class="fa-solid fa-align-left"></i> Details</div>
                  <div class="info-content" style="font-size: 1.05rem; color: #ccc;">${ev.details || 'No details provided.'}</div>
              </div>
          </div>
        `;
  }
};

window.closeCalendarDetail = function () {
  const mainView = document.getElementById('calendar-main-view');
  const detailView = document.getElementById('calendar-detail-view');
  if (mainView && detailView) {
    detailView.style.display = 'none';
    mainView.style.display = 'block';
  }
};

function extractTikTokVideoIdFromUrl(url) {
  const u = String(url || '').trim();
  if (!u) return null;
  const m = u.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i);
  if (m) return m[1];
  const m2 = u.match(/tiktok\.com\/v\/(\d+)/i);
  if (m2) return m2[1];
  return null;
}

function closeTikTokTrendPreviewModal() {
  const modal = document.getElementById('tiktok-trend-preview-modal');
  const frame = document.getElementById('tiktok-trend-preview-iframe');
  const titleEl = document.getElementById('clip-media-preview-title');
  if (titleEl) titleEl.textContent = 'Preview';
  if (frame) {
    frame.src = 'about:blank';
    frame.style.display = 'none';
  }
  const fb = document.getElementById('tiktok-trend-preview-fallback');
  if (fb) {
    fb.style.display = 'none';
    fb.innerHTML = '';
  }
  if (modal) modal.classList.remove('active');
}

function externalLinkLabelForUrl(url) {
  try {
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const host = new URL(href).hostname.replace(/^www\./i, '').toLowerCase();
    if (host === 'youtu.be' || host.includes('youtube')) return 'Open in YouTube';
    if (host.includes('tiktok')) return 'Open in TikTok';
    if (host.includes('kick')) return 'Open on Kick';
    return 'Open in browser';
  } catch {
    return 'Open in browser';
  }
}

/** Kick channel home only (official player); VOD URLs fall back to opening Kick in a new tab. */
function tryKickLiveEmbedUrl(rawUrl) {
  const u = String(rawUrl || '').trim();
  if (!u) return null;
  try {
    const href = /^https?:\/\//i.test(u) ? u : `https://${u}`;
    const url = new URL(href);
    const host = url.hostname.replace(/^www\./i, '').toLowerCase();
    if (host !== 'kick.com') return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length !== 1) return null;
    const slug = parts[0];
    if (!slug || ['videos', 'categories', 'search', 'browse'].includes(slug.toLowerCase())) return null;
    return `https://player.kick.com/${encodeURIComponent(slug)}`;
  } catch {
    return null;
  }
}

async function openMediaEmbedPreview(rawUrl) {
  const url = String(rawUrl || '').trim();
  if (!url) return;
  const modal = document.getElementById('tiktok-trend-preview-modal');
  const frame = document.getElementById('tiktok-trend-preview-iframe');
  const fallback = document.getElementById('tiktok-trend-preview-fallback');
  const titleEl = document.getElementById('clip-media-preview-title');
  if (!modal || !frame || !fallback) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  const ytId = extractYouTubeVideoId(url);
  if (ytId) {
    if (titleEl) titleEl.textContent = 'YouTube';
    fallback.innerHTML = '';
    frame.src = `https://www.youtube.com/embed/${ytId}?rel=0`;
    frame.style.display = 'block';
    fallback.style.display = 'none';
    modal.classList.add('active');
    return;
  }

  let tikTokId = extractTikTokVideoIdFromUrl(url);
  if (!tikTokId && /tiktok\.com|vt\.tiktok|vm\.tiktok/i.test(url)) {
    try {
      const r = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
      if (r.ok) {
        const j = await r.json();
        const html = String(j.html || '');
        const mid = html.match(/data-video-id="(\d+)"/) || html.match(/\/video\/(\d+)/);
        if (mid) tikTokId = mid[1];
      }
    } catch (_) {
      /* oEmbed may be blocked */
    }
  }
  if (tikTokId) {
    if (titleEl) titleEl.textContent = 'TikTok';
    fallback.innerHTML = '';
    frame.src = `https://www.tiktok.com/embed/v2/${tikTokId}`;
    frame.style.display = 'block';
    fallback.style.display = 'none';
    modal.classList.add('active');
    return;
  }

  const kickEmbed = tryKickLiveEmbedUrl(url);
  if (kickEmbed) {
    if (titleEl) titleEl.textContent = 'Kick';
    fallback.innerHTML = '';
    frame.src = kickEmbed;
    frame.style.display = 'block';
    fallback.style.display = 'none';
    modal.classList.add('active');
    return;
  }

  if (titleEl) titleEl.textContent = 'Preview';
  fallback.innerHTML = '';
  frame.removeAttribute('src');
  frame.style.display = 'none';
  fallback.style.display = 'block';
  const extLabel = externalLinkLabelForUrl(url);
  fallback.innerHTML = `<p style="color:var(--text-muted); margin-bottom:14px;">This link cannot be played inside the app (for example Kick VODs or unsupported URLs). Open it in the original site instead.</p><a class="btn btn-primary" href="${escAttr(url)}" target="_blank" rel="noopener noreferrer">${escAttr(extLabel)}</a>`;
  modal.classList.add('active');
}

async function openTikTokTrendPreview(rawUrl) {
  return openMediaEmbedPreview(rawUrl);
}

window.openMediaEmbedPreview = openMediaEmbedPreview;

function setupTikTokTrendPreviewModal() {
  const modal = document.getElementById('tiktok-trend-preview-modal');
  const closeBtn = document.getElementById('tiktok-trend-preview-close');
  if (!modal || !closeBtn) return;
  closeBtn.addEventListener('click', () => closeTikTokTrendPreviewModal());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeTikTokTrendPreviewModal();
  });
}

function renderTikTokTrendRowsMarkup(urls) {
  const list = Array.isArray(urls) ? urls.map((x) => String(x || '').trim()).filter(Boolean) : [];
  return list
    .map(
      (link) => `
    <div class="tiktok-trend-row">
      <input type="url" class="form-input tiktok-trend-url" value="${escAttr(link)}" placeholder="https://www.tiktok.com/..." />
      <div class="tiktok-trend-row-actions">
        <button type="button" class="btn btn-outline btn-sm tiktok-trend-play" title="Play in app"><i class="fa-solid fa-play"></i></button>
        <button type="button" class="btn btn-outline btn-sm tiktok-trend-remove" title="Remove row"><i class="fa-solid fa-xmark"></i></button>
      </div>
    </div>`
    )
    .join('');
}

function appendTikTokTrendRow(container) {
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'tiktok-trend-row';
  row.innerHTML = `
      <input type="url" class="form-input tiktok-trend-url" value="" placeholder="https://www.tiktok.com/..." />
      <div class="tiktok-trend-row-actions">
        <button type="button" class="btn btn-outline btn-sm tiktok-trend-play" title="Play in app"><i class="fa-solid fa-play"></i></button>
        <button type="button" class="btn btn-outline btn-sm tiktok-trend-remove" title="Remove row"><i class="fa-solid fa-xmark"></i></button>
      </div>`;
  container.appendChild(row);
  row.querySelector('.tiktok-trend-url')?.focus();
}

function bindTikTokMediaTrendEditors(detailPanel, asset) {
  const ac = new AbortController();
  detailPanel.__mediaDetailAborter = ac;

  const syncFromDom = () => {
    asset.tiktokSoloTrendLinks = [...detailPanel.querySelectorAll('#tiktok-solo-rows .tiktok-trend-url')]
      .map((el) => String(el.value || '').trim())
      .filter(Boolean);
    asset.tiktokCollabTrendLinks = [...detailPanel.querySelectorAll('#tiktok-collab-rows .tiktok-trend-url')]
      .map((el) => String(el.value || '').trim())
      .filter(Boolean);
    scheduleSaveAppStateToDb();
  };

  const onInput = (e) => {
    if (e.target.classList && e.target.classList.contains('tiktok-trend-url')) syncFromDom();
  };
  const onClick = (e) => {
    const playBtn = e.target.closest('.tiktok-trend-play');
    if (playBtn) {
      const row = playBtn.closest('.tiktok-trend-row');
      const u = String(row?.querySelector('.tiktok-trend-url')?.value || '').trim();
      if (u) void openMediaEmbedPreview(u);
      return;
    }
    if (e.target.closest('.tiktok-trend-remove')) {
      e.target.closest('.tiktok-trend-row')?.remove();
      syncFromDom();
      return;
    }
    if (e.target.closest('#tiktok-solo-add')) {
      appendTikTokTrendRow(detailPanel.querySelector('#tiktok-solo-rows'));
      return;
    }
    if (e.target.closest('#tiktok-collab-add')) {
      appendTikTokTrendRow(detailPanel.querySelector('#tiktok-collab-rows'));
    }
  };

  detailPanel.addEventListener('input', onInput, { signal: ac.signal });
  detailPanel.addEventListener('click', onClick, { signal: ac.signal });
}

// Render Streams
let activeStreamsBucket = 'past';
let streamsBucketUserPinned = false;
let streamListSelectedKey = null;
let assetListSelectedKey = null;

function syncStreamsBucketButtons() {
  ['past', 'current', 'future'].forEach((b) => {
    const el = document.getElementById(`streams-bucket-${b}`);
    if (!el) return;
    el.classList.toggle('streams-bucket-btn--active', activeStreamsBucket === b);
  });
}

window.setStreamsBucket = function (bucket) {
  const next = String(bucket || '').toLowerCase();
  if (!['past', 'current', 'future'].includes(next)) return;
  streamsBucketUserPinned = true;
  activeStreamsBucket = next;
  renderStreams();
};

const MOBILE_DETAIL_DOCK_MQ = '(max-width: 900px)';

function isMobileDetailDockLayout() {
  try {
    return window.matchMedia(MOBILE_DETAIL_DOCK_MQ).matches;
  } catch (e) {
    const w = window.innerWidth || document.documentElement.clientWidth || 0;
    return w <= 900;
  }
}

function isSingleColumnCampaignLayout(list) {
  if (!list || !list.closest) return false;
  const layout = list.closest('.campaigns-layout');
  if (!layout) return false;
  const computedCols = window.getComputedStyle(layout).gridTemplateColumns || '';
  const cols = computedCols
    .split(' ')
    .map((v) => v.trim())
    .filter(Boolean);
  return cols.length <= 1;
}

function isMobileCardDetailModeForList(listId) {
  const list = document.getElementById(listId);
  return isMobileDetailDockLayout() || isSingleColumnCampaignLayout(list);
}

function clearMobileCardDetailScreens() {
  ['tab-streams', 'tab-arcs', 'tab-media', 'tab-goals'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('mobile-card-detail-open');
  });
  const mediaTab = document.getElementById('tab-media');
  if (mediaTab) mediaTab.classList.remove('clippers-mgmt-detail-open');
}

function openMobileCardDetailScreen(tabId, detailId, columnSelector) {
  const tab = document.getElementById(tabId);
  if (!tab) return;
  moveDetailPanelToColumn(detailId, columnSelector);
  tab.classList.add('mobile-card-detail-open');
}

window.backToCardSelections = function (tabId) {
  const tab = document.getElementById(tabId);
  if (!tab) return;
  tab.classList.remove('mobile-card-detail-open');
};

function injectMobileBackButton(detailPanel, tabId) {
  if (!detailPanel) return;
  const existing = detailPanel.querySelector('.mobile-detail-back-btn');
  if (existing) existing.remove();
  const listIdByTab = {
    'tab-media': 'asset-list',
    'tab-streams': 'stream-list',
    'tab-arcs': 'arc-list',
    'tab-goals': 'goals-list',
  };
  const listId = listIdByTab[tabId] || 'arc-list';
  if (!isMobileCardDetailModeForList(listId)) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-outline btn-sm mobile-detail-back-btn';
  btn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Back to list';
  btn.addEventListener('click', () => window.backToCardSelections(tabId));
  detailPanel.prepend(btn);
}

function moveDetailPanelToColumn(detailId, columnSelector) {
  const detail = document.getElementById(detailId);
  const col = document.querySelector(columnSelector);
  if (detail && col) {
    col.classList.remove('campaign-detail-col--docked-out');
    detail.style.display = '';
    col.appendChild(detail);
  }
}

function dockDetailUnderActiveListCard(listId, detailId, columnSelector) {
  const list = document.getElementById(listId);
  const active = list ? list.querySelector('.arc-card.active') : null;
  dockDetailUnderSpecificCard(listId, detailId, columnSelector, active);
}

function dockDetailUnderSpecificCard(listId, detailId, columnSelector, cardEl) {
  const list = document.getElementById(listId);
  const detail = document.getElementById(detailId);
  const col = document.querySelector(columnSelector);
  if (!list || !detail) return;
  if (col) col.classList.remove('campaign-detail-col--docked-out');
  if (col) col.appendChild(detail);
}

function hideDetailPanel(detailId, columnSelector) {
  const detail = document.getElementById(detailId);
  const col = document.querySelector(columnSelector);
  if (!detail) return;
  detail.style.display = 'none';
  if (col) col.classList.add('campaign-detail-col--docked-out');
}

function scheduleDetailDockRetry(syncFn) {
  syncFn();
  requestAnimationFrame(() => {
    syncFn();
    requestAnimationFrame(() => syncFn());
  });
}

function syncStreamDetailDock() {
  dockDetailUnderActiveListCard('stream-list', 'stream-detail', '#tab-streams .campaign-detail-col');
}

function syncArcDetailDock() {
  dockDetailUnderActiveListCard('arc-list', 'arc-detail', '#tab-arcs .campaign-detail-col');
}

function syncAssetDetailDock() {
  dockDetailUnderActiveListCard('asset-list', 'asset-detail', '#media-pane-social .campaign-detail-col');
}

function syncGoalDetailDock() {
  dockDetailUnderActiveListCard('goals-list', 'goal-detail', '#tab-goals .campaign-detail-col');
}

function restoreAllDetailPanelsToColumns() {
  document.querySelectorAll('.campaign-detail-col--docked-out').forEach((el) => el.classList.remove('campaign-detail-col--docked-out'));
  moveDetailPanelToColumn('stream-detail', '#tab-streams .campaign-detail-col');
  moveDetailPanelToColumn('arc-detail', '#tab-arcs .campaign-detail-col');
  moveDetailPanelToColumn('asset-detail', '#media-pane-social .campaign-detail-col');
  moveDetailPanelToColumn('goal-detail', '#tab-goals .campaign-detail-col');
}

function renderStreams() {
  const list = document.getElementById('stream-list');
  moveDetailPanelToColumn('stream-detail', '#tab-streams .campaign-detail-col');
  list.innerHTML = '';
  const streams = getUnifiedStreams();
  if (!streamsBucketUserPinned) {
    const hasCurrent = streams.some((s) => getClipStreamTimeBucket(s) === 'current');
    activeStreamsBucket = hasCurrent ? 'current' : 'past';
  }
  const filtered = streams.filter((s) => getClipStreamTimeBucket(s) === activeStreamsBucket);

  if (filtered.length === 0) {
    const pretty = activeStreamsBucket === 'future' ? 'upcoming' : activeStreamsBucket;
    list.innerHTML = `<div class="glass-panel" style="padding:12px; color:var(--text-muted); border-style:dashed;">No ${pretty} streams yet.</div>`;
    const detailPanel = document.getElementById('stream-detail');
    if (detailPanel) {
      detailPanel.innerHTML = `
            <div class="empty-state">
              <i class="fa-solid fa-video empty-icon"></i>
              <p>Select a stream to view details</p>
            </div>
          `;
    }
    syncStreamsBucketButtons();
    scheduleDetailDockRetry(syncStreamDetailDock);
    return;
  }

  const hasSelectedStream = filtered.some((s) => getClipStreamKey(s) === streamListSelectedKey);

  filtered.forEach((stream) => {
    const card = document.createElement('div');
    const streamKey = getClipStreamKey(stream);
    card.className = `arc-card ${streamListSelectedKey === streamKey ? 'active' : ''}`;
    const displayDate = String(stream.date || 'TBD').split(' - ')[0];
    const displayLocation = String(stream.location || 'TBD').split(',')[0];
    card.innerHTML = `
            <span class="arc-status status-${stream.status}">${stream.status}</span>
            <span class="arc-status status-planning" style="background: rgba(255, 255, 255, 0.1); color: #fff;">${stream.type}</span>
            <h4 class="arc-title" style="margin-top: 8px;">${stream.title}</h4>
            <div class="arc-meta">
                <span><i class="fa-regular fa-calendar"></i> ${displayDate}</span>
                <span><i class="fa-solid fa-location-dot"></i> ${displayLocation}</span>
            </div>
            ${stream.parentArc ? `<div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 8px;">From arc: ${stream.parentArc.title}</div>` : ''}
        `;

    card.addEventListener('click', () => {
      if (card.classList.contains('active')) {
        streamListSelectedKey = null;
        card.classList.remove('active');
        hideDetailPanel('stream-detail', '#tab-streams .campaign-detail-col');
        return;
      }
      document.querySelectorAll('#tab-streams .arc-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      streamListSelectedKey = streamKey;
      renderDetail(stream, 'stream-detail', stream.parentArc || null);
      scheduleDetailDockRetry(() =>
        dockDetailUnderSpecificCard('stream-list', 'stream-detail', '#tab-streams .campaign-detail-col', card)
      );
      if (isMobileCardDetailModeForList('stream-list')) {
        openMobileCardDetailScreen('tab-streams', 'stream-detail', '#tab-streams .campaign-detail-col');
      }
    });
    list.appendChild(card);
  });

  if (hasSelectedStream) {
    const selectedStream = filtered.find((s) => getClipStreamKey(s) === streamListSelectedKey);
    if (selectedStream) renderDetail(selectedStream, 'stream-detail', selectedStream.parentArc || null);
  } else {
    const detailPanel = document.getElementById('stream-detail');
    if (detailPanel) {
      detailPanel.innerHTML = `
            <div class="empty-state">
              <i class="fa-solid fa-video empty-icon"></i>
              <p>Select a stream to view details</p>
            </div>
          `;
    }
    hideDetailPanel('stream-detail', '#tab-streams .campaign-detail-col');
  }
  syncStreamsBucketButtons();
  scheduleDetailDockRetry(syncStreamDetailDock);
}

function deleteStreamRecord(stream, parentArc = null) {
  const ok = window.confirm(
    parentArc
      ? `Delete linked stream "${stream.title}" from "${parentArc.title}"?`
      : `Delete stream "${stream.title}"?`
  );
  if (!ok) return;

  if (parentArc) {
    const parent = arcsData.find((a) => a.id === parentArc.id);
    if (!parent || !Array.isArray(parent.linkedStreams)) return;
    if (Number.isInteger(stream.linkedIndex)) {
      parent.linkedStreams.splice(stream.linkedIndex, 1);
    } else {
      parent.linkedStreams = parent.linkedStreams.filter((ls) => ls.title !== stream.title);
    }
  } else {
    arcsData = arcsData.filter((a) => a.id !== stream.id);
  }
  renderStreams();
  renderArcs();
  const detailPanel = document.getElementById('stream-detail');
  if (detailPanel) {
    detailPanel.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-video empty-icon"></i>
          <p>Select a stream to view details</p>
        </div>
      `;
  }
  scheduleSaveAppStateToDb();
}

function deleteArcRecord(arc) {
  const ok = window.confirm(`Delete arc "${arc.title}"?`);
  if (!ok) return;
  arcsData = arcsData.filter((a) => a.id !== arc.id);
  arcListSelectedId = null;
  renderArcs();
  renderStreams();
  scheduleSaveAppStateToDb();
}

window.updateSegmentOption = function (streamId, parentArcId, linkedIndex, segmentIndex, optionIndex, field, value) {
  let stream = null;
  if (parentArcId && parentArcId !== 'null') {
    const parent = arcsData.find((a) => a.id === parentArcId);
    if (!parent || !Array.isArray(parent.linkedStreams)) return;
    if (Number.isInteger(linkedIndex) && linkedIndex >= 0) {
      stream = parent.linkedStreams[linkedIndex];
    }
  } else {
    stream = arcsData.find((a) => a.id === streamId);
  }
  if (!stream || !Array.isArray(stream.segments)) return;
  const seg = stream.segments[segmentIndex];
  if (!seg) return;
  if (!Array.isArray(seg.options)) seg.options = [];
  const opt = seg.options[optionIndex];
  if (!opt) return;
  if (field === 'text') opt.text = value;
  if (field === 'decision') opt.decision = value;
  scheduleSaveAppStateToDb();
};

window.updateSegmentName = function (streamId, parentArcId, linkedIndex, segmentIndex, value) {
  const stream = getClipStreamRecord(streamId, parentArcId, linkedIndex);
  if (!stream || !Array.isArray(stream.segments)) return;
  const seg = stream.segments[segmentIndex];
  if (!seg) return;
  seg.title = String(value || '').trim();
  scheduleSaveAppStateToDb();
};

window.updateSegmentField = function (streamId, parentArcId, linkedIndex, segmentIndex, field, value) {
  if (isClipperRole()) return;
  const stream = getClipStreamRecord(streamId, parentArcId, linkedIndex);
  if (!stream || !Array.isArray(stream.segments)) return;
  const seg = stream.segments[segmentIndex];
  if (!seg) return;
  if (!['duration', 'goals', 'narrative'].includes(field)) return;
  seg[field] = String(value || '');
  scheduleSaveAppStateToDb();
};

window.updateSegmentClipperFields = function (streamId, parentArcId, linkedIndex, segmentIndex, field, value) {
  if (isClipperRole()) return;
  let stream = null;
  if (parentArcId && parentArcId !== 'null') {
    const parent = arcsData.find((a) => a.id === parentArcId);
    if (!parent || !Array.isArray(parent.linkedStreams)) return;
    if (Number.isInteger(linkedIndex) && linkedIndex >= 0) stream = parent.linkedStreams[linkedIndex];
  } else {
    stream = arcsData.find((a) => a.id === streamId);
  }
  if (!stream || !Array.isArray(stream.segments)) return;
  const seg = stream.segments[segmentIndex];
  if (!seg) return;
  if (field === 'clipVodUrl') seg.clipVodUrl = value;
  if (field === 'clipDesiredAngle') seg.clipDesiredAngle = value;
  scheduleSaveAppStateToDb();
};

window.updateStreamClipField = function (streamId, parentArcId, linkedIndex, field, value) {
  if (isClipperRole()) return;
  const stream = getClipStreamRecord(streamId, parentArcId, linkedIndex);
  if (!stream) return;
  if (field === 'fullVodUrl') stream.fullVodUrl = value;
  if (field === 'posterUrl') stream.posterUrl = value;
  if (field === 'posterPostDate') stream.posterPostDate = value;
  scheduleSaveAppStateToDb();
};

window.setActiveClipManagementStream = function (streamKey) {
  activeClipStreamKey = String(streamKey || '');
  if (activeClipStreamKey && isMobileDetailDockLayout()) {
    const mediaTab = document.getElementById('tab-media');
    if (mediaTab) mediaTab.classList.add('clippers-mgmt-detail-open');
  }
  renderClippersBoard();
};

window.setClipManagementBucket = function (bucket) {
  const next = String(bucket || '').toLowerCase();
  if (!['past', 'current', 'future'].includes(next)) return;
  activeClipStreamBucket = next;
  activeClipStreamKey = '';
  const mediaTab = document.getElementById('tab-media');
  if (mediaTab) mediaTab.classList.remove('clippers-mgmt-detail-open');
  renderClippersBoard();
};

window.setClipBankFilter = function (field, value) {
  if (!Object.prototype.hasOwnProperty.call(clipBankFilters, field)) return;
  let caret = null;
  if (field === 'text') {
    const active = document.activeElement;
    if (active && active.tagName === 'INPUT') {
      caret = {
        start: Number(active.selectionStart ?? 0),
        end: Number(active.selectionEnd ?? 0),
      };
    }
  }
  clipBankFilters[field] = String(value || '');
  renderClippersBoard();
  if (field === 'text') {
    requestAnimationFrame(() => {
      const input = document.querySelector('#clip-bank-board input.form-input');
      if (!input) return;
      input.focus({ preventScroll: true });
      if (caret) {
        const len = input.value.length;
        const start = Math.max(0, Math.min(caret.start, len));
        const end = Math.max(0, Math.min(caret.end, len));
        input.setSelectionRange(start, end);
      }
    });
  }
};

window.addPostedClip = function (streamId, parentArcId, linkedIndex, segmentIndex) {
  if (isClipperRole()) return;
  const stream = getClipStreamRecord(streamId, parentArcId, linkedIndex);
  if (!stream || !Array.isArray(stream.segments)) return;
  const seg = stream.segments[segmentIndex];
  if (!seg) return;
  if (!Array.isArray(seg.postedClips)) seg.postedClips = [];
  seg.postedClips.push({ title: '', url: '', tags: [], people: [] });
  renderClippersBoard();
  scheduleSaveAppStateToDb();
};

window.removePostedClip = function (streamId, parentArcId, linkedIndex, segmentIndex, clipIndex) {
  if (isClipperRole()) return;
  const stream = getClipStreamRecord(streamId, parentArcId, linkedIndex);
  if (!stream || !Array.isArray(stream.segments)) return;
  const seg = stream.segments[segmentIndex];
  if (!seg || !Array.isArray(seg.postedClips)) return;
  seg.postedClips.splice(clipIndex, 1);
  renderClippersBoard();
  scheduleSaveAppStateToDb();
};

window.updatePostedClipField = function (streamId, parentArcId, linkedIndex, segmentIndex, clipIndex, field, value) {
  if (isClipperRole()) return;
  const stream = getClipStreamRecord(streamId, parentArcId, linkedIndex);
  if (!stream || !Array.isArray(stream.segments)) return;
  const seg = stream.segments[segmentIndex];
  if (!seg) return;
  if (!Array.isArray(seg.postedClips)) seg.postedClips = [];
  const clip = seg.postedClips[clipIndex];
  if (!clip) return;
  if (field === 'title' || field === 'url') {
    clip[field] = value;
  }
  if (field === 'tags' || field === 'people') {
    clip[field] = String(value || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }
  scheduleSaveAppStateToDb();
};

function syncArcTimelineFilterButtons() {
  const active = String(arcTimelineFilter.timeline || '').trim().toLowerCase();
  document.querySelectorAll('#tab-arcs .arc-timeline-btn').forEach((btn) => {
    const key = String(btn.getAttribute('data-arc-timeline') || '').trim().toLowerCase();
    btn.classList.toggle('active', key === active);
  });
}

// Render Campaigns/Arcs
function renderArcs() {
  const list = document.getElementById('arc-list');
  const detailPanel = document.getElementById('arc-detail');
  if (!list) return;

  moveDetailPanelToColumn('arc-detail', '#tab-arcs .campaign-detail-col');
  list.innerHTML = '';
  let arcs = arcsData.filter((a) => a.type === 'Arc');
  const tf = String(arcTimelineFilter.timeline || '').trim().toLowerCase();
  if (tf === 'past' || tf === 'current' || tf === 'future') {
    arcs = arcs.filter((a) => getArcTimelineStatus(a).key === tf);
  }
  syncArcTimelineFilterButtons();

  if (arcs.length === 0) {
    list.innerHTML =
      '<div class="empty-state" style="padding: 24px; text-align: center;"><p>No arcs match this filter.</p></div>';
    if (detailPanel) {
      detailPanel.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-bolt empty-icon"></i>
                    <p>Select an arc to view details</p>
                </div>`;
    }
    scheduleDetailDockRetry(syncArcDetailDock);
    return;
  }

  const activeId = arcs.some((a) => a.id === arcListSelectedId) ? arcListSelectedId : null;
  arcListSelectedId = activeId;

  arcs.forEach((arc) => {
    const card = document.createElement('div');
    const arcTimeline = getArcTimelineStatus(arc);
    card.className = `arc-card ${arc.id === activeId ? 'active' : ''}`;
    card.innerHTML = `
            <span class="arc-status status-${arcTimeline.key}">${arcTimeline.label}</span>
            <span class="arc-status status-planning" style="background: rgba(255, 255, 255, 0.1); color: #fff;">${arc.type}</span>
            <h4 class="arc-title" style="margin-top: 8px;">${arc.title}</h4>
            <div class="arc-meta">
                <span><i class="fa-regular fa-calendar"></i> ${arc.date.split(' - ')[0]}</span>
                <span><i class="fa-solid fa-location-dot"></i> ${arc.location.split(',')[0]}</span>
            </div>
        `;

    card.addEventListener('click', () => {
      if (card.classList.contains('active')) {
        arcListSelectedId = null;
        card.classList.remove('active');
        hideDetailPanel('arc-detail', '#tab-arcs .campaign-detail-col');
        return;
      }
      arcListSelectedId = arc.id;
      document.querySelectorAll('#tab-arcs .arc-card').forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      renderDetail(arc, 'arc-detail');
      scheduleDetailDockRetry(() =>
        dockDetailUnderSpecificCard('arc-list', 'arc-detail', '#tab-arcs .campaign-detail-col', card)
      );
      if (isMobileCardDetailModeForList('arc-list')) {
        openMobileCardDetailScreen('tab-arcs', 'arc-detail', '#tab-arcs .campaign-detail-col');
      }
    });

    list.appendChild(card);
  });

  if (activeId) {
    const selected = arcs.find((a) => a.id === activeId);
    if (selected) renderDetail(selected, 'arc-detail');
    scheduleDetailDockRetry(syncArcDetailDock);
  } else {
    if (detailPanel) {
      detailPanel.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-bolt empty-icon"></i>
                    <p>Select an arc to view details</p>
                </div>`;
    }
    hideDetailPanel('arc-detail', '#tab-arcs .campaign-detail-col');
  }
}

function renderDetail(arc, targetId, parentArc = null) {
  const detailPanel = document.getElementById(targetId);
  if (!detailPanel) return;
  detailPanel.style.display = '';
  const canDeleteInDetail = targetId === 'stream-detail' && (arc.type !== 'Arc' || parentArc);
  const canDeleteArcInDetail = targetId === 'arc-detail' && arc.type === 'Arc';
  const isStreamLike = arc.type !== 'Arc';
  const canEditStreamFields = targetId === 'stream-detail' || targetId === 'calendar-event-detail';

  let html = `
        <div class="detail-header">
            ${parentArc ? `<button class="btn btn-outline btn-sm" style="margin-bottom: 16px; display: inline-flex; align-items: center; gap: 8px;" onclick="renderDetail(arcsData.find(a => a.id === '${parentArc.id}'), '${targetId}')"><i class="fa-solid fa-arrow-left"></i> Back to ${parentArc.title}</button>` : ''}
            <div class="detail-header-actions">
                <div class="detail-header-actions-right">
                    <button type="button" class="btn btn-outline btn-sm detail-edit-toggle detail-corner-btn" onclick="toggleEditMode(this)">
                        <i class="fa-solid fa-pen"></i> Edit Info
                    </button>
                ${canDeleteArcInDetail ? `<button type="button" id="delete-detail-arc-btn" class="btn btn-outline btn-sm detail-corner-btn detail-corner-btn--danger">
                    <i class="fa-solid fa-trash"></i> Delete Arc
                </button>` : ''}
                ${canDeleteInDetail ? `<button type="button" id="delete-detail-stream-btn" class="btn btn-outline btn-sm detail-corner-btn detail-corner-btn--danger">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>` : ''}
                </div>
            </div>
            <h2>${arc.title}</h2>
            <div class="detail-tags">
                <span class="tag"><i class="fa-regular fa-calendar"></i> ${arc.date}</span>
                <span class="tag"><i class="fa-solid fa-location-dot"></i> ${arc.location}</span>
                ${arc.budget ? `<span class="tag"><i class="fa-solid fa-sack-dollar"></i> Budget: ${arc.budget}</span>` : ''}
            </div>
            ${isStreamLike ? `
            <div style="margin-top: 12px;">
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Full stream VOD</div>
                <div class="stream-vod-actions-row">
                    <input class="form-input stream-detail-full-vod${canEditStreamFields ? ' stream-detail-managed-field' : ''}" style="width:100%;" placeholder="https://... (full stream VOD URL)" value="${escAttr(arc.fullVodUrl || '')}"
                      ${canEditStreamFields ? `oninput="updateStreamClipField('${arc.id}', ${parentArc ? `'${parentArc.id}'` : 'null'}, ${Number.isInteger(arc.linkedIndex) ? arc.linkedIndex : -1}, 'fullVodUrl', this.value)"` : 'disabled'} />
                    <button type="button" class="btn btn-outline btn-sm" title="Play in app" onclick="void window.openMediaEmbedPreview(this.closest('.stream-vod-actions-row').querySelector('.stream-detail-full-vod').value)"><i class="fa-solid fa-play"></i></button>
                    <a href="${escAttr(arc.fullVodUrl || '#')}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" title="Open link" onclick="const row=this.closest('.stream-vod-actions-row'); const v=(row?.querySelector('.stream-detail-full-vod')?.value||'').trim(); if(!v){event.preventDefault();return;} this.href=v;"><i class="fa-solid fa-up-right-from-square"></i></a>
                </div>
                <div class="stream-poster-date-grid">
                    <div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Stream poster URL</div>
                        <input type="url" class="form-input${canEditStreamFields ? ' stream-detail-managed-field' : ''}" style="width:100%;" placeholder="https://... (poster URL)" value="${escAttr(arc.posterUrl || '')}"
                          ${canEditStreamFields ? `oninput="updateStreamClipField('${arc.id}', ${parentArc ? `'${parentArc.id}'` : 'null'}, ${Number.isInteger(arc.linkedIndex) ? arc.linkedIndex : -1}, 'posterUrl', this.value)"` : 'disabled'} />
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Poster post date</div>
                        <input type="date" class="form-input${canEditStreamFields ? ' stream-detail-managed-field' : ''}" style="width:100%;" value="${escAttr(normalizeDateInputValue(arc.posterPostDate))}"
                          ${canEditStreamFields ? `oninput="updateStreamClipField('${arc.id}', ${parentArc ? `'${parentArc.id}'` : 'null'}, ${Number.isInteger(arc.linkedIndex) ? arc.linkedIndex : -1}, 'posterPostDate', this.value)"` : 'disabled'} />
                    </div>
                </div>
            </div>` : ''}
            ${arc.narrative ? `
            <p style="color: var(--text-muted); font-size: 1.1rem; margin-top: 16px; line-height: 1.5;">
                <strong>Overall Narrative:</strong> ${arc.narrative}
            </p>` : ''}
        </div>
        <div class="detail-grid">
    `;

  if (arc.type === 'Arc' || arc.goals) {
    let goalsHtml = '';
    if (arc.goals) {
      goalsHtml = Array.isArray(arc.goals) ? arc.goals.map(g => `<li>${g}</li>`).join('') : `<li>${arc.goals}</li>`;
    }
    let activitiesHtml = arc.activities ? arc.activities.map(a => `<li>${a}</li>`).join('') : '';
    let promptsHtml = arc.prompts ? arc.prompts.map(p => `<li>${p}</li>`).join('') : '';
    let clothingHtml = arc.clothing ? arc.clothing.map(c => `<li>${c}</li>`).join('') : '';

    html += `
            <div class="info-group">
                <div class="info-label"><i class="fa-solid fa-bullseye"></i> Goals</div>
                <div class="info-content">
                    <ul>${goalsHtml}</ul>
                </div>
            </div>
            <div class="info-group">
                <div class="info-label"><i class="fa-solid fa-shirt"></i> Clothing & Aesthetics</div>
                <div class="info-content">
                    <ul>${clothingHtml}</ul>
                </div>
            </div>
            <div class="info-group">
                <div class="info-label"><i class="fa-solid fa-person-running"></i> Key Activities</div>
                <div class="info-content">
                    <ul>${activitiesHtml}</ul>
                </div>
            </div>
            <div class="info-group">
                <div class="info-label"><i class="fa-regular fa-comment-dots"></i> Prompts & Bits</div>
                <div class="info-content">
                    <ul>${promptsHtml}</ul>
                </div>
            </div>
            <div class="info-group" style="grid-column: 1 / -1; background: rgba(204, 255, 0, 0.05); border-color: rgba(204, 255, 0, 0.2);">
                <div class="info-label" style="color: var(--primary);"><i class="fa-solid fa-scissors"></i> Clipping Narrative</div>
                <div class="info-content" style="font-style: italic; color: #fff;">
                    "${arc.clippingNarrative || ''}"
                </div>
            </div>
            <div class="info-group">
                <div class="info-label"><i class="fa-solid fa-film"></i> Trailer Ideas</div>
                <div class="info-content">
                    <p style="margin-bottom: 12px; font-size: 0.9rem; color: var(--text-muted);">${arc.trailerIdeas || ''}</p>
                    <div style="display: flex; gap: 8px;">
                        <button type="button" class="btn btn-outline btn-sm arc-trailer-upload-btn" data-arc-id="${arc.id}"><i class="fa-solid fa-upload"></i> Upload</button>
                        <button type="button" class="btn btn-outline btn-sm arc-trailer-link-btn" data-arc-id="${arc.id}"><i class="fa-solid fa-link"></i> Add Link</button>
                    </div>
                </div>
                ${arc.type === 'Arc' ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Shoot date</div>
                        <input type="date" class="form-input arc-trailer-shoot" data-arc-id="${arc.id}" value="${escAttr(normalizeDateInputValue(arc.trailerShootDate))}" />
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Post date</div>
                        <input type="date" class="form-input arc-trailer-post" data-arc-id="${arc.id}" value="${escAttr(normalizeDateInputValue(arc.trailerPostDate))}" />
                    </div>
                </div>` : ''}
            </div>
            <div class="info-group">
                <div class="info-label"><i class="fa-solid fa-image"></i> Poster Ideas</div>
                <div class="info-content">
                    <p style="margin-bottom: 12px; font-size: 0.9rem; color: var(--text-muted);">${arc.posterIdeas || ''}</p>
                    <div style="display: flex; gap: 8px;">
                        <button type="button" class="btn btn-outline btn-sm arc-poster-upload-btn" data-arc-id="${arc.id}"><i class="fa-solid fa-upload"></i> Upload</button>
                        <button type="button" class="btn btn-outline btn-sm arc-poster-link-btn" data-arc-id="${arc.id}"><i class="fa-solid fa-link"></i> Add Link</button>
                    </div>
                </div>
                ${arc.type === 'Arc' ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 10px;">
                    <div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Poster URL</div>
                        <input type="url" class="form-input arc-poster-url" data-arc-id="${arc.id}" placeholder="https://..." value="${escAttr(arc.posterUrl || '')}" />
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Post date</div>
                        <input type="date" class="form-input arc-poster-post" data-arc-id="${arc.id}" value="${escAttr(normalizeDateInputValue(arc.posterPostDate))}" />
                    </div>
                </div>` : ''}
            </div>
        `;
  }

  if (arc.collabWith) {
    html += `
                <div class="info-group" style="grid-column: 1 / -1; background: rgba(255, 255, 255, 0.05);">
                    <div class="info-label"><i class="fa-solid fa-users"></i> Collab Details</div>
                    <div class="info-content">
                        <strong>With:</strong> ${escAttr(formatCollabWithForDisplay(arc.collabWith))}
                    </div>
                </div>
            `;
  }

  if (arc.segments) {
    if (arc.security || arc.driver || arc.logistics) {
      html += `
                <div class="info-group" style="grid-column: 1 / -1;">
                    <div class="info-label"><i class="fa-solid fa-shield-halved"></i> Logistics</div>
                    <div class="info-content" style="display: flex; gap: 24px;">
                        ${arc.security ? `<div><strong>Security:</strong> ${arc.security}</div>` : ''}
                        ${arc.driver ? `<div><strong>Driver:</strong> ${arc.driver}</div>` : ''}
                        ${arc.logistics ? `<div>${arc.logistics}</div>` : ''}
                    </div>
                </div>
            `;
    }

    arc.segments.forEach((seg, i) => {
      const optionsHtml = Array.isArray(seg.options) && seg.options.length > 0
        ? `
                    <div style="margin-top: 10px;">
                  <strong>Activities:</strong>
                  <div style="display:flex; flex-direction:column; gap:6px; margin-top:6px;">
                    ${seg.options.map((opt, optionIndex) => {
          const decision = String(opt.decision || 'keep');
          if (canEditStreamFields) {
            return `<div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; background:rgba(255,255,255,0.03); border:1px solid var(--border-color); padding:6px 8px; border-radius:6px;">
                          <input type="text" class="form-input stream-detail-managed-field" style="flex:1 1 240px; min-width:0;" value="${(opt.text || '').replace(/"/g, '&quot;')}" oninput="updateSegmentOption('${arc.id}', ${parentArc ? `'${parentArc.id}'` : 'null'}, ${Number.isInteger(arc.linkedIndex) ? arc.linkedIndex : -1}, ${i}, ${optionIndex}, 'text', this.value)" />
                          <select class="form-input stream-detail-managed-field" style="appearance:auto; background: rgba(0,0,0,0.5); flex:0 0 230px; max-width:100%;" onchange="updateSegmentOption('${arc.id}', ${parentArc ? `'${parentArc.id}'` : 'null'}, ${Number.isInteger(arc.linkedIndex) ? arc.linkedIndex : -1}, ${i}, ${optionIndex}, 'decision', this.value)">
                            <option value="keep" ${decision === 'keep' ? 'selected' : ''}>Keep</option>
                            <option value="deny" ${decision === 'deny' ? 'selected' : ''}>Deny</option>
                            <option value="save_for_another_stream" ${decision === 'save_for_another_stream' ? 'selected' : ''}>Save for another stream</option>
                          </select>
                        </div>`;
          }
          const label =
            decision === 'save_for_another_stream'
              ? 'Save for another stream'
              : decision === 'deny'
                ? 'Deny'
                : 'Keep';
          const color =
            decision === 'save_for_another_stream'
              ? 'rgba(96,165,250,0.2)'
              : decision === 'deny'
                ? 'rgba(239,68,68,0.2)'
                : 'rgba(34,197,94,0.2)';
          return `<div style="display:flex; justify-content:space-between; gap:8px; align-items:center; background:rgba(255,255,255,0.03); border:1px solid var(--border-color); padding:6px 8px; border-radius:6px;">
                        <span>${opt.text || ''}</span>
                        <span class="tag" style="background:${color}; border:none;">${label}</span>
                      </div>`;
        }).join('')}
                  </div>
                </div>
              `
        : '';
      html += `
                <div class="info-group" style="grid-column: 1 / -1; border-color: rgba(204, 255, 0, 0.2);">
                    <div class="info-label" style="color: var(--primary);">Segment ${i + 1}</div>
                    <div class="info-content">
                        ${isStreamLike
          ? `<div style="margin-bottom: 8px;">
                                <strong>Segment name:</strong>
                                <input class="form-input${canEditStreamFields ? ' stream-detail-managed-field' : ''}" style="width:100%; margin-top:6px;" placeholder="Segment name" value="${escAttr(seg.title || '')}"
                                  ${canEditStreamFields ? `oninput="updateSegmentName('${arc.id}', ${parentArc ? `'${parentArc.id}'` : 'null'}, ${Number.isInteger(arc.linkedIndex) ? arc.linkedIndex : -1}, ${i}, this.value)"` : 'disabled'} />
                              </div>`
          : `<div style="margin-bottom: 8px;"><strong>Name:</strong> ${seg.title || ''}</div>`
        }
                        ${isStreamLike
          ? `<div style="margin-bottom: 8px;">
                                <strong>Duration:</strong>
                                <input class="form-input${canEditStreamFields ? ' stream-detail-managed-field' : ''}" style="width:100%; margin-top:6px;" placeholder="e.g. 1h 30m" value="${escAttr(seg.duration || '')}"
                                  ${canEditStreamFields ? `oninput="updateSegmentField('${arc.id}', ${parentArc ? `'${parentArc.id}'` : 'null'}, ${Number.isInteger(arc.linkedIndex) ? arc.linkedIndex : -1}, ${i}, 'duration', this.value)"` : 'disabled'} />
                              </div>`
          : `${seg.duration ? `<div style="margin-bottom: 8px;"><strong>Duration:</strong> ${seg.duration}</div>` : ''}`
        }
                        ${isStreamLike
          ? `<div class="stream-goals-block" style="margin-bottom: 8px;">
                                <strong>Goals:</strong>
                                <div class="stream-detail-read-only" style="margin-top:6px;">${bulletsHtmlFromText(seg.goals, 'No goals yet.')}</div>
                                <textarea class="form-input${canEditStreamFields ? ' stream-detail-managed-field stream-detail-edit-only' : ''}" style="width:100%; margin-top:6px; min-height:64px; resize:vertical; display:none;" placeholder="Segment goals"
                                  ${canEditStreamFields ? `oninput="updateSegmentField('${arc.id}', ${parentArc ? `'${parentArc.id}'` : 'null'}, ${Number.isInteger(arc.linkedIndex) ? arc.linkedIndex : -1}, ${i}, 'goals', this.value)"` : 'disabled'}>${escAttr(seg.goals || '')}</textarea>
                              </div>`
          : `<div style="margin-bottom: 8px;"><strong>Goals:</strong> ${seg.goals}</div>`
        }
                        ${isStreamLike
          ? `<div class="stream-narrative-block" style="margin-bottom: 8px;">
                                <strong>Clipping Narrative:</strong>
                                <div class="stream-detail-read-only" style="margin-top:6px;">${bulletsHtmlFromText(seg.narrative, 'No clipping narrative yet.')}</div>
                                <textarea class="form-input${canEditStreamFields ? ' stream-detail-managed-field stream-detail-edit-only' : ''}" style="width:100%; margin-top:6px; min-height:72px; resize:vertical; display:none;" placeholder="Clipping narrative"
                                  ${canEditStreamFields ? `oninput="updateSegmentField('${arc.id}', ${parentArc ? `'${parentArc.id}'` : 'null'}, ${Number.isInteger(arc.linkedIndex) ? arc.linkedIndex : -1}, ${i}, 'narrative', this.value)"` : 'disabled'}>${escAttr(seg.narrative || '')}</textarea>
                              </div>`
          : `<div style="font-style: italic; color: #aaa;"><strong>Clipping Narrative:</strong> "${seg.narrative}"</div>`
        }
                        ${isStreamLike ? `<div style="margin-bottom: 8px;">
                          <strong>Segment VOD:</strong>
                          <div class="stream-vod-actions-row" style="margin-top:6px;">
                            <input class="form-input stream-detail-segment-vod${canEditStreamFields ? ' stream-detail-managed-field' : ''}" style="width:100%;" placeholder="https://... (segment VOD URL)" value="${escAttr(seg.clipVodUrl || '')}"
                              ${canEditStreamFields ? `oninput="updateSegmentClipperFields('${arc.id}', ${parentArc ? `'${parentArc.id}'` : 'null'}, ${Number.isInteger(arc.linkedIndex) ? arc.linkedIndex : -1}, ${i}, 'clipVodUrl', this.value)"` : 'disabled'} />
                            <button type="button" class="btn btn-outline btn-sm" title="Play in app" onclick="void window.openMediaEmbedPreview(this.closest('.stream-vod-actions-row').querySelector('.stream-detail-segment-vod').value)"><i class="fa-solid fa-play"></i></button>
                            <a href="${escAttr(seg.clipVodUrl || '#')}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" title="Open link" onclick="const row=this.closest('.stream-vod-actions-row'); const v=(row?.querySelector('.stream-detail-segment-vod')?.value||'').trim(); if(!v){event.preventDefault();return;} this.href=v;"><i class="fa-solid fa-up-right-from-square"></i></a>
                          </div>
                        </div>` : ''}
                        ${optionsHtml}
                    </div>
                </div>
            `;
    });
    if (isStreamLike && canEditStreamFields) {
      html += `
                <div class="detail-add-segment-wrap" style="grid-column: 1 / -1; display:none;">
                    <button type="button" class="btn btn-outline btn-sm detail-add-segment-btn" onclick="addSegmentToDetail('${arc.id}', ${parentArc ? `'${parentArc.id}'` : 'null'}, ${Number.isInteger(arc.linkedIndex) ? arc.linkedIndex : -1}, '${targetId}')">
                        <i class="fa-solid fa-plus"></i> Add Segment
                    </button>
                </div>
            `;
    }
  }
  if (isStreamLike && canEditStreamFields && (!Array.isArray(arc.segments) || arc.segments.length === 0)) {
    html += `
            <div class="detail-add-segment-wrap" style="grid-column: 1 / -1; display:none;">
                <button type="button" class="btn btn-outline btn-sm detail-add-segment-btn" onclick="addSegmentToDetail('${arc.id}', ${parentArc ? `'${parentArc.id}'` : 'null'}, ${Number.isInteger(arc.linkedIndex) ? arc.linkedIndex : -1}, '${targetId}')">
                    <i class="fa-solid fa-plus"></i> Add Segment
                </button>
            </div>
        `;
  }

  if (arc.linkedStreams && arc.linkedStreams.length > 0) {
    html += `
            <div class="info-group" style="grid-column: 1 / -1; border-color: rgba(204, 255, 0, 0.4);">
                <div class="info-label" style="font-size: 1.2rem; color: var(--primary);"><i class="fa-solid fa-video"></i> Linked Streams (${arc.linkedStreams.length})</div>
                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 12px;">
        `;
    arc.linkedStreams.forEach((ls, index) => {
      html += `
                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 16px; border-radius: var(--radius-sm); cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'" onclick="renderLinkedStream('${arc.id}', ${index}, '${targetId}')">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <strong style="color: var(--primary); font-size: 1.1rem;">${ls.title}</strong>
                        <span class="arc-status status-planning" style="background: rgba(255,255,255,0.1); color: #fff;">${ls.type}</span>
                    </div>
                    <div style="display: flex; gap: 16px; font-size: 0.9rem; color: #aaa; margin-bottom: 12px;">
                        <span><i class="fa-regular fa-calendar"></i> ${ls.date}</span>
                        <span><i class="fa-solid fa-location-dot"></i> ${ls.location}</span>
                    </div>
                    <div style="margin-bottom: 8px;"><strong>Goals:</strong> ${ls.goals}</div>
                    <div style="font-size: 0.9rem; color: var(--text-muted);"><strong>Logistics:</strong> ${ls.logistics}</div>
                </div>
            `;
    });
    html += `</div></div>`;
  }

  const relatedGoals = typeof goalsData !== 'undefined' ? goalsData.filter(g => g.linkedArcs.includes(arc.id) || g.linkedStreams.includes(arc.id)) : [];
  if (relatedGoals.length > 0) {
    html += `
            <div class="info-group" style="grid-column: 1 / -1; border-color: rgba(204, 255, 0, 0.4);">
                <div class="info-label"><i class="fa-solid fa-bullseye"></i> Associated Goals</div>
                <div class="info-content" style="display: flex; gap: 12px; flex-wrap: wrap;">
                    ${relatedGoals.map(g => `<span class="tag" style="background: rgba(204, 255, 0, 0.1); color: var(--primary); border: 1px solid rgba(204,255,0,0.3);"><i class="fa-solid fa-crosshairs"></i> ${g.title}</span>`).join('')}
                </div>
            </div>
        `;
  }

  html += `</div>`;
  detailPanel.innerHTML = html;

  if (canEditStreamFields && isStreamLike) {
    const editBtn = detailPanel.querySelector('.detail-edit-toggle');
    if (editBtn) {
      editBtn.classList.remove('editing');
      editBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Edit Info';
    }
    detailPanel.querySelectorAll('.detail-add-segment-wrap').forEach((el) => {
      el.style.display = 'none';
    });
  }
  syncStreamDetailManagedFieldsDisabled(detailPanel);
  syncStreamDetailReadOnlyBlocks(detailPanel);

  if (arc.type === 'Arc') {
    if (arc.posterUrl == null) arc.posterUrl = '';
    if (arc.posterPostDate == null) arc.posterPostDate = '';
    if (arc.trailerShootDate == null) arc.trailerShootDate = '';
    if (arc.trailerPostDate == null) arc.trailerPostDate = '';
    const bindArcMediaField = (selector, key) => {
      const el = detailPanel.querySelector(selector);
      if (!el) return;
      const sync = () => {
        arc[key] = el.value.trim();
        scheduleSaveAppStateToDb();
      };
      el.addEventListener('change', sync);
      el.addEventListener('input', sync);
    };
    bindArcMediaField(`.arc-poster-url[data-arc-id="${arc.id}"]`, 'posterUrl');
    bindArcMediaField(`.arc-poster-post[data-arc-id="${arc.id}"]`, 'posterPostDate');
    bindArcMediaField(`.arc-trailer-shoot[data-arc-id="${arc.id}"]`, 'trailerShootDate');
    bindArcMediaField(`.arc-trailer-post[data-arc-id="${arc.id}"]`, 'trailerPostDate');
    const bindAction = (selector, handler) => {
      const el = detailPanel.querySelector(selector);
      if (!el) return;
      el.addEventListener('click', handler);
    };
    bindAction(`.arc-poster-link-btn[data-arc-id="${arc.id}"]`, () => {
      openQuickFormModal({
        title: 'Poster Link',
        submitLabel: 'Save Link',
        fields: [{ name: 'url', label: 'Poster URL', type: 'url', value: arc.posterUrl || '', placeholder: 'https://...' }],
        onSubmit: (values) => {
          arc.posterUrl = String(values.url || '').trim();
          renderDetail(arc, targetId, parentArc);
          scheduleSaveAppStateToDb();
          return true;
        },
      });
    });
    bindAction(`.arc-trailer-link-btn[data-arc-id="${arc.id}"]`, () => {
      openQuickFormModal({
        title: 'Trailer Link',
        submitLabel: 'Add Link',
        fields: [{ name: 'url', label: 'Trailer Reference URL', type: 'url', placeholder: 'https://...' }],
        onSubmit: (values) => {
          const link = String(values.url || '').trim();
          if (!link) {
            setDbStatus('Trailer URL is required.', 'warn');
            return false;
          }
          const base = arc.trailerIdeas ? `${arc.trailerIdeas}\n` : '';
          arc.trailerIdeas = `${base}Link: ${link}`;
          renderDetail(arc, targetId, parentArc);
          scheduleSaveAppStateToDb();
          return true;
        },
      });
    });
    bindAction(`.arc-poster-upload-btn[data-arc-id="${arc.id}"]`, () => {
      openQuickFormModal({
        title: 'Poster Upload URL',
        submitLabel: 'Save URL',
        fields: [{ name: 'url', label: 'Uploaded Poster URL', type: 'url', value: arc.posterUrl || '', placeholder: 'https://...' }],
        onSubmit: (values) => {
          arc.posterUrl = String(values.url || '').trim();
          renderDetail(arc, targetId, parentArc);
          scheduleSaveAppStateToDb();
          return true;
        },
      });
    });
    bindAction(`.arc-trailer-upload-btn[data-arc-id="${arc.id}"]`, () => {
      openQuickFormModal({
        title: 'Trailer Upload URL',
        submitLabel: 'Save URL',
        fields: [{ name: 'url', label: 'Uploaded Trailer URL', type: 'url', placeholder: 'https://...' }],
        onSubmit: (values) => {
          const link = String(values.url || '').trim();
          if (!link) {
            setDbStatus('Trailer URL is required.', 'warn');
            return false;
          }
          const base = arc.trailerIdeas ? `${arc.trailerIdeas}\n` : '';
          arc.trailerIdeas = `${base}Upload: ${link}`;
          renderDetail(arc, targetId, parentArc);
          scheduleSaveAppStateToDb();
          return true;
        },
      });
    });
  }

  if (canDeleteInDetail) {
    const delBtn = document.getElementById('delete-detail-stream-btn');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        deleteStreamRecord(arc, parentArc || null);
      });
    }
  }

  if (canDeleteArcInDetail) {
    const delArcBtn = document.getElementById('delete-detail-arc-btn');
    if (delArcBtn) {
      delArcBtn.addEventListener('click', () => {
        deleteArcRecord(arc);
      });
    }
  }

  if (targetId === 'stream-detail') injectMobileBackButton(detailPanel, 'tab-streams');
  if (targetId === 'arc-detail') injectMobileBackButton(detailPanel, 'tab-arcs');

  if (targetId === 'stream-detail') scheduleDetailDockRetry(syncStreamDetailDock);
  else if (targetId === 'arc-detail') scheduleDetailDockRetry(syncArcDetailDock);
}

window.renderLinkedStream = function (arcId, streamIndex, targetId) {
  const parentArc = arcsData.find(a => a.id === arcId);
  if (!parentArc) return;
  const stream = parentArc.linkedStreams[streamIndex];
  if (!stream) return;
  renderDetail(stream, targetId, parentArc);
};

// Render Narratives
function renderNarratives() {
  const container = document.getElementById('narrative-cards');
  if (!container) return;
  container.innerHTML = '';

  narratives.forEach(nar => {
    const goalsHtml = nar.goals.map(g => `<span class="goal-pill">${g}</span>`).join('');

    container.innerHTML += `
            <div class="narrative-card">
                <h4>${nar.title}</h4>
                <p>${nar.desc}</p>
                <div class="narrative-goals">
                    ${goalsHtml}
                </div>
            </div>
        `;
  });
}

// Render Media Assets
function renderAssets() {
  const list = document.getElementById('asset-list');
  if (!list) return;
  moveDetailPanelToColumn('asset-detail', '#media-pane-social .campaign-detail-col');
  list.innerHTML = '';

  const hasSelectedAsset = mediaAssets.some((a) => `${a.platform}::${a.handle}` === assetListSelectedKey);

  mediaAssets.forEach((asset) => {
    const card = document.createElement('div');
    const assetKey = `${asset.platform}::${asset.handle}`;
    card.className = `arc-card ${assetListSelectedKey === assetKey ? 'active' : ''}`;
    card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(204, 255, 0, 0.1); overflow:hidden; display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 1.2rem;">
                    <img src="${escAttr(CINDY_PLATFORM_PHOTO)}" alt="Cindy" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';" />
                    <span style="display:none; align-items:center; justify-content:center; width:100%; height:100%;"><i class="fa-brands ${asset.icon}"></i></span>
                </div>
                <div>
                    <h4 class="arc-title" style="margin: 0;">${asset.platform}</h4>
                    <div style="font-size: 0.85rem; color: #aaa; margin-top: 4px;">${asset.handle}</div>
                </div>
            </div>
        `;

    card.addEventListener('click', () => {
      if (card.classList.contains('active')) {
        assetListSelectedKey = null;
        card.classList.remove('active');
        hideDetailPanel('asset-detail', '#media-pane-social .campaign-detail-col');
        return;
      }
      document.querySelectorAll('#tab-media .arc-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      assetListSelectedKey = assetKey;
      renderAssetDetail(asset);
      scheduleDetailDockRetry(() =>
        dockDetailUnderSpecificCard('asset-list', 'asset-detail', '#media-pane-social .campaign-detail-col', card)
      );
      if (isMobileCardDetailModeForList('asset-list')) {
        openMobileCardDetailScreen('tab-media', 'asset-detail', '#media-pane-social .campaign-detail-col');
      }
    });

    list.appendChild(card);
  });

  if (hasSelectedAsset) {
    const selectedAsset = mediaAssets.find((a) => `${a.platform}::${a.handle}` === assetListSelectedKey);
    if (selectedAsset) renderAssetDetail(selectedAsset);
  } else {
    const detailPanel = document.getElementById('asset-detail');
    if (detailPanel) {
      detailPanel.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 40px;">Select a platform to view management and creation details</div>`;
    }
    hideDetailPanel('asset-detail', '#media-pane-social .campaign-detail-col');
  }

  if (mediaAssets.length === 0) {
    scheduleDetailDockRetry(syncAssetDetailDock);
  }
}

function renderAssetDetail(asset) {
  const detailPanel = document.getElementById('asset-detail');
  if (!detailPanel) return;
  detailPanel.style.display = '';
  if (detailPanel.__mediaDetailAborter) {
    detailPanel.__mediaDetailAborter.abort();
    detailPanel.__mediaDetailAborter = null;
  }

  if (asset.platform === 'YouTube') {
    const now = new Date();
    const weekPeriods = [
      `Current week: ${formatWeekRangeFromDate(now)}`,
      `Past week: ${formatWeekRangeFromDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))}`,
      `Past week: ${formatWeekRangeFromDate(new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000))}`,
    ];
    const monthPeriods = [
      `Current month: ${formatMonthYear(now)}`,
      `Past month: ${formatMonthYear(new Date(now.getFullYear(), now.getMonth() - 1, 1))}`,
      `Past month: ${formatMonthYear(new Date(now.getFullYear(), now.getMonth() - 2, 1))}`,
    ];
    const weeklyLinks = normalizeRecapPeriodLinks(asset.weeklyRecapLinks, weekPeriods);
    const monthlyLinks = normalizeRecapPeriodLinks(asset.monthlyRecapLinks, monthPeriods);
    asset.weeklyRecapLinks = weeklyLinks;
    asset.monthlyRecapLinks = monthlyLinks;
    detailPanel.innerHTML = `
        <div class="detail-header" style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(204, 255, 0, 0.1); display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 2rem;">
                <i class="fa-brands ${asset.icon}"></i>
            </div>
            <div>
                <h2 style="margin: 0;">${asset.platform}</h2>
                <div style="color: #aaa; font-size: 1.05rem; margin-top: 4px;">${asset.handle}</div>
            </div>
        </div>
        <div class="detail-grid">
            <div class="info-group" style="grid-column: 1 / -1;">
                <div class="info-label"><i class="fa-solid fa-link"></i> Weekly Recap Links</div>
                <div class="info-content">
                    <div style="display:flex; flex-direction:column; gap:8px;">
                      ${weeklyLinks
        .map(
          (row, idx) => `
                        <div class="yt-recap-row">
                          <input class="form-input yt-weekly-period" data-index="${idx}" value="${String(row.period).replace(/"/g, '&quot;')}" />
                          <input class="form-input yt-weekly-url" data-index="${idx}" placeholder="https://..." value="${String(row.url || '').replace(/"/g, '&quot;')}" />
                        </div>`
        )
        .join('')}
                    </div>
                    <div style="margin-top:8px; font-size:0.82rem; color:var(--text-muted);">Set period labels and URLs for current/past weeks.</div>
                </div>
            </div>
            <div class="info-group" style="grid-column: 1 / -1;">
                <div class="info-label"><i class="fa-solid fa-calendar-days"></i> Monthly Recap Links</div>
                <div class="info-content">
                    <div style="display:flex; flex-direction:column; gap:8px;">
                      ${monthlyLinks
        .map(
          (row, idx) => `
                        <div class="yt-recap-row">
                          <input class="form-input yt-monthly-period" data-index="${idx}" value="${String(row.period).replace(/"/g, '&quot;')}" />
                          <input class="form-input yt-monthly-url" data-index="${idx}" placeholder="https://..." value="${String(row.url || '').replace(/"/g, '&quot;')}" />
                        </div>`
        )
        .join('')}
                    </div>
                    <div style="margin-top:8px; font-size:0.82rem; color:var(--text-muted);">Set period labels and URLs for current/past months.</div>
                </div>
            </div>
        </div>
      `;
    const onChange = () => {
      const nextWeekly = [...detailPanel.querySelectorAll('.yt-weekly-period')].map((periodEl) => {
        const idx = Number(periodEl.getAttribute('data-index'));
        const urlEl = detailPanel.querySelector(`.yt-weekly-url[data-index="${idx}"]`);
        return { period: periodEl.value.trim(), url: urlEl?.value?.trim() || '' };
      });
      const nextMonthly = [...detailPanel.querySelectorAll('.yt-monthly-period')].map((periodEl) => {
        const idx = Number(periodEl.getAttribute('data-index'));
        const urlEl = detailPanel.querySelector(`.yt-monthly-url[data-index="${idx}"]`);
        return { period: periodEl.value.trim(), url: urlEl?.value?.trim() || '' };
      });
      asset.weeklyRecapLinks = nextWeekly;
      asset.monthlyRecapLinks = nextMonthly;
      scheduleSaveAppStateToDb();
    };
    detailPanel.querySelectorAll('.yt-weekly-period, .yt-weekly-url, .yt-monthly-period, .yt-monthly-url').forEach((el) => {
      el.addEventListener('input', onChange);
    });
    injectMobileBackButton(detailPanel, 'tab-media');
    scheduleDetailDockRetry(syncAssetDetailDock);
    return;
  }

  if (asset.platform === 'TikTok') {
    if (!Array.isArray(asset.tiktokSoloTrendLinks)) asset.tiktokSoloTrendLinks = [];
    if (!Array.isArray(asset.tiktokCollabTrendLinks)) asset.tiktokCollabTrendLinks = [];
    const soloRows = renderTikTokTrendRowsMarkup(asset.tiktokSoloTrendLinks);
    const collabRows = renderTikTokTrendRowsMarkup(asset.tiktokCollabTrendLinks);
    detailPanel.innerHTML = `
        <div class="detail-header" style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(204, 255, 0, 0.1); display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 2rem;">
                <i class="fa-brands ${asset.icon}"></i>
            </div>
            <div>
                <h2 style="margin: 0;">${asset.platform}</h2>
                <div style="color: #aaa; font-size: 1.05rem; margin-top: 4px;">${asset.handle}</div>
            </div>
        </div>
        <div class="detail-grid">
            <div class="info-group" style="grid-column: 1 / -1;">
                <div class="info-label"><i class="fa-solid fa-user"></i> Solo trends (links to recreate)</div>
                <div class="info-content">
                    <div id="tiktok-solo-rows" class="tiktok-trend-rows">${soloRows}</div>
                    <button type="button" id="tiktok-solo-add" class="btn btn-outline btn-sm" style="margin-top:10px;"><i class="fa-solid fa-plus"></i> Add link</button>
                    <div style="margin-top:8px; font-size:0.82rem; color:var(--text-muted);">One URL per row. Use Play to watch inside this app.</div>
                </div>
            </div>
            <div class="info-group" style="grid-column: 1 / -1;">
                <div class="info-label"><i class="fa-solid fa-users"></i> Collab trends (links to recreate)</div>
                <div class="info-content">
                    <div id="tiktok-collab-rows" class="tiktok-trend-rows">${collabRows}</div>
                    <button type="button" id="tiktok-collab-add" class="btn btn-outline btn-sm" style="margin-top:10px;"><i class="fa-solid fa-plus"></i> Add link</button>
                    <div style="margin-top:8px; font-size:0.82rem; color:var(--text-muted);">Reference trends for collab / guest recreations.</div>
                </div>
            </div>
        </div>
      `;
    bindTikTokMediaTrendEditors(detailPanel, asset);
    injectMobileBackButton(detailPanel, 'tab-media');
    scheduleDetailDockRetry(syncAssetDetailDock);
    return;
  }

  let managementHtml = (asset.management || []).map(m => `<li>${m}</li>`).join('');
  let creationHtml = (asset.creation || []).map(c => `<li>${c}</li>`).join('');
  const isXPlatform = String(asset.platform || '').toLowerCase().includes('x');
  const showManagementBlock = String(asset.platform || '').toLowerCase() !== 'snapchat';

  detailPanel.innerHTML = `
        <div class="detail-header" style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(204, 255, 0, 0.1); display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 2rem;">
                <i class="fa-brands ${asset.icon}"></i>
            </div>
            <div>
                <h2 style="margin: 0;">${asset.platform}</h2>
                <div style="color: #aaa; font-size: 1.1rem; margin-top: 4px;">${asset.handle}</div>
            </div>
        </div>
        
        <div class="detail-grid">
            <div class="info-group" style="grid-column: 1 / -1;">
                <div class="info-label"><i class="fa-solid fa-bullseye"></i> Goal & Strategy</div>
                <div class="info-content" style="font-size: 1.05rem;">
                    ${isXPlatform
      ? `<div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
                             <button type="button" class="btn btn-outline btn-sm x-edit-toggle"><i class="fa-solid fa-pen"></i> Edit Info</button>
                           </div>
                           <div class="x-readonly-view">
                             <div style="margin-bottom: 12px;"><strong>Goal:</strong> <span class="x-goal-read">${escAttr(asset.goal || '')}</span></div>
                             <div style="color: var(--text-muted);"><strong>Strategy:</strong> <span class="x-strategy-read">${escAttr(asset.strategy || '')}</span></div>
                           </div>
                           <div class="x-edit-view" style="display:none;">
                             <div style="margin-bottom: 10px;">
                               <div style="font-size:0.78rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Goal</div>
                               <textarea class="form-input x-goal-input" style="width:100%; min-height:70px; resize:vertical;">${escAttr(asset.goal || '')}</textarea>
                             </div>
                             <div style="margin-bottom: 10px;">
                               <div style="font-size:0.78rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Strategy</div>
                               <textarea class="form-input x-strategy-input" style="width:100%; min-height:90px; resize:vertical;">${escAttr(asset.strategy || '')}</textarea>
                             </div>
                             <div style="display:flex; justify-content:flex-end; gap:8px;">
                               <button type="button" class="btn btn-outline btn-sm x-cancel-btn">Cancel</button>
                               <button type="button" class="btn btn-primary btn-sm x-save-btn"><i class="fa-solid fa-check"></i> Save</button>
                             </div>
                           </div>`
      : `<div style="margin-bottom: 12px;"><strong>Goal:</strong> ${asset.goal}</div>
                           <div style="color: var(--text-muted);"><strong>Strategy:</strong> ${asset.strategy}</div>`
    }
                </div>
            </div>

            ${showManagementBlock
      ? `<div class="info-group">
                <div class="info-label"><i class="fa-solid fa-users-gear"></i> Management Workflow</div>
                <div class="info-content">
                    <ul style="padding-left: 20px; color: var(--text-muted); display: flex; flex-direction: column; gap: 8px;">
                        ${managementHtml}
                    </ul>
                </div>
            </div>`
      : ''
    }

            <div class="info-group">
                <div class="info-label"><i class="fa-solid fa-wand-magic-sparkles"></i> Content Creation</div>
                <div class="info-content">
                    <ul style="padding-left: 20px; color: var(--text-muted); display: flex; flex-direction: column; gap: 8px;">
                        ${creationHtml}
                    </ul>
                </div>
            </div>
        </div>
    `;
  if (isXPlatform) {
    const toggleBtn = detailPanel.querySelector('.x-edit-toggle');
    const saveBtn = detailPanel.querySelector('.x-save-btn');
    const cancelBtn = detailPanel.querySelector('.x-cancel-btn');
    const readView = detailPanel.querySelector('.x-readonly-view');
    const editView = detailPanel.querySelector('.x-edit-view');
    const goalInput = detailPanel.querySelector('.x-goal-input');
    const strategyInput = detailPanel.querySelector('.x-strategy-input');
    const goalRead = detailPanel.querySelector('.x-goal-read');
    const strategyRead = detailPanel.querySelector('.x-strategy-read');
    toggleBtn?.addEventListener('click', () => {
      if (readView) readView.style.display = 'none';
      if (editView) editView.style.display = '';
    });
    cancelBtn?.addEventListener('click', () => {
      if (goalInput) goalInput.value = String(asset.goal || '');
      if (strategyInput) strategyInput.value = String(asset.strategy || '');
      if (readView) readView.style.display = '';
      if (editView) editView.style.display = 'none';
    });
    saveBtn?.addEventListener('click', () => {
      asset.goal = String(goalInput?.value || '').trim();
      asset.strategy = String(strategyInput?.value || '').trim();
      if (goalRead) goalRead.textContent = asset.goal;
      if (strategyRead) strategyRead.textContent = asset.strategy;
      if (readView) readView.style.display = '';
      if (editView) editView.style.display = 'none';
      scheduleSaveAppStateToDb();
    });
  }
  injectMobileBackButton(detailPanel, 'tab-media');
  scheduleDetailDockRetry(syncAssetDetailDock);
}

// Render Goals
window.renderGoals = function () {
  const list = document.getElementById('goals-list');
  if (!list) return;
  moveDetailPanelToColumn('goal-detail', '#tab-goals .campaign-detail-col');
  list.innerHTML = '';

  const categories = [...new Set(goalsData.map(g => g.category))];
  if (!categories.includes(goalListSelectedCategory)) goalListSelectedCategory = null;

  categories.forEach(category => {
    const card = document.createElement('div');
    card.className = `arc-card ${goalListSelectedCategory === category ? 'active' : ''}`;

    const categoryGoals = goalsData.filter(g => g.category === category);
    const inProgress = categoryGoals.filter(g => g.status === 'In Progress').length;

    card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <h4 class="arc-title" style="margin: 0; font-size: 1.1rem; text-transform: uppercase; min-width:0;">${category}</h4>
                <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;" onclick="event.stopPropagation()">
                    <button type="button" class="btn btn-outline btn-sm" onclick="editGoalCategory('${escAttr(category)}')"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" class="btn btn-outline btn-sm" style="border-color: rgba(239,68,68,0.45); color:#f87171;" onclick="deleteGoalCategory('${escAttr(category)}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 12px; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-layer-group"></i> ${categoryGoals.length} Subgoals <span style="opacity: 0.5;">(${inProgress} Active)</span>
            </div>
        `;

    card.addEventListener('click', () => {
      if (goalListSelectedCategory === category) {
        goalListSelectedCategory = null;
        card.classList.remove('active');
        hideDetailPanel('goal-detail', '#tab-goals .campaign-detail-col');
        return;
      }
      document.querySelectorAll('#tab-goals .arc-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      goalListSelectedCategory = category;
      renderCategoryDetail(category);
      if (isMobileCardDetailModeForList('goals-list')) {
        openMobileCardDetailScreen('tab-goals', 'goal-detail', '#tab-goals .campaign-detail-col');
      }
    });

    list.appendChild(card);
  });

  if (goalListSelectedCategory) {
    renderCategoryDetail(goalListSelectedCategory);
  } else {
    const detailPanel = document.getElementById('goal-detail');
    if (detailPanel) {
      detailPanel.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-layer-group empty-icon"></i>
                    <p>Select a category to view subgoals</p>
                </div>
            `;
    }
    hideDetailPanel('goal-detail', '#tab-goals .campaign-detail-col');
  }
}

window.renderCategoryDetail = function (category) {
  const detailPanel = document.getElementById('goal-detail');
  if (!detailPanel) return;
  detailPanel.style.display = '';

  const categoryGoals = goalsData.filter(g => g.category === category);

  let html = `
        <div class="detail-header" style="padding-bottom: 24px; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <h2 style="margin-bottom: 12px; font-size: 2rem; text-transform: uppercase;">${category}</h2>
            <div style="color: var(--text-muted);">Expand subgoals below to view or edit details.</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 16px;">
    `;

  categoryGoals.forEach((goal, index) => {
    let actionsHtml = goal.actionItems.map(a => `<li style="margin-bottom: 6px;">${a}</li>`).join('');

    let linkedHtml = '';
    const linkedObjects = [];
    goal.linkedArcs.forEach(id => {
      const arc = arcsData.find(a => a.id === id);
      if (arc) linkedObjects.push({ title: arc.title, type: 'Arc', icon: 'fa-bolt' });
    });
    goal.linkedStreams.forEach(id => {
      const stream = arcsData.find(a => a.id === id);
      if (stream) linkedObjects.push({ title: stream.title, type: 'Stream', icon: 'fa-video' });
    });

    if (linkedObjects.length > 0) {
      linkedHtml = `
                <div class="info-group" style="grid-column: 1 / -1; margin-top: 16px;">
                    <div class="info-label"><i class="fa-solid fa-link"></i> Linked Content</div>
                    <div class="info-content" style="display: flex; gap: 12px; flex-wrap: wrap;">
                        ${linkedObjects.map(obj => `
                            <span class="tag" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                                <i class="fa-solid ${obj.icon}"></i> ${obj.title}
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;
    }

    html += `
            <div class="glass-panel" style="padding: 0; overflow: hidden; position: relative;">
                <div style="padding: 20px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: rgba(255,255,255,0.02); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='rgba(255,255,255,0.02)'" onclick="toggleGoalAccordion('goal-body-${index}', this)">
                    <h3 style="margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 12px; min-width:0;">
                        <i class="fa-solid fa-chevron-right chevron-icon" style="transition: transform 0.3s; font-size: 0.9rem; color: var(--text-muted);"></i>
                        ${goal.title}
                    </h3>
                    <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;" onclick="event.stopPropagation()">
                        <button type="button" class="btn btn-outline btn-sm" onclick="editGoalById('${goal.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button type="button" class="btn btn-outline btn-sm" style="border-color: rgba(239,68,68,0.45); color:#f87171;" onclick="deleteGoalById('${goal.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <div id="goal-body-${index}" style="display: none; padding: 20px; border-top: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
                        <button class="btn btn-outline btn-sm" onclick="toggleEditMode(this)">
                            <i class="fa-solid fa-pen"></i> Edit Info
                        </button>
                    </div>
                    <div class="detail-grid">
                        <div class="info-group" style="grid-column: 1 / -1;">
                            <div class="info-label"><i class="fa-solid fa-align-left"></i> Description</div>
                            <div class="info-content" style="font-size: 1.05rem; color: #ccc;">${goal.description}</div>
                        </div>
                        
                        <div class="info-group" style="grid-column: 1 / -1;">
                            <div class="info-label"><i class="fa-solid fa-check-double"></i> Action Items</div>
                            <div class="info-content">
                                <ul style="padding-left: 20px; color: var(--text-muted); display: flex; flex-direction: column;">
                                    ${actionsHtml}
                                </ul>
                            </div>
                        </div>
                    </div>
                    ${linkedHtml}
                </div>
            </div>
        `;
  });

  html += `</div>`;
  detailPanel.innerHTML = html;
  injectMobileBackButton(detailPanel, 'tab-goals');
  scheduleDetailDockRetry(syncGoalDetailDock);
}

window.toggleGoalAccordion = function (bodyId, headerElement) {
  const body = document.getElementById(bodyId);
  const chevron = headerElement.querySelector('.chevron-icon');

  if (body.style.display === 'none') {
    body.style.display = 'block';
    chevron.style.transform = 'rotate(90deg)';
    headerElement.style.background = 'rgba(255,255,255,0.08)';
    headerElement.onmouseout = function () { this.style.background = 'rgba(255,255,255,0.08)' };
  } else {
    body.style.display = 'none';
    chevron.style.transform = 'rotate(0deg)';
    headerElement.style.background = 'rgba(255,255,255,0.02)';
    headerElement.onmouseout = function () { this.style.background = 'rgba(255,255,255,0.02)' };
  }
}

function renderReachOutContacts() {
  const board = document.getElementById('reachout-contacts-board');
  if (!board) return;
  const groups = [
    { key: 'artists', label: 'Artists' },
    { key: 'athletes', label: 'Athletes' },
    { key: 'actors', label: 'Actors' },
    { key: 'streamers', label: 'Streamers' },
    { key: 'youtubers', label: 'YouTubers' },
  ];
  board.innerHTML = groups
    .map((group) => {
      const bucket = (reachOutContactsData && reachOutContactsData[group.key]) || {};
      const subCats = Object.keys(bucket);
      const subHtml = subCats
        .map((sub) => {
          const val = bucket[sub];
          if (Array.isArray(val)) {
            const entries = val;
            const chips = entries.length
              ? entries.map((name) => `<span class="tag">${escAttr(name)}</span>`).join('')
              : `<span style="font-size:0.82rem; color:var(--text-muted);">No contacts added yet.</span>`;
            return `
                <div class="glass-panel" style="padding:12px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
                    <div style="font-size:0.78rem; text-transform:uppercase; color:var(--text-muted);">${escAttr(sub)}</div>
                    <button type="button" class="btn btn-outline btn-sm" onclick="addReachOutContactToBucket('${escAttr(group.key)}','${escAttr(sub)}')"><i class="fa-solid fa-plus"></i></button>
                  </div>
                  <div style="display:flex; flex-wrap:wrap; gap:8px;">${chips}</div>
                </div>
              `;
          }
          const teamKeys = Object.keys(val || {});
          const teamCards = teamKeys
            .map((team) => {
              const teamEntries = Array.isArray(val[team]) ? val[team] : [];
              const teamChips = teamEntries.length
                ? teamEntries.map((name) => `<span class="tag">${escAttr(name)}</span>`).join('')
                : `<span style="font-size:0.8rem; color:var(--text-muted);">No names yet.</span>`;
              return `
                  <div class="glass-panel" style="padding:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
                      <div style="font-size:0.78rem; color:var(--text-main);">${escAttr(team)}</div>
                      <button type="button" class="btn btn-outline btn-sm" onclick="addReachOutContactToBucket('${escAttr(group.key)}','${escAttr(sub)}','${escAttr(team)}')"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <div style="display:flex; flex-wrap:wrap; gap:8px;">${teamChips}</div>
                  </div>
                `;
            })
            .join('');
          return `
              <div class="glass-panel" style="padding:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px;">
                  <div style="font-size:0.78rem; text-transform:uppercase; color:var(--text-muted);">${escAttr(sub)}</div>
                  <button type="button" class="btn btn-outline btn-sm" onclick="addReachOutContactToBucket('${escAttr(group.key)}','${escAttr(sub)}')"><i class="fa-solid fa-plus"></i></button>
                </div>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:8px;">
                  ${teamCards}
                </div>
              </div>
            `;
        })
        .join('');
      return `
          <div class="glass-panel" style="padding:14px;">
            <h4 style="margin-bottom:10px;">${group.label}</h4>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap:10px;">
              ${subHtml}
            </div>
          </div>
        `;
    })
    .join('');
}

function addReachOutContactViaForm(prefill = {}) {
  const options = [];
  const groups = [
    { key: 'artists', label: 'Artists' },
    { key: 'athletes', label: 'Athletes' },
    { key: 'actors', label: 'Actors' },
    { key: 'streamers', label: 'Streamers' },
    { key: 'youtubers', label: 'YouTubers' },
  ];
  groups.forEach((group) => {
    const bucket = (reachOutContactsData && reachOutContactsData[group.key]) || {};
    Object.keys(bucket).forEach((sub) => {
      if (Array.isArray(bucket[sub])) {
        options.push({ value: `${group.key}::${sub}`, label: `${group.label} - ${sub}` });
      } else {
        Object.keys(bucket[sub] || {}).forEach((team) => {
          options.push({ value: `${group.key}::${sub}::${team}`, label: `${group.label} - ${sub} - ${team}` });
        });
      }
    });
  });
  const initial =
    prefill && prefill.groupKey && prefill.subKey
      ? prefill.teamKey
        ? `${prefill.groupKey}::${prefill.subKey}::${prefill.teamKey}`
        : `${prefill.groupKey}::${prefill.subKey}`
      : options[0]?.value || '';
  openQuickFormModal({
    title: 'Add Reach-Out Contact',
    submitLabel: 'Add',
    fields: [
      { name: 'name', label: 'Name', type: 'text', placeholder: 'Contact name' },
      { name: 'bucket', label: 'Category', type: 'select', options, value: initial },
    ],
    onSubmit: (values) => {
      const name = String(values.name || '').trim();
      const bucket = String(values.bucket || '');
      if (!name || !bucket.includes('::')) return false;
      const parts = bucket.split('::');
      const groupKey = parts[0];
      const subKey = parts[1];
      const teamKey = parts[2];
      if (!reachOutContactsData[groupKey]) return false;
      let target = null;
      if (teamKey) {
        if (!reachOutContactsData[groupKey][subKey] || !Array.isArray(reachOutContactsData[groupKey][subKey][teamKey])) return false;
        target = reachOutContactsData[groupKey][subKey][teamKey];
      } else {
        if (!Array.isArray(reachOutContactsData[groupKey][subKey])) return false;
        target = reachOutContactsData[groupKey][subKey];
      }
      if (!target.some((x) => String(x).toLowerCase() === name.toLowerCase())) target.push(name);
      renderReachOutContacts();
      scheduleSaveAppStateToDb();
      return true;
    },
  });
}

window.addReachOutContactToBucket = function (groupKey, subKey, teamKey) {
  addReachOutContactViaForm({ groupKey, subKey, teamKey });
};

// Render Network
function renderNetwork() {
  const container = document.getElementById('network-grid');
  if (!container) return;

  container.innerHTML = '';
  const query = String(networkFilters.query || '').trim().toLowerCase();
  const tagFilter = String(networkFilters.tag || '').trim().toLowerCase();
  const nameFilter = String(networkFilters.name || '').trim().toLowerCase();
  const filtered = networkData.filter((person) => {
    const name = String(person.name || '').toLowerCase();
    const tags = Array.isArray(person.tags) ? person.tags.map((t) => String(t).toLowerCase()) : [];
    const matchQuery = !query || name.includes(query) || tags.some((t) => t.includes(query));
    const matchName = !nameFilter || name === nameFilter;
    const matchTag = !tagFilter || tags.includes(tagFilter);
    return matchQuery && matchName && matchTag;
  });

  const metricMap = new Map();
  const getMetrics = (person) => {
    const key = person;
    if (!metricMap.has(key)) metricMap.set(key, getNetworkPersonMetrics(person));
    return metricMap.get(key);
  };
  const sorted = [...filtered].sort((a, b) => {
    const mode = String(networkFilters.sort || 'name_asc');
    if (mode === 'most_streamed_with') {
      const diff = getMetrics(b).streamCount - getMetrics(a).streamCount;
      if (diff !== 0) return diff;
    } else if (mode === 'most_clips_with') {
      const diff = getMetrics(b).clipCount - getMetrics(a).clipCount;
      if (diff !== 0) return diff;
    } else if (mode === 'recent_streamed_with') {
      const aTs = getMetrics(a).recentStreamTs ?? -Infinity;
      const bTs = getMetrics(b).recentStreamTs ?? -Infinity;
      if (bTs !== aTs) return bTs - aTs;
    }
    return String(a.name || '').localeCompare(String(b.name || ''));
  });

  sorted.forEach((person) => {
    const index = networkData.indexOf(person);
    const contacts = Array.isArray(person.contacts) ? person.contacts : [];
    const ideas = Array.isArray(person.ideas) ? person.ideas : [];
    const tags = Array.isArray(person.tags) ? person.tags : [];
    let contactsHtml = contacts.map(c => `
            <a href="#" class="contact-pill" onclick="event.stopPropagation(); return false;">
                <i class="fa-${c.type} ${c.icon}"></i> ${c.handle}
            </a>
        `).join('');

    let ideasHtml = ideas.map(i => `<li>${i}</li>`).join('');
    let tagsHtml = tags.map(t => `<span style="background: rgba(204,255,0,0.1); color: var(--primary); padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; margin-right: 4px; text-transform: uppercase;">${t}</span>`).join('');

    container.innerHTML += `
            <div class="network-card" style="cursor:pointer;" onclick="openNetworkPersonDetail(${index})">
                <div class="network-header network-header-actions">
                    <div style="display:flex; align-items:flex-start; gap:12px; min-width:0; flex:1 1 auto;">
                    <div class="network-avatar">
                        <img src="${escAttr(person.photo || defaultAvatarForName(person.name))}" alt="${escAttr(person.name || 'Contact')}" loading="lazy" onerror="this.style.display='none'; this.parentElement.classList.add('network-avatar--fallback'); this.parentElement.innerHTML='<i class=&quot;fa-solid fa-user&quot;></i>';">
                    </div>
                    <div class="network-info" title="View streams and tagged clips">
                        <h4>${person.name}</h4>
                        <p style="margin-bottom: 6px;"><i class="fa-solid fa-location-dot"></i> ${person.city}</p>
                        <div>${tagsHtml}</div>
                    </div>
                    </div>
                    <div class="network-card-actions">
                        <button type="button" class="btn btn-outline btn-sm" onclick="event.stopPropagation(); openNetworkPersonDetail(${index});"><i class="fa-solid fa-chart-line"></i> History</button>
                        <button type="button" class="btn btn-outline btn-sm" onclick="event.stopPropagation(); editNetworkPerson(${index});"><i class="fa-solid fa-pen"></i> Edit</button>
                    </div>
                </div>
                <div class="network-contact">
                    ${contactsHtml}
                </div>
                <div class="network-ideas">
                    <div class="network-ideas-title">Stream Ideas</div>
                    <ul class="network-ideas-list">
                        ${ideasHtml}
                    </ul>
                </div>
            </div>
        `;
  });
  if (sorted.length === 0) {
    container.innerHTML = `<div class="glass-panel" style="padding:12px; color:var(--text-muted);">No contacts match this filter.</div>`;
  }
}

window.editNetworkPerson = function (index) {
  editNetworkPersonViaForm(index);
};
window.openNetworkPersonDetail = function (index) {
  showNetworkPersonDetail(index);
};

function syncStreamDetailManagedFieldsDisabled(panel) {
  if (!panel) return;
  const editBtn = panel.querySelector('.detail-edit-toggle');
  const locked = !editBtn || !editBtn.classList.contains('editing');
  panel.querySelectorAll('.stream-detail-managed-field').forEach((el) => {
    el.disabled = locked;
  });
}

function syncStreamDetailReadOnlyBlocks(panel) {
  if (!panel) return;
  const editBtn = panel.querySelector('.detail-edit-toggle');
  const isEditing = !!(editBtn && editBtn.classList.contains('editing'));

  panel.querySelectorAll('.stream-goals-block').forEach((block) => {
    const read = block.querySelector('.stream-detail-read-only');
    const input = block.querySelector('textarea');
    if (!read || !input) return;
    if (!isEditing) read.innerHTML = bulletsHtmlFromText(input.value, 'No goals yet.');
    read.style.display = isEditing ? 'none' : '';
    input.style.display = isEditing ? '' : 'none';
  });
  panel.querySelectorAll('.stream-narrative-block').forEach((block) => {
    const read = block.querySelector('.stream-detail-read-only');
    const input = block.querySelector('textarea');
    if (!read || !input) return;
    if (!isEditing) read.innerHTML = bulletsHtmlFromText(input.value, 'No clipping narrative yet.');
    read.style.display = isEditing ? 'none' : '';
    input.style.display = isEditing ? '' : 'none';
  });
}

window.toggleEditMode = function (btn) {
  const container = btn.closest('.glass-panel');
  const isEditing = btn.classList.contains('editing');
  const addSegmentWrappers = container ? container.querySelectorAll('.detail-add-segment-wrap') : [];

  if (isEditing) {
    // Save
    btn.innerHTML = '<i class="fa-solid fa-pen"></i> Edit Info';
    btn.classList.remove('editing');
    addSegmentWrappers.forEach((el) => { el.style.display = 'none'; });

    container.querySelectorAll('.info-content, .detail-tags, p').forEach(el => {
      if (el.classList.contains('btn')) return;
      el.contentEditable = false;
      el.style.border = 'none';
      el.style.padding = '0';
      el.style.backgroundColor = 'transparent';
    });
    syncStreamDetailManagedFieldsDisabled(container);
    syncStreamDetailReadOnlyBlocks(container);
    scheduleSaveAppStateToDb();
  } else {
    // Edit
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Save';
    btn.classList.add('editing');
    addSegmentWrappers.forEach((el) => { el.style.display = ''; });

    container.querySelectorAll('.info-content, .detail-tags, p').forEach(el => {
      if (el.classList.contains('btn')) return;
      el.contentEditable = true;
      el.style.border = '1px dashed var(--primary)';
      el.style.padding = '8px';
      el.style.backgroundColor = 'rgba(255,255,255,0.05)';
      el.style.borderRadius = '4px';
      el.style.outline = 'none';
    });
    syncStreamDetailManagedFieldsDisabled(container);
    syncStreamDetailReadOnlyBlocks(container);
  }
};

window.addSegmentToDetail = function (streamId, parentArcId, linkedIndex, targetId) {
  const stream = getClipStreamRecord(streamId, parentArcId, linkedIndex);
  if (!stream) return;
  const parentArc = parentArcId && parentArcId !== 'null' ? arcsData.find((a) => a.id === parentArcId) || null : null;
  if (!Array.isArray(stream.segments)) stream.segments = [];
  stream.segments.push({
    title: '',
    duration: '1 hr',
    goals: '',
    narrative: '',
    options: [],
    clipVodUrl: '',
  });
  renderDetail(stream, targetId, parentArc);
  scheduleSaveAppStateToDb();
};

function handleCreateDraftSubmit(modal) {
  const titleEl = document.getElementById('new-item-title');
  const dateEl = document.getElementById('new-item-date');
  const locEl = document.getElementById('new-item-location');
  const title = titleEl?.value?.trim() || '';
  if (!title) {
    setDbStatus('Please enter a title before creating a draft.', 'warn');
    if (titleEl) titleEl.focus();
    return;
  }
  const typeBtn = modal.querySelector('#modal-type-selector .type-btn.active');
  const type = typeBtn?.getAttribute('data-value') || 'Desktop';
  const dateStr = dateEl?.value ? dateEl.value.replace('T', ' ') : 'TBD';
  const location = locEl?.value?.trim() || 'TBD';
  const newId = `item-${Date.now()}`;
  const splitLines = (text) =>
    String(text || '')
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);
  const oneLineToList = (text) =>
    String(text || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  const getFieldValue = (selector) => modal.querySelector(selector)?.value?.trim() || '';

  const segmentCards = modal.querySelectorAll('#segments-list .segment-card');
  const segments = [];
  segmentCards.forEach((card) => {
    const segTitle = card.querySelector('.segment-activity')?.value?.trim() || 'Activity';
    const h = card.querySelector('.segment-hours')?.value;
    const m = card.querySelector('.segment-minutes')?.value;
    let duration = '';
    if (h != null && h !== '' && m != null && m !== '') {
      duration = `${h}h ${m}m`;
    }
    const goalsSeg = card.querySelector('.segment-goals-select')?.value?.trim() || '';
    const nar = card.querySelector('.segment-narrative')?.value?.trim() || '';
    const options = [...card.querySelectorAll('.segment-option-row')]
      .map((row) => ({
        text: row.querySelector('.option-text')?.value?.trim() || '',
        decision: row.querySelector('.option-decision')?.value || 'keep',
      }))
      .filter((opt) => opt.text);
    segments.push({
      title: segTitle,
      duration: duration || '1 hr',
      goals: goalsSeg,
      narrative: nar,
      options,
    });
  });

  if (type === 'Arc') {
    const linkedStreams = [...modal.querySelectorAll('#arc-streams-list .segment-card')]
      .map((card) => {
        const titleVal = card.querySelector('.arc-stream-title')?.value?.trim() || '';
        if (!titleVal) return null;
        const dateVal = card.querySelector('.arc-stream-date')?.value || '';
        return {
          title: titleVal,
          type: card.querySelector('.arc-stream-type')?.value || 'IRL',
          date: dateVal ? dateVal.replace('T', ' ') : 'TBD',
          location: card.querySelector('.arc-stream-location')?.value?.trim() || 'TBD',
          goals: card.querySelector('.arc-stream-goals')?.value?.trim() || '',
          logistics: card.querySelector('.arc-stream-logistics')?.value?.trim() || '',
        };
      })
      .filter(Boolean);
    const newArc = {
      id: newId,
      title,
      status: 'planning',
      type: 'Arc',
      date: dateStr,
      location,
      goals: splitLines(getFieldValue('#arc-goals')),
      clothing: oneLineToList(getFieldValue('#arc-clothing')),
      activities: oneLineToList(getFieldValue('#arc-activities')),
      prompts: oneLineToList(getFieldValue('#arc-prompts')),
      narrative: getFieldValue('#arc-narrative'),
      clippingNarrative: getFieldValue('#arc-clipping-narrative'),
      trailerIdeas: getFieldValue('#arc-trailer-ideas'),
      posterIdeas: getFieldValue('#arc-poster-ideas'),
      posterUrl: '',
      posterPostDate: '',
      trailerShootDate: '',
      trailerPostDate: '',
      budget: getFieldValue('#arc-budget'),
      linkedStreams,
    };
    const arcCollab = readCollabChipsFromModal(modal);
    if (arcCollab !== undefined) newArc.collabWith = arcCollab;
    arcsData.push(newArc);
  } else {
    const draft = {
      id: newId,
      title,
      status: 'planning',
      type,
      date: dateStr,
      location,
      segments: segments.length ? segments : [{ title: 'Main', duration: '1 hr', goals: '', narrative: '' }],
    };
    const security = getFieldValue('.field-security');
    const driver = getFieldValue('.field-driver');
    if (security) draft.security = security;
    if (driver) draft.driver = driver;
    const streamCollab = readCollabChipsFromModal(modal);
    if (streamCollab !== undefined) draft.collabWith = streamCollab;
    arcsData.push(draft);

    const dateSource = dateEl?.value || '';
    const parsed = dateSource ? new Date(dateSource) : null;
    const dayNum = parsed && !Number.isNaN(parsed.getTime()) ? parsed.getDate() : null;
    if (dayNum && dayNum >= 1 && dayNum <= 30) {
      const goalPreview = segments[0]?.goals ? `Goals: ${segments[0].goals}` : '';
      const details = [location !== 'TBD' ? `Location: ${location}` : '', goalPreview].filter(Boolean).join(' · ');
      calendarEvents.push({
        day: dayNum,
        type: 'stream',
        title,
        streamId: draft.id,
        color: 'stream',
        time: dateSource ? dateSource.replace('T', ' ') : '',
        details: details || 'Created from Streams form.',
      });
      renderCalendar();
    }
  }

  renderStreams();
  renderArcs();
  modal.classList.remove('active');
  if (titleEl) titleEl.value = '';
  if (dateEl) dateEl.value = '';
  if (locEl) locEl.value = '';
  scheduleSaveAppStateToDb();
}

// Modal Logic
function getSegmentCardHtml(segmentNumber) {
  return `
    <div class="segment-card" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); padding: 12px; border-radius: var(--radius-sm); position: relative;">
      <button type="button" onclick="this.parentElement.remove()" style="position: absolute; right: 8px; top: 8px; background: none; border: none; color: var(--text-muted); cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
      <div style="display:flex; justify-content: space-between; align-items:center; gap:8px; margin-bottom: 8px;">
        <div style="font-size: 0.82rem; color: var(--primary); text-transform: uppercase;">Segment ${segmentNumber}</div>
        <button type="button" class="btn btn-outline btn-sm" onclick="openSegmentBankModal(this)"><i class="fa-solid fa-book-open"></i> Segment Bank</button>
      </div>
      <div style="display:grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; margin-bottom: 8px;">
        <input type="text" class="form-input segment-activity" placeholder="Activity" style="width: 100%;">
        <button type="button" class="btn btn-outline btn-sm" onclick="addSegmentOption(this)"><i class="fa-solid fa-plus"></i> Add option</button>
      </div>
      <div class="segment-options-list" style="display:flex; flex-direction: column; gap: 8px; margin-bottom: 8px;">
        ${getSegmentOptionHtml()}
      </div>
      <div style="display: flex; gap: 8px; margin-bottom: 8px;">
        <select class="form-input segment-hours" style="flex: 1; appearance: auto; background: rgba(0,0,0,0.5);">
          <option value="" disabled selected>Hours</option>
          <option value="0">0 hrs</option><option value="1">1 hr</option><option value="2">2 hrs</option><option value="3">3 hrs</option>
          <option value="4">4 hrs</option><option value="5">5 hrs</option><option value="6">6 hrs</option>
        </select>
        <select class="form-input segment-minutes" style="flex: 1; appearance: auto; background: rgba(0,0,0,0.5);">
          <option value="" disabled selected>Minutes</option>
          <option value="0">0 mins</option><option value="15">15 mins</option><option value="30">30 mins</option><option value="45">45 mins</option>
        </select>
      </div>
      <select class="form-input segment-goals-select" style="width: 100%; margin-bottom: 8px; appearance: auto; background: rgba(0,0,0,0.5);">
        <option value="">Select goal from Goals tab...</option>
        ${getGoalOptionsHtml()}
      </select>
      <input type="text" class="form-input segment-narrative" placeholder="Clipping Narrative" style="width: 100%; margin-bottom: 10px;">
    </div>
  `;
}

function getGoalOptionsHtml() {
  if (!Array.isArray(goalsData)) return '';
  return goalsData
    .map((g) => (g && g.title ? `<option value="${escAttr(g.title)}">${escAttr(g.title)}</option>` : ''))
    .join('');
}

function getSegmentOptionHtml() {
  return `
    <div class="segment-option-row" style="display:grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center;">
      <input type="text" class="form-input option-text" placeholder="Activity">
      <button type="button" class="btn btn-outline btn-sm" onclick="this.closest('.segment-option-row').remove()"><i class="fa-solid fa-xmark"></i></button>
    </div>
  `;
}

const SEGMENT_BANK_CATEGORIES = [
  { name: 'Water / Aquatic', items: ['Olympic pool diving', 'Cliff jumping', 'Scuba diving', 'Snorkeling', 'Jet skiing', 'Wakeboarding', 'Water skiing', 'Surfing', 'Indoor wave pool surfing', 'White-water rafting', 'Kayaking (river or ocean)', 'Paddleboarding', 'Flyboarding', 'Parasailing', 'Underwater scooter experience', 'Ice swimming', 'Sailing lesson', 'Yacht day trip', 'River tubing', 'Water obstacle course park'] },
  { name: 'Martial Arts / Discipline', items: ['Kung fu monastery stay', 'Ninja obstacle training', 'Samurai sword class (iaido)', 'Parkour academy'] },
  { name: 'Snow / Mountain', items: ['Skiing', 'Snowboarding', 'Snowmobiling', 'Dog sledding', 'Mountain cabin trip', 'Alpine sledding', 'Winter survival camp', 'Ski resort spa weekend', 'Ice fishing trip'] },
  { name: 'Nature / Adventure', items: ['Cabin trip', 'Safari', 'Riding horses', 'Desert ATV riding', 'Zipline in forest', 'Hot air balloon ride', 'Volcano hike', 'Cave exploration', 'Mountain summit hike', 'Camping on remote island', 'Sandboarding dunes', 'Jeep off-road expedition', 'Farm stay experience'] },
  { name: 'Simulation / Experience', items: ['Airplane flight simulator', 'Space mission simulator', 'Helicopter simulator', 'Driving supercar track day', 'F1 simulator experience', 'Spy training experience', 'Military tank driving experience', 'Submarine simulator', 'Firefighter training experience'] },
  { name: 'Animal Experiences', items: ['Riding horses', 'Camel riding', 'Elephant sanctuary visit', 'Dolphin swim', 'Shark cage diving', 'Dog sledding', 'Wolf sanctuary tour', 'Reindeer sledding', 'Penguin encounter', 'Whale watching', 'Horseback mountain trail', 'Farm animal care day', 'Safari jeep tour', 'Bird of prey handling', 'Aquarium behind-the-scenes'] },
  { name: 'Skill-Based Trips', items: ['Archery camp', 'Survival skills training'] },
];
let activeSegmentBankCategory = 0;
let activeSegmentBankCard = null;

function setupSegmentBankModal() {
  const modal = document.getElementById('segment-bank-modal');
  const closeBtn = document.getElementById('segment-bank-close-btn');
  const tabs = document.getElementById('segment-bank-tabs');
  const items = document.getElementById('segment-bank-items');
  if (!modal || !closeBtn || !tabs || !items) return;

  const renderTabs = () => {
    tabs.innerHTML = SEGMENT_BANK_CATEGORIES.map((c, idx) => `
          <button type="button" class="segment-bank-tab ${idx === activeSegmentBankCategory ? 'active' : ''}" data-segment-bank-tab="${idx}">
            ${escAttr(c.name)}
          </button>
        `).join('');
  };

  const renderItems = () => {
    const category = SEGMENT_BANK_CATEGORIES[activeSegmentBankCategory];
    items.innerHTML = category.items.map((item) => `
          <div class="segment-bank-item-row">
            <span>${escAttr(item)}</span>
            <button type="button" class="btn btn-outline btn-sm" data-segment-bank-add="${escAttr(item)}">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        `).join('');
  };

  const render = () => {
    renderTabs();
    renderItems();
  };
  render();

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-segment-bank-tab]');
    if (!btn) return;
    const idx = Number(btn.getAttribute('data-segment-bank-tab'));
    if (Number.isNaN(idx) || idx < 0 || idx >= SEGMENT_BANK_CATEGORIES.length) return;
    activeSegmentBankCategory = idx;
    render();
  });

  items.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-segment-bank-add]');
    if (!btn || !activeSegmentBankCard) return;
    const text = btn.getAttribute('data-segment-bank-add') || '';
    const optionsList = activeSegmentBankCard.querySelector('.segment-options-list');
    if (!optionsList) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = getSegmentOptionHtml();
    const row = wrap.firstElementChild;
    if (!row) return;
    const input = row.querySelector('.option-text');
    if (input) input.value = text;
    optionsList.appendChild(row);
    modal.classList.remove('active');
  });
}

window.openSegmentBankModal = function (triggerEl) {
  const segmentCard = triggerEl && triggerEl.closest ? triggerEl.closest('.segment-card') : null;
  if (segmentCard) activeSegmentBankCard = segmentCard;
  const modal = document.getElementById('segment-bank-modal');
  if (!modal) return;
  modal.classList.add('active');
};

function walkReachOutContactNames(node, outSet) {
  if (node == null) return;
  if (typeof node === 'string') {
    const t = node.trim();
    if (t) outSet.add(t);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((x) => walkReachOutContactNames(x, outSet));
    return;
  }
  if (typeof node === 'object') {
    Object.keys(node).forEach((k) => {
      if (k === '__version') return;
      walkReachOutContactNames(node[k], outSet);
    });
  }
}

function getCollabContactNameList() {
  const set = new Set();
  if (Array.isArray(networkData)) {
    networkData.forEach((p) => {
      const n = String(p?.name || '').trim();
      if (n) set.add(n);
    });
  }
  if (reachOutContactsData && typeof reachOutContactsData === 'object') {
    walkReachOutContactNames(reachOutContactsData, set);
  }
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

function filterCollabContactNames(query, limit = 20, excludeLower = new Set()) {
  const q = String(query || '').trim().toLowerCase();
  const all = getCollabContactNameList().filter((name) => !excludeLower.has(name.toLowerCase()));
  if (!q) return all.slice(0, limit);
  return all.filter((name) => name.toLowerCase().includes(q)).slice(0, limit);
}

function getCollabChipSelectedLowerSet(wrap) {
  const set = new Set();
  wrap.querySelectorAll('.field-collab-chip').forEach((el) => {
    const n = String(el.getAttribute('data-name') || '').trim().toLowerCase();
    if (n) set.add(n);
  });
  return set;
}

function formatCollabWithForDisplay(value) {
  if (Array.isArray(value)) {
    return value.map((x) => String(x).trim()).filter(Boolean).join(', ');
  }
  return String(value || '').trim();
}

function collabWithFieldAsSearchBlob(collabWith) {
  if (Array.isArray(collabWith)) return collabWith.map((x) => String(x).trim()).filter(Boolean).join(' ').toLowerCase();
  return String(collabWith || '').toLowerCase();
}

function readCollabChipsFromModal(modal) {
  if (!modal) return undefined;
  const chipNames = [...modal.querySelectorAll('.field-collab-chip')]
    .map((el) => String(el.getAttribute('data-name') || '').trim())
    .filter(Boolean);
  const seen = new Set();
  const uniq = [];
  chipNames.forEach((n) => {
    const k = n.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    uniq.push(n);
  });
  if (!uniq.length) return undefined;
  if (uniq.length === 1) return uniq[0];
  return uniq;
}

function getNewItemCollabWithFieldHtml() {
  return `
            <div class="form-group collab-with-wrap" style="margin-bottom: 16px; position: relative;">
                <label>Collab With (Network)</label>
                <div class="field-collab-chips" style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; margin-bottom: 6px; min-height: 0;"></div>
                <input type="text" class="form-input field-collab-search" autocomplete="off" placeholder="Search contacts, click a name to add…" style="width: 100%;">
                <div class="field-collab-suggestions" style="display: none; position: absolute; left: 0; right: 0; top: 100%; z-index: 60; margin-top: 4px; max-height: 240px; overflow-y: auto; background: rgba(18, 18, 22, 0.98); border: 1px solid var(--border-color); border-radius: var(--radius-sm); box-shadow: 0 10px 28px rgba(0,0,0,0.45);"></div>
            </div>`;
}

function setupCollabWithAutocomplete(modal) {
  const searchInput = modal?.querySelector('.field-collab-search');
  const wrap = searchInput?.closest('.collab-with-wrap');
  const chipsEl = wrap?.querySelector('.field-collab-chips');
  const listEl = wrap?.querySelector('.field-collab-suggestions');
  if (!searchInput || !listEl || !wrap || !chipsEl) return;

  if (wrap._collabDocAbort) {
    wrap._collabDocAbort.abort();
  }
  const ac = new AbortController();
  wrap._collabDocAbort = ac;
  const { signal } = ac;

  const hide = () => {
    listEl.style.display = 'none';
    listEl.innerHTML = '';
  };

  const show = (names) => {
    if (!names.length) {
      hide();
      return;
    }
    listEl.innerHTML = names
      .map(
        (name) =>
          `<button type="button" class="field-collab-suggestion-btn" data-name="${escAttr(name)}" style="display:block;width:100%;text-align:left;padding:8px 12px;border:none;background:transparent;color:var(--text-main);cursor:pointer;font:inherit;border-bottom:1px solid var(--border-color);">${escAttr(name)}</button>`
      )
      .join('');
    listEl.style.display = 'block';
  };

  const renderSuggestions = () => {
    const exclude = getCollabChipSelectedLowerSet(wrap);
    show(filterCollabContactNames(searchInput.value, 20, exclude));
  };

  const addChip = (rawName) => {
    const name = String(rawName || '').trim();
    if (!name) return;
    const exclude = getCollabChipSelectedLowerSet(wrap);
    if (exclude.has(name.toLowerCase())) return;
    const chip = document.createElement('span');
    chip.className = 'field-collab-chip';
    chip.setAttribute('data-name', name);
    chip.style.cssText =
      'display:inline-flex;align-items:center;gap:6px;padding:5px 10px 5px 12px;border-radius:999px;background:rgba(255,255,255,0.08);border:1px solid var(--border-color);font-size:0.88rem;line-height:1.2;';
    chip.appendChild(document.createTextNode(name));
    const rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'field-collab-chip-remove';
    rm.setAttribute('aria-label', 'Remove');
    rm.style.cssText =
      'background:none;border:none;color:var(--text-muted);cursor:pointer;padding:0 0 0 2px;line-height:1;font-size:1.05rem;display:flex;align-items:center;';
    rm.textContent = '×';
    chip.appendChild(rm);
    chipsEl.appendChild(chip);
  };

  chipsEl.addEventListener(
    'click',
    (e) => {
      const rm = e.target.closest('.field-collab-chip-remove');
      if (!rm) return;
      const chip = rm.closest('.field-collab-chip');
      if (chip) chip.remove();
      renderSuggestions();
    },
    { signal }
  );

  searchInput.addEventListener('input', renderSuggestions, { signal });
  searchInput.addEventListener('focus', renderSuggestions, { signal });
  searchInput.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape') hide();
      if (e.key === 'Backspace' && !searchInput.value) {
        const chips = chipsEl.querySelectorAll('.field-collab-chip');
        const last = chips[chips.length - 1];
        if (last) {
          e.preventDefault();
          last.remove();
          renderSuggestions();
        }
      }
    },
    { signal }
  );

  listEl.addEventListener(
    'mousedown',
    (e) => {
      e.preventDefault();
    },
    { signal }
  );

  listEl.addEventListener(
    'click',
    (e) => {
      const btn = e.target.closest('.field-collab-suggestion-btn[data-name]');
      if (!btn) return;
      const name = btn.getAttribute('data-name') || '';
      addChip(name);
      searchInput.value = '';
      hide();
      renderSuggestions();
      searchInput.focus();
    },
    { signal }
  );

  document.addEventListener(
    'click',
    (e) => {
      if (!wrap.contains(e.target)) hide();
    },
    { signal }
  );
}

function setupModal() {
  const modal = document.getElementById('new-item-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  const typeBtns = document.querySelectorAll('#modal-type-selector .type-btn');
  const dynamicContainer = document.getElementById('dynamic-fields-container');
  const renderTypeTemplate = (type) => {
    if (templates[type]) {
      dynamicContainer.innerHTML = templates[type];
      if (modal.querySelector('.collab-with-wrap')) setupCollabWithAutocomplete(modal);
    }
  };

  mainActionBtn.addEventListener('click', () => {
    const activeTab = document.querySelector('.nav-item.active')?.getAttribute('data-tab') || 'calendar';
    if (activeTab === 'goals' || activeTab === 'network') return;
    const activeTypeBtn = modal.querySelector('#modal-type-selector .type-btn.active');
    renderTypeTemplate(activeTypeBtn?.getAttribute('data-value') || 'Desktop');
    modal.classList.add('active');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  const templates = {
    'Desktop': `
            ${getNewItemCollabWithFieldHtml()}
            <div class="segments-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <label>Segments</label>
                    <button class="btn btn-outline btn-sm" type="button" onclick="addSegment()"><i class="fa-solid fa-plus"></i> Add Segment</button>
                </div>
                <div id="segments-list" style="display: flex; flex-direction: column; gap: 12px;">
                    ${getSegmentCardHtml(1)}
                </div>
            </div>
        `,
    'IRL': `
            ${getNewItemCollabWithFieldHtml()}
            <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                    <label>Assign Security</label>
                    <input type="text" class="form-input field-security" placeholder="e.g. Big Mike" style="width: 100%; margin-top: 8px;">
                </div>
                <div>
                    <label>Assign Driver</label>
                    <input type="text" class="form-input field-driver" placeholder="e.g. John" style="width: 100%; margin-top: 8px;">
                </div>
            </div>
            <div class="segments-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <label>Segments</label>
                    <button class="btn btn-outline btn-sm" type="button" onclick="addSegment()"><i class="fa-solid fa-plus"></i> Add Segment</button>
                </div>
                <div id="segments-list" style="display: flex; flex-direction: column; gap: 12px;">
                    ${getSegmentCardHtml(1)}
                </div>
            </div>
        `,
    'Collab': `
            ${getNewItemCollabWithFieldHtml()}
            <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                    <label>Assign Security</label>
                    <input type="text" class="form-input field-security" placeholder="e.g. Big Mike" style="width: 100%; margin-top: 8px;">
                </div>
                <div>
                    <label>Assign Driver</label>
                    <input type="text" class="form-input field-driver" placeholder="e.g. John" style="width: 100%; margin-top: 8px;">
                </div>
            </div>
            <div class="segments-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <label>Segments</label>
                    <button class="btn btn-outline btn-sm" type="button" onclick="addSegment()"><i class="fa-solid fa-plus"></i> Add Segment</button>
                </div>
                <div id="segments-list" style="display: flex; flex-direction: column; gap: 12px;">
                    ${getSegmentCardHtml(1)}
                </div>
            </div>
        `,
    'Arc': `
            <div class="form-group" style="margin-bottom: 16px;">
                <label>Budget</label>
                <input type="text" id="arc-budget" class="form-input" placeholder="e.g. $50,000 (Production)" style="width: 100%; margin-top: 8px;">
            </div>
            ${getNewItemCollabWithFieldHtml()}
            <div class="form-group" style="margin-bottom: 16px;">
                <label>Overall Narrative</label>
                <textarea id="arc-narrative" class="form-input" placeholder="Enter the grand vision for this arc..." style="width: 100%; margin-top: 8px; min-height: 60px; resize: vertical; font-family: inherit;"></textarea>
            </div>
            
            <div class="form-group" style="margin-bottom: 16px;">
                    <label>Goals</label>
                <textarea id="arc-goals" class="form-input" placeholder="One goal per line, e.g. Establish sports legitimacy" style="width: 100%; margin-top: 8px; min-height: 72px; resize: vertical; font-family: inherit;"></textarea>
            </div>

            <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                    <label>Clothing & Aesthetics</label>
                    <input type="text" id="arc-clothing" class="form-input" placeholder="Comma-separated, e.g. Full basketball kits, tunnel fits" style="width: 100%; margin-top: 8px;">
                </div>
                <div>
                    <label>Key Activities</label>
                    <input type="text" id="arc-activities" class="form-input" placeholder="Comma-separated, e.g. Arena food review, fan interviews" style="width: 100%; margin-top: 8px;">
                </div>
            </div>

            <div class="form-group" style="margin-bottom: 16px;">
                <label>Prompts & Bits</label>
                <input type="text" id="arc-prompts" class="form-input" placeholder="Comma-separated, e.g. Challenging pros, fan dares" style="width: 100%; margin-top: 8px;">
            </div>

            <div class="form-group" style="margin-bottom: 16px;">
                <label>Clipping Narrative</label>
                <textarea id="arc-clipping-narrative" class="form-input" placeholder="What should the clippers focus on?" style="width: 100%; margin-top: 8px; min-height: 60px; resize: vertical; font-family: inherit;"></textarea>
            </div>

            <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                    <label>Trailer Ideas</label>
                    <textarea id="arc-trailer-ideas" class="form-input" placeholder="Describe the trailer concept..." style="width: 100%; margin-top: 8px; min-height: 60px; resize: vertical; font-family: inherit;"></textarea>
                </div>
                <div>
                    <label>Poster Ideas</label>
                    <textarea id="arc-poster-ideas" class="form-input" placeholder="Describe the poster concept..." style="width: 100%; margin-top: 8px; min-height: 60px; resize: vertical; font-family: inherit;"></textarea>
                </div>
            </div>

            <div class="arc-streams-section" style="margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <label style="color: var(--primary); font-size: 1.1rem;"><i class="fa-solid fa-video"></i> Linked Streams</label>
                    <button class="btn btn-outline btn-sm" onclick="addArcStream()"><i class="fa-solid fa-plus"></i> Add Stream</button>
                </div>
                <div id="arc-streams-list" style="display: flex; flex-direction: column; gap: 12px;">
                    <!-- Dynamically added streams will go here -->
                </div>
            </div>
        `
  };

  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const type = btn.getAttribute('data-value');
      renderTypeTemplate(type);
    });
  });

  renderTypeTemplate('Desktop');

  const createBtn = document.getElementById('create-draft-btn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      handleCreateDraftSubmit(modal);
    });
  }
}

// Global function for adding segments
window.addSegment = function () {
  const list = document.getElementById('segments-list');
  if (!list) return;
  const segmentNumber = list.querySelectorAll('.segment-card').length + 1;
  const card = document.createElement('div');
  card.innerHTML = getSegmentCardHtml(segmentNumber);
  list.appendChild(card.firstElementChild);
};

window.addSegmentOption = function (btn) {
  const card = btn.closest('.segment-card');
  if (!card) return;
  const optionsList = card.querySelector('.segment-options-list');
  if (!optionsList) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = getSegmentOptionHtml();
  optionsList.appendChild(wrap.firstElementChild);
};

// Global function for adding streams to an arc
window.addArcStream = function () {
  const list = document.getElementById('arc-streams-list');
  if (!list) return;

  const card = document.createElement('div');
  card.className = 'segment-card';
  card.style.cssText = 'background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); padding: 16px; border-radius: var(--radius-sm); position: relative;';
  card.innerHTML = `
        <button onclick="this.parentElement.remove()" style="position: absolute; right: 8px; top: 8px; background: none; border: none; color: var(--text-muted); cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px; margin-bottom: 12px; width: calc(100% - 20px);">
            <input type="text" class="form-input arc-stream-title" placeholder="Stream Title (e.g. Scotiabank Arena)" style="width: 100%;">
            <select class="form-input arc-stream-type" style="width: 100%; appearance: auto; background: rgba(0,0,0,0.5);">
                <option>IRL</option>
                <option>Desktop</option>
                <option>Collab</option>
            </select>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <input type="datetime-local" class="form-input arc-stream-date" style="width: 100%; color-scheme: dark;">
            <input type="text" class="form-input arc-stream-location" placeholder="Location" style="width: 100%;">
        </div>
        <input type="text" class="form-input arc-stream-goals" placeholder="Main Stream Goals" style="width: 100%; margin-bottom: 12px;">
        <input type="text" class="form-input arc-stream-logistics" placeholder="Logistics (Security / Driver / Collabs)" style="width: 100%;">
    `;

  list.appendChild(card);
};
