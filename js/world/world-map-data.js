// ============================================================
// CITY VIBES - GTA SAN ANDREAS ISLAND MAP DATA
// Authentic 5-region state layout matching GTA San Andreas
// ============================================================

window.WorldMapData = {
  islandBounds: { minX: -550, maxX: 550, minZ: -550, maxZ: 550 },
  oceanRadius: 600,

  // Iconic GTA San Andreas Regions & Districts
  districts: [
    {
      id: 'los_santos',
      name: 'Los Santos (Downtown & Vinewood)',
      tagline: 'Citadel Tower, Grove Street, Vinewood Hills & LSX Airport',
      color: 0x00f0ff,
      bounds: { minX: -120, maxX: 260, minZ: 60, maxZ: 500 },
      center: { x: 60, z: 220 }
    },
    {
      id: 'santa_maria',
      name: 'Santa Maria Beach & Marina',
      tagline: 'Ocean Promenade, Palm Boardwalk & Luxury Villas',
      color: 0xf1c40f,
      bounds: { minX: 200, maxX: 520, minZ: 40, maxZ: 420 },
      center: { x: 340, z: 200 }
    },
    {
      id: 'san_fierro',
      name: 'San Fierro (Chinatown & Gant Bridge)',
      tagline: 'Hilly Streets, Pagoda Gate, Gant Red Suspension Bridge & Bay',
      color: 0xe74c3c,
      bounds: { minX: -520, maxX: -100, minZ: -500, maxZ: -60 },
      center: { x: -280, z: -220 }
    },
    {
      id: 'las_venturas',
      name: 'Las Venturas (Casino Strip & Pyramid)',
      tagline: 'The Strip, Golden Luxor Pyramid, High-Roller Penthouses & Julius Thruway',
      color: 0x9b59b6,
      bounds: { minX: 100, maxX: 520, minZ: -500, maxZ: -60 },
      center: { x: 300, z: -260 }
    },
    {
      id: 'mount_chiliad',
      name: 'Mount Chiliad & Flint County',
      tagline: 'Majestic 48m Summit Lookout, Pine Forest & Offroad Dirt Trails',
      color: 0x27ae60,
      bounds: { minX: -520, maxX: -120, minZ: 100, maxZ: 520 },
      center: { x: -340, z: 380 }
    },
    {
      id: 'bone_county',
      name: 'Bone County & Red Rock Desert',
      tagline: 'Sandstone Mesas, Cacti, Desert Runway & Canyon Pass',
      color: 0xd35400,
      bounds: { minX: -140, maxX: 140, minZ: -520, maxZ: -240 },
      center: { x: 0, z: -360 }
    }
  ],

  // Fixed GTA Landmarks & Interactive Locations
  locations: {
    // Los Santos Core (Downtown)
    hospital: { x: -39, z: 120, name: 'Los Santos All Saints Hospital ER', action: 'ambulance_job', color: 0xe74c3c },
    pizzeria: { x: 80, z: 140, name: "Well Stacked Pizzeria (Los Santos)", action: 'delivery_job', color: 0xf39c12 },
    taxi_depot: { x: 30, z: 70, name: 'Downtown Metro Cab Depot', action: 'taxi_job', color: 0xf1c40f },
    bank: { x: 12, z: 195, name: 'Maze Bank & Vault', action: 'open_bank', color: 0x0984e3 },
    bank_atm_downtown: { x: 18, z: 190, name: 'Maze Bank ATM Kiosk', action: 'open_bank_atm', color: 0x00f0ff },
    supermart_downtown: { x: -70, z: 200, name: '24/7 SuperMart Downtown', action: 'open_supermart', color: 0x2ecc71 },
    dealership: { x: 110, z: 240, name: 'Apex Exotic Motors Dealership', action: 'open_cardealer', color: 0x00f0ff },
    citadel_tower: { x: 0, z: 250, name: 'Maze/Citadel 138m Skyscraper (Elevator)', action: 'teleport', color: 0x34495e },
    citadel_rooftop: { x: 0, y: 139, z: 250, name: 'Citadel Sniper Rooftop Deck' },
    citadel_safehouse: { x: 0, y: 72, z: 250, name: 'Citadel Luxury Penthouse', action: 'teleport_heal', color: 0xf1c40f },
    construction_co: { x: -100, z: 140, name: 'Apex Construction Co. (Renovations)', action: 'open_construction', color: 0x00cec9 },
    grove_street: { x: 160, z: 330, name: "Grove Street Cul-de-Sac (CJ's House)", color: 0x2ecc71 },
    vinewood_sign: { x: 50, z: 460, name: 'Vinewood Giant Sign Summit', color: 0xffffff },
    airport_lsx: { x: 220, z: 450, name: 'Los Santos International Airport (LSX)', color: 0x95a5a6 },

    // Santa Maria Beach
    clothes_boutique: { x: 320, z: 150, name: 'Urban Threads Beach Boutique', action: 'open_clothes', color: 0xe91e63 },
    supermart_beach: { x: 380, z: 210, name: '24/7 SuperMart Beachside', action: 'open_supermart', color: 0x2ecc71 },
    bank_atm_beach: { x: 340, z: 160, name: 'Beachfront Boardwalk ATM', action: 'open_bank_atm', color: 0x00f0ff },

    // San Fierro (North-West)
    assassin_guild: { x: -240, z: -150, name: 'The Black Lotus Guild (San Fierro)', action: 'open_guild', color: 0xff0055 },
    mechanic_shop: { x: -200, z: -210, name: 'TransFender San Fierro Customs & Tuning', action: 'open_mechanic', color: 0x9b59b6 },
    bank_atm_port: { x: -240, z: -190, name: 'San Fierro Port ATM Kiosk', action: 'open_bank_atm', color: 0x00f0ff },
    gant_bridge: { x: -300, z: -380, name: 'Gant Red Suspension Bridge', color: 0xe74c3c },

    // Las Venturas (North-East)
    armory_shop: { x: 240, z: -200, name: 'Ammu-Nation Las Venturas Armory', action: 'open_armory', color: 0x2c3e50 },
    supermart_casino: { x: 260, z: -240, name: 'The Strip 24/7 Mart', action: 'open_supermart', color: 0x2ecc71 },
    bank_atm_casino: { x: 310, z: -250, name: 'Golden Pyramid ATM Kiosk', action: 'open_bank_atm', color: 0x00f0ff },
    las_venturas_pyramid: { x: 300, z: -260, name: "The Camel's Toe Golden Pyramid", color: 0xf1c40f },

    // Mount Chiliad (South-West)
    mount_chiliad_summit: { x: -360, z: 400, name: 'Mount Chiliad Summit Lookout Deck (Y=48m)', color: 0x27ae60 },

    // Real Estate Property Sites (Purchase Title Deeds On-Site)
    prop_motel: { x: 280, z: 260, id: 'motel_studio', name: 'Sunset Motel Studio #4 ($3,500)', price: 3500, action: 'buy_property_onsite' },
    prop_loft: { x: 60, z: 220, id: 'downtown_loft', name: 'Downtown Los Santos Loft ($55,000)', price: 55000, action: 'buy_property_onsite' },
    prop_villa: { x: 420, z: 280, id: 'beachfront_villa', name: 'Santa Maria Beachfront Villa ($320,000)', price: 320000, action: 'buy_property_onsite' },
    prop_penthouse: { x: 320, z: -320, id: 'casino_penthouse', name: 'Las Venturas High-Roller Penthouse ($750,000)', price: 750000, action: 'buy_property_onsite' },
    prop_scrapyard: { x: -380, z: 420, id: 'desert_safehouse', name: 'Mount Chiliad Country Compound ($28,000)', price: 28000, action: 'buy_property_onsite' },
    prop_dock_warehouse: { x: -360, z: -300, id: 'port_warehouse', name: 'San Fierro Port Container Warehouse ($180,000)', price: 180000, action: 'buy_property_onsite' }
  },

  // Major Highway Loops & Arterials
  highways: [
    // Julius Thruway & North Loop
    { from: { x: 100, z: -450 }, to: { x: 450, z: -450 }, name: 'Julius Thruway North (Las Venturas)' },
    { from: { x: 450, z: -450 }, to: { x: 450, z: -100 }, name: 'Julius Thruway East' },
    { from: { x: 450, z: -100 }, to: { x: 100, z: -100 }, name: 'Julius Thruway South' },

    // Gant Suspension Bridge & San Fierro Expressway
    { from: { x: -300, z: -450 }, to: { x: -300, z: -100 }, name: 'Gant Bridge & SF Freeway' },
    { from: { x: -450, z: -220 }, to: { x: -100, z: -220 }, name: 'San Fierro Boulevard' },

    // Los Santos Freeway & Beach Promenade
    { from: { x: 0, z: 80 }, to: { x: 0, z: 450 }, name: 'Los Santos Central Freeway' },
    { from: { x: 0, z: 220 }, to: { x: 450, z: 220 }, name: 'Santa Maria Coastal Highway' },
    { from: { x: 450, z: 80 }, to: { x: 450, z: 450 }, name: 'Ocean Promenade Drive' },

    // Mount Chiliad & Badlands Pass
    { from: { x: -100, z: 220 }, to: { x: -450, z: 220 }, name: 'Flint County Country Route' },
    { from: { x: -340, z: 220 }, to: { x: -340, z: 450 }, name: 'Mount Chiliad Mountain Pass' },

    // Grand Connecting Waterway Bridges
    { from: { x: 0, z: 80 }, to: { x: 0, z: -100 }, name: 'Central Grand State Bridge' },
    { from: { x: -300, z: -100 }, to: { x: -300, z: 80 }, name: 'San Fierro - Flint County Bridge' },
    { from: { x: 300, z: -100 }, to: { x: 300, z: 80 }, name: 'Las Venturas - Los Santos Bridge' }
  ]
};
