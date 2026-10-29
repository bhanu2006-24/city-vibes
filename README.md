# 🏙️ City Vibes 3D - Open World City & Empire

A complete 3D open-world city simulation game built with **Vanilla JavaScript, HTML5, CSS3, and Three.js (via CDN)**. No Node.js build step or bundler needed — runs instantly in any modern web browser!

---

## 🎮 Features Overview

### 1. 🚶‍♂️ Smooth Player Movement & Dynamic Camera
- **Slide-Collision Resolution**: Axis-separated collision detection ensures you never freeze or get stuck against walls, curbs, or buildings.
- **Controls**: Walk/run with `WASD` or Arrow keys, sprint with `Shift`, jump with `Space`, and look around by moving or dragging the mouse (or `Q` / `E` / Arrow keys).
- **Clickable Interaction Banner**: Click on the HUD prompt or press `E` / `F` to enter/exit vehicles and enter stores.

### 2. 👤 Character Studio & Customizer
- Customize your character in real-time through the **Urban Threads Store** or the **Creator App** on your smartphone:
  - **Skin Tones**: Fair, Tan, Caramel, Deep, Bronze.
  - **Hair Styles & Colors**: Crew Cut, Slick, Afro, Punk Mohican (Jet Black, Chestnut Brown, Golden Blonde, Silver, Neon Pink).
  - **Headwear**: Fedora, Baseball Cap, Beanie, or None.
  - **Eyewear**: Aviator Sunglasses, Cyberpunk Visor, or None.
  - **Outfits**: Casual Streetwear, Paramedic Scrubs, Delivery Boy Cap & Vest, Taxi Driver Uniform, Hitman Black Suit & Tie, Cyberpunk Neon, and Gold Boss Tuxedo.

### 3. 🔧 City Customs (Mechanic & Tuning Workshop)
- **Repair Service**: Restore vehicle condition to 100% ($200).
- **Engine Performance Tuning**:
  - Stock
  - Stage 1 Street Tune (+15% top speed & acceleration, $2,500)
  - Stage 2 Pro Racing (+30% top speed & acceleration, $6,500)
  - Twin-Turbocharged (+50% top speed & acceleration, $14,000)
- **Nitro Boost (NOS)**: Install a Nitro kit ($3,500). Hold `Shift` while driving for an intense acceleration burst with exhaust flame effects!
- **Custom Paint Workshop**: Apply custom gloss paint (Midnight Black, Cyber Cyan, Crimson Red, Taxi Yellow, Neon Purple, Pearl White, Emerald Green).

### 4. 🚑 City Careers & Jobs
- **Ambulance Paramedic**: 911 dispatch calls, race to pick up injured citizens, activate your flashing strobes and emergency siren (`J`), and deliver to St. Jude Hospital ER before time runs out.
- **Pizza Delivery Boy**: Pick up piping hot orders from Luigi's Express Pizzeria and deliver them across town before the freshness timer expires for big tips.
- **Metro Cab / Taxi Driver**: Pick up hailing pedestrians on city streets and drop them off at their desired destinations for metered fares.

### 5. 🕷️ The Black Lotus Assassin's Guild & Bounty Photography
- **Secret Syndicate Lair**: Located in the industrial harbor behind shipping containers, designated by a glowing crimson neon emblem.
- **Contract Board**: Accept high-value bounties on corrupt officials, rival hitmen, mob bankers, and smugglers.
- **Target Elimination & Photographic Proof**:
  - Hunt down the target using stealth weapons (Silenced 9mm or Marksman Sniper).
  - Eliminate the target, then pull out your **In-Game Smartphone Camera (`C` key)**.
  - Frame the fallen target in the camera viewfinder — the built-in AI recognition software verifies target status.
  - Snap the photo (`Click` / Shutter button) to transmit proof to the Guild Handler and collect your **bounty reward ($15,000 – $50,000)**!
  - Browse your captured contract photos in the smartphone's **Photo Gallery** app.

### 6. 🏢 Real Estate Empire & Passive Rental Yield
- **Buy Properties Across the City**:
  - Sunset Motel Studio ($3,500)
  - Maple Grove Suburb Bungalow ($24,000)
  - Neo-Tokyo Downtown Loft ($55,000)
  - Pier 9 Commercial Warehouse ($90,000)
  - The Citadel Skyline Penthouse ($150,000)
  - Harbor Crest Seaside Mansion ($280,000)
- **Lease Out for Passive Rent**: Switch properties between Private Safehouses and Leased Rentals.
- **Passive Rent Income**: Every 45 seconds, tenant rental income is automatically collected and deposited directly into your bank account!
- **Renovations & Upgrades**: Upgrade properties to Level 2+ to boost rental yields by 50%+.

### 7. 🏎️ Vehicles & Car Dealership (Apex Exotic Motors)
- Drive realistic procedural 3D vehicles with suspension, headlights, exhaust physics, and drifting:
  - **Rescue Ambulance** (Flashing red/blue emergency strobe lights + working siren `J`)
  - **Metro City Taxi** (Illuminated roof cab sign)
  - **Express Delivery Scooter** (Nimble moped with rear thermal carrier box)
  - **Urban Commuter Sedan**
  - **Viper 69 Muscle Car** (High acceleration & drifting)
  - **Lotus Armored Enforcer** (Heavy syndicate SUV)
  - **Apex GT Hypercar** (Ultra-fast wedge supercar)
- **Garage Valet Summoner**: Open your phone's Garage App to have any owned vehicle delivered right next to you!

### 8. 📻 Procedural Web Audio Synthesizer
- **100% Procedural Audio**: Engine acceleration / pitch modulation, siren sound, gunshot effects, camera shutter & flash, coin chimes, and 3 procedural synth radio stations (`R` key to switch):
  - *98.5 Neon Nights* (80s Synthwave)
  - *104.2 Lo-Fi Vibes* (Chill jazz chords)
  - *107.9 Cyber Pulse* (Driving techno)

---

## ⌨️ Controls & Keybindings

| Key | Action |
|---|---|
| **W, A, S, D** / Arrows | Walk / Run / Drive (Steer & Accelerate) |
| **Shift** | Sprint (on foot) / Trigger Nitro NOS (while driving) |
| **Space** | Jump (on foot) / Handbrake drift (driving) |
| **E** or **F** | Enter / Exit Vehicle OR Interact with Shops, Jobs, and Safehouses |
| **Q, E** / Mouse Drag | Rotate Camera / Aim |
| **Left Click** | Attack / Fire Weapon / Snap Smartphone Photo |
| **C** | Toggle Smartphone Camera (Bounty Proof Viewfinder) |
| **P** or 📱 button | Open / Close Smartphone ("VibePhone 16 Pro") |
| **1, 2, 3** | Switch Weapons (Fists / Silenced 9mm / Sniper) |
| **H** | Car Horn |
| **J** | Ambulance Siren Toggle |
| **R** | Switch Radio Station |
| **Esc** | Close Menus / Modals / Phone |

---

## 🚀 How to Run

1. Open [index.html](file:///Users/bhanupratapsaini/Coding/PROJECTS/JAVASCRIPT/GAMES/city-vibes/index.html) directly in any web browser.
2. Or run a local HTTP server:
   ```bash
   python3 -m http.server 8080
   ```
   and visit `http://localhost:8080`!
