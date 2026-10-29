// ============================================================
// CITY VIBES - GTA SAN ANDREAS STYLE ISLAND MAP DATA
// Dense, cohesive island territory with water, bridges & districts
// ============================================================

window.WorldMapData = {
  islandBounds: { minX: -550, maxX: 550, minZ: -550, maxZ: 550 },
  oceanRadius: 600,

  // Iconic GTA-Style Island Districts
  districts: [
    {
      id: 'downtown',
      name: 'Downtown Metropolis',
      tagline: 'Financial Core & Citadel Skyscraper',
      color: 0x00f0ff,
      bounds: { minX: -120, maxX: 160, minZ: 40, maxZ: 320 },
      center: { x: 20, z: 180 }
    },
    {
      id: 'vice_beach',
      name: 'Vice Beach & Marina',
      tagline: 'Ocean Promenade & Luxury Villas',
      color: 0xf1c40f,
      bounds: { minX: 180, maxX: 500, minZ: 20, maxZ: 380 },
      center: { x: 340, z: 200 }
    },
    {
      id: 'industrial_port',
      name: 'Liberty Industrial Port',
      tagline: 'Cargo Docks, Cranes & Underground Customs',
      color: 0xe67e22,
      bounds: { minX: 120, maxX: 500, minZ: -480, maxZ: -60 },
      center: { x: 310, z: -270 }
    },
    {
      id: 'chinatown',
      name: 'Neo-Chinatown District',
      tagline: 'Pagoda Gates & Night Bazaar',
      color: 0xe74c3c,
      bounds: { minX: -340, maxX: -140, minZ: 20, maxZ: 280 },
      center: { x: -240, z: 150 }
    },
    {
      id: 'casino_strip',
      name: 'Las Palmas Casino Strip',
      tagline: 'Neon Strip, Pyramid & High-Roller Penthouses',
      color: 0x9b59b6,
      bounds: { minX: -460, maxX: -80, minZ: -480, maxZ: -60 },
      center: { x: -270, z: -270 }
    },
    {
      id: 'red_rock_hills',
      name: 'Red Rock Badlands & Hills',
      tagline: 'Mount Chiliad Trail & Route 66 Lookout',
      color: 0xd35400,
      bounds: { minX: -500, maxX: -160, minZ: 300, maxZ: 520 },
      center: { x: -330, z: 410 }
    }
  ],

  // Fixed GTA Landmarks & Interactive Locations
  locations: {
    // Downtown Core
    hospital: { x: -39, z: 120, name: 'St. Jude Hospital ER', action: 'ambulance_job', color: 0xe74c3c },
    pizzeria: { x: 80, z: 140, name: "Luigi's Pizzeria", action: 'delivery_job', color: 0xf39c12 },
    taxi_depot: { x: 30, z: 70, name: 'Metro Cab HQ', action: 'taxi_job', color: 0xf1c40f },
    bank: { x: 12, z: 195, name: 'First National Bank & Vault', action: 'open_bank', color: 0x0984e3 },
    bank_atm_downtown: { x: 18, z: 190, name: 'First National ATM Kiosk', action: 'open_bank_atm', color: 0x00f0ff },
    supermart_downtown: { x: -70, z: 200, name: '24/7 SuperMart Downtown', action: 'open_supermart', color: 0x2ecc71 },
    dealership: { x: 110, z: 240, name: 'Apex Exotic Motors', action: 'open_cardealer', color: 0x00f0ff },
    citadel_tower: { x: 0, z: 250, name: 'Citadel 138m Tower (Elevator)', action: 'teleport', color: 0x34495e },
    citadel_rooftop: { x: 0, y: 139, z: 250, name: 'Citadel Sniper Rooftop Deck' },
    citadel_safehouse: { x: 0, y: 72, z: 250, name: 'Citadel Luxury Penthouse', action: 'teleport_heal', color: 0xf1c40f },
    construction_co: { x: -100, z: 140, name: 'Apex Construction Co. (Renovations)', action: 'open_construction', color: 0x00cec9 },

    // Industrial Port & Docks
    mechanic_shop: { x: 260, z: -210, name: 'City Customs Mechanic & Tuning', action: 'open_mechanic', color: 0x9b59b6 },
    armory_shop: { x: 330, z: -240, name: 'Underground Armory & Weapons', action: 'open_armory', color: 0x2c3e50 },
    bank_atm_port: { x: 280, z: -200, name: 'Port Marine ATM Kiosk', action: 'open_bank_atm', color: 0x00f0ff },

    // Vice Beach
    clothes_boutique: { x: 320, z: 150, name: 'Urban Threads Beach Boutique', action: 'open_clothes', color: 0xe91e63 },
    supermart_beach: { x: 380, z: 210, name: '24/7 SuperMart Beachside', action: 'open_supermart', color: 0x2ecc71 },
    bank_atm_beach: { x: 340, z: 160, name: 'Beachfront Boardwalk ATM', action: 'open_bank_atm', color: 0x00f0ff },

    // Chinatown
    assassin_guild: { x: -240, z: 150, name: 'The Black Lotus Guild (Dark Web)', action: 'open_guild', color: 0xff0055 },

    // Casino Strip
    supermart_casino: { x: -220, z: -240, name: 'Casino Strip 24/7 Mart', action: 'open_supermart', color: 0x2ecc71 },
    bank_atm_casino: { x: -270, z: -220, name: 'Golden Pyramid ATM Kiosk', action: 'open_bank_atm', color: 0x00f0ff },

    // Real Estate Property Sites (Purchase Title Deeds On-Site)
    prop_motel: { x: 280, z: 260, id: 'motel_studio', name: 'Sunset Motel Studio #4 ($3,500)', price: 3500, action: 'buy_property_onsite' },
    prop_loft: { x: 60, z: 220, id: 'downtown_loft', name: 'Downtown Loft ($55,000)', price: 55000, action: 'buy_property_onsite' },
    prop_villa: { x: 420, z: 280, id: 'beachfront_villa', name: 'Vice Beachfront Villa ($320,000)', price: 320000, action: 'buy_property_onsite' },
    prop_penthouse: { x: -260, z: -290, id: 'casino_penthouse', name: 'Casino High-Roller Penthouse ($750,000)', price: 750000, action: 'buy_property_onsite' },
    prop_scrapyard: { x: -380, z: 420, id: 'desert_safehouse', name: 'Red Rock Badlands Compound ($28,000)', price: 28000, action: 'buy_property_onsite' },
    prop_dock_warehouse: { x: 390, z: -350, id: 'port_warehouse', name: 'Liberty Port Container Warehouse ($180,000)', price: 180000, action: 'buy_property_onsite' }
  },

  // Major Highway Loop & Arterial Roads
  highways: [
    // Grand Island Ring Road (Loop connecting all districts)
    { from: { x: 0, z: 360 }, to: { x: 380, z: 360 }, name: 'North Coast Expressway' },
    { from: { x: 380, z: 360 }, to: { x: 440, z: -400 }, name: 'Vice Beach & Port Highway' },
    { from: { x: 440, z: -400 }, to: { x: -380, z: -400 }, name: 'South Industrial & Casino Expressway' },
    { from: { x: -380, z: -400 }, to: { x: -380, z: 360 }, name: 'Badlands & West Coast Freeway' },
    { from: { x: -380, z: 360 }, to: { x: 0, z: 360 }, name: 'Mountain Overpass' },

    // Central Connecting Arteries & Bridges
    { from: { x: 0, z: 360 }, to: { x: 0, z: -400 }, name: 'Central Grand Boulevard (North-South)' },
    { from: { x: -380, z: 0 }, to: { x: 440, z: 0 }, name: 'Ocean Canal Bridge (East-West)' }
  ]
};
