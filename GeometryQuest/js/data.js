const TOUR_STEPS = [
  {
    icon: "🎮",
    title: "1. HUD TACTIQUE & BUFFS DE COMBAT PGM",
    targetId: "hud-header",
    text: "Surveillez vos constantes en haut du HUD : <b>XP</b>, <b>Rang Apex</b>, <b>Crypto-Geom ($)</b> et <b>STREAK MULTI</b>. Enchaînez les tirs critiques sans erreur pour débloquer le loot PGM !"
  },
  {
    icon: "🗺️",
    title: "2. TREE OF CHAMPIONS : 8 RANGS & 6 MONDES AAA",
    targetId: "sidebar",
    text: "Infiltrez 6 mondes tactiques : du <b>Radar Tactique</b> aux enclos d'<b>Isla Hitbox</b> (Jurassic World) et aux donjons de <b>Sanctuary Arcane</b> (Diablo IV). Franchissez les 8 Rangs PGM pour défier le Boss."
  },
  {
    icon: "🖥️",
    title: "3. MATRICE & CANVASES D'ENGAGEMENT",
    targetId: "canvas-container",
    text: "Zone d'engagement dynamique. Effectuez vos scans radars, calibrez vos miroirs lasers ou vectorisez vos déplacements en temps réel sur la matrice interactive."
  },
  {
    icon: "📐",
    title: "4. ARMURERIE & LOADOUT TACTIQUE",
    targetId: "hud-footer",
    text: "Déployez votre <b>Lame Secrète Graduée</b>, votre <b>Katana Monomoléculaire 90°</b> ou votre <b>Compteur Vice Sunset</b>. Aimantage automatique garanti sur les hitboxes ennemies !"
  },
  {
    icon: "⌨️",
    title: "5. VERROUILLAGE TARGET & KEYPAD HOLO",
    targetId: "input-overlay",
    text: "Sélectionnez la coordonnée cible via les <b>CHOIX TACTIQUES RAPIDES (QCM)</b> ou ouvrez le <b>Keypad Holo PGM</b>. Une fois la valeur verrouillée, pressez <b>FIRING / SHOOT / ENGAGE !</b>"
  },
  {
    icon: "📁",
    title: "6. TACTICAL DATABASE & DRONE DE RECON",
    targetId: "quest-demo-btn",
    text: "Bloqué sur le terrain ? Déployez la <b>TACTICAL DATABASE / Drone de Recon</b> pour analyser les données de vol, réviser la règle géométrique et exécuter le tir parfait."
  }
];

/* ==========================================================================
SHOP_SKINS ENRICHI : VISUELS AAA & RÉFÉRENCES POP-CULTURE
========================================================================== */
const SHOP_SKINS = [
  // --- STARTERS & GRATUITS ---
  { id: "avatar_gamer", type: "avatar", name: "Gamer Original", price: 0, gameRef: "Cyberpunk", desc: "Insigne néon cyan rétro-éclairé de recrue PGM.", badgeClass: "bg-gradient-to-br from-cyan-500 to-blue-700 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.6)]", iconName: "gamepad-2" },
  { id: "skin_crosshair_classic", type: "crosshair", name: "Standard Tactical", price: 0, gameRef: "CS:GO", desc: "Réticule vert émeraude d'alignement chirurgical.", color: "#00ff66", iconName: "crosshair", renderStyle: "classic" },
  { id: "skin_canvas_dark", type: "canvas", name: "Matrice Deep Space", price: 0, gameRef: "Base", desc: "Fond de canvas nébulosité sombre bleu nuit.", bg: "#080d19", grid: "rgba(30, 45, 74, 0.4)", iconName: "square" },
  
  // --- SKINS BARRE D'XP / THÈMES COLORIMÉTRIQUES ---
  { id: "xp_theme_cyber_cyan", type: "xp_theme", name: "Cyber Cyan & Émeraude", price: 0, gameRef: "Cyberpunk 2077", desc: "Dégradé néon cyan vers vert émeraude avec impulsion lumineuse.", cssClass: "xp-theme-cyber-cyan", iconName: "zap" },
  { id: "xp_theme_solar_gold", type: "xp_theme", name: "Flamme Solaire Gold", price: 200, gameRef: "Elden Ring", desc: "Énergie aurique incandescente ambre et or pur.", cssClass: "xp-theme-solar-gold", iconName: "flame" },
  { id: "xp_theme_synthwave_fuchsia", type: "xp_theme", name: "Néon Synthwave Fuchsia", price: 350, gameRef: "GTA Vice City", desc: "Dégradé fuchsia vibrant, violet et orange sunset 80s.", cssClass: "xp-theme-synthwave-fuchsia", iconName: "sun" },
  { id: "xp_theme_matrix_emerald", type: "xp_theme", name: "Matrix Emerald Code", price: 450, gameRef: "Matrix", desc: "Flux numérique émeraude avec balayage phosphorescent.", cssClass: "xp-theme-matrix-emerald", iconName: "binary" },
  { id: "xp_theme_plasma_red", type: "xp_theme", name: "Plasma Rouge Lilith", price: 500, gameRef: "Diablo IV", desc: "Rouge sang démoniaque et arcs de plasma rutilants.", cssClass: "xp-theme-plasma-red", iconName: "shield-alert" },
  
  // --- AVATARS POP-CULTURE ---
  { id: "avatar_steve_block", type: "avatar", name: "Voxel Master", price: 160, gameRef: "Minecraft", desc: "Cadre cubique pixelisé vert Herbe & Obsidienne.", badgeClass: "bg-gradient-to-br from-emerald-700 via-green-600 to-amber-800 text-green-200 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]", iconName: "box" },
  { id: "avatar_chief_helmet", type: "avatar", name: "SPARTAN-117", price: 250, gameRef: "Halo", desc: "Insigne vert olive militaire avec visière plasma dorée.", badgeClass: "bg-gradient-to-br from-lime-800 via-emerald-900 to-amber-600 text-amber-300 border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.5)]", iconName: "shield" },
  { id: "avatar_dead_slayer", type: "avatar", name: "Slayer Zombie Mask", price: 280, gameRef: "Dead Island 2", desc: "Masque de massacreur d'HELL-A aux yeux phosphorescents.", badgeClass: "bg-gradient-to-br from-red-900 via-zinc-900 to-rose-700 text-red-400 border-red-500 shadow-[0_0_15px_rgba(225,29,72,0.6)]", iconName: "skull" },
  { id: "avatar_cyber_v", type: "avatar", name: "Mercenaire Night City", price: 300, gameRef: "Cyberpunk 2077", desc: "Contour néon jaune haute tension et optiques HUD.", badgeClass: "bg-gradient-to-br from-yellow-400 via-amber-500 to-red-600 text-black border-yellow-300 font-black shadow-[0_0_15px_rgba(250,204,21,0.7)]", iconName: "zap" },
  { id: "avatar_motorfest_rider", type: "avatar", name: "Casque Apex Nitro", price: 320, gameRef: "Motorfest", desc: "Fibre de carbone mat avec reflet de visière irisé.", badgeClass: "bg-gradient-to-br from-slate-900 via-orange-600 to-red-600 text-orange-200 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]", iconName: "gauge" },
  { id: "avatar_apex_champion", type: "avatar", name: "Badge Apex Champion", price: 330, gameRef: "Apex Legends", desc: "Insigne holographique réservé à la légende de l'arène.", badgeClass: "bg-gradient-to-br from-red-600 via-amber-600 to-yellow-400 text-white border-amber-300 shadow-[0_0_15px_rgba(239,68,68,0.7)]", iconName: "award" },
  { id: "avatar_fut_champ", type: "avatar", name: "Carte EA FUT Champion", price: 350, gameRef: "EA FC", desc: "Carte Or étincelante +99 PACE avec aura de victoire.", badgeClass: "bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 text-amber-950 border-amber-200 font-extrabold shadow-[0_0_18px_rgba(251,191,36,0.8)]", iconName: "trophy" },
  { id: "avatar_spidey_venom", type: "avatar", name: "Masque Bio-Shock", price: 400, gameRef: "Spider-Man", desc: "Cadre rouge toile & arcs de bio-électricité jaune néon.", badgeClass: "bg-gradient-to-br from-red-600 via-rose-700 to-yellow-400 text-yellow-300 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.7)]", iconName: "activity" },
  { id: "avatar_raptor_tactical", type: "avatar", name: "InGen Raptor Recon", price: 400, gameRef: "Jurassic World", desc: "Insigne camouflage préhistorique et visière infrarouge.", badgeClass: "bg-gradient-to-br from-emerald-900 via-green-800 to-teal-500 text-emerald-200 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.6)]", iconName: "eye" },
  { id: "avatar_gta_vice", type: "avatar", name: "Vice Sunset Legend", price: 500, gameRef: "GTA VI", desc: "Insigne Synthwave dégradé fuchsia, violet et orange sunset.", badgeClass: "bg-gradient-to-br from-fuchsia-600 via-pink-500 to-orange-400 text-white border-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.8)]", iconName: "sun" },
  { id: "avatar_diablo_lilith", type: "avatar", name: "Cornes de Sanctuarium", price: 550, gameRef: "Diablo IV", desc: "Aura d'éther rouge sang et runes incandescentes.", badgeClass: "bg-gradient-to-br from-red-950 via-red-800 to-black text-red-400 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.9)]", iconName: "flame" },
  { id: "avatar_triforce_hero", type: "avatar", name: "Héros du Temps", price: 600, gameRef: "Zelda BotW", desc: "Emblème sacrée de la Triforce d'or étincelante.", badgeClass: "bg-gradient-to-br from-amber-200 via-yellow-400 to-emerald-600 text-amber-950 border-yellow-200 shadow-[0_0_22px_rgba(234,179,8,0.9)]", iconName: "triangle" },
  
  // --- VISEURS & SCOPES LASER ---
  { id: "skin_crosshair_red_dot", type: "crosshair", name: "Red Dot Scope", price: 120, gameRef: "Call of Duty", desc: "Viseur point rouge laser ultra-précis.", color: "#ff0000", iconName: "dot", renderStyle: "classic" },
  { id: "skin_crosshair_halo_plasma", type: "crosshair", name: "Réticule Plasma Covenant", price: 180, gameRef: "Halo", desc: "Viseur circulaire à pulsation plasma bleu aliénigène.", color: "#00d0ff", iconName: "circle-dot", renderStyle: "classic" },
  { id: "skin_crosshair_spider_sense", type: "crosshair", name: "Spider-Sense Reticle", price: 200, gameRef: "Spider-Man", desc: "Ondes d'avertissement radiales bio-électriques.", color: "#ff0055", iconName: "radio", renderStyle: "spider_sense" },
  { id: "skin_crosshair_matrix_code", type: "crosshair", name: "Réticule Matrix Code", price: 360, gameRef: "Matrix", desc: "Viseur digital affichant le flux de code binaire Matrix.", color: "#00ff41", iconName: "binary", renderStyle: "classic" },
  { id: "skin_crosshair_dino_tracker", type: "crosshair", name: "Optique Thermique InGen", price: 370, gameRef: "Jurassic World", desc: "Grille de détection infrarouge à balayage sonar.", color: "#00ff66", iconName: "scan", renderStyle: "dino_tracker" },
  { id: "skin_crosshair_diablo_hell", type: "crosshair", name: "Rune Arcane de Lilith", price: 450, gameRef: "Diablo IV", desc: "Pentagramme d'éther pulsant et cercles de ciblage démoniaque.", color: "#ff0033", iconName: "disc", renderStyle: "diablo_rune" },
  { id: "skin_crosshair_awp_dragon", type: "crosshair", name: "AWP Dragon Lore Scope", price: 500, gameRef: "CS:GO / CS2", desc: "Optique de sniper d'or aux finitions de gravures mythiques.", color: "#ffd700", iconName: "target", renderStyle: "dragon_lore" },
  { id: "skin_crosshair_god_eye", type: "crosshair", name: "Œil de la Grâce Céleste", price: 750, gameRef: "Elden Ring", desc: "Réticule en rune d'or rayonnante pour une précision absolue.", color: "#fbbf24", iconName: "eye", renderStyle: "dragon_lore" },
  
  // --- RÈGLES TACTIQUES ---
  { id: "skin_ruler_cyber", type: "ruler", name: "Règle Cyber Neon", price: 100, gameRef: "Cyberpunk", desc: "Règle graduée cyan à néon haute intensité.", color: "#00f0ff", bg: "rgba(0, 240, 255, 0.2)", iconName: "ruler", renderStyle: "assassin_blade" },
  { id: "skin_ruler_quantum_beam", type: "ruler", name: "Règle Faisceau Quantique", price: 200, gameRef: "Portal", desc: "Règle de précision avec flux d'énergie quantique bleue/orange.", color: "#ff9900", bg: "rgba(255, 153, 0, 0.2)", iconName: "zap", renderStyle: "dragstrip" },
  { id: "skin_ruler_motorfest_tach", type: "ruler", name: "Bande Dragstrip Nitro", price: 350, gameRef: "Motorfest", desc: "Règle façon ligne de départ avec compte-tours et damier.", color: "#ff9900", bg: "rgba(255, 153, 0, 0.2)", iconName: "flag", renderStyle: "dragstrip" },
  { id: "skin_ruler_assassin_hidden", type: "ruler", name: "Lame Secrète Graduée", price: 380, gameRef: "Assassin's Creed", desc: "Acier damassé gravé du symbole de la Confrérie et graduations laser.", color: "#00f0ff", bg: "rgba(0, 240, 255, 0.25)", iconName: "sword", renderStyle: "assassin_blade" },
  { id: "skin_ruler_hyperion_plasma", type: "ruler", name: "Règle Hyperion Railgun", price: 420, gameRef: "Borderlands", desc: "Règle hyper-technologique avec faisceau plasmique chaud.", color: "#ff5500", bg: "rgba(255, 85, 0, 0.25)", iconName: "cpu", renderStyle: "assassin_blade" },
  
  // --- ÉQUERRES LASER ---
  { id: "skin_square_basic_laser", type: "square", name: "Équerre Néon Cyan", price: 90, gameRef: "Tron", desc: "Équerre en fibre néon bleutée pour tracés d'angles droits.", color: "#00f0ff", bg: "rgba(0, 240, 255, 0.15)", iconName: "triangle", renderStyle: "cyber_katana" },
  { id: "skin_square_excalibur_laser", type: "square", name: "Équerre Excalibur Laser", price: 220, gameRef: "Zelda", desc: "Équerre luminescente d'or et d'émeraude sacrée.", color: "#ffe600", bg: "rgba(255, 230, 0, 0.2)", iconName: "sparkles", renderStyle: "cyber_katana" },
  { id: "skin_square_minecraft_redstone", type: "square", name: "Équerre Redstone Laser", price: 300, gameRef: "Minecraft", desc: "Structure en blocs de Redstone traversée par un flux d'énergie.", color: "#ff2200", bg: "rgba(255, 34, 0, 0.25)", iconName: "box", renderStyle: "redstone_block" },
  { id: "skin_square_cyber_katana", type: "square", name: "Katana Monomoléculaire 90°", price: 420, gameRef: "Cyberpunk 2077", desc: "Lame néon fuchsia formant un angle droit ultra-tranchant.", color: "#ff0055", bg: "rgba(255, 0, 85, 0.2)", iconName: "slash", renderStyle: "cyber_katana" },
  { id: "skin_square_void_arc", type: "square", name: "Équerre Void Arc", price: 450, gameRef: "Destiny 2", desc: "Équerre cosmique taillée dans l'énergie abyssale violette.", color: "#a855f7", bg: "rgba(168, 85, 247, 0.25)", iconName: "moon", renderStyle: "redstone_block" },
  
  // --- RAPPORTEURS HOLO ---
  { id: "skin_protractor_classic_neon", type: "protractor", name: "Rapporteur Amber Grid", price: 100, gameRef: "Retro Arcade", desc: "Rapporteur angulaire rétro-éclairé couleur ambre.", color: "#ffb700", bg: "rgba(255, 183, 0, 0.15)", iconName: "compass", renderStyle: "vice_speedo" },
  { id: "skin_protractor_chronos_time", type: "protractor", name: "Rapporteur Chronos Time", price: 250, gameRef: "Chrono Trigger", desc: "Rapporteur temporel doté d'engrenages néon dorés.", color: "#ffd700", bg: "rgba(255, 215, 0, 0.2)", iconName: "clock", renderStyle: "vice_speedo" },
  { id: "skin_protractor_nitro_dial", type: "protractor", name: "Manomètre Nitro Thruster", price: 300, gameRef: "Motorfest", desc: "Rapporteur 180° en forme de cadran de vitesse d'hypercar.", color: "#00f0ff", bg: "rgba(0, 240, 255, 0.2)", iconName: "gauge", renderStyle: "vice_speedo" },
  { id: "skin_protractor_dead_island", type: "protractor", name: "Cadran Sclérotique 180°", price: 330, gameRef: "Dead Island 2", desc: "Rapporteur mécanique style lame de scie circulaire graduée.", color: "#ff3300", bg: "rgba(255, 51, 0, 0.2)", iconName: "disc", renderStyle: "vice_speedo" },
  { id: "skin_protractor_gta_speedo", type: "protractor", name: "Compteur Vice Sunset", price: 390, gameRef: "GTA VI", desc: "Cadran 180° rétro d'hypercar sous le soleil couchant de Vice City.", color: "#ff007f", bg: "rgba(255, 0, 127, 0.25)", iconName: "gauge", renderStyle: "vice_speedo" },
  
  // --- FONDS CANVAS ---
  { id: "skin_canvas_grid_emerald", type: "canvas", name: "Grille Émeraude Cyber", price: 120, gameRef: "Matrix", desc: "Quadrillage phosphorescent vert émeraude rétro-éclairé.", bg: "#04140b", grid: "rgba(0, 255, 102, 0.3)", iconName: "grid" },
  { id: "skin_canvas_synthwave_80s", type: "canvas", name: "Grille Synthwave 80s", price: 240, gameRef: "Retro Wave", desc: "Dégradé violet/magenta avec grille géométrique style Outrun.", bg: "#1a0033", grid: "rgba(255, 0, 128, 0.4)", iconName: "sunset" },
  { id: "skin_canvas_cyberpunk_2077", type: "canvas", name: "Night City Neon Canvas", price: 400, gameRef: "Cyberpunk 2077", desc: "Canvas sombre illuminé de néons cyan et jaune haute tension.", bg: "#0d0e15", grid: "rgba(255, 238, 0, 0.35)", iconName: "layout" },
  { id: "skin_canvas_voxel_biome", type: "canvas", name: "Voxel Grid Matrix", price: 480, gameRef: "Minecraft", desc: "Grille 3D animée en blocs de verre et circuits lumineux.", bg: "#091409", grid: "rgba(85, 255, 85, 0.35)", iconName: "box" },
  { id: "skin_canvas_jurassic_paddock", type: "canvas", name: "Grille Thermique Paddock", price: 500, gameRef: "Jurassic World", desc: "Canvas vert sonar d'enclos avec balayage radar thermique.", bg: "#04140b", grid: "rgba(0, 255, 102, 0.35)", iconName: "activity" },
  { id: "skin_canvas_vice_sunset_v2", type: "canvas", name: "Vice City Neon Grid", price: 550, gameRef: "GTA VI", desc: "Dégradé fuchsia/orange rétro-futuriste avec silhouettes.", bg: "#1f0529", grid: "rgba(255, 0, 128, 0.45)", iconName: "sun" },
  { id: "skin_canvas_diablo_sanctuary", type: "canvas", name: "Dalle Cendrée de Sanctuarium", price: 600, gameRef: "Diablo IV", desc: "Sol de donjon en pierre sombre gravé de runes incandescentes.", bg: "#140303", grid: "rgba(255, 40, 0, 0.4)", iconName: "flame" },
  { id: "skin_canvas_deep_space_nebula", type: "canvas", name: "Deep Space Nebula 3D", price: 700, gameRef: "Starfield", desc: "Fond spatial profond aux poussières d'étoiles et nébuleuses violettes.", bg: "#05021a", grid: "rgba(147, 51, 234, 0.4)", iconName: "sparkles" }
];

/* ==========================================================================
SYSTEME DE HAUTS FAITS & GRILLE DE 12 BADGES PGM (ACHIEVEMENTS_LIST)
========================================================================== */
const ACHIEVEMENTS_LIST = [
  {
    id: "first_blood",
    title: "🌱 Géomètre en Herbe",
    condition: "first_mission",
    rewardCoins: 50,
    rewardXp: 100,
    quote: "Le premier pas d'un long voyage au cœur des 8 Rangs PGM."
  },
  {
    id: "sans_faute_w2",
    title: "📐 Sans Faute Monde 2",
    condition: "world_2_rank",
    rewardCoins: 120,
    rewardXp: 150,
    quote: "Réticule calibré ! Le Laser Scope et les figures planes n'ont aucun secret pour vous."
  },
  {
    id: "combo_master",
    title: "⚡ Combo Brûlant",
    condition: "streak_5",
    rewardCoins: 150,
    rewardXp: 200,
    quote: "Série de 5 tirs critiques consécutifs ! Multiplicateur PGM au maximum."
  },
  {
    id: "eclair_genie",
    title: "⏱️ Éclair de Génie",
    condition: "speed_3s",
    rewardCoins: 100,
    rewardXp: 150,
    quote: "Résolution éclair en moins de 3 secondes ! Télémétrie instantanée."
  },
  {
    id: "maitre_theoremes",
    title: "📜 Maître des Théorèmes",
    condition: "rank_7_or_8",
    rewardCoins: 250,
    rewardXp: 300,
    quote: "Pythagore, Thalès et la Trigonométrie maîtrisés avec une rigueur absolue."
  },
  {
    id: "cartographe_pgm",
    title: "🗺️ Cartographe PGM",
    condition: "all_6_worlds",
    rewardCoins: 200,
    rewardXp: 250,
    quote: "Infiltration réussie dans les 6 Mondes de la Matrice Géométrique."
  },
  {
    id: "expert_angles",
    title: "🎯 Visée Laser",
    condition: "angles_5",
    rewardCoins: 120,
    rewardXp: 180,
    quote: "5 classifications et mesures d'angles exécutées sans déviation."
  },
  {
    id: "tueur_de_boss",
    title: "👹 Tueur de Boss Apex",
    condition: "boss_win",
    rewardCoins: 400,
    rewardXp: 500,
    rewardSkin: "avatar_apex_champion",
    quote: "Boss Apex terrassé en speedrun ! Qualification Grandmaster validée."
  },
  {
    id: "perfectionniste",
    title: "💎 Perfectionniste",
    condition: "nodes_10",
    rewardCoins: 300,
    rewardXp: 350,
    quote: "10 Rangs validés à 100% de maîtrise. Une discipline exemplaire."
  },
  {
    id: "armurier_elite",
    title: "🛡️ Armurier d'Élite",
    condition: "skins_5",
    rewardCoins: 200,
    rewardXp: 200,
    quote: "Arsenal de 5 skins d'outils et avatars équipés dans votre loadout."
  },
  {
    id: "savant_tactique",
    title: "🎓 Savant Tactique",
    condition: "demo_5_times",
    rewardCoins: 100,
    rewardXp: 120,
    quote: "La théorie au service de la pratique : 5 DÉMOS tactiques analysées."
  },
  {
    id: "grandmaster_apex",
    title: "👑 Grandmaster Apex",
    desc: "Atteindre 2000 XP au total",
    condition: "xp_2000",
    rewardCoins: 500,
    rewardXp: 600,
    quote: "Sommet de la hiérarchie PGM atteint ! Vous incarnez la maîtrise géométrique."
  }
];