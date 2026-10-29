# 🏙️ City Vibes 3D - Open World City & Empire

A complete 3D open-world city simulation game built with **Vanilla JavaScript, HTML5, CSS3, and Three.js (via CDN)**. No Node.js build step or bundler needed — runs instantly in any modern web browser!

---

## 🌐 Live Deployments & Repository
- **Cloudflare Pages Production**: [https://city-vibes.pages.dev/](https://city-vibes.pages.dev/)
- **GitHub Pages Website**: [https://bhanu2006-24.github.io/city-vibes/](https://bhanu2006-24.github.io/city-vibes/)
- **GitHub Source Repository**: [https://github.com/bhanu2006-24/city-vibes](https://github.com/bhanu2006-24/city-vibes)

---

## 🎮 New & Advanced Gameplay Features

### 1. 🗺️ Massive 30,000 x 30,000 Map & Dynamic City Streaming (Zero Lag)
- **Huge 30,000 x 30,000 Territory**: An open world spanning from -15,000m to +15,000m, linked by high-speed 4-lane expressways.
- **Dynamic City Streaming (`CityStreamer`)**: Only the active city (and nearby highway corridor within 2.2km) is rendered in WebGL and queried for collisions. Distant cities are unmounted/hidden, preventing lag and memory exhaustion on any device!
- **8 Major Cities & Provinces**:
  1. **Downtown Metropolis** (`0, 0`): Skyscraper core, 138-meter Citadel Tower with rooftop sniper deck, penthouse safehouse, hospital, pizzeria, cab depot, dealership, armory, 24/7 SuperMart, and bank.
  2. **Vice Beach & Marina** (`3400, 600`): Tropical sandy coast, ocean bay, luxury beachfront villas with swimming pools, palm boulevards, yacht marina, beach bar.
  3. **Liberty Industrial Port** (`-3200, -3200`): Stacks of freight containers, giant industrial cargo cranes, cargo ships, and warehouses.
  4. **Maple Valley Suburbs** (`3200, 3400`): Peaceful residential cul-de-sacs, homes with brick chimneys, green lawns, suburban grocery store.
  5. **Red Rock Badlands** (`-3600, 3600`): Towering sandstone canyon mesas, desert trails, outlaw scrapyards, and Route 66 diner.
  6. **Neo-Chinatown District** (`600, -3600`): Traditional pagoda gate archways, hanging red glowing paper lanterns, dim sum pavilions, night bazaar.
  7. **Las Palmas Casino Strip** (`-4200, 1000`): Golden casino pyramid & towers, neon marquees, illuminated fountain plaza, sports car boulevard.
  8. **Alpine Pines Peak** (`1200, 5000`): Snowy pine tree forest, wooden timber log ski chalets, and mountain fire-lookout tower.
- **Ocean / Sea Boundary**: Deep sea waters surround the entire map (`14,500m`). Approaching the boundary triggers Coast Guard warnings and safely keeps vehicles and players from plunging off into the void.

### 2. 🚗 Drive ANY Car & Hijack Ambient Traffic
- **Drive Any Car in the Game**: Walk up to ANY ambient traffic car driving down the street or parked by the sidewalk and press `[E]`.
- **Carjacking Mechanics**: The ambient driver is pulled out onto the pavement, screams, drops their wallet with **$150 - $400 cash**, and runs away!
- **Instant Full Driving Physics**: Commandeered traffic cars immediately inherit full steering, acceleration, drifting, nitro boost (`Shift`), horn (`H`), and radio stations (`R`). Alerts police with ⭐ 1-Star heat for Grand Theft Auto.

### 3. 🚨 Realistic Police Pursuits, Foot Chases & The BUSTED System
- **No Unfair Auto-Aim**: Police cruisers pursue and pull up alongside suspects. Armed police officers in uniform and peaked caps step out on foot to apprehend suspects.
- **Visible Bullet Tracers & Spread**: Officers fire sidearms with realistic human spread and dodgeable bullet tracers. Players can dive into alleyways or duck behind cars for cover!
- **Physical Melee Cornering & BUSTED Sequence**:
  - Police cannot magically bust players from inside cars across the street. Cops must pursue on foot and physically corner the player (`dist <= 2.5m`) when player HP drops to `<= 10%`.
  - Handcuffs latching audio plays (`*click-click*`), sirens blare, and the cinematic dark red **BUSTED** screen displays confiscated weapons, medical/bail fees (-$1,200), and clears police heat.
  - Player respawns outside Central Police Precinct / Hospital ER with 100% health restored and civilian cover intact!

### 4. 🛣️ Trans-Archipelago Expressways & Overhead Direction Gantries
- **Interconnected Road Network**: Flat, seamless 4-lane asphalt highways connecting Downtown Metropolis directly with Vice Beach, Liberty Port, Red Rock Badlands, Alpine Pines, etc.
- **Overhead Direction Signboards**: Highway gantries feature green reflective road signs with distance markers, arrows, and speed limits (`⬆ VICE BEACH 3.2 KM • MAX 150 MPH`).
- **Highway Shoulders & Guardrails**: Steel side barriers and double yellow lane dividers prevent vehicular drift into deep ditches.

### 5. 🏢 Physical Real Estate Purchases & Apex Construction Co.
- **No Online Instant Purchases**: Real estate cannot be bought directly over the phone. Players use the phone's GPS to navigate to physical properties across the cities and sign title deeds on-site at interactive beacons.
- **Apex Construction Co. Landmark**: Renovations cannot be done via smartphone. Visit the physical **Apex Construction Co.** headquarters (`-117, 39`) to contract structural upgrades that boost passive rental yields!

### 6. 🏦 First National Bank & Physical ATM Kiosks
- **Physical Currency Banking**: Smartphone banking only displays account statements; cash deposits and withdrawals must be made in person at **First National Bank** or local street ATM kiosks.
- **Full ATM Interface**: Quick buttons for $500, $2,000, $10,000, Deposit All Cash, and Withdraw All Bank funds.

### 7. 🧭 Dynamic Minimap & Off-Screen Waypoint Chevrons
- **Dynamic Scrolling Road Grid**: The minimap scrolls dynamically centered on player position, ensuring road networks are visible everywhere across the entire 30,000 × 30,000 world.
- **Off-Screen Navigation Chevrons**: When paramedic patients, cab passengers, delivery drop-offs, or GPS waypoints are beyond the radar edge, a pulsing chevron indicator on the minimap's perimeter points directly toward the objective with a real-time distance readout (e.g. `🚑 Patient 420m`).
- **Tactical Full Map (`M` Key)**: Click the minimap or press `[M]` to expand the radar into a 30,000 × 30,000 full-state map showing all 8 cities, expressways, and taxi dispatch pins.

### 4. 🛒 Enterable Building Interiors, Shopping & Store Robberies
- **24/7 SuperMart & Convenience Stores**:
  - Approach any 24/7 SuperMart and press `[E]` to step into the organised store.
  - Talk to the shop clerk and buy items:
    - 💊 **Military Field Medkit ($150)**: Restores +60 HP immediately.
    - 🛡️ **Kevlar Tactical Armor ($350)**: Equips +100 Armor shielding that absorbs damage before health is touched.
    - ⚡ **Hyper Nitro Energy Can ($40)**: Grants max sprint speed for 20 seconds.
    - 🔧 **Roadside Repair Kit ($250)**: Restores vehicle condition to 100%.
    - 🧨 **Tactical Smoke Canister ($500)**: Deploys a smoke screen that breaks police pursuit and clears -1 Wanted Star!
  - **Stick Up / Store Robbery (`[F]` key)**:
    - Draw a weapon or press `[F]` on the cash register to rob the store!
    - Store clerk panics and throws hands up; register pops open with **$800 - $2,500 cash**!
    - Alarms ring loudly and dispatch a **2-Star Police pursuit**!
- **First National Bank & Vault**:
  - Crack the bank vault for a high-stakes **$15,000 - $30,000 Heist payout**, immediately escalating into a **4-Star Police manhunt**!
- **Citadel Penthouse Safehouse**:
  - Rest in the master bed to fully heal 100% HP.
- **Citadel 138m Rooftop Helipad**:
  - Express elevator up to the 138-meter rooftop sniper deck for panoramic vantage views and stealth contracts.

### 5. 🎥 View Modes: TPS & FPS (`V` Key)
- **Third-Person Shooter (TPS)**: Smooth orbital follow camera, character animations, and peripheral vision.
- **First-Person Shooter (FPS)**: Eye-level camera with 3D first-person weapon viewmodel, authentic weapon bobbing, and precision crosshairs.

### 6. 🛡️ Weapon Concealment & Public Heat (`G` Key)
- **Civilian Cover**: While unarmed or holstered, civilians treat you normally and police will not chase you.
- **Brandishing in Public**: Drawing a weapon (`G` or `1-3`) causes civilians to scream, raise their hands, and sprint away in terror. Keeping it drawn triggers 911 calls and dispatches police!

### 7. 🎯 8x Mil-Dot Sniper Scope & Photographic Bounty Proof
- **Underground Armory**: Buy the **Silenced 9mm Hitman Special** ($3,500) and **Ghost Marksman Silenced Sniper** ($9,000).
- **8x Sniper Scope (Hold Right Click)**: Mil-dot reticle, windage tick marks, and integrated real-time laser rangefinder. Eliminate targets from distance without alerting police.
- **Smartphone Camera (`C` or `P`)**: Frame the fallen contract target in your smartphone viewfinder and snap the photo to claim your **$15,000 – $75,000 bounty**!

### 8. 📱 VibePhone 16 Pro Apps
- **CityMaps GPS**: Full-screen interactive GPS map of all 8 cities across the 30Kx30K world, distance meters, and **Fast-Travel Taxi ($200)** service!
- **Careers App**: Launch Ambulance, Pizza Delivery, and Taxi Driver shifts.
- **Properties App**: Buy 6 luxury properties across the state, lease them out for recurring passive rental income every 45 seconds, and renovate them to boost profits.
- **Dark Web Guild**: Browse assassination contracts across the 8 cities.
- **Character Creator**: Customize skin tones, hairstyles, headwear, glasses, and outfits in real time.
- **Garage Valet**: Summon any owned vehicle directly to your curb.
- **City Radio**: Switch between 3 procedural synthwave, lo-fi, and cyber radio stations.

---

## ⌨️ Controls & Keybindings

| Key | Action |
|---|---|
| **W, A, S, D** / Arrows | Walk / Run / Drive (Steer & Accelerate) |
| **Shift** | Sprint (on foot) / Trigger Nitro NOS (while driving) |
| **Space** | Jump (on foot) / Handbrake drift (driving) |
| **V** | Toggle View Mode (TPS Third-Person ↔ FPS First-Person) |
| **G** | Toggle Weapon Holster (Concealed Civilian Cover ↔ Drawn Weapon) |
| **Right Click (Hold)** | Aim Down Sights / 8x Mil-Dot Sniper Scope |
| **Left Click** | Attack / Fire Weapon / Snap Smartphone Photo |
| **E** | Enter / Exit Vehicle, Commandeer Traffic Cars, Elevators, Shops |
| **F** | Rob Cash Register / Bank Vault / Secondary Interaction |
| **M** or Click Radar | Toggle Maximized Full 30K × 30K World Map |
| **C** | Quick Toggle Smartphone Camera (Bounty Proof Viewfinder) |
| **P** or 📱 button | Open / Close Smartphone ("VibePhone 16 Pro") |
| **1, 2, 3** | Switch Weapons (1: Fists / 2: Silenced 9mm / 3: Silenced Sniper) |
| **H** | Car Horn |
| **J** | Ambulance / Police Siren Toggle |
| **R** | Switch Radio Station |
| **Esc** | Close Menus / Modals / Phone |

---

## 🚀 How to Run Locally

1. Open [index.html](file:///Users/bhanupratapsaini/Coding/PROJECTS/JAVASCRIPT/GAMES/city-vibes/index.html) directly in any web browser.
2. Or run a local HTTP server:
   ```bash
   python3 -m http.server 8080
   ```
   and navigate to `http://localhost:8080`.
