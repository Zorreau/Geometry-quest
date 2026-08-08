class GameEngine {
  constructor() {
    this.sound = new SoundEngine();
    this.profilesKey = "geom_quest_pgm_monolith_v10";
    this.activeProfileIdKey = "geom_quest_active_profile_id";
    this.profiles = {};
    this.activeProfileId = null;
    
    this.currentWorld = 1;
    this.currentRankIdx = 0;
    this.activeQuestRankIdx = 0;
    this.currentQuestInstance = null;
    
    this.isBossMode = false;
    this.bossHp = 100;
    this.bossTimer = 45; // Porté de 30s à 45s
    this.bossInterval = null;
    
    this.isTurboMode = false;
    this.turboTimer = 180; // 3 minutes
    this.turboInterval = null;
    this.turboConsecutiveErrors = 0;
    this.turboXpGained = 0;
    this.turboCoinsGained = 0;
    
    this.xp = 0;
    this.coins = 150;
    this.streak = 1;
    this.maxStreak = 1;
    this.totalAttempts = 0;
    this.successfulAttempts = 0;
    this.activeTool = "pointer";
    this.currentInputValue = "";
    this.previewTarget = null;
    
    this.completedNodes = new Set();
    this.nodeProgress = {}; 
    this.visitedWorlds = new Set();
    this.ownedSkins = new Set(["avatar_gamer", "xp_theme_cyber_cyan", "skin_crosshair_classic", "skin_canvas_dark"]);
    this.equippedSkins = {
      avatar: "avatar_gamer",
      xp_theme: "xp_theme_cyber_cyan",
      crosshair: "skin_crosshair_classic",
      canvas: "skin_canvas_dark",
      ruler: null,
      square: null,
      protractor: null
    };
    this.activeShopFilter = "all";
    
    this.toolPos = { x: 130, y: 180 };
    this.isDraggingTool = false;
    this.dragOffset = { x: 0, y: 0 };
    this.snapPoints = [];
    this.snappedPoint = null;
    
    this.particles = [];
    this.glitchAmount = 0;
    
    this.tourStep = 0;
    this.radarAngle = 0;
    this.isInterleavingRevision = false;
    this.isTourActive = false;
    this.hasNotifiedShop = false;
    
    this.selectedOnboardingAvatar = "avatar_gamer";
    this.selectedOnboardingSkin = "skin_ruler_cyber";
    
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    
    if (this.canvas) {
      this.init();
    }
  }
  
  init() {
    if (typeof this.setupKeypadDraggable === 'function') {
      this.setupKeypadDraggable();
    }
    if (typeof this.setupEventListeners === 'function') {
      this.setupEventListeners();
    }
    if (typeof this.setupDragAndDrop === 'function') {
      this.setupDragAndDrop();
    }
    
    this.loadProgress();
    
    if (typeof this.resizeCanvas === 'function') {
      this.resizeCanvas();
    }
    if (typeof this.startMainAnimationLoop === 'function') {
      this.startMainAnimationLoop();
    }
    if (typeof this.applyEquippedSkins === 'function') {
      this.applyEquippedSkins();
    }
    
    if (!this.activeProfileId || Object.keys(this.profiles).length === 0) {
      if (typeof this.openOnboardingModal === 'function') {
        this.openOnboardingModal();
      }
    }
  }
  
  validateProfileData(rawData) {
    if (!rawData || typeof rawData !== 'object') return null;
    
    const currentStreak = (typeof rawData.streak === 'number' && !isNaN(rawData.streak) && rawData.streak >= 1) ? rawData.streak : 1;
    const maxStrk = (typeof rawData.maxStreak === 'number' && !isNaN(rawData.maxStreak) && rawData.maxStreak >= currentStreak) ? rawData.maxStreak : currentStreak;
    
    return {
      name: (typeof rawData.name === 'string' && rawData.name.trim().length > 0) ? rawData.name.trim() : 'Gamer_PGM',
      avatar: typeof rawData.avatar === 'string' ? rawData.avatar : 'avatar_gamer',
      xp: (typeof rawData.xp === 'number' && !isNaN(rawData.xp) && rawData.xp >= 0) ? rawData.xp : 0,
      coins: (typeof rawData.coins === 'number' && !isNaN(rawData.coins) && rawData.coins >= 0) ? rawData.coins : 150,
      streak: currentStreak,
      maxStreak: maxStrk,
      totalAttempts: (typeof rawData.totalAttempts === 'number' && !isNaN(rawData.totalAttempts) && rawData.totalAttempts >= 0) ? rawData.totalAttempts : 0,
      successfulAttempts: (typeof rawData.successfulAttempts === 'number' && !isNaN(rawData.successfulAttempts) && rawData.successfulAttempts >= 0) ? rawData.successfulAttempts : 0,
      currentWorld: (typeof rawData.currentWorld === 'number' && rawData.currentWorld >= 1 && rawData.currentWorld <= 6) ? rawData.currentWorld : 1,
      currentRankIdx: (typeof rawData.currentRankIdx === 'number' && rawData.currentRankIdx >= 0 && rawData.currentRankIdx <= 7) ? rawData.currentRankIdx : 0,
      completedNodes: Array.isArray(rawData.completedNodes) ? rawData.completedNodes.filter(id => typeof id === 'string') : [],
      nodeProgress: (rawData.nodeProgress && typeof rawData.nodeProgress === 'object') ? rawData.nodeProgress : {},
      visitedWorlds: Array.isArray(rawData.visitedWorlds) ? rawData.visitedWorlds.filter(w => typeof w === 'number') : [],
      ownedSkins: Array.isArray(rawData.ownedSkins) ? rawData.ownedSkins.filter(s => typeof s === 'string') : ["avatar_gamer", "skin_crosshair_classic", "skin_canvas_dark"],
      equippedSkins: (rawData.equippedSkins && typeof rawData.equippedSkins === 'object') ? {
        avatar: rawData.equippedSkins.avatar || "avatar_gamer",
        xp_theme: rawData.equippedSkins.xp_theme || "xp_theme_cyber_cyan", // <-- LIGNE À AJOUTER
        crosshair: rawData.equippedSkins.crosshair || "skin_crosshair_classic",
        canvas: rawData.equippedSkins.canvas || "skin_canvas_dark",
        ruler: rawData.equippedSkins.ruler || null,
        square: rawData.equippedSkins.square || null,
        protractor: rawData.equippedSkins.protractor || null
      } : {
        avatar: "avatar_gamer",
        xp_theme: "xp_theme_cyber_cyan", // <-- ET ICI POUR LE PROFIL PAR DÉFAUT
        crosshair: "skin_crosshair_classic",
        canvas: "skin_canvas_dark",
        ruler: null,
        square: null,
        protractor: null
      },
      demoConsultCount: typeof rawData.demoConsultCount === 'number' ? rawData.demoConsultCount : 0,
      unlockedAchievements: Array.isArray(rawData.unlockedAchievements) ? rawData.unlockedAchievements.filter(a => typeof a === 'string') : []
    };
  }
  
  saveProfilesToStorage() {
    try {
      const serializedData = JSON.stringify(this.profiles);
      localStorage.setItem(this.profilesKey, serializedData);
      if (this.activeProfileId) {
        localStorage.setItem(this.activeProfileIdKey, this.activeProfileId);
      }
    } catch (error) {
      console.error("[Géométrie Quest] Échec d'écriture dans localStorage :", error);
    }
  }
  
  saveProgress() {
    if (!this.activeProfileId || !this.profiles[this.activeProfileId]) return;
    
    const profile = this.profiles[this.activeProfileId];
    profile.xp = this.xp;
    profile.coins = this.coins;
    profile.streak = this.streak;
    profile.maxStreak = this.maxStreak;
    profile.totalAttempts = this.totalAttempts;
    profile.successfulAttempts = this.successfulAttempts;
    profile.anglesSuccessCount = this.anglesSuccessCount || 0; // FIX : Persistance du badge angles
    profile.completedNodes = Array.from(this.completedNodes || []);
    profile.nodeProgress = this.nodeProgress || {};
    profile.visitedWorlds = Array.from(this.visitedWorlds || []);
    profile.ownedSkins = Array.from(this.ownedSkins || []);
    profile.equippedSkins = { ...this.equippedSkins };
    profile.unlockedAchievements = Array.from(this.unlockedAchievements || []);
    
    this.saveProfilesToStorage();
  }
  
  saveCurrentState() {
    this.saveProgress();
  }
  
  loadProgress() {
    try {
      const rawProfilesJson = localStorage.getItem(this.profilesKey);
      const storedActiveId = localStorage.getItem(this.activeProfileIdKey);
      
      this.profiles = {};
      
      if (rawProfilesJson) {
        const parsed = JSON.parse(rawProfilesJson);
        if (parsed && typeof parsed === 'object') {
          Object.keys(parsed).forEach(id => {
            const validated = this.validateProfileData(parsed[id]);
            if (validated) {
              this.profiles[id] = validated;
            }
          });
        }
      }
      
      let targetId = null;
      if (storedActiveId && this.profiles[storedActiveId]) {
        targetId = storedActiveId;
      } else {
        const availableIds = Object.keys(this.profiles);
        if (availableIds.length > 0) {
          targetId = availableIds[0];
        }
      }
      
      if (!targetId) {
        this.activeProfileId = null;
        return;
      }
      
      this.activeProfileId = targetId;
      const prof = this.profiles[targetId];
      
      this.xp = prof.xp || 0;
      this.coins = prof.coins || 150;
      this.streak = typeof prof.streak === 'number' ? prof.streak : 1;
      this.maxStreak = typeof prof.maxStreak === 'number' ? prof.maxStreak : this.streak;
      this.totalAttempts = typeof prof.totalAttempts === 'number' ? prof.totalAttempts : 0;
      this.successfulAttempts = typeof prof.successfulAttempts === 'number' ? prof.successfulAttempts : 0;
      this.completedNodes = new Set(prof.completedNodes);
      this.nodeProgress = { ...prof.nodeProgress };
      this.visitedWorlds = new Set(prof.visitedWorlds);
      this.ownedSkins = new Set(prof.ownedSkins);
      this.unlockedAchievements = new Set(prof.unlockedAchievements);
      this.equippedSkins = { ...prof.equippedSkins };
      this.demoConsultCount = prof.demoConsultCount;
      
      if (this.bossInterval) {
        clearInterval(this.bossInterval);
        this.bossInterval = null;
      }
      this.isBossMode = false;
      
      const bossOverlay = document.getElementById("boss-hud-overlay");
      if (bossOverlay) bossOverlay.classList.add("hidden");
      
      this.currentInputValue = "";
      this.previewTarget = null;
      if (typeof this.updateAnswerDisplay === 'function') {
        this.updateAnswerDisplay();
      }
      
      this.currentWorld = prof.currentWorld || 1;
      this.currentRankIdx = prof.currentRankIdx || 0;
      
      if (typeof this.updateHUD === 'function') {
        this.updateHUD();
      }
      if (typeof this.selectWorld === 'function') {
        this.selectWorld(this.currentWorld, true); // true = silent
      }
      if (typeof this.selectRankNode === 'function') {
        this.selectRankNode(this.currentRankIdx, false, false, true); // true = silent
      }
      
    } catch (error) {
      console.error("[Géométrie Quest] Données corrompues ou illisibles dans localStorage :", error);
      this.profiles = {};
      this.activeProfileId = null;
    }
  }
  
  loadProfilesFromStorage() {
    this.loadProgress();
  }
  
  resetGame() {
    if (this.bossInterval) {
      clearInterval(this.bossInterval);
      this.bossInterval = null;
    }
    this.isBossMode = false;
    this.isTourActive = false;
    
    try {
      localStorage.removeItem(this.profilesKey);
      localStorage.removeItem(this.activeProfileIdKey);
    } catch (e) {
      console.error("[Géométrie Quest] Échec de la purge du localStorage :", e);
    }
    
    this.profiles = {};
    this.activeProfileId = null;
    this.xp = 0;
    this.coins = 150;
    this.streak = 1;
    this.maxStreak = 1;
    this.totalAttempts = 0;
    this.successfulAttempts = 0;
    
    this.currentWorld = 1;
    this.currentRankIdx = 0;
    this.activeQuestRankIdx = 0;
    this.currentQuestInstance = null;
    
    this.completedNodes = new Set();
    this.nodeProgress = {};
    this.visitedWorlds = new Set();
    this.ownedSkins = new Set(["avatar_gamer", "xp_theme_cyber_cyan", "skin_crosshair_classic", "skin_canvas_dark"]);
    this.equippedSkins = {
      avatar: "avatar_gamer",
      xp_theme: "xp_theme_cyber_cyan",
      crosshair: "skin_crosshair_classic",
      canvas: "skin_canvas_dark",
      ruler: null,
      square: null,
      protractor: null
    };
    this.unlockedAchievements = new Set();
    this.demoConsultCount = 0;
    
    this.currentInputValue = "";
    this.previewTarget = null;
    this.activeTool = "pointer";
    this.toolPos = { x: 130, y: 180 };
    this.particles = [];
    this.glitchAmount = 0;
    
    const modals = [
      "boss-hud-overlay",
      "tour-modal",
      "quest-demo-modal",
      "guide-modal",
      "shop-modal",
      "profile-modal",
      "error-explanation-modal",
      "virtual-keypad"
    ];
    modals.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add("hidden");
    });
    
    if (typeof this.applyEquippedSkins === 'function') {
      this.applyEquippedSkins();
    }
    if (typeof this.updateHUD === 'function') {
      this.updateHUD();
    }
    if (typeof this.updateAnswerDisplay === 'function') {
      this.updateAnswerDisplay();
    }
    
    if (typeof this.triggerKillfeed === 'function') {
      this.triggerKillfeed("🔄 HARD RESET EFFECTUÉ", "Stockage nettoyé et instance réinitialisée !");
    }
    if (typeof this.openOnboardingModal === 'function') {
      this.openOnboardingModal();
    }
  }
  
  checkBossUnlockEligibility() {
    // Vérifie si le Rang 8 (Hacker PGM) d'au moins un monde est complété (_7)
    const hasHackerRank = Array.from(this.completedNodes).some(nodeId => String(nodeId).endsWith('_7'));
    // OU si le joueur a un Streak >= 10
    const hasRequiredStreak = this.streak >= 10;
    return hasHackerRank || hasRequiredStreak;
  }
  
  
  loadProfileState(profileId) {
    if (!this.profiles[profileId]) return;
    
    this.activeProfileId = profileId;
    const prof = this.profiles[profileId];
    
    const pName = document.getElementById("player-name");
    if (pName) pName.innerText = prof.name;
    
    this.xp = prof.xp || 0;
    this.coins = prof.coins || 150;
    this.demoConsultCount = prof.demoConsultCount || 0;
    
    // FIX : Importation des variables de statistiques et combos isolées du profil
    this.streak = typeof prof.streak === 'number' ? prof.streak : 1;
    this.maxStreak = typeof prof.maxStreak === 'number' ? prof.maxStreak : this.streak;
    this.totalAttempts = typeof prof.totalAttempts === 'number' ? prof.totalAttempts : 0;
    this.successfulAttempts = typeof prof.successfulAttempts === 'number' ? prof.successfulAttempts : 0;
    this.anglesSuccessCount = typeof prof.anglesSuccessCount === 'number' ? prof.anglesSuccessCount : 0;
    this.completedNodes = new Set(prof.completedNodes || []);
    this.nodeProgress = prof.nodeProgress || {};
    this.visitedWorlds = new Set(prof.visitedWorlds || []);
    this.ownedSkins = new Set(prof.ownedSkins || ["avatar_gamer", "skin_crosshair_classic", "skin_canvas_dark"]);
    this.unlockedAchievements = new Set(prof.unlockedAchievements || []);
    this.equippedSkins = prof.equippedSkins || {
      avatar: "avatar_gamer",
      crosshair: "skin_crosshair_classic",
      canvas: "skin_canvas_dark",
      ruler: null,
      square: null,
      protractor: null
    };
    
    this.applyEquippedSkins();
    this.updateHUD();
    this.selectWorld(1);
  }
  
  openOnboardingModal() {
    document.getElementById("onboarding-modal")?.classList.remove("hidden");
  }
  
  selectOnboardingAvatar(emoji, btnEl) {
    this.sound.playClick();
    this.selectedOnboardingAvatar = emoji;
    document.querySelectorAll(".ob-avatar-btn").forEach(b => {
      b.className = "ob-avatar-btn p-3 bg-slate-900 border-2 border-slate-800 rounded-xl text-2xl flex items-center justify-center touch-btn";
    });
    if (btnEl) btnEl.className = "ob-avatar-btn active p-3 bg-cyber-card border-2 border-cyber-accent rounded-xl text-2xl flex items-center justify-center touch-btn";
  }
  
  selectOnboardingSkin(skinId, btnEl) {
    this.sound.playClick();
    this.selectedOnboardingSkin = skinId;
    document.querySelectorAll(".ob-skin-btn").forEach(b => {
      b.className = "ob-skin-btn p-2.5 bg-slate-900 border-2 border-slate-800 rounded-xl text-xs font-bold flex flex-col items-center space-y-1 touch-btn text-slate-400";
    });
    if (btnEl) btnEl.className = "ob-skin-btn active p-2.5 bg-cyber-card border-2 border-cyber-accent rounded-xl text-xs font-bold flex flex-col items-center space-y-1 touch-btn text-cyber-accent";
  }
  
  confirmOnboardingCharacter() {
    const pseudoInput = document.getElementById("ob-pseudo-input");
    const name = pseudoInput ? pseudoInput.value.trim() : "Apex_Geom";
    const finalName = name || "Apex_Geom";
    
    if (this.selectedOnboardingAvatar && this.ownedSkins) {
      this.ownedSkins.add(this.selectedOnboardingAvatar);
      this.equippedSkins.avatar = this.selectedOnboardingAvatar;
    }
    
    if (this.selectedOnboardingSkin && this.ownedSkins) {
      this.ownedSkins.add(this.selectedOnboardingSkin);
      const starterSkinObj = SHOP_SKINS.find(s => s.id === this.selectedOnboardingSkin);
      if (starterSkinObj) {
        this.equippedSkins[starterSkinObj.type] = this.selectedOnboardingSkin;
      }
    }
    
    const newId = `prof_${Date.now()}`;
    this.profiles[newId] = {
      name: finalName,
      avatar: this.selectedOnboardingAvatar || "avatar_gamer",
      xp: 0,
      coins: 150,
      completedNodes: [],
      visitedWorlds: [],
      ownedSkins: Array.from(this.ownedSkins || []),
      equippedSkins: this.equippedSkins
    };
    
    this.activeProfileId = newId;
    this.sound.playSuccess();
    this.saveProfilesToStorage();
    
    this.isTourActive = true;
    this.loadProfileState(newId);
    
    const obModal = document.getElementById("onboarding-modal");
    if (obModal) obModal.classList.add("hidden");
    
    this.triggerKillfeed(`${this.getEquippedAvatarSymbol()} PERSONNAGE CRÉÉ !`, `Bienvenue ${finalName} !`);
    this.startGuidedTour();
  }
  
  setupEventListeners() {
    window.addEventListener("keydown", (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
      
      const openModals = document.querySelectorAll(
        "#guide-modal:not(.hidden), #shop-modal:not(.hidden), #profile-modal:not(.hidden), " +
        "#onboarding-modal:not(.hidden), #quest-demo-modal:not(.hidden), #error-explanation-modal:not(.hidden), " +
        "#tour-modal:not(.hidden)"
      );
      
      if (e.key === "Escape") {
        e.preventDefault();
        if (openModals.length > 0) {
          this.closeGuideModal();
          this.closeShop();
          this.closeProfileModal();
          this.closeQuestDemo();
          this.closeErrorExplanationModal();
          return;
        }
        this.currentInputValue = "";
        this.selectedQcmIndex = -1;
        this.updateAnswerDisplay();
        return;
      }
      
      if (openModals.length > 0) return;
      
      const options = this.currentQuestInstance?.options || [];
      const hasQcm = options.length > 0;
      const isInputEmpty = this.currentInputValue.length === 0;
      
      if (hasQcm && isInputEmpty && ["1", "2", "3", "4"].includes(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        if (index < options.length) {
          e.preventDefault();
          this.selectedQcmIndex = index;
          this.currentInputValue = options[index].toString();
          this.updateAnswerDisplay();
          this.highlightSelectedQcmButton(index);
          this.sound.playClick();
          return;
        }
      }
      
      if (e.key === "Enter" || e.key === "NumpadEnter") {
        e.preventDefault();
        this.submitAnswer();
        return;
      }
      
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        this.keypadBackspace();
        return;
      }
      
      if (/^[0-9a-zA-Z,\.\-\/°\[\] ]$/.test(e.key)) {
        this.keypadInput(e.key.toUpperCase());
      }
    });
    
    const canvasContainer = document.getElementById("canvas-container");
    if (canvasContainer) {
      canvasContainer.setAttribute("tabindex", "-1");
      canvasContainer.addEventListener("click", () => this.restoreFocus());
    }
  }
  
  restoreFocus() {
    const mainContainer = document.getElementById("canvas-container") || document.body;
    if (mainContainer && typeof mainContainer.focus === "function") {
      mainContainer.focus({ preventScroll: true });
    }
  }
  
  // --- JS/MAIN.JS : RÉÉCRITURE DE setupDragAndDrop ---
  
  setupDragAndDrop() {
    let isTouchInteracting = false; // Flag anti-ghost click
    
    const getCanvasCoords = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? (e.touches[0] ? e.touches[0].clientX : e.changedTouches[0].clientX) : e.clientX;
      const clientY = e.touches ? (e.touches[0] ? e.touches[0].clientY : e.changedTouches[0].clientY) : e.clientY;
      return {
        x: (clientX - rect.left) * (this.canvas.width / rect.width),
        y: (clientY - rect.top) * (this.canvas.height / rect.height)
      };
    };
    
    const isInsideTool = (pos) => {
      if (this.activeTool === "pointer") return false;
      const dx = pos.x - this.toolPos.x;
      const dy = pos.y - this.toolPos.y;
      if (this.activeTool === "ruler") return dx >= -10 && dx <= 270 && dy >= -10 && dy <= 60;
      if (this.activeTool === "square") return dx >= -10 && dx <= 190 && dy >= -160 && dy <= 10;
      if (this.activeTool === "protractor") return Math.sqrt(dx * dx + dy * dy) <= 125;
      return false;
    };
    
    const checkSnapping = () => {
      this.snappedPoint = null;
      let minDistance = 15;
      
      this.snapPoints.forEach(pt => {
        const dist = Math.hypot(this.toolPos.x - pt.x, this.toolPos.y - pt.y);
        if (dist < minDistance) {
          minDistance = dist;
          this.snappedPoint = pt;
        }
      });
      
      if (this.snappedPoint) {
        this.toolPos.x = this.snappedPoint.x;
        this.toolPos.y = this.snappedPoint.y;
      }
    };
    
    const onStart = (e) => {
      // 1. Filtrage anti-ghost click (évite le mousedown simulé par le mobile après un touchstart)
      if (e.type === "touchstart") {
        isTouchInteracting = true;
      } else if (e.type === "mousedown" && isTouchInteracting) {
        return;
      }
      
      // 2. Maintien du focus clavier lors d'un clic ou touch sur le canvas
      this.restoreFocus();
      
      const pos = getCanvasCoords(e);
      if (this.activeTool !== "pointer" && isInsideTool(pos)) {
        this.isDraggingTool = true;
        this.dragOffset = { x: pos.x - this.toolPos.x, y: pos.y - this.toolPos.y };
        this.sound.playClick();
        if (e.cancelable) e.preventDefault();
      } else {
        this.sound.playClick();
      }
    };
    
    const onMove = (e) => {
      if (!this.isDraggingTool) return;
      const pos = getCanvasCoords(e);
      this.toolPos.x = pos.x - this.dragOffset.x;
      this.toolPos.y = pos.y - this.dragOffset.y;
      checkSnapping();
      this.renderCanvas();
      if (e.cancelable) e.preventDefault();
    };
    
    const onEnd = (e) => {
      if (this.isDraggingTool) {
        this.isDraggingTool = false;
      }
      if (e && e.type === "touchend") {
        setTimeout(() => { isTouchInteracting = false; }, 350);
      }
    };
    
    this.canvas.addEventListener("mousedown", onStart);
    this.canvas.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    
    this.canvas.addEventListener("touchstart", onStart, { passive: false });
    this.canvas.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  }
  
  setupKeypadDraggable() {
    const keypad = document.getElementById("virtual-keypad");
    const header = document.getElementById("keypad-header");
    if (!keypad || !header) return;
    
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    
    const getPointerPos = (e) => {
      const touch = e.touches ? (e.touches[0] || e.changedTouches[0]) : e;
      return { x: touch.clientX, y: touch.clientY };
    };
    
    const onStart = (e) => {
      if (e.target.closest("button")) return;
      
      isDragging = true;
      this.hasUserDraggedKeypad = true;
      
      const pos = getPointerPos(e);
      const keypadRect = keypad.getBoundingClientRect();
      
      dragOffsetX = pos.x - keypadRect.left;
      dragOffsetY = pos.y - keypadRect.top;
      
      keypad.style.transform = "none";
      keypad.style.left = `${keypadRect.left}px`;
      keypad.style.top = `${keypadRect.top}px`;
      keypad.style.bottom = "auto";
      
      header.style.cursor = "grabbing";
      if (e.cancelable) e.preventDefault();
    };
    
    const onMove = (e) => {
      if (!isDragging) return;
      const pos = getPointerPos(e);
      
      let newLeft = pos.x - dragOffsetX;
      let newTop = pos.y - dragOffsetY;
      
      const maxLeft = Math.max(0, window.innerWidth - keypad.offsetWidth);
      const maxTop = Math.max(0, window.innerHeight - keypad.offsetHeight);
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));
      
      keypad.style.left = `${newLeft}px`;
      keypad.style.top = `${newTop}px`;
      
      if (e.cancelable) e.preventDefault();
    };
    
    const onEnd = () => {
      isDragging = false;
      if (header) header.style.cursor = "grab";
    };
    
    header.addEventListener("mousedown", onStart);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    
    header.addEventListener("touchstart", onStart, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  }
  
  toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (!sidebar || !backdrop) return;
    const isHidden = sidebar.classList.contains("-translate-x-full");
    
    if (isHidden) {
      sidebar.classList.remove("-translate-x-full");
      backdrop.classList.remove("hidden");
    } else {
      sidebar.classList.add("-translate-x-full");
      backdrop.classList.add("hidden");
    }
  }
  
  toggleVirtualKeypad() {
    this.sound.playClick();
    const keypad = document.getElementById("virtual-keypad");
    const quickChoices = document.getElementById("quick-choices-panel");
    if (!keypad) return;
    
    const isHidden = keypad.classList.contains("hidden");
    if (isHidden) {
      keypad.classList.remove("hidden");
      if (window.innerHeight < 720 && quickChoices) {
        quickChoices.classList.add("collapsed");
        const toggleLabel = document.getElementById("toggle-qcm-label");
        if (toggleLabel) toggleLabel.innerText = "▲ AFFICHER";
      }
      this.adjustMobileKeypadPosition();
    } else {
      keypad.classList.add("hidden");
    }
    this.restoreFocus();
  }
  
  adjustMobileKeypadPosition() {
    const keypad = document.getElementById("virtual-keypad");
    if (!keypad || keypad.classList.contains("hidden")) return;
    
    const isSmallScreen = window.innerHeight < 720 || window.innerWidth < 640;
    if (isSmallScreen) {
      keypad.style.top = "auto";
      keypad.style.bottom = "70px";
      keypad.style.left = "50%";
      keypad.style.transform = "translateX(-50%) scale(0.85)";
      keypad.style.maxHeight = "50vh";
      keypad.style.overflowY = "auto";
    } else if (!this.hasUserDraggedKeypad) {
      keypad.style.transform = "none";
      keypad.style.maxHeight = "none";
    }
  }
  
  activateNativeKeyboard() {
    this.sound.playClick();
    const nativeInput = document.getElementById("native-keyboard-trigger");
    if (nativeInput) {
      nativeInput.value = this.currentInputValue;
      nativeInput.classList.remove("sr-only", "opacity-0", "pointer-events-none");
      nativeInput.classList.add("fixed", "bottom-16", "left-1/2", "-translate-x-1/2", "z-50", "bg-slate-900", "border-2", "border-cyber-accent", "text-cyber-accent", "font-mono", "p-3", "rounded-xl", "w-72", "text-center");
      nativeInput.focus();
      
      const handleNativeInput = () => {
        this.currentInputValue = nativeInput.value.toUpperCase();
        this.updateAnswerDisplay();
      };
      const handleNativeBlur = () => {
        nativeInput.classList.add("sr-only", "opacity-0", "pointer-events-none");
        nativeInput.classList.remove("fixed", "bottom-16", "left-1/2", "-translate-x-1/2", "z-50", "bg-slate-900", "border-2", "border-cyber-accent", "text-cyber-accent", "font-mono", "p-3", "rounded-xl", "w-72", "text-center");
        nativeInput.removeEventListener("input", handleNativeInput);
        nativeInput.removeEventListener("blur", handleNativeBlur);
      };
      
      nativeInput.addEventListener("input", handleNativeInput);
      nativeInput.addEventListener("blur", handleNativeBlur);
    }
  }
  
  highlightSelectedQcmButton(index) {
    const container = document.getElementById("quick-choices-items");
    if (!container) return;
    const buttons = container.querySelectorAll("button");
    buttons.forEach((btn, i) => {
      if (i === index) {
        btn.classList.add("ring-2", "ring-cyber-accent", "bg-cyber-accent/40", "scale-105");
      } else {
        btn.classList.remove("ring-2", "ring-cyber-accent", "bg-cyber-accent/40", "scale-105");
      }
    });
  }
  
  keypadInput(val) {
    this.sound.playClick();
    if (val === 'CLEAR') {
      this.currentInputValue = "";
    } else if (val === 'BACKSPACE') {
      this.currentInputValue = this.currentInputValue.slice(0, -1);
    } else {
      if (this.currentInputValue.length < 15) {
        this.currentInputValue += val;
      }
    }
    this.updateAnswerDisplay();
  }
  
  keypadBackspace() {
    this.keypadInput('BACKSPACE');
  }
  
  updateAnswerDisplay() {
    const textEl = document.getElementById("answer-text");
    if (textEl) {
      if (this.currentInputValue) {
        textEl.innerText = this.currentInputValue;
        textEl.classList.remove("placeholder-slate-600");
        textEl.classList.add("text-cyber-accent");
      } else {
        textEl.innerText = "APPUYER...";
        textEl.classList.add("placeholder-slate-600");
        textEl.classList.remove("text-cyber-accent");
      }
    }
    
    this.updatePreviewTarget();
    this.renderCanvas();
  }
  
  updatePreviewTarget() {
    if (!this.currentInputValue) {
      this.previewTarget = null;
      return;
    }
    
    const raw = this.currentInputValue.trim().toUpperCase().replace(/[()]/g, '');
    const gridMatch = raw.match(/^([A-H])\s*,\s*([0-8])$/) || raw.match(/^([A-H])([0-8])$/);
    const cartesianMatch = raw.match(/^(-?\d+)\s*,\s*(-?\d+)$/);
    
    if (gridMatch) {
      this.previewTarget = {
        type: 'GRID',
        col: gridMatch[1],
        row: parseInt(gridMatch[2], 10),
        raw: raw
      };
    } else if (cartesianMatch) {
      this.previewTarget = {
        type: 'CARTESIAN',
        x: parseInt(cartesianMatch[1], 10),
        y: parseInt(cartesianMatch[2], 10),
        raw: raw
      };
    } else {
      this.previewTarget = null;
    }
  }
  
  updateKeypadGrid() {
    const keypadGrid = document.getElementById("keypad-grid");
    if (!keypadGrid) return;
    
    keypadGrid.className = "grid grid-cols-6 gap-1 border-t border-slate-800 pt-1.5";
    keypadGrid.innerHTML = `
      <button onclick="game.keypadInput('1')" class="p-1.5 bg-slate-900 border border-slate-800 text-white font-mono font-black text-xs rounded-lg touch-btn">1</button>
      <button onclick="game.keypadInput('2')" class="p-1.5 bg-slate-900 border border-slate-800 text-white font-mono font-black text-xs rounded-lg touch-btn">2</button>
      <button onclick="game.keypadInput('3')" class="p-1.5 bg-slate-900 border border-slate-800 text-white font-mono font-black text-xs rounded-lg touch-btn">3</button>
      <button onclick="game.keypadInput('A')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">A</button>
      <button onclick="game.keypadInput('B')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">B</button>
      <button onclick="game.keypadInput('C')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">C</button>
    
      <button onclick="game.keypadInput('4')" class="p-1.5 bg-slate-900 border border-slate-800 text-white font-mono font-black text-xs rounded-lg touch-btn">4</button>
      <button onclick="game.keypadInput('5')" class="p-1.5 bg-slate-900 border border-slate-800 text-white font-mono font-black text-xs rounded-lg touch-btn">5</button>
      <button onclick="game.keypadInput('6')" class="p-1.5 bg-slate-900 border border-slate-800 text-white font-mono font-black text-xs rounded-lg touch-btn">6</button>
      <button onclick="game.keypadInput('D')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">D</button>
      <button onclick="game.keypadInput('E')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">E</button>
      <button onclick="game.keypadInput('F')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">F</button>
    
      <button onclick="game.keypadInput('7')" class="p-1.5 bg-slate-900 border border-slate-800 text-white font-mono font-black text-xs rounded-lg touch-btn">7</button>
      <button onclick="game.keypadInput('8')" class="p-1.5 bg-slate-900 border border-slate-800 text-white font-mono font-black text-xs rounded-lg touch-btn">8</button>
      <button onclick="game.keypadInput('9')" class="p-1.5 bg-slate-900 border border-slate-800 text-white font-mono font-black text-xs rounded-lg touch-btn">9</button>
      <button onclick="game.keypadInput('G')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">G</button>
      <button onclick="game.keypadInput('H')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">H</button>
      <button onclick="game.keypadInput('I')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">I</button>
    
      <button onclick="game.keypadInput('0')" class="p-1.5 bg-slate-900 border border-slate-800 text-white font-mono font-black text-xs rounded-lg touch-btn">0</button>
      <button onclick="game.keypadInput(',')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">,</button>
      <button onclick="game.keypadInput('.')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">.</button>
      <button onclick="game.keypadInput('J')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">J</button>
      <button onclick="game.keypadInput('K')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">K</button>
      <button onclick="game.keypadInput('L')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">L</button>
    
      <button onclick="game.keypadInput('M')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">M</button>
      <button onclick="game.keypadInput('N')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">N</button>
      <button onclick="game.keypadInput('O')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">O</button>
      <button onclick="game.keypadInput('P')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">P</button>
      <button onclick="game.keypadInput('Q')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">Q</button>
      <button onclick="game.keypadInput('R')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">R</button>
    
      <button onclick="game.keypadInput('S')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">S</button>
      <button onclick="game.keypadInput('T')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">T</button>
      <button onclick="game.keypadInput('U')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">U</button>
      <button onclick="game.keypadInput('V')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">V</button>
      <button onclick="game.keypadInput('W')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">W</button>
      <button onclick="game.keypadInput('X')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">X</button>
    
      <button onclick="game.keypadInput('Y')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">Y</button>
      <button onclick="game.keypadInput('Z')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">Z</button>
      <button onclick="game.keypadInput('[')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">[</button>
      <button onclick="game.keypadInput(']')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">]</button>
      <button onclick="game.keypadInput('°')" class="p-1.5 bg-cyber-card border border-cyber-accent/40 text-cyber-accent font-mono font-bold text-xs rounded-lg touch-btn">°</button>
      <button onclick="game.keypadInput('-')" class="p-1.5 bg-slate-900 border border-slate-800 text-white font-mono font-black text-xs rounded-lg touch-btn">-</button>
    
      <button onclick="game.keypadInput(' ')" class="col-span-2 p-1.5 bg-slate-800 border border-slate-700 text-slate-200 font-mono font-bold text-xs rounded-lg touch-btn">ESPACE</button>
      <button onclick="game.keypadBackspace()" class="col-span-4 p-1.5 bg-red-950/80 border border-red-700 text-red-200 font-bold text-xs rounded-lg touch-btn flex items-center justify-center gap-1">
        <i data-lucide="delete" class="w-4 h-4"></i> EFFACER / DEL
      </button>
    `;
    if (window.lucide) lucide.createIcons();
  }
  
  resizeCanvas() {
    const container = document.getElementById("canvas-container");
    if (!container || !this.canvas) return;
    
    // Garantit des dimensions minimales pour éviter le repli à 0px
    const w = Math.max(container.clientWidth - 16, 320);
    const h = Math.max(container.clientHeight - 16, 300);
    
    this.canvas.width = Math.min(w, 800);
    this.canvas.height = Math.min(h, 500);
    this.renderCanvas();
  }
  
  startMainAnimationLoop() {
    setInterval(() => {
      this.radarAngle = (this.radarAngle + 0.04) % (Math.PI * 2);
      this.updateParticles();
      if (this.glitchAmount > 0) this.glitchAmount--;
      this.renderCanvas();
    }, 35);
  }
  
  triggerVictoryParticles() {
    if (!this.canvas) return;
    const colors = ["#00f0ff", "#00ff66", "#ffd700", "#ff0055", "#b026ff"];
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 0.02 + Math.random() * 0.02,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2
      });
    }
  }
  
  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.rotation += p.vRot;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  triggerFailureGlitch() {
    this.glitchAmount = 12;
  }
  
  drawCompass(ctx, w) {
    ctx.save();
    const cx = w - 40;
    const cy = 40;
    const r = 22;
    
    ctx.fillStyle = "rgba(4, 15, 28, 0.85)";
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = "#ff0055";
    ctx.beginPath();
    ctx.moveTo(cx, cy - r + 5);
    ctx.lineTo(cx - 5, cy);
    ctx.lineTo(cx + 5, cy);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(cx, cy + r - 5);
    ctx.lineTo(cx - 5, cy);
    ctx.lineTo(cx + 5, cy);
    ctx.closePath();
    ctx.fill();
    
    ctx.font = "bold 10px 'Fira Code', monospace";
    ctx.fillStyle = "#00f0ff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N", cx, cy - r - 8);
    
    ctx.restore();
  }
  
  startGuidedTour() {
    this.sound.playSuccess();
    this.isTourActive = true;
    this.tourStep = 0;
    this.renderTourStep();
    const tourModal = document.getElementById("tour-modal");
    if (tourModal) tourModal.classList.remove("hidden");
  }

  renderTourStep() {
    // 1. Nettoyage complet des anciennes surbrillances et élévations
    document.querySelectorAll(".tut-highlight").forEach(el => el.classList.remove("tut-highlight"));
    document.querySelectorAll(".tut-parent-elevate").forEach(el => el.classList.remove("tut-parent-elevate"));
    
    // 2. Gestion des états repliés/dépliés
    const footerEl = document.getElementById("hud-footer");
    if (footerEl && this.tourStep !== 3) {
      footerEl.classList.add("collapsed");
    }

    const step = TOUR_STEPS[this.tourStep];
    if (!step) return;

    let targetId = step.targetId;
    if (step.targetId === "input-overlay") {
      targetId = "game-controls-container";
    }

    // Gestion de la Sidebar
    if (targetId === "sidebar") {
      const sidebar = document.getElementById("sidebar");
      const backdrop = document.getElementById("sidebar-backdrop");
      if (sidebar && sidebar.classList.contains("-translate-x-full")) {
        sidebar.classList.remove("-translate-x-full");
        if (backdrop) backdrop.classList.remove("hidden");
      }
    } else {
      if (window.innerWidth < 1024) {
        const sidebar = document.getElementById("sidebar");
        const backdrop = document.getElementById("sidebar-backdrop");
        if (sidebar) sidebar.classList.add("-translate-x-full");
        if (backdrop) backdrop.classList.add("hidden");
      }
    }

    // Gestion du Footer
    if (targetId === "hud-footer" && footerEl) {
      footerEl.classList.remove("collapsed");
    }

    // 3. Application de la surbrillance + élévation parentale
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.classList.add("tut-highlight");
      
      let parent = targetEl.parentElement;
      while (parent && parent !== document.body) {
        parent.classList.add("tut-parent-elevate");
        parent = parent.parentElement;
      }
    }

    // 4. Contenu textuel
    const iconEl = document.getElementById("tour-step-icon");
    const titleEl = document.getElementById("tour-step-title");
    const badgeEl = document.getElementById("tour-step-badge");
    const contentEl = document.getElementById("tour-step-content");

    if (iconEl) iconEl.innerText = step.icon;
    if (titleEl) titleEl.innerText = step.title;
    if (badgeEl) badgeEl.innerText = `Étape ${this.tourStep + 1} / ${TOUR_STEPS.length}`;
    if (contentEl) contentEl.innerHTML = `<p class="leading-relaxed text-slate-200">${step.text}</p>`;

    // 5. Positionnement garanti au premier plan
    const tourCard = document.getElementById("tour-modal-card");
    if (tourCard) {
      tourCard.style.top = "auto";
      tourCard.style.bottom = "auto";
      tourCard.style.left = "auto";
      tourCard.style.right = "auto";
      tourCard.style.transform = "none";

      if (targetId === "hud-header") {
        tourCard.style.top = "80px";
        tourCard.style.left = "50%";
        tourCard.style.transform = "translateX(-50%)";
      } 
      else if (targetId === "sidebar") {
        if (window.innerWidth >= 1024) {
          tourCard.style.top = "100px";
          tourCard.style.left = "340px";
          tourCard.style.transform = "none";
        } else {
          tourCard.style.top = "100px";
          tourCard.style.left = "50%";
          tourCard.style.transform = "translateX(-50%)";
        }
      } 
      else if (targetId === "canvas-container") {
        tourCard.style.top = "75px";
        tourCard.style.left = "50%";
        tourCard.style.transform = "translateX(-50%)";
      } 
      else if (targetId === "hud-footer") {
        tourCard.style.bottom = "80px";
        tourCard.style.left = "50%";
        tourCard.style.transform = "translateX(-50%)";
      } 
      else if (targetId === "game-controls-container") {
        tourCard.style.top = "80px";
        tourCard.style.left = "50%";
        tourCard.style.transform = "translateX(-50%)";
      } 
      else if (targetId === "quest-demo-btn") {
        tourCard.style.top = "130px";
        tourCard.style.left = "50%";
        tourCard.style.transform = "translateX(-50%)";
      }
      else {
        tourCard.style.top = "50%";
        tourCard.style.left = "50%";
        tourCard.style.transform = "translate(-50%, -50%)";
      }
    }

    const prevBtn = document.getElementById("tour-prev-btn");
    if (prevBtn) prevBtn.style.visibility = this.tourStep === 0 ? "hidden" : "visible";

    const nextBtn = document.getElementById("tour-next-btn");
    if (nextBtn) {
      if (this.tourStep === TOUR_STEPS.length - 1) {
        nextBtn.innerHTML = `<span>TERMINER</span> <i data-lucide="check" class="w-3.5 h-3.5"></i>`;
      } else {
        nextBtn.innerHTML = `<span>SUIVANT</span> <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>`;
      }
    }
    if (window.lucide) lucide.createIcons();
  }

  nextTourStep() {
    this.sound.playClick();
    if (typeof TOUR_STEPS !== "undefined" && this.tourStep < TOUR_STEPS.length - 1) {
      this.tourStep++;
      this.renderTourStep();
    } else {
      this.closeGuidedTour();
    }
  }

  prevTourStep() {
    this.sound.playClick();
    if (this.tourStep > 0) {
      this.tourStep--;
      this.renderTourStep();
    }
  }

  closeGuidedTour() {
    this.sound.playClick();
    this.isTourActive = false;
    document.querySelectorAll(".tut-highlight").forEach(el => el.classList.remove("tut-highlight"));
    document.querySelectorAll(".tut-parent-elevate").forEach(el => el.classList.remove("tut-parent-elevate"));
    const tourModal = document.getElementById("tour-modal");
    if (tourModal) tourModal.classList.add("hidden");
    this.triggerKillfeed(`${this.getEquippedAvatarSymbol()} TUTO PAS-À-PAS TERMINÉ`, "À toi de jouer PGM ! Franchis les 8 Rangs !");
  }
  
  startQuestDemo() {
    this.sound.playClick();
    if (!this.currentQuestInstance) return;
    const quest = this.currentQuestInstance;
    const demo = quest.demo;
    
    this.demoConsultCount = (this.demoConsultCount || 0) + 1;
    this.checkAchievements();
    
    const nodeKey = `${this.currentWorld}_${this.currentRankIdx}`;
    if (!this.completedNodes.has(nodeKey)) {
      this.nodeProgress[nodeKey] = 0;
      this.triggerKillfeed(
        "⚠️ DÉMO CONSULTÉE", 
        "Le compteur de série du niveau est réinitialisé !", 
        true
      );
    }
    
    const demoTitle = document.getElementById("quest-demo-title");
    const demoContent = document.getElementById("quest-demo-content");
    const demoModal = document.getElementById("quest-demo-modal");
    
    if (demoTitle) demoTitle.innerText = `DÉMO TACTIQUE : ${quest.title}`;
    
    if (demoContent) {
      demoContent.innerHTML = `
            <div class="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
              <span class="text-xs text-cyber-accent font-bold uppercase block mb-1">🎯 Mission du Niveau :</span>
              <p class="text-slate-200">${quest.desc}</p>
            </div>
            <div class="bg-slate-900/90 p-3.5 rounded-xl border border-amber-500/40">
              <span class="text-xs text-amber-400 font-bold uppercase block mb-1">💡 Règle du Cours & Méthode :</span>
              <p class="mb-2 text-slate-300">${quest.hint}</p>
              <span class="text-[11px] text-slate-300 font-mono block"><b>Exemple Modèle :</b> ${demo ? demo.exampleQuestion : 'Suis le repère visualisé'}</span>
            </div>
            <div class="bg-cyber-card/80 p-3.5 rounded-xl border border-cyber-green text-cyber-green font-mono font-bold">
              <span class="text-xs uppercase block text-slate-300">✅ Réponse Modèle Résolue :</span>
              <span class="text-base text-cyber-green">${demo ? demo.exampleAnswer : quest.answer}</span>
            </div>
          `;
    }
    
    if (demoModal) demoModal.classList.remove("hidden");
  }
  
  closeQuestDemo() {
    this.sound.playClick();
    const demoModal = document.getElementById("quest-demo-modal");
    if (demoModal) demoModal.classList.add("hidden");
  }
  
  selectWorld(worldId, silent = false) {
    if (this.currentInputValue && this.currentInputValue.length > 0 && !this.isBossMode && !this.isTurboMode) {
      this.streak = 1;
      this.triggerKillfeed("⚠️ MANŒUVRE INTERROMPUE", "Changement de secteur : Streak réinitialisé à x1 !", true);
    }
    
    if (this.bossInterval) {
      clearInterval(this.bossInterval);
      this.bossInterval = null;
      this.isBossMode = false;
      const bossOverlay = document.getElementById("boss-hud-overlay");
      if (bossOverlay) bossOverlay.classList.add("hidden");
    }
    if (this.turboInterval) {
      clearInterval(this.turboInterval);
      this.turboInterval = null;
      this.isTurboMode = false;
    }
    
    // N'émets le son que s'il s'agit d'une action du joueur
    if (!silent) this.sound.playClick();
    this.currentWorld = worldId;
    
    document.querySelectorAll(".wtab").forEach((tab, idx) => {
      if (idx + 1 === worldId) {
        tab.className = "wtab active p-2.5 rounded-xl bg-cyber-card border border-cyber-accent text-cyber-accent font-bold text-xs flex items-center space-x-2 touch-btn";
      } else {
        tab.className = "wtab p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs flex items-center space-x-2 touch-btn";
      }
    });
    
    let firstUnlocked = 0;
    for (let r = 0; r < 8; r++) {
      if (r === 0 || this.completedNodes.has(`${worldId}_${r - 1}`)) {
        firstUnlocked = r;
      }
    }
    this.selectRankNode(firstUnlocked, false, false, silent);
    
    if (!this.visitedWorlds) this.visitedWorlds = new Set();
    if (!this.visitedWorlds.has(worldId)) {
      this.visitedWorlds.add(worldId);
      this.saveCurrentState();
      if (!this.isTourActive && !silent) {
        this.startQuestDemo();
      }
    }
  }
  
  selectRankNode(rankIdx, keepBoss = false, forceRegenerate = false, silent = false) {
    this.selectedQcmIndex = -1;
    
    if (!keepBoss && this.isBossMode) {
      if (this.bossInterval) {
        clearInterval(this.bossInterval);
        this.bossInterval = null;
      }
      this.isBossMode = false;
      const bossOverlay = document.getElementById("boss-hud-overlay");
      if (bossOverlay) bossOverlay.classList.add("hidden");
    }
    
    if (rankIdx > 0 && !this.completedNodes.has(`${this.currentWorld}_${rankIdx - 1}`)) {
      if (!silent) this.sound.playError();
      this.triggerKillfeed("ACCÈS VERROUILLÉ 🔒", "Réussis la mission précédente pour débloquer !", true);
      return;
    }
    
    const isSameRank = (rankIdx === this.currentRankIdx);
    if (isSameRank && this.currentQuestInstance && !forceRegenerate && !this.isBossMode) {
      this.updateAnswerDisplay();
      this.renderSkillNodesList();
      this.renderCanvas();
      this.restoreFocus();
      return;
    }
    
    if (!silent) this.sound.playClick();
    this.currentRankIdx = rankIdx;
    this.isInterleavingRevision = false;
    
    const currentWorldDef = GAME_WORLDS[this.currentWorld];
    let rankDef = currentWorldDef.ranks[rankIdx];
    let revisionRankIdx = rankIdx;
    
    if (rankIdx > 0 && Math.random() < 0.25) {
      const validatedLowerRanks = [];
      for (let r = 0; r < rankIdx; r++) {
        if (this.completedNodes.has(`${this.currentWorld}_${r}`)) {
          validatedLowerRanks.push(r);
        }
      }
      if (validatedLowerRanks.length > 0) {
        revisionRankIdx = validatedLowerRanks[Math.floor(Math.random() * validatedLowerRanks.length)];
        rankDef = currentWorldDef.ranks[revisionRankIdx];
        this.isInterleavingRevision = true;
      }
    }
    
    this.activeQuestRankIdx = revisionRankIdx;
    this.currentQuestInstance = rankDef.generate();
    
    const questIcon = document.getElementById("quest-icon");
    const questTag = document.getElementById("quest-tag");
    const questTitle = document.getElementById("quest-title");
    const questDesc = document.getElementById("quest-desc");
    
    const nodeKey = `${this.currentWorld}_${rankIdx}`;
    const currentProgress = this.nodeProgress[nodeKey] || 0;
    
    if (questIcon) questIcon.innerText = currentWorldDef.icon;
    if (questTag) {
      if (this.isInterleavingRevision) {
        questTag.innerText = `⚠️ RÉVISION INTERCALÉE (RANG ${revisionRankIdx + 1})`;
        questTag.className = "text-[9px] bg-amber-500/20 text-amber-400 border border-amber-400/50 font-black px-2 py-0.5 rounded font-mono shrink-0 uppercase animate-pulse";
      } else {
        questTag.innerText = `${rankDef.rankTitle} (RANG ${rankIdx + 1})`;
        questTag.className = "text-[9px] bg-cyber-accent/20 text-cyber-accent font-black px-2 py-0.5 rounded font-mono shrink-0 uppercase";
      }
    }
    if (questTitle) questTitle.innerText = this.currentQuestInstance.title;
    if (questDesc) {
      if (this.isInterleavingRevision) {
        questDesc.innerText = `${this.currentQuestInstance.desc} — [RÉVISION INTERCALÉE]`;
      } else {
        questDesc.innerText = `${this.currentQuestInstance.desc} — Jauge : ${currentProgress}/5`;
      }
    }
    
    this.currentInputValue = "";
    this.previewTarget = null;
    this.updateAnswerDisplay();
    this.updateKeypadGrid();
    this.renderSkillNodesList();
    
    const opts = this.currentQuestInstance.options || [];
    this.renderQuickChoices(opts);
    
    this.renderCanvas();
    this.restoreFocus();
  }
  
  getHint() {
    if (!this.currentQuestInstance) return;
    this.sound.playClick();
    this.triggerKillfeed("💡 RÈGLE DU COURS", this.currentQuestInstance.hint);
    this.renderQuickChoices(this.currentQuestInstance.options);
  }
  
  renderSkillNodesList() {
    const container = document.getElementById("skill-nodes-container");
    if (!container) return;
    container.innerHTML = "";
    const ranks = GAME_WORLDS[this.currentWorld].ranks;
    
    const bossBtn = document.getElementById("boss-quest-btn");
    const bossTxt = document.getElementById("boss-btn-text");
    
    if (bossBtn && bossTxt) {
      const isUnlocked = this.checkBossUnlockEligibility();
      if (isUnlocked) {
        bossBtn.disabled = false;
        bossBtn.className = "w-full py-3.5 px-3 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 border border-amber-300 transition shadow-lg cursor-pointer neon-glow-gold animate-bounce touch-btn";
        bossTxt.innerText = "BOSS FIGHT GRANDMASTER DISPONIBLE !";
      } else {
        bossBtn.disabled = true;
        bossBtn.className = "w-full py-3.5 px-3 bg-slate-900 text-slate-500 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 border border-slate-800 cursor-not-allowed opacity-60 touch-btn";
        bossTxt.innerText = `BOSS FIGHT VERROUILLÉ (Requis : Rang 8 ou Streak x10)`;
      }
    }
    
    const progressLbl = document.getElementById("domain-progress-lbl");
    if (progressLbl) progressLbl.innerText = `${this.completedNodes.size}/48 MISSIONS RÉUSSIES`;
    
    ranks.forEach((r, idx) => {
      const nodeKey = `${this.currentWorld}_${idx}`;
      const isDone = this.completedNodes.has(nodeKey);
      const isUnlocked = idx === 0 || this.completedNodes.has(`${this.currentWorld}_${idx - 1}`);
      const isSelected = this.currentRankIdx === idx;
      
      const item = document.createElement("div");
      item.className = `p-3 rounded-xl border transition cursor-pointer flex items-center justify-between touch-btn ${
        isSelected
        ? "bg-cyber-card border-cyber-accent neon-glow-cyan"
        : isUnlocked
        ? "bg-slate-900/80 border-slate-800 hover:border-slate-700"
        : "bg-slate-950/40 border-slate-900 opacity-50 cursor-not-allowed"
      }`;
      
      item.onclick = () => this.selectRankNode(idx);
      
      item.innerHTML = `
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
      isDone
      ? "bg-cyber-green/20 text-cyber-green border border-cyber-green"
      : isUnlocked
      ? "bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/40"
      : "bg-slate-800 text-slate-500"
    }">
                ${isDone ? "✓" : isUnlocked ? r.rankId.replace("RANG ", "R") : "🔒"}
              </div>
              <div>
                <h4 class="font-bold text-xs text-white">${r.rankTitle}</h4>
                <span class="text-[9px] text-slate-400 uppercase font-mono">${r.rankId}</span>
              </div>
            </div>
            <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500"></i>
          `;
    
    container.appendChild(item);
  });
  
  if (window.lucide) lucide.createIcons();
}

toggleQuickChoicesCollapse() {
  this.sound.playClick();
  const panel = document.getElementById("quick-choices-panel");
  const labelEl = document.getElementById("toggle-qcm-label");
  if (!panel || !labelEl) return;
  
  const isCollapsed = panel.classList.toggle("collapsed");
  labelEl.innerText = isCollapsed ? "▲ AFFICHER" : "▼ RÉDUIRE";
}

toggleTacticalFooter() {
  this.sound.playClick();
  const footer = document.getElementById("hud-footer");
  const toggleBtn = document.getElementById("toggle-footer-lbl");
  if (!footer) return;
  
  const isCollapsed = footer.classList.toggle("collapsed");
  if (toggleBtn) {
    toggleBtn.innerText = isCollapsed ? "▲ AFFICHER OUTILS" : "▼ MASQUER";
  }
  
  setTimeout(() => this.resizeCanvas(), 50);
}

renderQuickChoices(options) {
  const panel = document.getElementById("quick-choices-panel");
  const container = document.getElementById("quick-choices-items");
  if (!panel || !container) return;
  
  container.innerHTML = "";
  if (!options || options.length === 0) {
    panel.classList.add("hidden");
    return;
  }
  
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "px-5 py-3 bg-slate-900/90 active:bg-cyber-accent/30 border border-cyber-accent/50 active:border-cyber-accent text-cyber-accent font-extrabold font-mono text-sm rounded-xl transition shadow-lg touch-btn flex items-center justify-center min-w-[70px]";
    btn.innerText = opt;
    btn.onclick = () => {
      this.sound.playClick();
      this.currentInputValue = opt.toString();
      this.updateAnswerDisplay();
    };
    container.appendChild(btn);
  });
  
  panel.classList.remove("hidden");
}

drawTargetReticlePreview(ctx) {
  if (!this.previewTarget) return;
  
  let px = null;
  let py = null;
  
  if (this.previewTarget.type === 'GRID' && this.gridMetrics) {
    const colIdx = this.previewTarget.col.charCodeAt(0) - 65;
    const rowIdx = this.previewTarget.row;
    px = this.gridMetrics.startX + colIdx * this.gridMetrics.cellW + this.gridMetrics.cellW / 2;
    py = this.gridMetrics.startY + (this.gridMetrics.numRows - rowIdx + 0.5) * this.gridMetrics.cellH;
  } else if (this.previewTarget.type === 'CARTESIAN' && this.cartesianMetrics) {
    px = this.cartesianMetrics.originX + this.previewTarget.x * this.cartesianMetrics.scaleX;
    py = this.cartesianMetrics.originY - this.previewTarget.y * this.cartesianMetrics.scaleY;
  }
  
  if (px === null || py === null) return;
  
  const time = Date.now() / 150;
  const alpha = 0.6 + Math.sin(time) * 0.4;
  const radius = 16 + Math.cos(time) * 3;
  
  ctx.save();
  ctx.strokeStyle = `rgba(255, 0, 127, ${alpha})`;
  ctx.fillStyle = `rgba(255, 0, 127, ${alpha * 0.25})`;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = "#ff007f";
  ctx.shadowBlur = 12;
  
  ctx.beginPath();
  ctx.arc(px, py, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(px - radius - 8, py); ctx.lineTo(px - radius + 4, py);
  ctx.moveTo(px + radius - 4, py); ctx.lineTo(px + radius + 8, py);
  ctx.moveTo(px, py - radius - 8); ctx.lineTo(px, py - radius + 4);
  ctx.moveTo(px, py + radius - 4); ctx.lineTo(px, py + radius + 8);
  ctx.stroke();
  
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(px, py, 2.5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

submitAnswer() {
  if (!this.gamification) {
    this.gamification = new GamificationEngine(this);
  }
  
  const input = this.currentInputValue.trim().toUpperCase();
  if (!this.currentQuestInstance) return;
  const currentQuest = this.currentQuestInstance;
  
  if (!input && input !== "0") {
    this.sound.playError();
    this.gamification.renderCanvasBanner({
      title: "⚠️ SAISIE VIDE",
      subtitle: "Sélectionnez ou saisissez une valeur avant d'engager le tir.",
      isError: true
    });
    return;
  }
  
  const now = Date.now();
  const startTime = this.questStartTime || now;
  const responseTimeSeconds = Math.max(0.5, (now - startTime) / 1000);
  this.questStartTime = Date.now();
  
  this.currentInputValue = "";
  this.previewTarget = null;
  this.updateAnswerDisplay();
  
  if (this.isBossMode) {
    this.handleBossAnswer(input);
    return;
  }
  
  if (this.isTurboMode) {
    this.handleTurboAnswer(input);
    return;
  }
  
  const activeRank = (this.activeQuestRankIdx !== undefined) ? this.activeQuestRankIdx : this.currentRankIdx;
  const nodeKey = `${this.currentWorld}_${activeRank}`;
  const alreadyCompleted = this.completedNodes.has(nodeKey);
  const rankNumber = activeRank + 1;
  
  if (this.nodeProgress[nodeKey] === undefined) {
    this.nodeProgress[nodeKey] = 0;
  }
  
  const normalize = (str) => {
    let cleaned = str.toString().toUpperCase().trim();
    cleaned = cleaned.replace(/[\[\]()]/g, '');
    cleaned = cleaned
    .replace(/[°²³]/g, '')
    .replace(/\s*(CM²|M²|KM²|DM²|MM²|CM³|M³|KM³|DM³|MM³|CM|M|KM|DM|MM|L|CARREAUX|CARREAU|DEGRÉS|DEGRÉ|DEGRE)\b/g, '')
    .trim();
    return cleaned.replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ').trim();
  };
  
  const cleanInput = normalize(input);
  const cleanAnswer = normalize(currentQuest.answer);
  
  const isMatch = (cleanInput === cleanAnswer) ||
  (cleanInput.replace(',', '.') === cleanAnswer.replace(',', '.')) ||
  (input.toUpperCase().trim() === currentQuest.answer.toString().toUpperCase().trim());
  
  this.totalAttempts++;
  
  if (isMatch) {
    this.successfulAttempts++;
    const rewards = this.gamification.calculateReward(rankNumber, this.streak, responseTimeSeconds);
    
    if (currentQuest.title && currentQuest.title.toLowerCase().includes("angle")) {
      this.anglesSuccessCount = (this.anglesSuccessCount || 0) + 1;
    }
    
    if (!alreadyCompleted) {
      // NOUVEAU NIVEAU : Attribution à 100% des gains (XP + Coins) sans sur-créditement
      this.nodeProgress[nodeKey]++;
      this.streak++;
      this.maxStreak = Math.max(this.maxStreak, this.streak);
      
      this.xp += rewards.totalXP;
      this.coins += rewards.totalCoins;
      
      if (this.nodeProgress[nodeKey] >= 5) {
        this.completedNodes.add(nodeKey);
      }
      
      this.gamification.showSuccessFeedback(rewards);
    } else {
      // REJOUABILITÉ : Attribution uniquement de la récompense réduite (33% des gains)
      this.nodeProgress[nodeKey]++;
      this.streak++;
      this.maxStreak = Math.max(this.maxStreak, this.streak);
      
      const reducedReward = Math.max(2, Math.round(rewards.totalCoins / 3));
      const reducedXP = Math.max(5, Math.round(rewards.totalXP / 3));
      
      this.coins += reducedReward;
      this.xp += reducedXP;
      
      this.gamification.showSuccessFeedback({
        totalXP: reducedXP,
        totalCoins: reducedReward,
        comboMultiplier: rewards.comboMultiplier,
        speedBonusXP: 0
      });
    }
    
    this.gamification.evaluateBadges({
      responseTime: responseTimeSeconds,
      isCorrect: true
    });
    
    this.saveCurrentState();
    this.updateHUD();
    this.renderSkillNodesList();
    setTimeout(() => this.selectRankNode(this.currentRankIdx, false, true), 1000);
    
  } else {
    this.streak = 1;
    if (!alreadyCompleted && !this.isInterleavingRevision) {
      this.nodeProgress[nodeKey] = 0;
    }
    
    this.gamification.showErrorFeedback(input, currentQuest.answer, currentQuest.hint);
    
    this.saveCurrentState();
    this.updateHUD();
  }
}

checkAchievements(triggerContext = {}) {
  if (!this.gamification) {
    this.gamification = new GamificationEngine(this);
  }
  this.gamification.evaluateBadges(triggerContext);
}

showErrorExplanationModal(userInput, expectedAnswer, ruleHint) {
  let errModal = document.getElementById("error-explanation-modal");
  if (!errModal) {
    errModal = document.createElement("div");
    errModal.id = "error-explanation-modal";
    errModal.className = "fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[130] flex items-center justify-center p-4";
    document.body.appendChild(errModal);
  }
  
  errModal.innerHTML = `
          <div class="bg-cyber-panel border-2 border-red-500 w-full max-w-md rounded-2xl shadow-2xl p-5 flex flex-col space-y-3 neon-glow-red animate-pulse-fast">
            <div class="flex items-center space-x-2 border-b border-red-900 pb-2">
              <span class="text-2xl">💥</span>
              <h3 class="text-lg font-black text-red-400 uppercase tracking-wide">TIR MANQUÉ !</h3>
            </div>
            <div class="space-y-2 text-xs font-mono">
              <div class="bg-red-950/60 p-2.5 rounded-xl border border-red-800 text-red-200">
                <b>Ta saisie :</b> <span class="text-white font-bold">[${userInput}]</span>
              </div>
              <div class="bg-cyber-card p-2.5 rounded-xl border border-cyber-green text-cyber-green">
                <b>Réponse attendue :</b> <span class="font-bold text-white">[${expectedAnswer}]</span>
              </div>
              <div class="bg-slate-900 p-3 rounded-xl border border-amber-500/40 text-amber-300">
                <b>💡 Explication :</b> ${ruleHint}
              </div>
            </div>
            <div class="pt-2 border-t border-red-900/50 flex justify-end">
              <button onclick="game.closeErrorExplanationModal()" class="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase rounded-xl transition neon-glow-red touch-btn">
                [COMPRIS ! CONTINUER LA MISSION]
              </button>
            </div>
          </div>
        `;
  errModal.classList.remove("hidden");
}

closeErrorExplanationModal() {
  const errModal = document.getElementById("error-explanation-modal");
  if (errModal) {
    errModal.classList.add("hidden");
  }
  this.selectRankNode(this.currentRankIdx);
}

startBossQuest() {
  this.sound.playClick();
  this.isBossMode = true;
  this.bossHp = 150; // Rebalancement V2 : 150 HP
  this.maxBossHp = 150;
  this.bossTimer = 30; // Chrono fixe 30s
  this.bossAttemptsLeft = 3;
  
  const bossOverlay = document.getElementById("boss-hud-overlay");
  const hpBar = document.getElementById("boss-hp-bar");
  const timerEl = document.getElementById("boss-timer");
  
  if (hpBar) hpBar.style.width = "100%";
  if (timerEl) timerEl.innerText = "30s";
  if (bossOverlay) bossOverlay.classList.remove("hidden");
  
  this.triggerKillfeed("COMBAT BOSS APEX : 150 HP - 30 SECONDES !", "Chrono sous pression & 3 tentatives !");
  
  if (this.bossInterval) clearInterval(this.bossInterval);
  this.bossInterval = setInterval(() => {
    this.bossTimer--;
    const currentTimerEl = document.getElementById("boss-timer");
    if (currentTimerEl) currentTimerEl.innerText = `${this.bossTimer}s`;
    
    if (this.bossTimer <= 0) {
      clearInterval(this.bossInterval);
      this.endBossQuest(false, "TEMPS ÉCOULÉ !");
    }
  }, 1000);
  
  this.generateBossQuestion();
}

generateBossQuestion() {
  const eligiblePool = [];
  
  for (let w = 1; w <= Math.max(this.currentWorld, 6); w++) {
    const worldDef = GAME_WORLDS[w];
    if (!worldDef || !worldDef.ranks) continue;
    
    worldDef.ranks.forEach((rankDef, rIdx) => {
      const nodeKey = `${w}_${rIdx}`;
      if (w === this.currentWorld || this.completedNodes.has(nodeKey) || rIdx === 0) {
        eligiblePool.push({ worldId: w, rankIdx: rIdx, rankDef });
      }
    });
  }
  
  if (eligiblePool.length === 0) {
    eligiblePool.push({
      worldId: this.currentWorld,
      rankIdx: 0,
      rankDef: GAME_WORLDS[this.currentWorld].ranks[0]
    });
  }
  
  const picked = eligiblePool[Math.floor(Math.random() * eligiblePool.length)];
  const questInstance = picked.rankDef.generate();
  
  this.currentQuestInstance = questInstance;
  this.activeQuestWorldId = picked.worldId;
  this.activeQuestRankIdx = picked.rankIdx;
  
  const questTag = document.getElementById("quest-tag");
  const questTitle = document.getElementById("quest-title");
  const questDesc = document.getElementById("quest-desc");
  const questIcon = document.getElementById("quest-icon");
  
  if (questIcon) questIcon.innerText = GAME_WORLDS[picked.worldId].icon || "👹";
  if (questTag) {
    questTag.innerText = `BOSS FIGHT - M${picked.worldId} (${picked.rankDef.rankTitle})`;
    questTag.className = "text-[9px] bg-red-500/20 text-red-400 border border-red-500/50 font-black px-2 py-0.5 rounded font-mono shrink-0 uppercase animate-pulse";
  }
  if (questTitle) questTitle.innerText = `[BOSS] ${questInstance.title}`;
  if (questDesc) questDesc.innerText = questInstance.desc;
  
  this.currentInputValue = "";
  this.previewTarget = null;
  this.updateAnswerDisplay();
  this.updateKeypadGrid();
  
  if (questInstance.options && questInstance.options.length > 0) {
    this.renderQuickChoices(questInstance.options);
  } else {
    this.renderQuickChoices([]);
  }
  
  this.renderCanvas();
}

handleBossAnswer(input) {
  if (!this.currentQuestInstance) return;
  const currentQuest = this.currentQuestInstance;
  
  this.totalAttempts++;
  
  const normalize = (str) => {
    let cleaned = str.toString().toUpperCase().trim();
    cleaned = cleaned.replace(/[°²³]/g, '').replace(/\s*(CM²|M²|KM²|DM²|MM²|CM³|M³|KM³|DM³|MM³|CM|M|KM|DM|MM|L)\b/g, '').trim();
    return cleaned.replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ').trim();
  };
  
  const isMatch = (normalize(input) === normalize(currentQuest.answer));
  
  if (isMatch) {
    this.successfulAttempts++;
    this.bossHp = Math.max(0, this.bossHp - 30); // -30 HP par tir (5 réussites requises)
    this.sound.playHeadshot();
    this.triggerVictoryParticles();
    this.triggerKillfeed("💥 HIT CRITIQUE BOSS -30 HP !", "Tir parfait ! Continue !");
    
    const hpBar = document.getElementById("boss-hp-bar");
    if (hpBar) hpBar.style.width = `${(this.bossHp / this.maxBossHp) * 100}%`;
    
    if (this.bossHp <= 0) {
      clearInterval(this.bossInterval);
      this.endBossQuest(true);
    } else {
      this.generateBossQuestion();
    }
  } else {
    this.bossTimer = Math.max(0, this.bossTimer - 5); // Pénalité de temps : -5s
    this.sound.playError();
    this.triggerFailureGlitch();
    this.triggerKillfeed("ERREUR DE TIR ! CHRONO -5s", "Ajuste ta visée !", true);
    
    if (this.bossTimer <= 0) {
      this.endBossQuest(false, "TEMPS ÉCOULÉ !");
    } else {
      this.generateBossQuestion();
    }
  }
}

checkBossAnswer(input) {
  this.handleBossAnswer(input);
}

updateBossHP(damage) {
  this.bossHp = Math.max(0, this.bossHp - damage);
  const hpBar = document.getElementById("boss-hp-bar");
  if (hpBar) {
    hpBar.style.width = `${(this.bossHp / this.maxBossHp) * 100}%`;
  }
}

updatePlayerHP(damage) {
  this.playerHp = Math.max(0, this.playerHp - damage);
  this.bossAttemptsLeft = Math.max(0, this.bossAttemptsLeft - 1);
  
  const playerBar = document.getElementById("boss-player-hp-bar");
  if (playerBar) {
    playerBar.style.width = `${(this.playerHp / this.maxPlayerHp) * 100}%`;
  }
  
  const attemptsContainer = document.getElementById("boss-attempts-badges");
  if (attemptsContainer) {
    const hearts = attemptsContainer.querySelectorAll(".attempt-heart");
    hearts.forEach((heart, idx) => {
      if (idx >= this.bossAttemptsLeft) {
        heart.className = "attempt-heart text-slate-700 opacity-30";
      }
    });
  }
}

triggerBossFeedback(type, damageValue) {
  const canvasContainer = document.getElementById("canvas-container");
  const bossHud = document.getElementById("boss-hud-overlay");
  
  if (type === "CRITICAL_HIT") {
    if (canvasContainer) {
      canvasContainer.classList.add("ring-4", "ring-emerald-400", "bg-emerald-950/30");
      setTimeout(() => canvasContainer.classList.remove("ring-4", "ring-emerald-400", "bg-emerald-950/30"), 350);
    }
    if (bossHud) {
      bossHud.classList.add("scale-105");
      setTimeout(() => bossHud.classList.remove("scale-105"), 200);
    }
    this.triggerFloatingText(`-${damageValue} HP !`, "#00ff66");
    
  } else if (type === "PLAYER_DAMAGE") {
    if (canvasContainer) {
      canvasContainer.classList.add("animate-bounce", "ring-4", "ring-red-600", "bg-red-950/50");
      setTimeout(() => canvasContainer.classList.remove("animate-bounce", "ring-4", "ring-red-600", "bg-red-950/50"), 450);
    }
    if (bossHud) {
      bossHud.classList.add("border-red-500", "bg-red-950");
      setTimeout(() => bossHud.classList.remove("border-red-500", "bg-red-950"), 450);
    }
    this.triggerFloatingText(`-${damageValue} SHIELD !`, "#ff0055");
  }
}

triggerFloatingText(text, color) {
  const container = document.getElementById("canvas-container");
  if (!container) return;
  
  const floatEl = document.createElement("div");
  floatEl.className = "absolute text-2xl font-black font-mono pointer-events-none z-40 transition-all duration-700 ease-out";
  floatEl.style.color = color;
  floatEl.style.left = "50%";
  floatEl.style.top = "45%";
  floatEl.style.transform = "translate(-50%, -50%) scale(0.8)";
  floatEl.style.textShadow = `0 0 14px ${color}`;
  floatEl.innerText = text;
  
  container.appendChild(floatEl);
  
  requestAnimationFrame(() => {
    floatEl.style.transform = "translate(-50%, -120%) scale(1.2)";
    floatEl.style.opacity = "0";
  });
  
  setTimeout(() => floatEl.remove(), 700);
}

endBossQuest(success, reasonMessage) {
  if (this.bossInterval) {
    clearInterval(this.bossInterval);
    this.bossInterval = null;
  }
  this.isBossMode = false;
  
  const bossOverlay = document.getElementById("boss-hud-overlay");
  if (bossOverlay) bossOverlay.classList.add("hidden");
  
  if (success) {
    this.sound.playSuccess();
    this.triggerVictoryParticles();
    this.streak += 5; // Bonus de victoire
    this.maxStreak = Math.max(this.maxStreak, this.streak);
    this.xp += 400;
    this.coins += 300;
    
    this.triggerKillfeed("🏆 VICTOIRE BOSS APEX !", "+5 STREAK ! Lancement du Mode TURBO WORLD !");
    this.checkAchievements({ bossWin: true });
    this.saveCurrentState();
    this.updateHUD();
    
    this.startTurboWorld(); // Bascule immédiate vers le mode bonus
  } else {
    this.sound.playError();
    this.triggerFailureGlitch();
    this.triggerKillfeed("❌ ÉCHEC BOSS FIGHT", reasonMessage || "Chrono écoulé !", true);
    this.selectRankNode(this.currentRankIdx);
  }
}

triggerKillfeed(title, subtitle, isError = false) {
  const feed = document.getElementById("killfeed");
  if (!feed) return;
  
  while (feed.children.length >= 3) {
    feed.removeChild(feed.firstElementChild);
  }
  
  const item = document.createElement("div");
  item.className = `killfeed-item p-3.5 rounded-xl border backdrop-blur-md shadow-2xl pointer-events-none ${
    isError
    ? "bg-red-950/90 border-red-500 text-red-200"
    : "bg-cyber-card/90 border-cyber-green text-cyber-green neon-glow-green"
  }`;
  item.innerHTML = `
          <div class="font-black text-xs uppercase tracking-wider">${title}</div>
          <div class="text-[10px] text-slate-300 font-mono">${subtitle}</div>
        `;
  feed.appendChild(item);
  
  setTimeout(() => {
    item.classList.add("fade-out");
    setTimeout(() => {
      if (item.parentNode) {
        item.remove();
      }
    }, 500);
  }, 5000);
}

resetCanvas() {
  this.sound.playClick();
  this.toolPos = { x: 130, y: 180 };
  this.renderCanvas();
}

nextQuest() {
  if (this.currentRankIdx < 7) {
    this.selectRankNode(this.currentRankIdx + 1);
  }
}

getEquippedAvatarSymbol() {
  const avatarSkin = SHOP_SKINS.find(s => s.id === this.equippedSkins.avatar);
  if (avatarSkin && avatarSkin.name) {
    return `[${avatarSkin.name}]`;
  }
  return "[PGM]";
}

updateHUD() {
  const level = Math.floor(this.xp / 200) + 1;
  const xpInCurrentLevel = this.xp % 200;
  const xpProgressPct = (xpInCurrentLevel / 200) * 100;
  
  const xpBar = document.getElementById("xp-bar");
  if (xpBar) xpBar.style.width = `${xpProgressPct}%`;
  
  const rankBadge = document.getElementById("rank-badge");
  if (rankBadge) rankBadge.innerText = `LVL ${level}`;
  
  const rankTitle = document.getElementById("rank-title");
  if (rankTitle) {
    let title = "NOOB";
    if (level >= 8) title = "PGM GRANDMASTER";
    else if (level >= 7) title = "LÉGENDAIRE";
    else if (level >= 6) title = "CHAMPION";
    else if (level >= 5) title = "EXPERT";
    else if (level >= 4) title = "CONFIRMÉ";
    else if (level >= 3) title = "APPRENTI";
    else if (level >= 2) title = "NOVICE";
    
    rankTitle.innerText = title;
  }
  
  const streakCount = document.getElementById("streak-count");
  if (streakCount) streakCount.innerText = `x${this.streak} MULTI`;
  
  const coinCount = document.getElementById("coin-count");
  if (coinCount) coinCount.innerText = `${this.coins} $`;
  
  const shopCoinCount = document.getElementById("shop-coin-count");
  if (shopCoinCount) shopCoinCount.innerText = `${this.coins} $`;
  
  const activeProf = this.profiles ? this.profiles[this.activeProfileId] : null;
  if (activeProf) {
    const pName = document.getElementById("player-name");
    if (pName) pName.innerText = activeProf.name || "Gamer_PGM";
  }
  
  if (this.coins >= 200 && !this.hasNotifiedShop) {
    this.hasNotifiedShop = true;
    if (typeof this.triggerKillfeed === "function") {
      this.triggerKillfeed(
        "🛒 BOURSE PLEINE (200 $) !", 
        "Visitez l'Armurerie PGM pour équiper vos Skins !", 
        false
      );
    }
  } else if (this.coins < 200) {
    this.hasNotifiedShop = false;
  }
  
  const avatarDisplay = document.getElementById("avatar-display");
  const avatarContainer = document.getElementById("avatar-container");
  if (avatarDisplay && avatarContainer) {
    const skinObj = SHOP_SKINS.find(s => s.id === this.equippedSkins.avatar);
    if (skinObj && skinObj.badgeClass) {
      avatarContainer.className = "w-11 h-11 rounded-xl p-0.5";
      avatarDisplay.className = `w-full h-full ${skinObj.badgeClass} rounded-[9px] flex items-center justify-center text-xl transition-all border`;
      avatarDisplay.innerHTML = `<i data-lucide="${skinObj.iconName || 'gamepad-2'}" class="w-5 h-5"></i>`;
    } else {
      avatarDisplay.innerHTML = `<i data-lucide="gamepad-2" class="w-5 h-5 text-cyber-accent"></i>`;
    }
    if (window.lucide) lucide.createIcons();
  }
}

previewItem3D(skin) {
    if (!skin) return;

    const nameEl = document.getElementById("armory-3d-item-name");
    const rarityEl = document.getElementById("armory-3d-rarity");
    if (nameEl) nameEl.innerText = skin.name.toUpperCase();
    if (rarityEl) rarityEl.innerText = (skin.rarity || "COMMUN").toUpperCase();

    if (this.armory3DRenderer) {
      const config = skin.config3D || {};
      const meshType = config.meshType || skin.type;
      const colorHex = config.colorMain || skin.palette?.[0] || skin.color || "#00f0ff";

      this.armory3DRenderer.loadItem(meshType, colorHex);
    }
  }

  openShop() {
    this.sound.playClick();
    const shopModal = document.getElementById("shop-modal");
    if (shopModal) shopModal.classList.remove("hidden");

    // Destruire toute instance 3D préexistante pour éviter les fuites de mémoire VRAM
    if (this.armory3DRenderer) {
      this.armory3DRenderer.destroy();
      this.armory3DRenderer = null;
    }

    requestAnimationFrame(() => {
      if (window.Armory3DRenderer) {
        this.armory3DRenderer = new Armory3DRenderer("armory-3d-viewport");
      }

      const activeSkinId = this.equippedSkins.xp_theme || this.equippedSkins.avatar || "skin_xp_theme_cyber_cyan";
      const skin = SHOP_SKINS.find(s => s.id === activeSkinId) || SHOP_SKINS[0];
      this.previewItem3D(skin);
    });

    this.filterShop(this.activeShopFilter || "all");
  }

  closeShop() {
    this.sound.playClick();
    const shopModal = document.getElementById("shop-modal");
    if (shopModal) shopModal.classList.add("hidden");

    // Arrêt immédiat de la boucle WebGL et purge de la VRAM
    if (this.armory3DRenderer) {
      this.armory3DRenderer.destroy();
      this.armory3DRenderer = null;
    }
  }

  renderShopItems() {
    const container = document.getElementById("shop-items-container");
    if (!container) return;
    container.innerHTML = "";

    const filtered = SHOP_SKINS.filter(skin => {
      if (this.activeShopFilter === "all") return true;
      return skin.type === this.activeShopFilter;
    });

    const getRarityConfig = (skin) => {
      const rarity = (skin.rarity || "").toLowerCase();
      if (rarity.includes("commune") || rarity.includes("commun")) return { name: "COMMUN", cardClass: "loot-card-common", badgeClass: "bg-slate-800/90 text-slate-300 border-slate-600" };
      if (rarity.includes("rare")) return { name: "RARE", cardClass: "loot-card-rare", badgeClass: "bg-cyan-950/90 text-cyan-300 border-cyan-500" };
      if (rarity.includes("épique") || rarity.includes("epique")) return { name: "ÉPIQUE", cardClass: "loot-card-epic", badgeClass: "bg-purple-950/90 text-purple-300 border-purple-400" };
      if (rarity.includes("exotique")) return { name: "EXOTIQUE", cardClass: "loot-card-legendary", badgeClass: "bg-rose-950/90 text-rose-300 border-rose-500" };
      return { name: "LÉGENDAIRE", cardClass: "loot-card-legendary", badgeClass: "bg-amber-950/90 text-amber-300 border-amber-400" };
    };

    filtered.forEach(skin => {
      const isOwned = this.ownedSkins.has(skin.id);
      const isEquipped = this.equippedSkins[skin.type] === skin.id;
      const rarity = getRarityConfig(skin);

      const card = document.createElement("div");
      card.className = `loot-card p-4 rounded-2xl border-2 flex flex-col justify-between space-y-3 min-h-[310px] shrink-0 ${rarity.cardClass} ${isEquipped ? 'loot-card-equipped' : ''}`;
      
      // Prévisualisation 3D au clic ET au survol (Hover)
      card.onclick = () => this.previewItem3D(skin);
      card.onmouseenter = () => this.previewItem3D(skin);

      let previewHtml = '';
      if (skin.badgeClass) {
        previewHtml = `<div class="w-12 h-12 rounded-xl ${skin.badgeClass} flex items-center justify-center text-xl border"><i data-lucide="${skin.iconName || 'sparkles'}" class="w-6 h-6"></i></div>`;
      } else if (skin.color) {
        previewHtml = `<div class="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center shadow-lg" style="background-color: ${skin.color};"><i data-lucide="${skin.iconName || 'crosshair'}" class="w-5 h-5 text-slate-950"></i></div>`;
      } else if (skin.bg) {
        previewHtml = `<div class="w-14 h-10 rounded-lg border border-slate-600 flex items-center justify-center font-mono text-[10px] text-slate-300" style="background-color: ${skin.bg}">GRID</div>`;
      } else {
        previewHtml = `<div class="w-10 h-10 rounded-xl bg-cyber-card border border-cyber-accent/40 flex items-center justify-center text-cyber-accent"><i data-lucide="${skin.iconName || 'box'}" class="w-5 h-5"></i></div>`;
      }

      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-[9px] font-black font-mono px-2 py-0.5 rounded-md border uppercase tracking-wider ${rarity.badgeClass}">
            ${rarity.name}
          </span>
          <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-950/80 text-slate-400 border border-slate-800">
            ${skin.gameRef || 'ORIGINAL'}
          </span>
        </div>

        <div class="loot-preview-box h-24 rounded-xl border border-slate-800/80 flex items-center justify-center p-2 relative shrink-0">
          ${previewHtml}
          ${isEquipped ? `<span class="absolute bottom-1.5 right-2 text-[9px] font-black font-mono text-cyber-green bg-cyber-green/10 border border-cyber-green/40 px-1.5 py-0.5 rounded uppercase">ACTIF</span>` : ''}
        </div>

        <div class="space-y-1 shrink-0">
          <h4 class="font-black text-white text-sm tracking-wide truncate flex items-center gap-1.5">
            ${skin.name}
          </h4>
          <p class="text-[11px] text-slate-400 font-mono line-clamp-2 leading-relaxed min-h-[2.25rem]">
            ${skin.desc}
          </p>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 shrink-0">
          <div class="flex flex-col">
            <span class="text-[9px] text-slate-500 font-mono font-bold uppercase">VALEUR</span>
            <span class="text-xs font-black font-mono ${skin.price === 0 ? 'text-cyber-green' : 'text-cyber-gold'}">
              ${skin.price === 0 ? 'GRATUIT' : skin.price + ' $'}
            </span>
          </div>

          <button onclick="game.buyOrEquipSkin(event, '${skin.id}')" class="px-3.5 py-2 rounded-xl text-xs font-black font-mono transition-all touch-btn flex items-center gap-1.5 ${
            isEquipped
            ? "bg-cyber-green/20 text-cyber-green border border-cyber-green cursor-default"
            : isOwned
            ? "bg-cyber-accent hover:bg-cyan-300 text-slate-950 font-black shadow-[0_0_12px_rgba(0,240,255,0.4)]"
            : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-[0_0_12px_rgba(255,215,0,0.3)]"
          }">
            ${isEquipped ? '<i data-lucide="check" class="w-3.5 h-3.5"></i> ÉQUIPÉ' : isOwned ? 'ÉQUIPER' : '<i data-lucide="shopping-cart" class="w-3.5 h-3.5"></i> ACHETER'}
          </button>
        </div>
      `;

      container.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  buyOrEquipSkin(e, skinId) {
    if (e && e.stopPropagation) e.stopPropagation(); // Évite le double appel dû au bubbling d'événements

    const skin = SHOP_SKINS.find(s => s.id === skinId);
    if (!skin) return;

    this.previewItem3D(skin);

    if (this.ownedSkins.has(skinId)) {
      this.sound.playClick();
      this.equippedSkins[skin.type] = skinId;
      this.saveCurrentState();
      this.applyEquippedSkins();
      this.renderShopItems();
      this.updateHUD();
      return;
    }

    if (this.coins >= skin.price) {
      this.sound.playSuccess();
      this.coins -= skin.price;
      this.ownedSkins.add(skinId);
      this.equippedSkins[skin.type] = skinId;
      this.saveCurrentState();
      this.applyEquippedSkins();
      this.renderShopItems();
      this.updateHUD();
      this.triggerKillfeed("🛒 ÉQUIPEMENT DÉBLOQUÉ !", `${skin.name} équipé !`);
    } else {
      this.sound.playError();
      this.triggerKillfeed("🪙 FONDS INSUFFISANTS", `Il te manque ${skin.price - this.coins} $ !`, true);
    }
  }

toggleAudio() {
  this.sound.enabled = !this.sound.enabled;
  const icon = document.getElementById("audio-icon");
  if (icon) {
    icon.setAttribute("data-lucide", this.sound.enabled ? "volume-2" : "volume-x");
    if (window.lucide) lucide.createIcons();
  }
}

openGuideModal() {
  this.sound.playClick();
  document.getElementById("guide-modal")?.classList.remove("hidden");
}

closeGuideModal() {
  this.sound.playClick();
  document.getElementById("guide-modal")?.classList.add("hidden");
}

applyEquippedSkins() {
  // --- NETTOYAGE WEBGL : NETTOYAGE DE LA VRAM (MÉMOIRE GPU) ---
  if (this.current3DModel) {
    if (this.scene3D) {
      this.scene3D.remove(this.current3DModel);
    }
    this.current3DModel.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          } else {
            if (child.material.map) child.material.map.dispose();
            child.material.dispose();
          }
        }
      }
    });
    this.current3DModel = null;
  }
  
  // --- MISE À JOUR DYNAMIQUE DE LA BARRE D'XP ---
  const xpBar = document.getElementById("xp-bar");
  if (xpBar) {
    const xpSkin = SHOP_SKINS.find(s => s.id === this.equippedSkins.xp_theme) || SHOP_SKINS.find(s => s.id === "xp_theme_cyber_cyan");
    xpBar.className = "xp-bar-base";
    if (xpSkin && xpSkin.cssClass) {
      xpBar.classList.add(xpSkin.cssClass);
    } else {
      xpBar.classList.add("xp-theme-cyber-cyan");
    }
  }
  
  // --- CODE EXISTANT (CANVAS & AVATAR) ---
  const canvasBgSkin = SHOP_SKINS.find(s => s.id === this.equippedSkins.canvas);
  if (canvasBgSkin && this.canvas) {
    this.canvas.style.backgroundColor = canvasBgSkin.bg || "#080d19";
  }
  
  const avatarSkin = SHOP_SKINS.find(s => s.id === this.equippedSkins.avatar);
  const avatarDisplay = document.getElementById("avatar-display");
  const avatarContainer = document.getElementById("avatar-container");
  
  if (avatarDisplay && avatarContainer) {
    if (avatarSkin && avatarSkin.badgeClass) {
      avatarContainer.className = "w-11 h-11 rounded-xl p-0.5";
      avatarDisplay.className = `w-full h-full ${avatarSkin.badgeClass} rounded-[9px] flex items-center justify-center text-xl transition-all border`;
      avatarDisplay.innerHTML = `<i data-lucide="${avatarSkin.iconName || 'gamepad-2'}" class="w-5 h-5"></i>`;
    } else {
      avatarDisplay.innerHTML = `<i data-lucide="gamepad-2" class="w-5 h-5 text-cyber-accent"></i>`;
    }
  }
  
  const rulerSkin = SHOP_SKINS.find(s => s.id === this.equippedSkins.ruler);
  const lblRuler = document.getElementById("label-tool-ruler");
  if (lblRuler) lblRuler.innerText = rulerSkin ? rulerSkin.name : "RÈGLE NÉON";
  
  const squareSkin = SHOP_SKINS.find(s => s.id === this.equippedSkins.square);
  const lblSquare = document.getElementById("label-tool-square");
  if (lblSquare) lblSquare.innerText = squareSkin ? squareSkin.name : "ÉQUERRE LASER";
  
  const protractorSkin = SHOP_SKINS.find(s => s.id === this.equippedSkins.protractor);
  const lblProtractor = document.getElementById("label-tool-protractor");
  if (lblProtractor) lblProtractor.innerText = protractorSkin ? protractorSkin.name : "RAPPORTEUR HOLO";
  
  if (window.lucide) lucide.createIcons();
  this.renderCanvas();
}

openProfileModal() {
  this.sound.playClick();
  const modal = document.getElementById("profile-modal");
  if (modal) modal.classList.remove("hidden");
  
  const activeProf = this.profiles ? this.profiles[this.activeProfileId] : null;
  const inputEdit = document.getElementById("edit-active-profile-name");
  if (inputEdit && activeProf) {
    inputEdit.value = activeProf.name || '';
  }
  
  this.updateProfileStatsDashboard();
  this.renderProfilesList();
}

closeProfileModal() {
  this.sound.playClick();
  document.getElementById("profile-modal")?.classList.add("hidden");
}

renderProfilesList() {
  const container = document.getElementById("profiles-list-container");
  if (!container) return;
  container.innerHTML = "";
  
  Object.keys(this.profiles).forEach(id => {
    const prof = this.profiles[id];
    const isActive = id === this.activeProfileId;
    
    const item = document.createElement("div");
    item.className = `p-3 rounded-xl border flex items-center justify-between ${
      isActive ? "bg-cyber-card border-cyber-accent" : "bg-slate-900 border-slate-800"
    }`;
    
    item.innerHTML = `
            <div class="flex items-center space-x-3">
              <span class="text-xl">🎮</span>
              <div>
                <h5 class="font-bold text-white text-sm">${prof.name}</h5>
                <span class="text-[10px] text-slate-400 font-mono">XP: ${prof.xp || 0} | ${prof.coins || 150} $</span>
              </div>
            </div>
            <button onclick="game.loadProfileState('${id}')" class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${
    isActive ? "bg-cyber-accent text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
  }">
              ${isActive ? 'ACTIF' : 'CHARGER'}
            </button>
          `;
  container.appendChild(item);
});
}

switchProfile(id) {
  this.sound.playClick();
  this.saveCurrentState();
  this.loadProfileState(id);
  this.renderProfilesList();
}

createNewProfile() {
  const nameInput = document.getElementById("new-profile-name");
  const name = nameInput ? nameInput.value.trim() : "";
  if (!name) return;
  
  this.sound.playSuccess();
  const id = `prof_${Date.now()}`;
  this.profiles[id] = {
    name: name,
    avatar: "avatar_gamer",
    xp: 0,
    coins: 150,
    streak: 1,
    // ➕ AJOUTER CES 3 LIGNES :
    maxStreak: 1,
    totalAttempts: 0,
    successfulAttempts: 0,
    completedNodes: [],
    visitedWorlds: [],
    ownedSkins: ["avatar_gamer", "xp_theme_cyber_cyan", "skin_crosshair_classic", "skin_canvas_dark"],
    equippedSkins: { avatar: "avatar_gamer", xp_theme: "xp_theme_cyber_cyan", crosshair: "skin_crosshair_classic", canvas: "skin_canvas_dark", ruler: null, square: null, protractor: null }  };
    nameInput.value = "";
    this.loadProfileState(id);
    this.renderProfilesList();
  }
  
  editActiveProfileName(newName) {
    const cleaned = typeof newName === 'string' ? newName.trim() : '';
    if (!cleaned || !this.activeProfileId || !this.profiles[this.activeProfileId]) return;
    
    this.profiles[this.activeProfileId].name = cleaned;
    this.saveCurrentState();
    this.updateHUD();
    this.renderProfilesList();
    this.triggerKillfeed("✏️ PROFIL MIS À JOUR", `Nouveau pseudo : ${cleaned}`);
  }
  
  updateProfileStatsDashboard() {
    const count = this.completedNodes ? this.completedNodes.size : 0;
    const qCount = document.getElementById("stat-quests-count");
    const pPct = document.getElementById("stat-progress-pct");
    const maxStrk = document.getElementById("stat-max-streak");
    const accPct = document.getElementById("stat-accuracy-pct");
    
    if (qCount) qCount.innerText = count;
    if (pPct) pPct.innerText = `${Math.round((count / 48) * 100)}%`;
    if (maxStrk) maxStrk.innerText = `x${this.maxStreak || 1}`;
    
    const accuracy = this.totalAttempts > 0 
    ? Math.round((this.successfulAttempts / this.totalAttempts) * 100) 
    : 0;
    if (accPct) accPct.innerText = `${accuracy}%`;
  }
  
  filterShop(category) {
    this.sound.playClick();
    this.activeShopFilter = category;
    document.querySelectorAll(".stab").forEach(btn => {
      btn.className = "stab px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-bold font-mono text-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 hover:text-slate-200 transition-all";
    });
    const activeTab = document.getElementById(`stab-${category}`);
    if (activeTab) {
      activeTab.className = "stab active px-4 py-2.5 rounded-xl bg-cyber-accent text-slate-950 font-black font-mono text-xs whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.8)] border-2 border-white scale-105 transition-all";
    }
    this.renderShopItems();
  }
  
  
  buySkin(skinId, price) {
    if (this.coins >= price && !this.ownedSkins.has(skinId)) {
      this.coins -= price;
      this.ownedSkins.add(skinId);
      this.sound.playSuccess();
      this.equipSkin(skinId);
      this.saveCurrentState();
      this.updateHUD();
      this.renderShopItems();
    } else if (this.coins < price) {
      this.sound.playError();
      this.triggerKillfeed("FONDS INSUFFISANTS", "Réussis plus de missions pour gagner des $ !", true);
    }
  }
  
  equipSkin(skinId) {
    const skin = SHOP_SKINS.find(s => s.id === skinId);
    if (!skin) return false;
    
    const isOwned = this.ownedSkins && (this.ownedSkins.has ? this.ownedSkins.has(skinId) : this.ownedSkins.includes(skinId));
    if (!isOwned && skin.price > 0) {
      this.triggerKillfeed(
        "🔒 SKIN VERROUILLÉ",
        "Achète ce skin dans l'Armurerie avant de pouvoir l'équiper.",
        true
      );
      return false;
    }
    
    if (!this.equippedSkins) this.equippedSkins = {};
    this.equippedSkins[skin.type] = skinId;
    
    this.saveCurrentState();
    this.applyEquippedSkins();
    this.updateHUD();
    
    if (typeof this.renderCanvas === "function") {
      this.renderCanvas();
    }
    if (typeof this.renderShopItems === "function") {
      this.renderShopItems();
    }
    
    this.triggerKillfeed(
      `🎨 SKIN ÉQUIPÉ : ${skin.name}`,
      `Module ${skin.type.toUpperCase()} activé !`,
      false
    );
    
    return true;
  }
  
  setActiveTool(tool) {
    this.sound.playClick();
    this.activeTool = tool;
    document.querySelectorAll(".tool-btn").forEach((btn) => {
      btn.className = "tool-btn p-2.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold flex items-center space-x-1.5 shrink-0 touch-btn";
    });
    const activeBtn = document.getElementById(`tool-${tool}`);
    if (activeBtn) {
      activeBtn.className = "tool-btn active p-2.5 bg-cyber-card border border-cyber-accent text-cyber-accent rounded-xl text-xs font-bold flex items-center space-x-1.5 shrink-0 touch-btn";
    }
    this.renderCanvas();
  }
  
  drawParticles(ctx) {
    for (let p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
  }
  
  startTurboWorld() {
    this.isTurboMode = true;
    this.turboTimer = 180; // 3 minutes (180 s)
    this.turboConsecutiveErrors = 0;
    this.turboXpGained = 0;
    this.turboCoinsGained = 0;
    
    const bossOverlay = document.getElementById("boss-hud-overlay");
    if (bossOverlay) bossOverlay.classList.remove("hidden");
    
    this.triggerKillfeed("⚡ TURBO WORLD ACTIVÉ", " Mode Chrono 3 Min ! Réponds un maximum de questions !");
    
    if (this.turboInterval) clearInterval(this.turboInterval);
    this.turboInterval = setInterval(() => {
      this.turboTimer--;
      const currentTimerEl = document.getElementById("boss-timer");
      if (currentTimerEl) currentTimerEl.innerText = `${this.turboTimer}s`;
      
      if (this.turboTimer <= 0) {
        clearInterval(this.turboInterval);
        this.endTurboWorld();
      }
    }, 1000);
    
    this.generateTurboQuestion();
  }
  
  generateTurboQuestion() {
    // Tirage aléatoire parmi les 6 mondes
    const targetWorld = Math.floor(Math.random() * 6) + 1;
    // Tirage parmi les rangs 3 à 8 (indices 2 à 7) pour conserver du challenge
    const targetRank = Math.floor(Math.random() * 6) + 2;
    
    const worldDef = GAME_WORLDS[targetWorld];
    const rankDef = worldDef.ranks[targetRank];
    const questInstance = rankDef.generate();
    
    this.currentQuestInstance = questInstance;
    this.activeQuestWorldId = targetWorld;
    this.activeQuestRankIdx = targetRank;
    
    const questTag = document.getElementById("quest-tag");
    const questTitle = document.getElementById("quest-title");
    const questDesc = document.getElementById("quest-desc");
    const questIcon = document.getElementById("quest-icon");
    
    if (questIcon) questIcon.innerText = "⚡";
    if (questTag) {
      questTag.innerText = `TURBO WORLD - M${targetWorld} (RANG ${targetRank + 1})`;
      questTag.className = "text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/50 font-black px-2 py-0.5 rounded font-mono shrink-0 uppercase animate-pulse";
    }
    if (questTitle) questTitle.innerText = `[TURBO] ${questInstance.title}`;
    if (questDesc) questDesc.innerText = questInstance.desc;
    
    this.currentInputValue = "";
    this.previewTarget = null;
    this.updateAnswerDisplay();
    this.updateKeypadGrid();
    
    if (questInstance.options && questInstance.options.length > 0) {
      this.renderQuickChoices(questInstance.options);
    } else {
      this.renderQuickChoices([]);
    }
    
    this.renderCanvas();
  }
  
  handleTurboAnswer(input) {
    if (!this.currentQuestInstance) return;
    const currentQuest = this.currentQuestInstance;
    
    this.totalAttempts++;
    
    const normalize = (str) => {
      let cleaned = str.toString().toUpperCase().trim();
      cleaned = cleaned.replace(/[°²³]/g, '').replace(/\s*(CM²|M²|KM²|DM²|MM²|CM³|M³|KM³|DM³|MM³|CM|M|KM|DM|MM|L)\b/g, '').trim();
      return cleaned.replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ').trim();
    };
    
    const isMatch = (normalize(input) === normalize(currentQuest.answer));
    
    if (isMatch) {
      this.successfulAttempts++;
      this.turboConsecutiveErrors = 0;
      this.streak++;
      this.maxStreak = Math.max(this.maxStreak, this.streak);
      
      const reward = this.gamification.calculateReward(this.activeQuestRankIdx + 1, this.streak, 5);
      this.xp += reward.totalXP;
      this.coins += reward.totalCoins;
      this.turboXpGained += reward.totalXP;
      this.turboCoinsGained += reward.totalCoins;
      
      this.sound.playHeadshot();
      this.triggerVictoryParticles();
      this.triggerKillfeed("🎯 CRITICAL HIT TURBO !", `+${reward.totalXP} XP | +${reward.totalCoins} $`);
    } else {
      this.turboConsecutiveErrors++;
      this.streak = 1;
      
      const timePenalty = Math.min(15, Math.round(10 + (this.turboConsecutiveErrors - 1) * 2.5));
      this.turboTimer = Math.max(0, this.turboTimer - timePenalty);
      
      this.sound.playError();
      this.triggerFailureGlitch();
      this.triggerKillfeed("💥 ERREUR TURBO !", `-${timePenalty}s Temps Pénalité !`, true);
    }
    
    this.saveCurrentState();
    this.updateHUD();
    
    if (this.turboTimer > 0) {
      this.generateTurboQuestion();
    } else {
      this.endTurboWorld();
    }
  }
  
  endTurboWorld() {
    if (this.turboInterval) {
      clearInterval(this.turboInterval);
      this.turboInterval = null;
    }
    this.isTurboMode = false;
    
    const bossOverlay = document.getElementById("boss-hud-overlay");
    if (bossOverlay) bossOverlay.classList.add("hidden");
    
    this.sound.playSuccess();
    this.triggerKillfeed(
      "🏁 FIN DU MODE TURBO !", 
      `Bilan : +${this.turboXpGained} XP | +${this.turboCoinsGained} $ accumulés !`
    );
    
    this.saveCurrentState();
    this.updateHUD();
    this.selectRankNode(this.currentRankIdx);
  }
  
  renderCanvas() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    const bgSkin = SHOP_SKINS.find(s => s.id === this.equippedSkins.canvas) || SHOP_SKINS[2];
    ctx.fillStyle = bgSkin.bg || "#080d19";
    ctx.fillRect(0, 0, w, h);
    
    ctx.strokeStyle = bgSkin.grid || "rgba(30, 45, 74, 0.4)";
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    
    switch (this.currentWorld) {
      case 1:
      this.drawWorld1Radar(w, h, 5, this.currentQuestInstance);
      break;
      case 2:
      this.drawWorld2Laser(w, h, this.currentQuestInstance);
      break;
      case 3:
      this.drawWorld3Hitbox(w, h, this.currentQuestInstance);
      break;
      case 4:
      this.drawWorld4Mirror(w, h, this.currentQuestInstance);
      break;
      case 5:
      this.drawWorld5Solids(w, h, this.currentQuestInstance);
      break;
      case 6:
      this.drawWorld6Theorems(w, h, this.currentQuestInstance);
      break;
      default:
      this.drawWorld1Radar(w, h, 5, this.currentQuestInstance);
    }
    
    this.drawTargetReticlePreview(ctx);
    
    if (this.particles.length > 0) {
      this.drawParticles(ctx);
    }
    
    this.drawOverlayTool(w, h);
  }
}
