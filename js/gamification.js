class GamificationEngine {
  constructor(gameEngine) {
    this.game = gameEngine;
    this.bannerTimeout = null;
  }
  
  calculateReward(rankLevel, streak, responseTimeSeconds) {
    const lvl = typeof rankLevel === 'number' ? rankLevel : 1;
    const strk = typeof streak === 'number' ? streak : 1;
    const time = typeof responseTimeSeconds === 'number' ? responseTimeSeconds : 10;
    
    const baseXP = 30 + (15 * lvl);
    const baseCoins = 10 + (5 * lvl);
    
    let comboMultiplier = 1.0;
    if (strk >= 5) comboMultiplier = 2.5;
    else if (strk >= 4) comboMultiplier = 2.0;
    else if (strk >= 3) comboMultiplier = 1.6;
    else if (strk >= 2) comboMultiplier = 1.3;
    
    let speedBonusXP = 0;
    if (time < 10) {
      speedBonusXP = Math.round((10 - time) * 4);
    }
    
    const totalXP = Math.round((baseXP * comboMultiplier) + speedBonusXP);
    const totalCoins = Math.round(baseCoins * comboMultiplier);
    
    return {
      baseXP,
      totalXP,
      totalCoins,
      comboMultiplier: comboMultiplier.toFixed(1),
      speedBonusXP,
      responseTime: time.toFixed(1)
    };
  }
  
  showSuccessFeedback(rewardData) {
    if (this.game.sound) this.game.sound.playHeadshot();
    if (typeof this.game.triggerVictoryParticles === 'function') {
      this.game.triggerVictoryParticles();
    }
    
    const badgeTxt = `STREAK x${this.game.streak} (MULTI x${rewardData.comboMultiplier})`;
    const speedTxt = rewardData.speedBonusXP > 0 ? ` ⚡ Speed Bonus (+${rewardData.speedBonusXP} XP)` : '';
    
    this.renderCanvasBanner({
      title: "🎯 CRITICAL HIT ! TIR RÉUSSI",
      subtitle: `+${rewardData.totalXP} XP${speedTxt} | +${rewardData.totalCoins} $`,
      badge: badgeTxt,
      isError: false
    });
  }
  
  showErrorFeedback(userAnswer, correctAnswer, hintText) {
    if (this.game.sound) this.game.sound.playError();
    if (typeof this.game.triggerFailureGlitch === 'function') {
      this.game.triggerFailureGlitch();
    }
    
    this.renderCanvasBanner({
      title: "💥 RÉTICULE DÉCALÉ / Saisie Incorrecte",
      subtitle: `Ta saisie : "${userAnswer}"  ➜  Attendu : "${correctAnswer}"`,
      topo: `💡 Rappel Tactique : ${hintText}`,
      isError: true
    });
  }
  
  renderCanvasBanner(config) {
    let container = document.getElementById("canvas-feedback-overlay");
    if (!container) {
      container = document.createElement("div");
      container.id = "canvas-feedback-overlay";
      container.className = "absolute top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-30 transition-all duration-300 transform -translate-y-6 opacity-0 pointer-events-none";
      const canvasContainer = document.getElementById("canvas-container");
      if (canvasContainer) canvasContainer.appendChild(container);
    }
    
    if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
    
    const borderClass = config.isError ? "banner-error-neon text-red-400" : "banner-success-neon text-cyber-green";
    
    container.innerHTML = `
          <div class="p-3.5 rounded-2xl ${borderClass} backdrop-blur-md shadow-2xl flex flex-col space-y-1 text-center animate-banner-pulse pointer-events-auto">
            <div class="flex items-center justify-between gap-2">
              <span class="font-black text-xs sm:text-sm uppercase tracking-wider">${config.title}</span>
              ${config.badge ? `<span class="text-[9px] font-mono font-bold px-2 py-0.5 bg-cyber-green/20 text-cyber-green rounded-lg border border-cyber-green/40">${config.badge}</span>` : ''}
            </div>
            <div class="text-xs font-mono font-bold text-white">${config.subtitle}</div>
            ${config.topo ? `<div class="text-[11px] font-mono text-slate-300 pt-1.5 border-t border-red-800/60 text-left leading-relaxed">${config.topo}</div>` : ''}
          </div>
        `;
    
    requestAnimationFrame(() => {
      container.classList.remove("-translate-y-6", "opacity-0");
      container.classList.add("translate-y-0", "opacity-100");
    });
    
    this.bannerTimeout = setTimeout(() => {
      container.classList.add("-translate-y-6", "opacity-0");
      container.classList.remove("translate-y-0", "opacity-100");
    }, 4500);
  }
  
  evaluateBadges(context = {}) {
    if (!this.game.activeProfileId || !this.game.profiles || !this.game.profiles[this.game.activeProfileId]) return;
    if (!this.game.unlockedAchievements) this.game.unlockedAchievements = new Set();
    if (typeof ACHIEVEMENTS_LIST === 'undefined') return;
    
    ACHIEVEMENTS_LIST.forEach(badge => {
      if (this.game.unlockedAchievements.has(badge.id)) return;
      
      let unlocked = false;
      if (badge.condition === "first_mission" && this.game.completedNodes.size >= 1) unlocked = true;
      else if (badge.condition === "world_2_rank" && Array.from(this.game.completedNodes).some(n => String(n).startsWith("2_"))) unlocked = true;
      else if (badge.condition === "streak_5" && this.game.streak >= 5) unlocked = true;
      else if (badge.condition === "speed_3s" && context.isCorrect && context.responseTime <= 3) unlocked = true;
      else if (badge.condition === "rank_7_or_8" && Array.from(this.game.completedNodes).some(n => String(n).endsWith("_6") || String(n).endsWith("_7"))) unlocked = true;
      else if (badge.condition === "all_6_worlds") {
        const worlds = new Set(Array.from(this.game.completedNodes).map(n => String(n).split('_')[0]));
        if (worlds.size >= 6) unlocked = true;
      }
      else if (badge.condition === "angles_5" && (this.game.anglesSuccessCount || 0) >= 5) unlocked = true;
      // --- Dans evaluateBadges(context = {}) ---
      else if (badge.condition === "boss_win" && context.bossWin) unlocked = true;
      else if (badge.condition === "nodes_10" && this.game.completedNodes.size >= 10) unlocked = true;
      else if (badge.condition === "skins_5" && this.game.ownedSkins.size >= 5) unlocked = true;
      else if (badge.condition === "demo_5_times" && (this.game.demoConsultCount || 0) >= 5) unlocked = true;
      else if (badge.condition === "xp_2000" && this.game.xp >= 2000) unlocked = true;
      
      if (unlocked) {
        this.game.unlockedAchievements.add(badge.id);
        this.game.coins += badge.rewardCoins;
        this.game.xp += badge.rewardXp;
        if (badge.rewardSkin) this.game.ownedSkins.add(badge.rewardSkin);
        
        if (this.game.sound) this.game.sound.playSuccess();
        if (typeof this.game.triggerVictoryParticles === 'function') {
          this.game.triggerVictoryParticles();
        }
        if (typeof this.game.triggerKillfeed === 'function') {
          this.game.triggerKillfeed(
            `🏆 BADGE UNLOCKED : ${badge.title}`,
            `${badge.quote} (+${badge.rewardCoins} $ | +${badge.rewardXp} XP)`
          );
        }
        if (typeof this.game.saveCurrentState === 'function') {
          this.game.saveCurrentState();
        }
        if (typeof this.game.updateHUD === 'function') {
          this.game.updateHUD();
        }
      }
    });
  }
}