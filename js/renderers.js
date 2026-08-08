Object.assign(GameEngine.prototype, {
  drawWorld1Radar(w, h, gridSize, quest) {
    const ctx = this.ctx;
    const gd = quest ? quest.geoData : { type: 'crate', col: 'A', row: 1, gridSize: 5 }; // Fallback par défaut
    
    ctx.clearRect(0, 0, w, h);
    
    if (!gd) return;
    
    this.snapPoints = [];
    this.gridMetrics = null;
    this.cartesianMetrics = null;
    
    // 1. MODULE SPATIAL 3D (PERSPECTIVE CAVALIÈRE)
    if (gd.type === 'spatial3D' || gd.type === 'vector3D' || gd.type === '3D') {
      const cx = w / 2 - 25;
      const cy = h / 2 + 35;
      const scale = Math.min(w, h) / 18;
      
      const dimX = gd.x !== undefined ? gd.x : 3;
      const dimY = gd.y !== undefined ? gd.y : 3;
      const dimZ = gd.z !== undefined ? gd.z : 3;
      
      const cos30 = Math.cos(Math.PI / 6);
      const sin30 = Math.sin(Math.PI / 6);
      const k = 0.6;
      
      const project = (x, y, z) => ({
        px: cx + x * scale - y * scale * k * cos30,
        py: cy - z * scale + y * scale * k * sin30
      });
      
      const O   = project(0, 0, 0);
      const X   = project(dimX, 0, 0);
      const Y   = project(0, dimY, 0);
      const XY  = project(dimX, dimY, 0);
      const Z   = project(0, 0, dimZ);
      const XZ  = project(dimX, 0, dimZ);
      const YZ  = project(0, dimY, dimZ);
      const XYZ = project(dimX, dimY, dimZ);
      
      ctx.save();
      
      ctx.strokeStyle = "rgba(0, 240, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(O.px, O.py); ctx.lineTo(Y.px, Y.py);
      ctx.moveTo(O.px, O.py); ctx.lineTo(X.px, X.py);
      ctx.moveTo(O.px, O.py); ctx.lineTo(Z.px, Z.py);
      ctx.stroke();
      
      ctx.setLineDash([]);
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 8;
      
      ctx.beginPath();
      ctx.moveTo(X.px, X.py); ctx.lineTo(XY.px, XY.py); ctx.lineTo(XYZ.px, XYZ.py); ctx.lineTo(XZ.px, XZ.py); ctx.closePath();
      ctx.moveTo(Z.px, Z.py); ctx.lineTo(XZ.px, XZ.py); ctx.lineTo(XYZ.px, XYZ.py); ctx.lineTo(YZ.px, YZ.py); ctx.closePath();
      ctx.moveTo(Y.px, Y.py); ctx.lineTo(XY.px, XY.py); ctx.lineTo(XYZ.px, XYZ.py); ctx.lineTo(YZ.px, YZ.py); ctx.closePath();
      ctx.stroke();
      
      if (!gd.hideTarget) {
        ctx.fillStyle = "#ff0055";
        ctx.shadowColor = "#ff0055";
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(XYZ.px, XYZ.py, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px 'Fira Code', monospace";
        ctx.fillText("M", XYZ.px + 8, XYZ.py - 8);
      }
      
      this.snapPoints.push(
        { x: O.px, y: O.py }, { x: X.px, y: X.py }, { x: Y.px, y: Y.py }, { x: Z.px, y: Z.py },
        { x: XY.px, y: XY.py }, { x: XZ.px, y: XZ.py }, { x: YZ.px, y: YZ.py }, { x: XYZ.px, y: XYZ.py }
      );
      
      this.drawCompass(ctx, w);
      ctx.restore();
      return;
    }
    
    // 2. MODULE REPÈRE ORTHOGONAL 2D
    if (gd.type === 'orthogonal2D' || gd.type === 'orthogonalRelatives') {
      const isRelative = gd.type === 'orthogonalRelatives' || (gd.x < 0 || gd.y < 0);
      const marginLeft = 55, marginRight = 55, marginTop = 35, marginBottom = 45;
      const availW = w - marginLeft - marginRight;
      const availH = h - marginTop - marginBottom;
      
      const originX = isRelative ? marginLeft + availW / 2 : marginLeft + 30;
      const originY = isRelative ? marginTop + availH / 2 : marginTop + availH - 30;
      const scaleX = isRelative ? availW / 12 : availW / 7;
      const scaleY = isRelative ? availH / 12 : availH / 7;
      
      this.cartesianMetrics = { originX, originY, scaleX, scaleY };
      
      ctx.save();
      ctx.strokeStyle = "rgba(0, 240, 255, 0.12)";
      ctx.lineWidth = 1;
      for (let x = originX; x <= w - marginRight; x += scaleX) { ctx.beginPath(); ctx.moveTo(x, marginTop); ctx.lineTo(x, h - marginBottom); ctx.stroke(); }
      for (let x = originX; x >= marginLeft; x -= scaleX) { ctx.beginPath(); ctx.moveTo(x, marginTop); ctx.lineTo(x, h - marginBottom); ctx.stroke(); }
      for (let y = originY; y <= h - marginBottom; y += scaleY) { ctx.beginPath(); ctx.moveTo(marginLeft, y); ctx.lineTo(w - marginRight, y); ctx.stroke(); }
      for (let y = originY; y >= marginTop; y -= scaleY) { ctx.beginPath(); ctx.moveTo(marginLeft, y); ctx.lineTo(w - marginRight, y); ctx.stroke(); }
      
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(marginLeft, originY); ctx.lineTo(w - marginRight, originY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(originX, marginTop); ctx.lineTo(originX, h - marginBottom); ctx.stroke();
      
      const rangeX = isRelative ? 6 : 7;
      const rangeY = isRelative ? 6 : 7;
      for (let i = -rangeX; i <= rangeX; i++) {
        for (let j = -rangeY; j <= rangeY; j++) {
          const gx = originX + i * scaleX;
          const gy = originY - j * scaleY;
          if (gx >= marginLeft && gx <= w - marginRight && gy >= marginTop && gy <= h - marginBottom) {
            this.snapPoints.push({ x: gx, y: gy });
          }
        }
      }
      
      ctx.fillStyle = "#00f0ff";
      ctx.font = "bold 11px 'Fira Code', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      
      const numTicks = isRelative ? 5 : 6;
      for (let i = -numTicks; i <= numTicks; i++) {
        if (i === 0) continue;
        const gx = originX + i * scaleX;
        if (gx >= marginLeft && gx <= w - marginRight) {
          ctx.beginPath(); ctx.moveTo(gx, originY - 4); ctx.lineTo(gx, originY + 4); ctx.stroke();
          ctx.fillText(`${i}`, gx, originY + 7);
        }
      }
      
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let j = -numTicks; j <= numTicks; j++) {
        if (j === 0) continue;
        const gy = originY - j * scaleY;
        if (gy >= marginTop && gy <= h - marginBottom) {
          ctx.beginPath(); ctx.moveTo(originX - 4, gy); ctx.lineTo(originX + 4, gy); ctx.stroke();
          ctx.fillText(`${j}`, originX - 8, gy);
        }
      }
      ctx.fillText("0", originX - 6, originY + 12);
      
      ctx.fillStyle = "#00f0ff";
      ctx.font = "bold 12px 'Fira Code', monospace";
      ctx.fillText("x", w - marginRight + 15, originY + 12);
      ctx.fillText("y", originX - 10, marginTop - 10);
      
      if (gd.scale) {
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 11px 'Fira Code', monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(`Échelle : ${gd.scale}`, marginLeft, marginTop - 15);
      }
      
      if (!gd.hideTarget && gd.x !== undefined && gd.y !== undefined) {
        const targetPx = originX + gd.x * scaleX;
        const targetPy = originY - gd.y * scaleY;
        
        ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(targetPx, originY); ctx.lineTo(targetPx, targetPy); ctx.lineTo(originX, targetPy); ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = "#00f0ff";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(targetPx, targetPy, 6, 0, Math.PI * 2); ctx.fill();
      }
      
      this.drawCompass(ctx, w);
      ctx.restore();
      return;
    }
    
    // 3. MODULE RADAR ALPHANUMÉRIQUE (5x5 OU 8x8)
    const numCols = gd.gridSize || 5;
    const numRows = gd.gridSize || 5;
    const marginLeft = 55, marginRight = 55, marginTop = 25, marginBottom = 45;
    const availW = w - marginLeft - marginRight;
    const availH = h - marginTop - marginBottom;
    const cellW = availW / numCols;
    const cellH = availH / numRows;
    
    this.gridMetrics = { startX: marginLeft, startY: marginTop, cellW, cellH, numRows };
    
    ctx.save();
    ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
    ctx.lineWidth = 1;
    
    for (let c = 0; c <= numCols; c++) {
      const x = marginLeft + c * cellW;
      ctx.beginPath(); ctx.moveTo(x, marginTop); ctx.lineTo(x, marginTop + availH); ctx.stroke();
    }
    for (let r = 0; r <= numRows; r++) {
      const y = marginTop + r * cellH;
      ctx.beginPath(); ctx.moveTo(marginLeft, y); ctx.lineTo(marginLeft + availW, y); ctx.stroke();
    }
    
    for (let c = 0; c < numCols; c++) {
      for (let r = 1; r <= numRows; r++) {
        const cxCell = marginLeft + (c + 0.5) * cellW;
        const cyCell = marginTop + (numRows - r + 0.5) * cellH;
        this.snapPoints.push({ x: cxCell, y: cyCell });
      }
    }
    for (let c = 0; c <= numCols; c++) {
      for (let r = 0; r <= numRows; r++) {
        this.snapPoints.push({ x: marginLeft + c * cellW, y: marginTop + r * cellH });
      }
    }
    
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    ctx.font = "bold 13px 'Fira Code', monospace";
    ctx.fillStyle = "#00f0ff";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let c = 0; c < numCols; c++) {
      ctx.fillText(letters[c], marginLeft + (c + 0.5) * cellW, marginTop + availH + 8);
    }
    
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let r = 0; r < numRows; r++) {
      const lineLabel = `${numRows - r}`;
      ctx.fillText(lineLabel, marginLeft - 12, marginTop + (r + 0.5) * cellH);
    }
    
    const getCellCenter = (colStr, rowNum) => {
      const cIdx = letters.indexOf((colStr || 'A').toUpperCase());
      const rIdx = numRows - rowNum;
      return {
        x: marginLeft + (cIdx + 0.5) * cellW,
        y: marginTop + (rIdx + 0.5) * cellH
      };
    };
    
    if (gd.type === 'crate' && !gd.hideTarget) {
      const pos = getCellCenter(gd.col, gd.row);
      ctx.fillStyle = "rgba(0, 240, 255, 0.15)";
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 2;
      ctx.fillRect(pos.x - cellW * 0.35, pos.y - cellH * 0.35, cellW * 0.7, cellH * 0.7);
      ctx.strokeRect(pos.x - cellW * 0.35, pos.y - cellH * 0.35, cellW * 0.7, cellH * 0.7);
      
      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("📦", pos.x, pos.y);
    }
    
    if (gd.type === 'cardinalPath' || gd.type === 'dronePath2D') {
      const startCol = gd.startCol || gd.col || 'A';
      const startRow = gd.startRow || gd.row || 1;
      const startPos = getCellCenter(startCol, startRow);
      
      ctx.fillStyle = "rgba(0, 240, 255, 0.25)";
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 2;
      ctx.fillRect(startPos.x - cellW * 0.35, startPos.y - cellH * 0.35, cellW * 0.7, cellH * 0.7);
      ctx.strokeRect(startPos.x - cellW * 0.35, startPos.y - cellH * 0.35, cellW * 0.7, cellH * 0.7);
      
      ctx.fillStyle = "#00f0ff";
      ctx.font = "bold 11px 'Fira Code', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("DÉPART", startPos.x, startPos.y);
      
      const titleLower = (quest && quest.title) ? quest.title.toLowerCase() : "";
      const isDestinationQuestion = gd.hideTarget || 
        titleLower.includes("destination") ||
        titleLower.includes("retrait") ||
        titleLower.includes("déplacement") ||
        titleLower.includes("recherche") ||
        titleLower.includes("origine") ||
        titleLower.includes("départ") ||
        titleLower.includes("position") ||
        titleLower.includes("trajet") ||
        titleLower.includes("mesure") ||
        titleLower.includes("trajectoire") ||
        titleLower.includes("plan de vol");
      
      if (gd.endCol && gd.endRow && !isDestinationQuestion) {
        const endPos = getCellCenter(gd.endCol, gd.endRow);
        const cornerPos = (gd.type === 'dronePath2D')
        ? { x: startPos.x, y: endPos.y }
        : { x: endPos.x, y: startPos.y };
        
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        
        ctx.beginPath(); ctx.moveTo(startPos.x, startPos.y); ctx.lineTo(cornerPos.x, cornerPos.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cornerPos.x, cornerPos.y); ctx.lineTo(endPos.x, endPos.y); ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = "#ffd700";
        ctx.beginPath(); ctx.arc(endPos.x, endPos.y, 5, 0, Math.PI * 2); ctx.fill();
      }
    }
    
    this.drawCompass(ctx, w);
    ctx.restore();
  },
  
  drawWorld2Laser(w, h, quest) {
    const ctx = this.ctx;
    if (!ctx) return;
    
    const cx = w / 2;
    const cy = h / 2;
    let targetCenter = { x: cx, y: cy };
    const gd = quest ? quest.geoData : null;
    
    const crosshairSkin = (typeof SHOP_SKINS !== 'undefined' && this.equippedSkins)
      ? (SHOP_SKINS.find(s => s.id === this.equippedSkins.crosshair) || { color: "#00ff66", renderStyle: "classic" })
      : { color: "#00ff66", renderStyle: "classic" };
    const laserColor = crosshairSkin.color || "#00ff66";
    
    if (!this.snapPoints) this.snapPoints = [];
    this.snapPoints.length = 0;
    
    ctx.clearRect(0, 0, w, h);
    
    ctx.strokeStyle = "rgba(0, 255, 102, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) * 0.38, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) * 0.22, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - w * 0.4, cy); ctx.lineTo(cx + w * 0.4, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - h * 0.4); ctx.lineTo(cx, cy + h * 0.4); ctx.stroke();
    
    ctx.save();
    const type = gd ? gd.type : 'angleType';
    
    if (type === 'shapeIdent') {
      const shapeRaw = (gd.shape || 'Triangle').toString();
      const shapeNorm = shapeRaw.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const size = Math.min(w, h) * 0.28;
      
      ctx.strokeStyle = laserColor;
      ctx.fillStyle = "rgba(0, 240, 255, 0.15)";
      ctx.lineWidth = 3;
      ctx.shadowColor = laserColor;
      ctx.shadowBlur = 12;
      
      ctx.beginPath();
      if (shapeNorm.includes("TRIANGLE RECTANGLE")) {
        const p1 = { x: cx - size, y: cy + size * 0.7 };
        const p2 = { x: cx + size, y: cy + size * 0.7 };
        const p3 = { x: cx - size, y: cy - size * 0.7 };
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        ctx.strokeStyle = "#ffe600"; ctx.lineWidth = 2;
        ctx.strokeRect(p1.x, p1.y - 16, 16, 16);
        this.snapPoints.push(p1, p2, p3);
      } else if (shapeNorm.includes("TRIANGLE")) {
        const p1 = { x: cx, y: cy - size };
        const p2 = { x: cx - size, y: cy + size * 0.7 };
        const p3 = { x: cx + size, y: cy + size * 0.7 };
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
        ctx.fill(); ctx.stroke();
        this.snapPoints.push(p1, p2, p3);
      } else if (shapeNorm.includes("CARRE") || shapeNorm.includes("SQUARE")) {
        const side = size * 0.7;
        const p1 = { x: cx - side, y: cy - side };
        const p2 = { x: cx + side, y: cy - side };
        const p3 = { x: cx + side, y: cy + side };
        const p4 = { x: cx - side, y: cy + side };
        ctx.rect(p1.x, p1.y, side * 2, side * 2);
        ctx.fill(); ctx.stroke();
        this.snapPoints.push(p1, p2, p3, p4);
      } else if (shapeNorm.includes("RECTANGLE")) {
        const p1 = { x: cx - size, y: cy - size * 0.6 };
        const p2 = { x: cx + size, y: cy - size * 0.6 };
        const p3 = { x: cx + size, y: cy + size * 0.6 };
        const p4 = { x: cx - size, y: cy + size * 0.6 };
        ctx.rect(p1.x, p1.y, size * 2, size * 1.2);
        ctx.fill(); ctx.stroke();
        this.snapPoints.push(p1, p2, p3, p4);
      } else if (shapeNorm.includes("CERCLE")) {
        ctx.arc(cx, cy, size * 0.8, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        this.snapPoints.push({ x: cx, y: cy }, { x: cx + size * 0.8, y: cy }, { x: cx - size * 0.8, y: cy });
      } else {
        const side = size * 0.7;
        const p1 = { x: cx - side, y: cy - side };
        const p2 = { x: cx + side, y: cy - side };
        const p3 = { x: cx + side, y: cy + side };
        const p4 = { x: cx - side, y: cy + side };
        ctx.rect(p1.x, p1.y, side * 2, side * 2);
        ctx.fill(); ctx.stroke();
        this.snapPoints.push(p1, p2, p3, p4);
      }
    }
    else if (type === 'quadProps') {
      const shapeRaw = (gd.shape || 'Rectangle').toString();
      const shapeNorm = shapeRaw.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const qw = Math.min(w, h) * 0.32;
      const qh = Math.min(w, h) * 0.22;
      
      ctx.strokeStyle = laserColor;
      ctx.fillStyle = "rgba(0, 240, 255, 0.15)";
      ctx.lineWidth = 3;
      ctx.shadowColor = laserColor;
      ctx.shadowBlur = 12;
      
      ctx.beginPath();
      if (shapeNorm.includes("CARRE") || shapeNorm.includes("SQUARE")) {
        const side = qh;
        const p1 = { x: cx - side, y: cy - side }, p2 = { x: cx + side, y: cy - side }, p3 = { x: cx + side, y: cy + side }, p4 = { x: cx - side, y: cy + side };
        ctx.rect(p1.x, p1.y, side * 2, side * 2);
        ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "#ffe600"; ctx.lineWidth = 2;
        ctx.strokeRect(p1.x, p4.y - 14, 14, 14);
        this.snapPoints.push(p1, p2, p3, p4, { x: cx, y: cy });
      } else if (shapeNorm.includes("RECTANGLE")) {
        const p1 = { x: cx - qw, y: cy - qh }, p2 = { x: cx + qw, y: cy - qh }, p3 = { x: cx + qw, y: cy + qh }, p4 = { x: cx - qw, y: cy + qh };
        ctx.rect(p1.x, p1.y, qw * 2, qh * 2);
        ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "#ffe600"; ctx.lineWidth = 2;
        ctx.strokeRect(p1.x, p4.y - 14, 14, 14);
        this.snapPoints.push(p1, p2, p3, p4, { x: cx, y: cy });
      } else if (shapeNorm.includes("LOSANGE")) {
        const p1 = { x: cx, y: cy - qh * 1.2 };
        const p2 = { x: cx + qw, y: cy };
        const p3 = { x: cx, y: cy + qh * 1.2 };
        const p4 = { x: cx - qw, y: cy };
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.closePath();
        ctx.fill(); ctx.stroke();
        this.snapPoints.push(p1, p2, p3, p4, { x: cx, y: cy });
      } else if (shapeNorm.includes("PARALLELOGRAMME")) {
        const skew = 25;
        const p1 = { x: cx - qw + skew, y: cy - qh };
        const p2 = { x: cx + qw + skew, y: cy - qh };
        const p3 = { x: cx + qw - skew, y: cy + qh };
        const p4 = { x: cx - qw - skew, y: cy + qh };
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.closePath();
        ctx.fill(); ctx.stroke();
        this.snapPoints.push(p1, p2, p3, p4, { x: cx, y: cy });
      } else {
        const p1 = { x: cx - qw, y: cy - qh }, p2 = { x: cx + qw, y: cy - qh }, p3 = { x: cx + qw, y: cy + qh }, p4 = { x: cx - qw, y: cy + qh };
        ctx.rect(p1.x, p1.y, qw * 2, qh * 2);
        ctx.fill(); ctx.stroke();
        this.snapPoints.push(p1, p2, p3, p4, { x: cx, y: cy });
      }
    }
    else if (type === 'triangleClass') {
      const shapeRaw = (gd.shape || 'Triangle rectangle').toString();
      const shapeNorm = shapeRaw.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const tSize = Math.min(w, h) * 0.28;
      
      ctx.strokeStyle = laserColor;
      ctx.fillStyle = "rgba(0, 240, 255, 0.15)";
      ctx.lineWidth = 3;
      ctx.shadowColor = laserColor;
      ctx.shadowBlur = 12;
      
      ctx.beginPath();
      if (shapeNorm.includes("RECTANGLE") && shapeNorm.includes("ISOCELE")) {
        const p1 = { x: cx - tSize, y: cy + tSize };
        const p2 = { x: cx + tSize, y: cy + tSize };
        const p3 = { x: cx - tSize, y: cy - tSize };
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        ctx.strokeStyle = "#ffe600"; ctx.lineWidth = 2;
        ctx.strokeRect(p1.x, p1.y - 16, 16, 16);
        
        ctx.beginPath();
        ctx.moveTo(cx - tSize / 2 - 4, cy + tSize - 6); ctx.lineTo(cx - tSize / 2 + 4, cy + tSize + 6);
        ctx.moveTo(cx - tSize - 6, cy - 4); ctx.lineTo(cx - tSize + 6, cy + 4);
        ctx.stroke();
        
        this.snapPoints.push(p1, p2, p3);
      } else if (shapeNorm.includes("RECTANGLE")) {
        const p1 = { x: cx - tSize * 1.2, y: cy + tSize * 0.8 };
        const p2 = { x: cx + tSize * 0.8, y: cy + tSize * 0.8 };
        const p3 = { x: cx - tSize * 1.2, y: cy - tSize * 0.8 };
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        ctx.strokeStyle = "#ffe600"; ctx.lineWidth = 2;
        ctx.strokeRect(p1.x, p1.y - 16, 16, 16);
        this.snapPoints.push(p1, p2, p3);
      } else if (shapeNorm.includes("ISOCELE")) {
        const p1 = { x: cx, y: cy - tSize * 1.1 };
        const p2 = { x: cx - tSize * 0.8, y: cy + tSize };
        const p3 = { x: cx + tSize * 0.8, y: cy + tSize };
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        ctx.strokeStyle = "#ffe600"; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - tSize * 0.4 - 5, cy - tSize * 0.05); ctx.lineTo(cx - tSize * 0.4 + 5, cy - tSize * 0.05 + 5);
        ctx.moveTo(cx + tSize * 0.4 - 5, cy - tSize * 0.05 + 5); ctx.lineTo(cx + tSize * 0.4 + 5, cy - tSize * 0.05);
        ctx.stroke();
        
        this.snapPoints.push(p1, p2, p3);
      } else {
        const p1 = { x: cx, y: cy - tSize * 1.15 };
        const p2 = { x: cx - tSize, y: cy + tSize * 0.7 };
        const p3 = { x: cx + tSize, y: cy + tSize * 0.7 };
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        ctx.strokeStyle = "#ffe600"; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - tSize * 0.5 - 4, cy - tSize * 0.2); ctx.lineTo(cx - tSize * 0.5 + 4, cy - tSize * 0.2 + 4);
        ctx.moveTo(cx + tSize * 0.5 - 4, cy - tSize * 0.2 + 4); ctx.lineTo(cx + tSize * 0.5 + 4, cy - tSize * 0.2);
        ctx.moveTo(cx - 4, cy + tSize * 0.7 - 5); ctx.lineTo(cx + 4, cy + tSize * 0.7 + 5);
        ctx.stroke();
        
        this.snapPoints.push(p1, p2, p3);
      }
    }
    else if (type === 'circleRadius') {
      const r = Math.min(w, h) * 0.28;
      
      ctx.strokeStyle = laserColor;
      ctx.fillStyle = "rgba(0, 240, 255, 0.1)";
      ctx.lineWidth = 3;
      ctx.shadowColor = laserColor;
      ctx.shadowBlur = 12;
      
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      
      ctx.fillStyle = "#ffe600";
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.font = "bold 12px 'Fira Code', monospace";
      ctx.fillText("O", cx - 14, cy - 10);
      
      ctx.strokeStyle = "#ffe600"; ctx.lineWidth = 2.5;
      if (gd && gd.showMode === 'diameter') {
        ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
        ctx.fillStyle = "#ffe600";
        ctx.fillText(`Diamètre D = ${gd.d} m`, cx - 45, cy - 12);
        this.snapPoints.push({ x: cx, y: cy }, { x: cx - r, y: cy }, { x: cx + r, y: cy });
      } else {
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
        ctx.fillStyle = "#ffe600";
        ctx.fillText(`Rayon R = ${gd.r} m`, cx + r / 2 - 25, cy - 12);
        this.snapPoints.push({ x: cx, y: cy }, { x: cx + r, y: cy });
      }
    }
    else if (type === 'angleType') {
      const deg = gd ? gd.deg : 90;
      const rad = (deg * Math.PI) / 180;
      const len = 140;
      const vx = cx - 40;
      const vy = cy + 30;
      targetCenter = { x: vx, y: vy };
      
      ctx.save();
      ctx.translate(vx, vy);
      
      ctx.strokeStyle = laserColor; ctx.lineWidth = 3;
      ctx.shadowColor = laserColor; ctx.shadowBlur = 12;
      
      if (deg === 180) {
        ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(len, 0); ctx.stroke();
        ctx.strokeStyle = "#ffe600"; ctx.lineWidth = 2; ctx.shadowColor = "#ffe600";
        ctx.beginPath(); ctx.arc(0, 0, 42, Math.PI, 0, false); ctx.stroke();
        
        ctx.fillStyle = "#ffe600"; ctx.font = "bold 15px 'Fira Code', monospace";
        ctx.fillText("?", -5, -50);
      } else {
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len * Math.cos(-rad), len * Math.sin(-rad)); ctx.stroke();
        
        ctx.strokeStyle = "#ffe600"; ctx.lineWidth = 2; ctx.shadowColor = "#ffe600";
        const arcR = Math.min(len * 0.35, 42);
        ctx.beginPath(); ctx.arc(0, 0, arcR, 0, -rad, true); ctx.stroke();
        
        if (deg === 90) {
          ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 2;
          ctx.strokeRect(0, -18, 18, 18);
        } else {
          ctx.fillStyle = "#ffe600"; ctx.font = "bold 15px 'Fira Code', monospace";
          ctx.fillText("?", (arcR + 12) * Math.cos(-rad / 2), (arcR + 12) * Math.sin(-rad / 2));
        }
      }
      
      ctx.restore();
      
      this.snapPoints.push({ x: vx, y: vy });
      this.snapPoints.push({ x: vx + len, y: vy });
      this.snapPoints.push({ x: vx + len * Math.cos(-rad), y: vy + len * Math.sin(-rad) });
    }
    else if (type === 'diagProps') {
      const shapeRaw = (gd && gd.shape ? gd.shape : 'Rectangle').toString();
      const shapeNorm = shapeRaw.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const sz = Math.min(w, h) * 0.26;
      
      ctx.strokeStyle = "rgba(0, 240, 255, 0.35)"; ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(0, 240, 255, 0.08)";
      
      let vertices = [];
      let isPerpendicular = false;
      
      if (shapeNorm.includes("CARRE") || shapeNorm.includes("SQUARE")) {
        const side = sz * 0.85;
        vertices = [
          { x: cx - side, y: cy - side },
          { x: cx + side, y: cy - side },
          { x: cx + side, y: cy + side },
          { x: cx - side, y: cy + side }
        ];
        isPerpendicular = true;
      } else if (shapeNorm.includes("LOSANGE")) {
        const dx = sz * 1.1;
        const dy = sz * 0.65;
        vertices = [
          { x: cx, y: cy - dy },
          { x: cx + dx, y: cy },
          { x: cx, y: cy + dy },
          { x: cx - dx, y: cy }
        ];
        isPerpendicular = true;
      } else if (shapeNorm.includes("PARALLELOGRAMME")) {
        const dx = sz * 1.1;
        const dy = sz * 0.6;
        const skew = 35;
        vertices = [
          { x: cx - dx + skew, y: cy - dy },
          { x: cx + dx + skew, y: cy - dy },
          { x: cx + dx - skew, y: cy + dy },
          { x: cx - dx - skew, y: cy + dy }
        ];
      } else {
        const dx = sz * 1.2;
        const dy = sz * 0.65;
        vertices = [
          { x: cx - dx, y: cy - dy },
          { x: cx + dx, y: cy - dy },
          { x: cx + dx, y: cy + dy },
          { x: cx - dx, y: cy + dy }
        ];
      }
      
      ctx.beginPath();
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y);
      }
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      
      ctx.strokeStyle = laserColor; ctx.lineWidth = 3;
      ctx.shadowColor = laserColor; ctx.shadowBlur = 12;
      
      ctx.beginPath(); ctx.moveTo(vertices[0].x, vertices[0].y); ctx.lineTo(vertices[2].x, vertices[2].y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(vertices[1].x, vertices[1].y); ctx.lineTo(vertices[3].x, vertices[3].y); ctx.stroke();
      
      if (isPerpendicular) {
        ctx.strokeStyle = "#ffe600"; ctx.lineWidth = 2;
        ctx.strokeRect(cx - 8, cy - 8, 16, 16);
      }
      
      ctx.fillStyle = "#ffe600";
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
      
      vertices.forEach(v => this.snapPoints.push(v));
      this.snapPoints.push({ x: cx, y: cy });
    }
    else if (type === 'triangleSum') {
      const tSize = Math.min(w, h) * 0.28;
      const aVal = gd ? (gd.angleA || 38) : 38;
      const bVal = gd ? (gd.angleB || 77) : 77;
      
      const radA = (aVal * Math.PI) / 180;
      const radB = (bVal * Math.PI) / 180;
      const radSum = Math.min(radA + radB, Math.PI - 0.08);
      
      const baseLen = tSize * 2.2;
      const p2 = { x: cx - baseLen / 2, y: cy + tSize * 0.65 };
      const p3 = { x: cx + baseLen / 2, y: cy + tSize * 0.65 };
      
      const hTri = Math.min(h * 0.45, baseLen * (Math.sin(radA) * Math.sin(radB)) / Math.sin(radSum));
      const xOffset = baseLen * (Math.cos(radA) * Math.sin(radB)) / Math.sin(radSum);
      const p1 = {
        x: Math.max(30, Math.min(w - 30, p2.x + xOffset)),
        y: Math.max(30, Math.min(p2.y - 20, p2.y - hTri))
      };
      
      ctx.strokeStyle = laserColor; ctx.lineWidth = 3;
      ctx.shadowColor = laserColor; ctx.shadowBlur = 12;
      ctx.fillStyle = "rgba(0, 240, 255, 0.1)";
      
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
      ctx.fill(); ctx.stroke();
      
      ctx.strokeStyle = "#ffe600"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p2.x, p2.y, 28, 0, -radA, true); ctx.stroke();
      ctx.beginPath(); ctx.arc(p3.x, p3.y, 28, Math.PI, Math.PI + radB, false); ctx.stroke();
      
      ctx.fillStyle = "#ffe600"; ctx.font = "bold 13px 'Fira Code', monospace";
      ctx.fillText(`${aVal}°`, p2.x + 32, p2.y - 8);
      ctx.fillText(`${bVal}°`, p3.x - 52, p3.y - 8);
      
      ctx.fillStyle = "#ff0055"; ctx.font = "bold 18px 'Fira Code', monospace";
      ctx.shadowColor = "#ff0055"; ctx.shadowBlur = 8;
      ctx.fillText("?", p1.x - 5, p1.y + 24);
      
      this.snapPoints.push(p1, p2, p3);
    }
    else if (type === 'trigoCos') {
      const tw = Math.min(w, h) * 0.35;
      const th = Math.min(w, h) * 0.22;
      const pA = { x: cx - tw, y: cy + th };
      const pB = { x: cx + tw, y: cy + th };
      const pC = { x: cx - tw, y: cy - th };
      
      ctx.strokeStyle = laserColor; ctx.lineWidth = 3;
      ctx.shadowColor = laserColor; ctx.shadowBlur = 12;
      ctx.fillStyle = "rgba(0, 240, 255, 0.1)";
      
      ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.lineTo(pC.x, pC.y); ctx.closePath();
      ctx.fill(); ctx.stroke();
      
      ctx.strokeStyle = "#ffe600"; ctx.lineWidth = 2;
      ctx.strokeRect(pA.x, pA.y - 16, 16, 16);
      
      ctx.fillStyle = "#ffe600"; ctx.font = "bold 13px 'Fira Code', monospace";
      ctx.fillText("A", pA.x - 18, pA.y + 15);
      ctx.fillText("B", pB.x + 10, pB.y + 5);
      ctx.fillText("C", pC.x - 18, pC.y - 10);
      
      const targetLeg = gd ? (gd.targetLeg || 'hypotenuse') : 'hypotenuse';
      const hypLabel = (targetLeg === 'hypotenuse' || targetLeg === 'BC') ? 'Hypoténuse [BC] = ?' : `Hypoténuse [BC] = ${gd.bc || gd.hyp || 10} cm`;
      const adjLabel = (targetLeg === 'AB' || targetLeg === 'adj') ? 'Côté adjacent [AB] = ?' : `Côté adjacent [AB] = ${gd.ab || gd.adj || 3} cm`;
      
      ctx.fillStyle = "#00f0ff";
      ctx.fillText(hypLabel, cx - 35, cy - 12);
      if (gd && gd.cosVal && targetLeg !== 'formula') {
        ctx.fillText(`cos(B) = ${gd.cosVal}`, pB.x - 65, pB.y - 15);
      }
      
      ctx.fillStyle = "#ff0055"; ctx.font = "bold 13px 'Fira Code', monospace";
      ctx.fillText(adjLabel, cx - 50, pA.y + 22);
      
      this.snapPoints.push(pA, pB, pC);
    }
    else if (type === 'thalesTheorem' || type === 'thales') {
      const isButterfly = gd ? !!gd.isButterfly : false;
      const spreadX = Math.min(w, h) * 0.32;
      const spreadY = Math.min(w, h) * 0.22;
      
      if (isButterfly) {
        const A = { x: cx, y: cy };
        const B = { x: cx - spreadX, y: cy - spreadY };
        const M = { x: cx + spreadX, y: cy - spreadY };
        const N = { x: cx - spreadX, y: cy + spreadY };
        const C = { x: cx + spreadX, y: cy + spreadY };
        
        ctx.strokeStyle = laserColor; ctx.lineWidth = 2.5; ctx.shadowColor = laserColor; ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(B.x, B.y); ctx.lineTo(C.x, C.y);
        ctx.moveTo(N.x, N.y); ctx.lineTo(M.x, M.y);
        ctx.stroke();
        
        ctx.strokeStyle = "#00ff66"; ctx.lineWidth = 3; ctx.shadowColor = "#00ff66";
        ctx.beginPath();
        ctx.moveTo(B.x - 15, B.y); ctx.lineTo(M.x + 15, M.y);
        ctx.moveTo(N.x - 15, N.y); ctx.lineTo(C.x + 15, C.y);
        ctx.stroke();
        
        [A, B, C, M, N].forEach(p => {
          ctx.fillStyle = "#ff0055";
          ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
          this.snapPoints.push(p);
        });
        
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 13px 'Fira Code', monospace";
        ctx.fillText("A", A.x + 10, A.y - 10);
        ctx.fillText("B", B.x - 18, B.y - 10);
        ctx.fillText("M", M.x + 10, M.y - 10);
        ctx.fillText("N", N.x - 18, N.y + 18);
        ctx.fillText("C", C.x + 10, C.y + 18);
        
        if (gd) {
          ctx.font = "bold 11px 'Fira Code', monospace"; ctx.fillStyle = "#ffd700";
          ctx.fillText(`AB = ${gd.ab || '?'} cm`, (A.x + B.x) / 2 - 14, (A.y + B.y) / 2);
          ctx.fillText(`AM = ${gd.am || '?'} cm`, (A.x + M.x) / 2 + 14, (A.y + M.y) / 2);
          ctx.fillText(`AC = ${gd.ac || '?'} cm`, (A.x + C.x) / 2 + 14, (A.y + C.y) / 2);
          ctx.fillText(`AN = ?`, (A.x + N.x) / 2 - 14, (A.y + N.y) / 2);
        }
      } else {
        const A = { x: cx - 130, y: cy - 90 };
        const B = { x: cx - 40,  y: cy + 10 };
        const M = { x: cx + 10,  y: cy + 80 };
        const C = { x: cx + 110, y: cy + 10 };
        const N = { x: cx + 170, y: cy + 80 };
        
        ctx.strokeStyle = laserColor; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y); ctx.lineTo(M.x, M.y);
        ctx.moveTo(A.x, A.y); ctx.lineTo(N.x, N.y);
        ctx.stroke();
        
        ctx.strokeStyle = "#00ff66"; ctx.lineWidth = 2.5; ctx.shadowColor = "#00ff66"; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.moveTo(B.x - 20, B.y); ctx.lineTo(C.x + 20, C.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(M.x - 20, M.y); ctx.lineTo(N.x + 20, N.y); ctx.stroke();
        
        [{ p: A, l: 'A' }, { p: B, l: 'B' }, { p: C, l: 'C' }, { p: M, l: 'M' }, { p: N, l: 'N' }].forEach(v => {
          ctx.fillStyle = "#ff0055";
          ctx.beginPath(); ctx.arc(v.p.x, v.p.y, 4.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#ffffff"; ctx.font = "bold 12px 'Fira Code', monospace";
          ctx.fillText(v.l, v.p.x + 8, v.p.y - 8);
          this.snapPoints.push(v.p);
        });
        
        if (gd) {
          ctx.font = "bold 11px 'Fira Code', monospace"; ctx.fillStyle = "#ffd700";
          ctx.fillText(`AB = ${gd.ab || '?'} cm`, (A.x + B.x) / 2 - 35, (A.y + B.y) / 2);
          ctx.fillText(`AM = ${gd.am || '?'} cm`, (A.x + M.x) / 2 - 40, (A.y + M.y) / 2 + 15);
          ctx.fillText(`AC = ${gd.ac || '?'} cm`, (A.x + C.x) / 2 + 10, (A.y + C.y) / 2);
          ctx.fillText(`AN = ?`, (A.x + N.x) / 2 + 15, (A.y + N.y) / 2 + 15);
        }
      }
    }
    else if (type === 'sphereSection') {
      const r = Math.min(w, h) * 0.32;
      const distD = r * 0.45;
      const rSec = Math.sqrt(r * r - distD * distD);
      
      ctx.fillStyle = "rgba(0, 240, 255, 0.08)";
      ctx.strokeStyle = laserColor; ctx.lineWidth = 2.5; ctx.shadowColor = laserColor; ctx.shadowBlur = 10;
      
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.28, 0, 0, Math.PI * 2); ctx.stroke();
      
      const secY = cy - distD;
      ctx.fillStyle = "rgba(255, 0, 85, 0.25)";
      ctx.strokeStyle = "#ff0055"; ctx.lineWidth = 2.5; ctx.shadowColor = "#ff0055"; ctx.shadowBlur = 12;
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.ellipse(cx, secY, rSec, rSec * 0.28, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      
      ctx.fillStyle = "#ffe600"; ctx.strokeStyle = "#ffe600"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillText("O", cx - 14, cy + 5);
      
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, secY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, secY); ctx.lineTo(cx + rSec, secY); ctx.stroke();
      ctx.strokeStyle = "#00ff66";
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + rSec, secY); ctx.stroke();
      
      ctx.font = "bold 11px 'Fira Code', monospace";
      ctx.fillText(`d = ${gd ? gd.d || '?' : '?'} cm`, cx - 45, cy - distD / 2);
      ctx.fillText(`r = ?`, cx + rSec / 2 - 10, secY - 8);
      ctx.fillStyle = "#00ff66";
      ctx.fillText(`R = ${gd ? gd.R || '?' : '?'} cm`, cx + rSec / 2 + 10, cy - distD / 2 + 12);
      
      this.snapPoints.push({ x: cx, y: cy }, { x: cx, y: secY }, { x: cx + rSec, y: secY }, { x: cx + r, y: cy });
    }
    else {
      ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 18;
      ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 3;
      const size = Math.min(w, h) * 0.35;
      ctx.beginPath(); ctx.rect(cx - size / 2, cy - size / 2, size, size);
      ctx.fill(); ctx.stroke();
      this.snapPoints.push(
        { x: cx - size / 2, y: cy - size / 2 },
        { x: cx + size / 2, y: cy - size / 2 },
        { x: cx + size / 2, y: cy + size / 2 },
        { x: cx - size / 2, y: cy + size / 2 }
      );
    }
    
    // --- HUD VISEUR SURIMPOSÉ DE PRÉCISION AAA ---
    ctx.save();
    const style = crosshairSkin.renderStyle || 'classic';
    const rColor = crosshairSkin.color || '#00ff66';
    const hX = targetCenter.x;
    const hY = targetCenter.y;

    if (style === 'spider_sense') {
      ctx.strokeStyle = rColor;
      ctx.fillStyle = rColor;
      ctx.shadowColor = rColor;
      ctx.shadowBlur = 14;

      for (let r = 30; r <= 90; r += 30) {
        ctx.beginPath();
        ctx.arc(hX, hY, r, 0, Math.PI * 2);
        ctx.lineWidth = r === 90 ? 2 : 1;
        ctx.setLineDash(r === 60 ? [6, 6] : []);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.moveTo(hX + Math.cos(a) * 20, hY + Math.sin(a) * 20);
        ctx.lineTo(hX + Math.cos(a) * 95, hY + Math.sin(a) * 95);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const pulse = 7 + Math.sin(Date.now() * 0.005) * 4;
      ctx.beginPath(); ctx.arc(hX, hY, pulse, 0, Math.PI * 2); ctx.fill();

    } else if (style === 'dino_tracker') {
      ctx.strokeStyle = rColor;
      ctx.shadowColor = rColor;
      ctx.shadowBlur = 12;
      ctx.lineWidth = 1.5;

      const boxS = 85;
      const bLen = 18;
      ctx.beginPath(); ctx.moveTo(hX - boxS, hY - boxS + bLen); ctx.lineTo(hX - boxS, hY - boxS); ctx.lineTo(hX - boxS + bLen, hY - boxS); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hX + boxS - bLen, hY - boxS); ctx.lineTo(hX + boxS, hY - boxS); ctx.lineTo(hX + boxS, hY - boxS + bLen); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hX - boxS, hY + boxS - bLen); ctx.lineTo(hX - boxS, hY + boxS); ctx.lineTo(hX - boxS + bLen, hY + boxS); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hX + boxS - bLen, hY + boxS); ctx.lineTo(hX + boxS, hY + boxS); ctx.lineTo(hX + boxS, hY + boxS - bLen); ctx.stroke();

      const scanAngle = (Date.now() * 0.002) % (Math.PI * 2);
      ctx.beginPath(); ctx.arc(hX, hY, boxS * 0.8, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(hX, hY, boxS * 0.4, 0, Math.PI * 2); ctx.stroke();

      ctx.beginPath(); ctx.moveTo(hX, hY); ctx.lineTo(hX + Math.cos(scanAngle) * boxS * 0.8, hY + Math.sin(scanAngle) * boxS * 0.8); ctx.stroke();

      ctx.font = "bold 9px 'Fira Code', monospace";
      ctx.fillStyle = rColor;
      ctx.fillText("INGEN_THERMAL // LOCK_ON", hX - boxS, hY - boxS - 6);

    } else if (style === 'diablo_rune') {
      const rRad = 75;
      const rot = Date.now() * 0.001;

      ctx.strokeStyle = rColor;
      ctx.shadowColor = rColor;
      ctx.shadowBlur = 16;
      ctx.lineWidth = 2;

      ctx.beginPath(); ctx.arc(hX, hY, rRad, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(hX, hY, rRad - 8, 0, Math.PI * 2); ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a1 = rot + (i * Math.PI * 2 * 2) / 5;
        const px = hX + Math.cos(a1) * (rRad - 10);
        const py = hY + Math.sin(a1) * (rRad - 10);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = rColor;
      ctx.beginPath(); ctx.arc(hX, hY, 5, 0, Math.PI * 2); ctx.fill();

    } else if (style === 'dragon_lore') {
      const scopeR = 85;
      ctx.strokeStyle = rColor;
      ctx.shadowColor = rColor;
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2;

      ctx.beginPath(); ctx.arc(hX, hY, scopeR, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(hX, hY, scopeR + 6, 0, Math.PI * 2); ctx.stroke();

      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(hX - scopeR - 15, hY); ctx.lineTo(hX + scopeR + 15, hY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hX, hY - scopeR - 15); ctx.lineTo(hX, hY + scopeR + 15); ctx.stroke();

      ctx.fillStyle = rColor;
      for (let d = -60; d <= 60; d += 20) {
        if (d === 0) continue;
        ctx.beginPath(); ctx.arc(hX + d, hY, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(hX, hY + d, 2, 0, Math.PI * 2); ctx.fill();
      }

      ctx.beginPath();
      ctx.moveTo(hX, hY - 6); ctx.lineTo(hX + 6, hY); ctx.lineTo(hX, hY + 6); ctx.lineTo(hX - 6, hY);
      ctx.closePath();
      ctx.stroke();

    } else {
      const size = 35;
      ctx.strokeStyle = rColor;
      ctx.shadowColor = rColor;
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(hX - size, hY); ctx.lineTo(hX - 8, hY);
      ctx.moveTo(hX + 8, hY); ctx.lineTo(hX + size, hY);
      ctx.moveTo(hX, hY - size); ctx.lineTo(hX, hY - 8);
      ctx.moveTo(hX, hY + 8); ctx.lineTo(hX, hY + size);
      ctx.stroke();

      ctx.beginPath(); ctx.arc(hX, hY, size * 0.7, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = rColor;
      ctx.beginPath(); ctx.arc(hX, hY, 2.5, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
    ctx.restore();
  },
  
  drawWorld3Hitbox(w, h, quest) {
    const ctx = this.ctx;
    if (!ctx) return;
    const cx = w / 2;
    const cy = h / 2;
    const gd = quest ? quest.geoData : null;
    const time = Date.now() * 0.003;
    
    // Fond géré par le skin de canvas équipé
    
    if (!this.snapPoints) this.snapPoints = [];
    this.snapPoints.length = 0;
    
    ctx.save();
    const type = gd ? (gd.type || '') : '';
    
    if (type === 'alignmentCheck') {
      const p1Name = gd.p1 || 'K';
      const p2Name = gd.p2 || 'Q';
      const p3Name = gd.p3 || 'R';
      const isAligned = gd.isAligned !== false;
      
      const p1 = { x: cx - 150, y: cy + 45 };
      const p2 = { x: cx + 150, y: cy - 45 };
      const p3 = isAligned 
      ? { x: cx, y: cy } 
      : { x: cx + 20, y: cy - 40 };
      
      const pulseGlow = 10 + Math.sin(time * 4) * 4;
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = pulseGlow;
      ctx.beginPath();
      ctx.moveTo(p1.x - 50, p1.y + 15);
      ctx.lineTo(p2.x + 50, p2.y - 15);
      ctx.stroke();
      
      // Rendu neutre sans couleur vert/rouge spoiler avant validation
      const points = [
        { pos: p1, label: p1Name, color: '#00f0ff' },
        { pos: p2, label: p2Name, color: '#00f0ff' },
        { pos: p3, label: p3Name, color: '#00f0ff', isTarget: true }
      ];
      
      points.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, p.isTarget ? 7 : 6, 0, Math.PI * 2);
        ctx.fill();
        
        if (p.isTarget) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          const rPulse = 12 + Math.cos(time * 5) * 3;
          ctx.beginPath(); ctx.arc(p.pos.x, p.pos.y, rPulse, 0, Math.PI * 2); ctx.stroke();
        }
        
        ctx.font = "bold 14px 'Fira Code', monospace";
        ctx.fillText(p.label, p.pos.x - 5, p.pos.y - 14);
        this.snapPoints.push(p.pos);
      });
      
      this.snapPoints.push(
        { x: p1.x - 50, y: p1.y + 15 },
        { x: p2.x + 50, y: p2.y - 15 }
      );
    }
    else if (type === 'notationsCheck') {
      const p1Name = gd.p1 || 'A';
      const p2Name = gd.p2 || 'B';
      const targetType = gd.targetType || 'segment';
      
      const p1 = { x: cx - 130, y: cy };
      const p2 = { x: cx + 130, y: cy };
      
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      
      if (targetType === 'segment') {
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y - 12); ctx.lineTo(p1.x, p1.y + 12);
        ctx.moveTo(p2.x, p2.y - 12); ctx.lineTo(p2.x, p2.y + 12);
        ctx.stroke();
      } 
      else if (targetType === 'droite') {
        ctx.beginPath(); ctx.moveTo(p1.x - 60, p1.y); ctx.lineTo(p2.x + 60, p2.y); ctx.stroke();
      } 
      else if (targetType === 'demi-droite') {
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x + 70, p2.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y - 12); ctx.lineTo(p1.x, p1.y + 12); ctx.stroke();
      } 
      else {
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        
        const pulseY = cy + 28 + Math.sin(time * 3) * 2;
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5; ctx.shadowColor = '#ffd700';
        ctx.beginPath(); ctx.moveTo(p1.x, pulseY); ctx.lineTo(p2.x, pulseY); ctx.stroke();
        
        ctx.font = "bold 12px 'Fira Code', monospace";
        ctx.fillStyle = '#ffd700'; ctx.textAlign = 'center';
        ctx.fillText("d = 45 m", cx, pulseY + 16);
      }
      
      [{ pos: p1, name: p1Name }, { pos: p2, name: p2Name }].forEach(p => {
        ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(p.pos.x, p.pos.y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.font = "bold 14px 'Fira Code', monospace"; ctx.fillStyle = '#00f0ff';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, p.pos.x, p.pos.y - 14);
        this.snapPoints.push(p.pos);
      });
      
      this.snapPoints.push(
        { x: p1.x - 60, y: p1.y },
        { x: p2.x + 70, y: p2.y }
      );
    }
    else if (type === 'rightAngleCheck') {
      const d1 = gd.d1 || '(d_1)';
      const d2 = gd.d2 || '(d_2)';
      const isPerp = gd.isPerpendicular !== false;
      
      ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2.5; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(cx - 150, cy); ctx.lineTo(cx + 150, cy); ctx.stroke();
      
      const angleRad = isPerp ? Math.PI / 2 : ((gd.deg || 60) * Math.PI) / 180;
      const len = 135;
      
      ctx.strokeStyle = '#b026ff'; ctx.shadowColor = '#b026ff';
      ctx.beginPath();
      ctx.moveTo(cx - len * Math.cos(angleRad), cy + len * Math.sin(angleRad));
      ctx.lineTo(cx + len * Math.cos(angleRad), cy - len * Math.sin(angleRad));
      ctx.stroke();
      
      // Arc de cercle neutre avec symbole d'interrogation (pas de strokeRect vert/jaune spoiler)
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(cx, cy, 28, 0, -angleRad, true); ctx.stroke();
      ctx.fillStyle = '#ffd700'; ctx.font = "bold 13px 'Fira Code', monospace";
      ctx.fillText("?", cx + 12, cy - 12);
      
      ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.font = "bold 12px 'Fira Code', monospace";
      ctx.fillStyle = '#00f0ff'; ctx.fillText(d1, cx + 155, cy + 4);
      ctx.fillStyle = '#b026ff'; ctx.fillText(d2, cx + len * Math.cos(angleRad) + 10, cy - len * Math.sin(angleRad));
      
      this.snapPoints.push(
        { x: cx, y: cy },
        { x: cx - 150, y: cy },
        { x: cx + 150, y: cy },
        { x: cx + len * Math.cos(angleRad), y: cy - len * Math.sin(angleRad) },
        { x: cx - len * Math.cos(angleRad), y: cy + len * Math.sin(angleRad) }
      );
    }
    else if (type === 'parallelTheorem') {
      const d1 = gd.d1 || '(d_1)';
      const d2 = gd.d2 || '(d_2)';
      const distVal = gd.dist ? `${gd.dist} m` : null;
      
      const y1 = cy - 42;
      const y2 = cy + 42;
      
      ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 3; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(cx - 150, y1); ctx.lineTo(cx + 150, y1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 150, y2); ctx.lineTo(cx + 150, y2); ctx.stroke();
      
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(cx, y1); ctx.lineTo(cx, y2); ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#ffd700';
      ctx.beginPath(); ctx.arc(cx, y1, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, y2, 4, 0, Math.PI * 2); ctx.fill();
      
      if (distVal) {
        ctx.font = "bold 12px 'Fira Code', monospace"; ctx.textAlign = 'left';
        ctx.fillText(`Écartement = ${distVal}`, cx + 10, cy + 4);
      }
      
      ctx.font = "bold 12px 'Fira Code', monospace";
      ctx.fillStyle = '#00f0ff'; ctx.fillText(d1, cx + 160, y1 + 4);
      ctx.fillStyle = '#00f0ff'; ctx.fillText(d2, cx + 160, y2 + 4);
      
      this.snapPoints.push(
        { x: cx, y: y1 },
        { x: cx, y: y2 },
        { x: cx - 150, y: y1 },
        { x: cx + 150, y: y1 },
        { x: cx - 150, y: y2 },
        { x: cx + 150, y: y2 }
      );
    }
    else if (type === 'parallelPerpTheorem') {
      const d1 = gd.d1 || '(d_1)';
      const d2 = gd.d2 || '(d_2)';
      const d3 = gd.d3 || '(d_3)';
      
      const y1 = cy - 45;
      const y2 = cy + 45;
      const perpX = cx - 20;
      
      ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2.5; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(cx - 140, y1); ctx.lineTo(cx + 140, y1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 140, y2); ctx.lineTo(cx + 140, y2); ctx.stroke();
      
      ctx.strokeStyle = '#ff0055'; ctx.lineWidth = 2.5; ctx.shadowColor = '#ff0055';
      ctx.beginPath(); ctx.moveTo(perpX, cy - 85); ctx.lineTo(perpX, cy + 85); ctx.stroke();
      
      ctx.font = "bold 14px 'Fira Code', monospace"; ctx.fillStyle = '#ff0055';
      ctx.fillText("?", perpX + 18, y1 + 16);
      
      ctx.font = "bold 12px 'Fira Code', monospace";
      ctx.fillStyle = '#00f0ff'; ctx.fillText(d1, cx + 148, y1 + 4);
      ctx.fillStyle = '#00f0ff'; ctx.fillText(d2, cx + 148, y2 + 4);
      ctx.fillStyle = '#ff0055'; ctx.fillText(d3, perpX - 4, cy - 92);
      
      this.snapPoints.push(
        { x: perpX, y: y1 },
        { x: perpX, y: y2 },
        { x: cx - 140, y: y1 },
        { x: cx + 140, y: y1 },
        { x: cx - 140, y: y2 },
        { x: cx + 140, y: y2 }
      );
    }
    else if (type === 'alternateInternal') {
      const d1 = gd.d1 || '(d_1)';
      const d2 = gd.d2 || '(d_2)';
      const secant = gd.secant || '(Δ)';
      const isAlternate = (gd.angleType || '').includes('alternes');
      const angleVal = gd.angle || 45;
      
      const y1 = cy - 45;
      const y2 = cy + 45;
      
      ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2.5; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(cx - 150, y1); ctx.lineTo(cx + 150, y1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 150, y2); ctx.lineTo(cx + 150, y2); ctx.stroke();
      
      const rad = (angleVal * Math.PI) / 180;
      const dx = 90 / Math.tan(rad);
      const xInt1 = cx - (y2 - y1) / (2 * Math.tan(rad));
      const xInt2 = cx + (y2 - y1) / (2 * Math.tan(rad));
      
      ctx.strokeStyle = '#b026ff'; ctx.lineWidth = 2.5; ctx.shadowColor = '#b026ff';
      ctx.beginPath(); ctx.moveTo(cx - dx, cy - 85); ctx.lineTo(cx + dx, cy + 85); ctx.stroke();
      
      // Arcs d'angles neutres tracés en magenta neutre #ff007f avec ?
      ctx.strokeStyle = '#ff007f'; ctx.lineWidth = 2.5; ctx.shadowColor = '#ff007f';
      ctx.beginPath(); ctx.arc(xInt1, y1, 24, 0, rad); ctx.stroke();
      
      ctx.fillStyle = '#ff007f'; ctx.font = "bold 13px 'Fira Code', monospace";
      ctx.fillText(`${angleVal}°`, xInt1 + 28, y1 + 16);
      
      if (isAlternate) {
        ctx.beginPath(); ctx.arc(xInt2, y2, 24, Math.PI, Math.PI + rad); ctx.stroke();
        ctx.fillText("?", xInt2 - 34, y2 - 12);
      } else {
        ctx.beginPath(); ctx.arc(xInt2, y2, 24, 0, rad); ctx.stroke();
        ctx.fillText("?", xInt2 + 28, y2 + 16);
      }
      
      ctx.font = "bold 12px 'Fira Code', monospace";
      ctx.fillStyle = '#00f0ff'; ctx.fillText(d1, cx + 155, y1 + 4);
      ctx.fillStyle = '#00f0ff'; ctx.fillText(d2, cx + 155, y2 + 4);
      ctx.fillStyle = '#b026ff'; ctx.fillText(secant, cx + dx + 10, cy + 90);
      
      this.snapPoints.push(
        { x: xInt1, y: y1 },
        { x: xInt2, y: y2 },
        { x: cx - dx, y: cy - 85 },
        { x: cx + dx, y: cy + 85 }
      );
    }
    else if (type === 'pointLineDist') {
      const lineName = gd.lineName || '(d)';
      const hPoint = gd.hPoint || 'H';
      const footPoint = gd.footPoint || "H'";
      
      const lineY = cy + 35;
      const hPos = { x: cx, y: cy - 55 };
      const footPos = { x: cx, y: lineY };
      
      ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2.5; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(cx - 150, lineY); ctx.lineTo(cx + 150, lineY); ctx.stroke();
      
      ctx.strokeStyle = '#ff0055'; ctx.lineWidth = 3; ctx.shadowColor = '#ff0055';
      ctx.beginPath(); ctx.moveTo(hPos.x, hPos.y); ctx.lineTo(footPos.x, footPos.y); ctx.stroke();
      
      // Suppression du carré d'angle droit au pied H' avant validation
      ctx.fillStyle = '#ff0055'; ctx.beginPath(); ctx.arc(hPos.x, hPos.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(footPos.x, footPos.y, 5, 0, Math.PI * 2); ctx.fill();
      
      ctx.font = "bold 13px 'Fira Code', monospace";
      ctx.fillStyle = '#ff0055'; ctx.fillText(hPoint, hPos.x - 18, hPos.y);
      ctx.fillStyle = '#ffd700'; ctx.fillText(footPoint, footPos.x - 22, footPos.y + 18);
      ctx.fillStyle = '#00f0ff'; ctx.fillText(lineName, cx + 155, lineY + 4);
      
      if (gd.dist) {
        ctx.fillStyle = '#ff0055'; ctx.font = "bold 11px 'Fira Code', monospace";
        ctx.fillText(`${gd.dist} m`, hPos.x + 10, (hPos.y + footPos.y) / 2);
      }
      
      this.snapPoints.push(
        hPos,
        footPos,
        { x: cx - 150, y: lineY },
        { x: cx + 150, y: lineY }
      );
    }
    else if (type === 'triangleRemarkableLine') {
      const lineType = gd.lineType || 'Hauteur';
      
      const A = { x: cx - 35, y: cy - 70 };
      const B = { x: cx - 120, y: cy + 60 };
      const C = { x: cx + 100, y: cy + 60 };
      
      const M = { x: (B.x + C.x) / 2, y: cy + 60 };
      const H = { x: A.x, y: cy + 60 };
      
      ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2.5; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(C.x, C.y); ctx.closePath();
      ctx.fill(); ctx.stroke();
      
      // Tracé discontinu neutre #ffd700 sans symbole d'angle droit pré-affiché
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2.5; ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 8;
      ctx.setLineDash([4, 4]);
      
      if (lineType === 'Hauteur') {
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(H.x, H.y); ctx.stroke();
        this.snapPoints.push(H);
      } else if (lineType === 'Médiatrice') {
        ctx.beginPath(); ctx.moveTo(M.x, M.y - 120); ctx.lineTo(M.x, M.y + 25); ctx.stroke();
        this.snapPoints.push(M, { x: M.x, y: M.y - 120 });
      } else if (lineType === 'Bissectrice') {
        const bissectX = cx - 22;
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(bissectX, cy + 60); ctx.stroke();
        this.snapPoints.push({ x: bissectX, y: cy + 60 });
      } else {
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(M.x, M.y); ctx.stroke();
        ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(M.x, M.y, 4, 0, Math.PI * 2); ctx.fill();
        this.snapPoints.push(M);
      }
      ctx.setLineDash([]);
      
      [{ p: A, n: 'A' }, { p: B, n: 'B' }, { p: C, n: 'C' }].forEach(item => {
        ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(item.p.x, item.p.y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.font = "bold 13px 'Fira Code', monospace"; ctx.fillStyle = '#00f0ff';
        ctx.fillText(item.n, item.p.x - 4, item.p.y + (item.n === 'A' ? -12 : 18));
        this.snapPoints.push(item.p);
      });
    }
    // Rendu de sécurité : Viseur vectoriel géométrique neutre
    else {
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 80, cy); ctx.lineTo(cx + 80, cy);
      ctx.moveTo(cx, cy - 80); ctx.lineTo(cx, cy + 80);
      ctx.stroke();
      this.snapPoints.push({ x: cx, y: cy });
    }
    
    ctx.restore();
  },
  
  drawWorld4Mirror(w, h, quest) {
    const ctx = this.ctx;
    if (!ctx) return;
    
    const cx = w / 2;
    const cy = h / 2;
    const gd = quest ? quest.geoData : null;
    
    if (!this.snapPoints) this.snapPoints = [];
    this.snapPoints.length = 0;
    
    ctx.clearRect(0, 0, w, h);
    // Fond géré par le skin de canvas équipé
    
    ctx.save();
    const type = gd ? (gd.type || '') : '';
    
    if (type === 'axialGrid' || type === 'axialGridError') {
      const gridSize = 30;
      ctx.strokeStyle = "rgba(176, 38, 255, 0.2)";
      ctx.lineWidth = 1;
      
      for (let x = cx; x < w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let x = cx - gridSize; x > 0; x -= gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      const startY = cy % gridSize;
      for (let y = startY; y < h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      
      ctx.strokeStyle = "#b026ff"; ctx.lineWidth = 3;
      ctx.shadowColor = "#b026ff"; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(cx, 20); ctx.lineTo(cx, h - 20); ctx.stroke();
      ctx.font = "bold 12px 'Fira Code', monospace"; ctx.fillStyle = "#b026ff";
      ctx.fillText("Axe Miroir (d)", cx + 10, 35);
      ctx.shadowBlur = 0;
      
      this.snapPoints.push({ x: cx, y: 20 }, { x: cx, y: cy }, { x: cx, y: h - 20 });
      
      const distA = gd.distA || 4;
      const pOrigX = cx - distA * gridSize;
      const pOrigY = cy;
      
      ctx.fillStyle = "#00f0ff"; ctx.shadowColor = "#00f0ff"; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(pOrigX, pOrigY, 8, 0, Math.PI * 2); ctx.fill();
      ctx.font = "bold 11px 'Fira Code', monospace"; ctx.fillStyle = "#00f0ff";
      ctx.fillText("A (Origine)", pOrigX - 35, pOrigY - 15);
      this.snapPoints.push({ x: pOrigX, y: pOrigY });
      
      const isDistanceQuestion = gd && (gd.hideTarget || gd.isCell);
      
      if (type === 'axialGridError') {
        const errDist = gd.errDist || (distA + 2);
        const pErrX = cx + errDist * gridSize;
        
        ctx.fillStyle = "#ff0055"; ctx.shadowColor = "#ff0055"; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(pErrX, pOrigY, 8, 0, Math.PI * 2); ctx.fill();
        ctx.font = "bold 11px 'Fira Code', monospace"; ctx.fillStyle = "#ff0055";
        ctx.fillText("A' (Projeté)", pErrX - 25, pOrigY + 22);
        
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(pOrigX, pOrigY); ctx.lineTo(pErrX, pOrigY); ctx.stroke();
        ctx.setLineDash([]);
        this.snapPoints.push({ x: pErrX, y: pOrigY });
      } else if (isDistanceQuestion || (gd && gd.hideTarget)) {
        const pSymX = cx + distA * gridSize;
        ctx.strokeStyle = "#ffd700"; ctx.lineWidth = 2; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.arc(pSymX, pOrigY, 12, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = "bold 12px 'Fira Code', monospace"; ctx.fillStyle = "#ffd700";
        ctx.fillText("?", pSymX - 3, pOrigY + 4);
        this.snapPoints.push({ x: pSymX, y: pOrigY });
      } else {
        const pSymX = cx + distA * gridSize;
        
        ctx.fillStyle = "#00ff66"; ctx.shadowColor = "#00ff66"; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(pSymX, pOrigY, 8, 0, Math.PI * 2); ctx.fill();
        ctx.font = "bold 11px 'Fira Code', monospace"; ctx.fillStyle = "#00ff66";
        ctx.fillText("A' (Symétrique)", pSymX - 35, pOrigY + 22);
        
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(pOrigX, pOrigY); ctx.lineTo(pSymX, pOrigY); ctx.stroke();
        ctx.setLineDash([]);
        this.snapPoints.push({ x: pSymX, y: pOrigY });
      }
    }
    else if (type === 'symmetryAxes') {
      const shape = gd.shape || "Carré";
      const sz = Math.min(w, h) * 0.32;
      const hideAxes = gd.hideTarget || (quest && quest.title && quest.title.includes("Dénombrement"));
      
      ctx.fillStyle = "rgba(0, 240, 255, 0.08)";
      ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 2.5;
      ctx.shadowColor = "#00f0ff"; ctx.shadowBlur = 10;
      
      this.snapPoints.push({ x: cx, y: cy });
      
      if (shape === "Carré") {
        const p1 = { x: cx - sz / 2, y: cy - sz / 2 }, p2 = { x: cx + sz / 2, y: cy - sz / 2 };
        const p3 = { x: cx + sz / 2, y: cy + sz / 2 }, p4 = { x: cx - sz / 2, y: cy + sz / 2 };
        ctx.beginPath(); ctx.rect(p1.x, p1.y, sz, sz); ctx.fill(); ctx.stroke();
        this.snapPoints.push(p1, p2, p3, p4);
        
        if (!hideAxes) {
          ctx.strokeStyle = "#ff0055"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy - sz / 2 - 20); ctx.lineTo(cx, cy + sz / 2 + 20);
          ctx.moveTo(cx - sz / 2 - 20, cy); ctx.lineTo(cx + sz / 2 + 20, cy);
          ctx.moveTo(p1.x - 15, p1.y - 15); ctx.lineTo(p3.x + 15, p3.y + 15);
          ctx.moveTo(p2.x + 15, p2.y - 15); ctx.lineTo(p4.x - 15, p4.y + 15);
          ctx.stroke(); ctx.setLineDash([]);
        }
      } else if (shape === "Rectangle") {
        const rw = sz * 1.3, rh = sz * 0.7;
        const p1 = { x: cx - rw / 2, y: cy - rh / 2 }, p2 = { x: cx + rw / 2, y: cy - rh / 2 };
        const p3 = { x: cx + rw / 2, y: cy + rh / 2 }, p4 = { x: cx - rw / 2, y: cy + rh / 2 };
        ctx.beginPath(); ctx.rect(p1.x, p1.y, rw, rh); ctx.fill(); ctx.stroke();
        this.snapPoints.push(p1, p2, p3, p4);
        
        if (!hideAxes) {
          ctx.strokeStyle = "#ff0055"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy - rh / 2 - 20); ctx.lineTo(cx, cy + rh / 2 + 20);
          ctx.moveTo(cx - rw / 2 - 20, cy); ctx.lineTo(cx + rw / 2 + 20, cy);
          ctx.stroke(); ctx.setLineDash([]);
        }
      } else if (shape === "Losange") {
        const p1 = { x: cx, y: cy - sz / 2 }, p2 = { x: cx + sz * 0.7, y: cy };
        const p3 = { x: cx, y: cy + sz / 2 }, p4 = { x: cx - sz * 0.7, y: cy };
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        this.snapPoints.push(p1, p2, p3, p4);
        
        if (!hideAxes) {
          ctx.strokeStyle = "#ff0055"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y - 20); ctx.lineTo(p3.x, p3.y + 20);
          ctx.moveTo(p4.x - 20, p4.y); ctx.lineTo(p2.x + 20, p2.y);
          ctx.stroke(); ctx.setLineDash([]);
        }
      } else if (shape === "Triangle équilatéral") {
        const p1 = { x: cx, y: cy - sz * 0.6 };
        const p2 = { x: cx + sz * 0.6, y: cy + sz * 0.4 };
        const p3 = { x: cx - sz * 0.6, y: cy + sz * 0.4 };
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        this.snapPoints.push(p1, p2, p3);
        
        if (!hideAxes) {
          ctx.strokeStyle = "#ff0055"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y - 15); ctx.lineTo(cx, cy + sz * 0.4 + 15);
          ctx.moveTo(p2.x + 15, p2.y + 10); ctx.lineTo(cx - sz * 0.3 - 10, cy - sz * 0.1 - 10);
          ctx.moveTo(p3.x - 15, p3.y + 10); ctx.lineTo(cx + sz * 0.3 + 10, cy - sz * 0.1 - 10);
          ctx.stroke(); ctx.setLineDash([]);
        }
      } else if (shape === "Triangle isocèle") {
        const p1 = { x: cx, y: cy - sz * 0.6 };
        const p2 = { x: cx + sz * 0.5, y: cy + sz * 0.4 };
        const p3 = { x: cx - sz * 0.5, y: cy + sz * 0.4 };
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        this.snapPoints.push(p1, p2, p3);
        
        if (!hideAxes) {
          ctx.strokeStyle = "#ff0055"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y - 15); ctx.lineTo(cx, cy + sz * 0.4 + 15);
          ctx.stroke(); ctx.setLineDash([]);
        }
      } else if (shape === "Segment") {
        const p1 = { x: cx - sz * 0.6, y: cy };
        const p2 = { x: cx + sz * 0.6, y: cy };
        ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(p1.x, p1.y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(p2.x, p2.y, 6, 0, Math.PI * 2); ctx.fill();
        this.snapPoints.push(p1, p2);
        
        if (!hideAxes) {
          ctx.strokeStyle = "#ff0055"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 50); ctx.lineTo(cx, cy + 50);
          ctx.moveTo(p1.x - 20, cy); ctx.lineTo(p2.x + 20, cy);
          ctx.stroke(); ctx.setLineDash([]);
        }
      } else if (shape === "Cercle") {
        ctx.beginPath(); ctx.arc(cx, cy, sz * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (!hideAxes) {
          ctx.strokeStyle = "#ff0055"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy - sz * 0.7); ctx.lineTo(cx, cy + sz * 0.7);
          ctx.moveTo(cx - sz * 0.7, cy); ctx.lineTo(cx + sz * 0.7, cy);
          ctx.stroke(); ctx.setLineDash([]);
        }
      }
      
      if (hideAxes) {
        ctx.fillStyle = "#ffd700"; ctx.font = "bold 16px 'Fira Code', monospace";
        ctx.fillText("? (Nombre d'axes)", cx - 60, cy - sz * 0.7 - 10);
      }
    }
    else if (type === 'symmetryProperties') {
      const axisX = cx;
      
      ctx.strokeStyle = "#b026ff"; ctx.lineWidth = 3; ctx.shadowColor = "#b026ff"; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(axisX, 20); ctx.lineTo(axisX, h - 20); ctx.stroke();
      ctx.shadowBlur = 0;
      
      const realWidth = gd.width || (gd.length ? gd.length / 2 : 6);
      const realHeight = gd.height || (gd.origArea ? Math.sqrt(gd.origArea) : 4);
      
      const maxDim = Math.max(realWidth, realHeight);
      const scale = (Math.min(w, h) * 0.28) / (maxDim || 1);
      
      const polyW = realWidth * scale;
      const polyH = realHeight * scale;
      
      const pL1 = { x: axisX - 30 - polyW, y: cy - polyH / 2 };
      const pL2 = { x: axisX - 30, y: cy - polyH / 2 };
      const pL3 = { x: axisX - 30 - polyW * 0.3, y: cy + polyH / 2 };
      
      ctx.fillStyle = "rgba(0, 240, 255, 0.15)"; ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pL1.x, pL1.y); ctx.lineTo(pL2.x, pL2.y); ctx.lineTo(pL3.x, pL3.y); ctx.closePath();
      ctx.fill(); ctx.stroke();
      
      ctx.font = "bold 12px 'Fira Code', monospace"; ctx.fillStyle = "#00f0ff";
      const labelOrig = gd.origArea ? `Aire = ${gd.origArea} m²` : (gd.length ? `L = ${gd.length} m` : "Figure A");
      ctx.fillText(labelOrig, pL1.x, cy + polyH / 2 + 25);
      
      if (gd.errArea) {
        const errScale = Math.sqrt(gd.errArea / (gd.origArea || 1));
        const errW = polyW * errScale;
        const errH = polyH * errScale;
        
        const pR1 = { x: axisX + 30 + errW, y: cy - errH / 2 };
        const pR2 = { x: axisX + 30, y: cy - errH / 2 };
        const pR3 = { x: axisX + 30 + errW * 0.3, y: cy + errH / 2 };
        
        ctx.fillStyle = "rgba(255, 0, 85, 0.2)"; ctx.strokeStyle = "#ff0055"; ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(pR1.x, pR1.y); ctx.lineTo(pR2.x, pR2.y); ctx.lineTo(pR3.x, pR3.y); ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = "#ff0055";
        ctx.fillText(`Aire = ${gd.errArea} m² (Erreur)`, axisX + 30, cy + polyH / 2 + 25);
        this.snapPoints.push(pR1, pR2, pR3);
      } else {
        const pR1 = { x: axisX + 30 + polyW, y: cy - polyH / 2 };
        const pR2 = { x: axisX + 30, y: cy - polyH / 2 };
        const pR3 = { x: axisX + 30 + polyW * 0.3, y: cy + polyH / 2 };
        
        ctx.fillStyle = "rgba(0, 255, 102, 0.15)"; ctx.strokeStyle = "#00ff66"; ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(pR1.x, pR1.y); ctx.lineTo(pR2.x, pR2.y); ctx.lineTo(pR3.x, pR3.y); ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = "#00ff66";
        const labelSym = gd.length ? `L = ${gd.length} m` : "Figure A' (Isométrique)";
        ctx.fillText(labelSym, axisX + 30, cy + polyH / 2 + 25);
        this.snapPoints.push(pR1, pR2, pR3);
      }
      
      this.snapPoints.push({ x: axisX, y: cy }, pL1, pL2, pL3);
    }
    else if (type === 'mediatrixDist') {
      const pxLen = Math.min(w * 0.6, 260);
      const pA = { x: cx - pxLen / 2, y: cy + 40 };
      const pB = { x: cx + pxLen / 2, y: cy + 40 };
      const pM = { x: cx, y: cy + 40 };
      const pP = { x: cx, y: cy - 70 };
      
      ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 3.5;
      ctx.shadowColor = "#00f0ff"; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.stroke();
      
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.arc(pA.x, pA.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pB.x, pB.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffd700";
      ctx.beginPath(); ctx.arc(pM.x, pM.y, 5, 0, Math.PI * 2); ctx.fill();
      
      ctx.strokeStyle = "#b026ff"; ctx.lineWidth = 2.5; ctx.shadowColor = "#b026ff";
      ctx.beginPath(); ctx.moveTo(cx, cy - 110); ctx.lineTo(cx, cy + 90); ctx.stroke();
      
      ctx.strokeStyle = "#ffe600"; ctx.lineWidth = 2; ctx.shadowBlur = 0;
      ctx.strokeRect(cx, cy + 40 - 14, 14, 14);
      
      ctx.beginPath();
      ctx.moveTo(pA.x + pxLen / 4 - 4, pA.y - 6); ctx.lineTo(pA.x + pxLen / 4 + 4, pA.y + 6);
      ctx.moveTo(pB.x - pxLen / 4 - 4, pB.y - 6); ctx.lineTo(pB.x - pxLen / 4 + 4, pB.y + 6);
      ctx.stroke();
      
      ctx.fillStyle = "#00ff66"; ctx.shadowColor = "#00ff66"; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(pP.x, pP.y, 6, 0, Math.PI * 2); ctx.fill();
      
      ctx.strokeStyle = "rgba(0, 255, 102, 0.5)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(pP.x, pP.y); ctx.lineTo(pA.x, pA.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pP.x, pP.y); ctx.lineTo(pB.x, pB.y); ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.font = "bold 13px 'Fira Code', monospace";
      ctx.fillStyle = "#00f0ff"; ctx.fillText("A", pA.x - 18, pA.y + 5);
      ctx.fillStyle = "#00f0ff"; ctx.fillText("B", pB.x + 10, pB.y + 5);
      ctx.fillStyle = "#ffd700"; ctx.fillText("M (Milieu)", pM.x - 30, pM.y + 24);
      ctx.fillStyle = "#00ff66"; ctx.fillText("P (Équidistant : PA = PB)", pP.x + 12, pP.y + 4);
      ctx.fillStyle = "#b026ff"; ctx.fillText("Médiatrice (d)", cx + 8, cy - 95);
      
      this.snapPoints.push(pA, pB, pM, pP, { x: cx, y: cy - 110 }, { x: cx, y: cy + 90 });
    }
    else if (type === 'centralSymDirect') {
      const scale = 25;
      const origX = gd.xOrig !== undefined ? gd.xOrig : (gd.orig ? gd.orig[0] : 3);
      const origY = gd.yOrig !== undefined ? gd.yOrig : (gd.orig ? gd.orig[1] : 2);
      
      const oPx = cx;
      const oPy = cy;
      const mPx = cx + origX * scale;
      const mPy = cy - origY * scale;
      const mPrimePx = cx - origX * scale;
      const mPrimePy = cy + origY * scale;
      
      ctx.strokeStyle = "rgba(176, 38, 255, 0.25)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(40, cy); ctx.lineTo(w - 40, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, 30); ctx.lineTo(cx, h - 30); ctx.stroke();
      
      ctx.strokeStyle = "rgba(0, 240, 255, 0.5)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(mPx, mPy); ctx.lineTo(mPrimePx, mPrimePy); ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = "#ffd700"; ctx.shadowColor = "#ffd700"; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(oPx, oPy, 6, 0, Math.PI * 2); ctx.fill();
      ctx.font = "bold 13px 'Fira Code', monospace";
      ctx.fillText("O (0,0)", oPx + 10, oPy + 18);
      
      ctx.fillStyle = "#00f0ff"; ctx.shadowColor = "#00f0ff"; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(mPx, mPy, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillText(`M (${origX}, ${origY})`, mPx + 10, mPy - 10);
      
      const distM = Math.hypot(mPx - cx, mPy - cy);
      const startAngle = Math.atan2(mPy - cy, mPx - cx);
      ctx.strokeStyle = "#ff0055"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5; ctx.shadowColor = "#ff0055";
      ctx.beginPath(); ctx.arc(cx, cy, distM, startAngle, startAngle + Math.PI); ctx.stroke();
      ctx.setLineDash([]);
      
      if (gd && gd.hideTarget) {
        ctx.strokeStyle = "#ffd700"; ctx.lineWidth = 2; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.arc(mPrimePx, mPrimePy, 12, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#ffd700"; ctx.fillText("?", mPrimePx - 4, mPrimePy + 4);
      } else {
        ctx.fillStyle = "#00ff66"; ctx.shadowColor = "#00ff66"; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(mPrimePx, mPrimePy, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillText(`M' (${-origX}, ${-origY})`, mPrimePx - 85, mPrimePy + 20);
        this.snapPoints.push({ x: mPrimePx, y: mPrimePy });
      }
      
      this.snapPoints.push({ x: oPx, y: oPy }, { x: mPx, y: mPy });
    }
    else if (type === 'centralSymParallel') {
      const range = gd.range || 100;
      const offset = 55;
      
      ctx.fillStyle = "#ffd700"; ctx.shadowColor = "#ffd700"; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
      ctx.font = "bold 13px 'Fira Code', monospace";
      ctx.fillText("O (Centre)", cx + 10, cy - 10);
      
      const yD = cy - offset;
      ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 3; ctx.shadowColor = "#00f0ff"; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(cx - range - 50, yD); ctx.lineTo(cx + range + 50, yD); ctx.stroke();
      ctx.fillStyle = "#00f0ff"; ctx.fillText("Droite (d)", cx + range + 15, yD - 10);
      
      const yDPrime = cy + offset;
      ctx.strokeStyle = "#00ff66"; ctx.lineWidth = 3; ctx.shadowColor = "#00ff66";
      ctx.beginPath(); ctx.moveTo(cx - range - 50, yDPrime); ctx.lineTo(cx + range + 50, yDPrime); ctx.stroke();
      ctx.fillStyle = "#00ff66"; ctx.fillText("Droite image (d') // (d)", cx + range + 15, yDPrime + 20);
      
      ctx.strokeStyle = "rgba(255, 0, 85, 0.4)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx - range, yD); ctx.lineTo(cx + range, yDPrime); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + range, yD); ctx.lineTo(cx - range, yDPrime); ctx.stroke();
      ctx.setLineDash([]);
      
      this.snapPoints.push(
        { x: cx, y: cy },
        { x: cx - range, y: yD }, { x: cx + range, y: yD },
        { x: cx - range, y: yDPrime }, { x: cx + range, y: yDPrime }
      );
    }
    else if (type === 'centerOfSymmetry') {
      const shape = gd.shape || "Parallélogramme";
      const sz = Math.min(w, h) * 0.32;
      
      ctx.fillStyle = "rgba(0, 240, 255, 0.08)";
      ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 2.5; ctx.shadowColor = "#00f0ff"; ctx.shadowBlur = 10;
      
      let vertices = [];
      if (shape === "Parallélogramme" || shape === "Rectangle" || shape === "Carré" || shape === "Losange") {
        const skew = shape === "Parallélogramme" ? 30 : 0;
        const rh = sz * 0.6;
        vertices = [
          { x: cx - sz + skew, y: cy - rh },
          { x: cx + sz + skew, y: cy - rh },
          { x: cx + sz - skew, y: cy + rh },
          { x: cx - sz - skew, y: cy + rh }
        ];
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) ctx.lineTo(vertices[i].x, vertices[i].y);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        
        ctx.strokeStyle = "rgba(176, 38, 255, 0.5)"; ctx.setLineDash([3, 3]); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(vertices[0].x, vertices[0].y); ctx.lineTo(vertices[2].x, vertices[2].y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(vertices[1].x, vertices[1].y); ctx.lineTo(vertices[3].x, vertices[3].y); ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.beginPath(); ctx.arc(cx, cy, sz * 0.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      
      ctx.fillStyle = "#ffd700"; ctx.shadowColor = "#ffd700"; ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
      ctx.font = "bold 13px 'Fira Code', monospace";
      ctx.fillText("O (Centre de Symétrie)", cx + 12, cy + 4);
      
      vertices.forEach(v => this.snapPoints.push(v));
      this.snapPoints.push({ x: cx, y: cy });
    }
    else {
      const axisX = cx;
      const size = Math.min(w, h) * 0.25;
      
      ctx.strokeStyle = "#b026ff";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#b026ff";
      ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(axisX, 30); ctx.lineTo(axisX, h - 30); ctx.stroke();
      ctx.shadowBlur = 0;
      
      const p1 = { x: axisX - size, y: cy - size / 2 };
      const p2 = { x: axisX - size / 3, y: cy - size / 2 };
      const p3 = { x: axisX - size * 0.7, y: cy + size / 2 };
      
      ctx.fillStyle = "rgba(0, 240, 255, 0.15)";
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      
      const p1Prime = { x: axisX + size, y: cy - size / 2 };
      const p2Prime = { x: axisX + size / 3, y: cy - size / 2 };
      const p3Prime = { x: axisX + size * 0.7, y: cy + size / 2 };
      
      ctx.fillStyle = "rgba(0, 255, 102, 0.15)";
      ctx.strokeStyle = "#00ff66";
      ctx.beginPath();
      ctx.moveTo(p1Prime.x, p1Prime.y); ctx.lineTo(p2Prime.x, p2Prime.y); ctx.lineTo(p3Prime.x, p3Prime.y);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      
      this.snapPoints.push(
        { x: axisX, y: cy },
        p1, p2, p3,
        p1Prime, p2Prime, p3Prime
      );
    }
    
    ctx.restore();
  },
  
  drawWorld5Solids(w, h, quest) {
    const ctx = this.ctx;
    if (!ctx) return;
    
    const cx = w / 2;
    const cy = h / 2;
    const gd = quest ? quest.geoData : null;
    
    if (!this.snapPoints) this.snapPoints = [];
    this.snapPoints.length = 0;
    
    ctx.clearRect(0, 0, w, h);
    
    // Grille tactique de fond
    ctx.save();
    ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
    ctx.lineWidth = 1;
    const bgGrid = 30;
    for (let x = 0; x <= w; x += bgGrid) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += bgGrid) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.restore();
    
    if (!gd) return;
    
    ctx.save();
    const type = gd.type || 'solid3D';
    
    // CONVENTIONS QA PERSPECTIVE CAVALIÈRE : Angle = 30° (pi/6), Réduction k = 0.5
    const kReduce = 0.5;
    const angleRad = Math.PI / 6;
    const cos30 = Math.cos(angleRad);
    const sin30 = Math.sin(angleRad);
    
    const project3D = (x, y, z, scale, offsetX = 0, offsetY = 0) => ({
      px: cx + offsetX + (x * scale) - (y * scale * kReduce * cos30),
      py: cy + offsetY - (z * scale) + (y * scale * kReduce * sin30)
    });
    
    if (type === 'solid3D') {
      const solidName = (gd.solid || 'Cube').toUpperCase();
      const scale = Math.min(w, h) / 14;
      
      ctx.strokeStyle = "#00f0ff";
      ctx.fillStyle = "rgba(0, 240, 255, 0.12)";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 10;
      
      if (solidName.includes("CYLINDRE")) {
        const rx = scale * 2.2, ry = scale * 0.7, ch = scale * 3.5;
        // Base supérieure
        ctx.beginPath(); ctx.ellipse(cx, cy - ch / 2, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Génératrices latérales
        ctx.beginPath(); ctx.moveTo(cx - rx, cy - ch / 2); ctx.lineTo(cx - rx, cy + ch / 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + rx, cy - ch / 2); ctx.lineTo(cx + rx, cy + ch / 2); ctx.stroke();
        // Base inférieure avant (trait plein)
        ctx.beginPath(); ctx.ellipse(cx, cy + ch / 2, rx, ry, 0, 0, Math.PI); ctx.stroke();
        // Base inférieure arrière cachée (pointillée strict [4, 4])
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.ellipse(cx, cy + ch / 2, rx, ry, 0, Math.PI, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        this.snapPoints.push({ x: cx, y: cy - ch / 2 }, { x: cx, y: cy + ch / 2 }, { x: cx - rx, y: cy }, { x: cx + rx, y: cy });
      } 
      else if (solidName.includes("CÔNE") || solidName.includes("CONE")) {
        const rx = scale * 2.2, ry = scale * 0.7, ch = scale * 4;
        ctx.beginPath(); ctx.moveTo(cx, cy - ch / 2); ctx.lineTo(cx - rx, cy + ch / 2);
        ctx.moveTo(cx, cy - ch / 2); ctx.lineTo(cx + rx, cy + ch / 2); ctx.stroke();
        // Contour avant
        ctx.beginPath(); ctx.ellipse(cx, cy + ch / 2, rx, ry, 0, 0, Math.PI); ctx.stroke();
        // Ellipse arrière cachée en pointillés
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.ellipse(cx, cy + ch / 2, rx, ry, 0, Math.PI, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        this.snapPoints.push({ x: cx, y: cy - ch / 2 }, { x: cx, y: cy + ch / 2 }, { x: cx - rx, y: cy + ch / 2 }, { x: cx + rx, y: cy + ch / 2 });
      }
      else if (solidName.includes("SPHÈRE") || solidName.includes("SPHERE") || solidName.includes("BOULE")) {
        const r = scale * 2.5;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.35, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        this.snapPoints.push({ x: cx, y: cy }, { x: cx - r, y: cy }, { x: cx + r, y: cy }, { x: cx, y: cy - r }, { x: cx, y: cy + r });
      }
      else {
        const dim = 3;
        const O = project3D(0, 0, 0, scale, -scale * 1.2, scale * 1.2);
        const X = project3D(dim, 0, 0, scale, -scale * 1.2, scale * 1.2);
        const Y = project3D(0, dim, 0, scale, -scale * 1.2, scale * 1.2);
        const XY = project3D(dim, dim, 0, scale, -scale * 1.2, scale * 1.2);
        const Z = project3D(0, 0, dim, scale, -scale * 1.2, scale * 1.2);
        const XZ = project3D(dim, 0, dim, scale, -scale * 1.2, scale * 1.2);
        const YZ = project3D(0, dim, dim, scale, -scale * 1.2, scale * 1.2);
        const XYZ = project3D(dim, dim, dim, scale, -scale * 1.2, scale * 1.2);
        
        // 3 fuyantes arrières cachées strictement en [4, 4]
        ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(0, 240, 255, 0.45)";
        ctx.beginPath(); ctx.moveTo(O.px, O.py); ctx.lineTo(Y.px, Y.py);
        ctx.moveTo(O.px, O.py); ctx.lineTo(X.px, X.py);
        ctx.moveTo(O.px, O.py); ctx.lineTo(Z.px, Z.py); ctx.stroke();
        
        // Arêtes visibles en trait plein
        ctx.setLineDash([]); ctx.strokeStyle = "#00f0ff";
        ctx.beginPath();
        ctx.moveTo(X.px, X.py); ctx.lineTo(XY.px, XY.py); ctx.lineTo(XYZ.px, XYZ.py); ctx.lineTo(XZ.px, XZ.py); ctx.closePath();
        ctx.moveTo(Z.px, Z.py); ctx.lineTo(XZ.px, XZ.py); ctx.lineTo(XYZ.px, XYZ.py); ctx.lineTo(YZ.px, YZ.py); ctx.closePath();
        ctx.moveTo(Y.px, Y.py); ctx.lineTo(XY.px, XY.py); ctx.lineTo(XYZ.px, XYZ.py); ctx.lineTo(YZ.px, YZ.py); ctx.closePath();
        ctx.stroke();
        
        [O, X, Y, Z, XY, XZ, YZ, XYZ].forEach(p => this.snapPoints.push({ x: p.px, y: p.py }));
      }
    }
    else if (type === 'cuboidProps' || type === 'cavalierRules') {
      const scale = Math.min(w, h) / 13;
      const L = 4, l = 3, hDim = 3.5;
      
      const O = project3D(0, 0, 0, scale, -scale * 1.5, scale * 1.2);
      const X = project3D(L, 0, 0, scale, -scale * 1.5, scale * 1.2);
      const Y = project3D(0, l, 0, scale, -scale * 1.5, scale * 1.2);
      const XY = project3D(L, l, 0, scale, -scale * 1.5, scale * 1.2);
      const Z = project3D(0, 0, hDim, scale, -scale * 1.5, scale * 1.2);
      const XZ = project3D(L, 0, hDim, scale, -scale * 1.5, scale * 1.2);
      const YZ = project3D(0, l, hDim, scale, -scale * 1.5, scale * 1.2);
      const XYZ = project3D(L, l, hDim, scale, -scale * 1.5, scale * 1.2);
      
      // 3 fuyantes cachées
      ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(0, 240, 255, 0.45)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(O.px, O.py); ctx.lineTo(Y.px, Y.py);
      ctx.moveTo(O.px, O.py); ctx.lineTo(X.px, X.py);
      ctx.moveTo(O.px, O.py); ctx.lineTo(Z.px, Z.py); ctx.stroke();
      
      ctx.setLineDash([]); ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 2.5; ctx.shadowColor = "#00f0ff"; ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(X.px, X.py); ctx.lineTo(XY.px, XY.py); ctx.lineTo(XYZ.px, XYZ.py); ctx.lineTo(XZ.px, XZ.py); ctx.closePath();
      ctx.moveTo(Z.px, Z.py); ctx.lineTo(XZ.px, XZ.py); ctx.lineTo(XYZ.px, XYZ.py); ctx.lineTo(YZ.px, YZ.py); ctx.closePath();
      ctx.moveTo(Y.px, Y.py); ctx.lineTo(XY.px, XY.py); ctx.lineTo(XYZ.px, XYZ.py); ctx.lineTo(YZ.px, YZ.py); ctx.closePath();
      ctx.stroke();
      
      [O, X, Y, Z, XY, XZ, YZ, XYZ].forEach(p => this.snapPoints.push({ x: p.px, y: p.py }));
    }
    else if (type === 'prismProps' || type === 'pyramidProps' || type === 'prismArea') {
      const scale = Math.min(w, h) / 12;
      const n = gd.nSides || 3;
      const isPyramid = type === 'pyramidProps';
      
      if (isPyramid) {
        const apex = project3D(0, 0, 4, scale, 0, scale * 1.5);
        const basePts = [];
        for (let i = 0; i < n; i++) {
          const ang = (i * 2 * Math.PI) / n;
          basePts.push(project3D(2.5 * Math.cos(ang), 2.5 * Math.sin(ang), 0, scale, 0, scale * 1.5));
        }
        
        ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 2.5; ctx.shadowColor = "#00f0ff"; ctx.shadowBlur = 10;
        for (let i = 0; i < n; i++) {
          const pA = basePts[i];
          const pB = basePts[(i + 1) % n];
          const isHidden = (i === n - 1);
          ctx.setLineDash(isHidden ? [4, 4] : []);
          ctx.beginPath(); ctx.moveTo(pA.px, pA.py); ctx.lineTo(pB.px, pB.py); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(pA.px, pA.py); ctx.lineTo(apex.px, apex.py); ctx.stroke();
          this.snapPoints.push({ x: pA.px, y: pA.py });
        }
        ctx.setLineDash([]);
        this.snapPoints.push({ x: apex.px, y: apex.py });
      } 
      else {
        const hPrism = 3.5;
        const bBottom = [], bTop = [];
        for (let i = 0; i < n; i++) {
          const ang = (i * 2 * Math.PI) / n;
          bBottom.push(project3D(2 * Math.cos(ang), 2 * Math.sin(ang), 0, scale, 0, scale * 0.8));
          bTop.push(project3D(2 * Math.cos(ang), 2 * Math.sin(ang), hPrism, scale, 0, scale * 0.8));
        }
        
        ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 2.5; ctx.shadowColor = "#00f0ff"; ctx.shadowBlur = 10;
        for (let i = 0; i < n; i++) {
          const isHidden = (i === n - 1);
          ctx.setLineDash(isHidden ? [4, 4] : []);
          ctx.beginPath(); ctx.moveTo(bBottom[i].px, bBottom[i].py); ctx.lineTo(bBottom[(i + 1) % n].px, bBottom[(i + 1) % n].py); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(bTop[i].px, bTop[i].py); ctx.lineTo(bTop[(i + 1) % n].px, bTop[(i + 1) % n].py); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(bBottom[i].px, bBottom[i].py); ctx.lineTo(bTop[i].px, bTop[i].py); ctx.stroke();
          
          this.snapPoints.push({ x: bBottom[i].px, y: bBottom[i].py }, { x: bTop[i].px, y: bTop[i].py });
        }
        ctx.setLineDash([]);
      }
    }
    else if (type === 'cubeNet' || type === 'cuboidNet') {
      // RENDU DES PATRONS 2D : Contours cyan (#00f0ff, lineWidth=2.5) & pliures dorées (#ffd700, [4, 4])
      const squareSize = Math.min(w, h) / 5.5;
      const startX = cx - squareSize / 2;
      const startY = cy - squareSize / 2;
      
      const netGrid = [
        { c: 1, r: 0 },
        { c: 0, r: 1 }, { c: 1, r: 1 }, { c: 2, r: 1 }, { c: 3, r: 1 },
        { c: 1, r: 2 }
      ];
      
      ctx.fillStyle = "rgba(0, 240, 255, 0.1)";
      
      netGrid.forEach(f => {
        const fx = startX + (f.c - 1) * squareSize;
        const fy = startY + (f.r - 1) * squareSize;
        ctx.fillRect(fx, fy, squareSize, squareSize);
        
        this.snapPoints.push(
          { x: fx, y: fy }, { x: fx + squareSize, y: fy },
          { x: fx + squareSize, y: fy + squareSize }, { x: fx, y: fy + squareSize }
        );
      });

      // 1. Dessin des lignes de pliure internes en pointillés dorés (#ffd700)
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      netGrid.forEach(f => {
        const fx = startX + (f.c - 1) * squareSize;
        const fy = startY + (f.r - 1) * squareSize;
        ctx.strokeRect(fx, fy, squareSize, squareSize);
      });
      ctx.setLineDash([]);

      // 2. Traçage du contour extérieur en trait plein cyan (#00f0ff)
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 8;
      netGrid.forEach(f => {
        const fx = startX + (f.c - 1) * squareSize;
        const fy = startY + (f.r - 1) * squareSize;
        
        // Tester chaque côté : s'il n'y a pas de voisin, c'est un contour extérieur
        if (!netGrid.some(v => v.c === f.c && v.r === f.r - 1)) {
          ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + squareSize, fy); ctx.stroke();
        }
        if (!netGrid.some(v => v.c === f.c + 1 && v.r === f.r)) {
          ctx.beginPath(); ctx.moveTo(fx + squareSize, fy); ctx.lineTo(fx + squareSize, fy + squareSize); ctx.stroke();
        }
        if (!netGrid.some(v => v.c === f.c && v.r === f.r + 1)) {
          ctx.beginPath(); ctx.moveTo(fx, fy + squareSize); ctx.lineTo(fx + squareSize, fy + squareSize); ctx.stroke();
        }
        if (!netGrid.some(v => v.c === f.c - 1 && v.r === f.r)) {
          ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, fy + squareSize); ctx.stroke();
        }
      });
    }
    else if (type === 'cylinderVol' || type === 'coneVol' || type === 'pyramidVol' || type === 'cuboidVol') {
      const scale = Math.min(w, h) / 13;
      
      if (type === 'cylinderVol' || type === 'coneVol') {
        const rx = scale * 2.2, ry = scale * 0.7, ch = scale * 3.8;
        
        ctx.fillStyle = "rgba(0, 240, 255, 0.12)";
        ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 2.5; ctx.shadowColor = "#00f0ff"; ctx.shadowBlur = 10;
        
        if (type === 'cylinderVol') {
          ctx.beginPath(); ctx.ellipse(cx, cy - ch / 2, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx - rx, cy - ch / 2); ctx.lineTo(cx - rx, cy + ch / 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx + rx, cy - ch / 2); ctx.lineTo(cx + rx, cy + ch / 2); ctx.stroke();
        } else {
          ctx.beginPath(); ctx.moveTo(cx, cy - ch / 2); ctx.lineTo(cx - rx, cy + ch / 2);
          ctx.moveTo(cx, cy - ch / 2); ctx.lineTo(cx + rx, cy + ch / 2); ctx.stroke();
        }
        
        // Ellipse inférieure : avant plein, arrière en pointillés [4, 4]
        ctx.beginPath(); ctx.ellipse(cx, cy + ch / 2, rx, ry, 0, 0, Math.PI); ctx.stroke();
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.ellipse(cx, cy + ch / 2, rx, ry, 0, Math.PI, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        
        // PROTECTION ANTI-SPOILER : On affiche R et h mais V = ?
        ctx.strokeStyle = "#ffd700"; ctx.fillStyle = "#ffd700"; ctx.font = "bold 12px 'Fira Code', monospace";
        ctx.beginPath(); ctx.moveTo(cx, cy + ch / 2); ctx.lineTo(cx + rx, cy + ch / 2); ctx.stroke();
        ctx.fillText(`R = ${gd.R || '?'} m`, cx + rx / 2 - 15, cy + ch / 2 + 18);
        
        ctx.beginPath(); ctx.moveTo(cx + rx + 15, cy - ch / 2); ctx.lineTo(cx + rx + 15, cy + ch / 2); ctx.stroke();
        ctx.fillText(`h = ${gd.h || '?'} m`, cx + rx + 22, cy);
        
        ctx.fillStyle = "#ff0055"; ctx.font = "bold 16px 'Fira Code', monospace";
        ctx.fillText("V = ?", cx - 20, cy - ch / 2 - 15);
        
        this.snapPoints.push({ x: cx, y: cy - ch / 2 }, { x: cx, y: cy + ch / 2 }, { x: cx + rx, y: cy - ch / 2 });
      }
      else {
        const L = gd.L || 4, l = gd.l || 3, hDim = gd.h || 3.5;
        const O = project3D(0, 0, 0, scale, -scale * 1.5, scale * 1.2);
        const X = project3D(L, 0, 0, scale, -scale * 1.5, scale * 1.2);
        const Y = project3D(0, l, 0, scale, -scale * 1.5, scale * 1.2);
        const XY = project3D(L, l, 0, scale, -scale * 1.5, scale * 1.2);
        const Z = project3D(0, 0, hDim, scale, -scale * 1.5, scale * 1.2);
        const XZ = project3D(L, 0, hDim, scale, -scale * 1.5, scale * 1.2);
        const YZ = project3D(0, l, hDim, scale, -scale * 1.5, scale * 1.2);
        const XYZ = project3D(L, l, hDim, scale, -scale * 1.5, scale * 1.2);
        
        // 3 fuyantes cachées
        ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(0, 240, 255, 0.45)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(O.px, O.py); ctx.lineTo(Y.px, Y.py);
        ctx.moveTo(O.px, O.py); ctx.lineTo(X.px, X.py);
        ctx.moveTo(O.px, O.py); ctx.lineTo(Z.px, Z.py); ctx.stroke();
        
        ctx.setLineDash([]); ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 2.5; ctx.shadowColor = "#00f0ff"; ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(X.px, X.py); ctx.lineTo(XY.px, XY.py); ctx.lineTo(XYZ.px, XYZ.py); ctx.lineTo(XZ.px, XZ.py); ctx.closePath();
        ctx.moveTo(Z.px, Z.py); ctx.lineTo(XZ.px, XZ.py); ctx.lineTo(XYZ.px, XYZ.py); ctx.lineTo(YZ.px, YZ.py); ctx.closePath();
        ctx.moveTo(Y.px, Y.py); ctx.lineTo(XY.px, XY.py); ctx.lineTo(XYZ.px, XYZ.py); ctx.lineTo(YZ.px, YZ.py); ctx.closePath();
        ctx.stroke();
        
        // PROTECTION ANTI-SPOILER : On affiche L et h mais V = ?
        ctx.fillStyle = "#ffd700"; ctx.font = "bold 12px 'Fira Code', monospace";
        ctx.fillText(`L = ${L} m`, (X.px + XY.px) / 2, X.py + 18);
        ctx.fillText(`h = ${hDim} m`, XZ.px + 12, (X.py + XZ.py) / 2);
        ctx.fillStyle = "#ff0055"; ctx.font = "bold 16px 'Fira Code', monospace";
        ctx.fillText("V = ?", cx - 20, O.py + 35);
        
        [O, X, Y, Z, XY, XZ, YZ, XYZ].forEach(p => this.snapPoints.push({ x: p.px, y: p.py }));
      }
    }
    else if (type === 'sphereVsBall') {
      const r = Math.min(w, h) * 0.32;
      const distD = r * 0.45;
      const rSec = Math.sqrt(r * r - distD * distD);
      
      ctx.fillStyle = "rgba(0, 240, 255, 0.08)";
      ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 2.5; ctx.shadowColor = "#00f0ff"; ctx.shadowBlur = 10;
      
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.28, 0, 0, Math.PI * 2); ctx.stroke();
      
      const secY = cy - distD;
      ctx.fillStyle = "rgba(255, 0, 85, 0.25)";
      ctx.strokeStyle = "#ff0055"; ctx.lineWidth = 2.5; ctx.shadowColor = "#ff0055"; ctx.shadowBlur = 12;
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.ellipse(cx, secY, rSec, rSec * 0.28, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      
      ctx.fillStyle = "#ffe600"; ctx.strokeStyle = "#ffe600"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillText("O", cx - 14, cy + 5);
      
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, secY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, secY); ctx.lineTo(cx + rSec, secY); ctx.stroke();
      ctx.strokeStyle = "#00ff66";
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + rSec, secY); ctx.stroke();
      
      // PROTECTION ANTI-SPOILER : r = ?
      ctx.font = "bold 11px 'Fira Code', monospace";
      ctx.fillText(`d = ${gd.d || '?'} cm`, cx - 45, cy - distD / 2);
      ctx.fillText(`r = ?`, cx + rSec / 2 - 10, secY - 8);
      ctx.fillStyle = "#00ff66";
      ctx.fillText(`R = ${gd.R || '?'} cm`, cx + rSec / 2 + 10, cy - distD / 2 + 12);
      
      this.snapPoints.push({ x: cx, y: cy }, { x: cx, y: secY }, { x: cx + rSec, y: secY }, { x: cx + r, y: cy });
    }
    else {
      const scale = Math.min(w, h) / 12;
      const O = project3D(0, 0, 0, scale);
      const X = project3D(3, 0, 0, scale);
      const Y = project3D(0, 3, 0, scale);
      const Z = project3D(0, 0, 3, scale);
      
      ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(O.px, O.py); ctx.lineTo(X.px, X.py); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(O.px, O.py); ctx.lineTo(Y.px, Y.py); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(O.px, O.py); ctx.lineTo(Z.px, Z.py); ctx.stroke();
      
      this.snapPoints.push({ x: O.px, y: O.py }, { x: X.px, y: X.py }, { x: Y.px, y: Y.py }, { x: Z.px, y: Z.py });
    }
    
    ctx.restore();
  },

  drawWorld5(w, h, quest) {
    this.drawWorld5Solids(w, h, quest);
  },

  drawWorld5Crafting(w, h, quest) {
    this.drawWorld5Solids(w, h, quest);
  },
  
  drawWorld6Theorems(w, h, quest) {
    const ctx = this.ctx;
    if (!ctx) return;
    
    const gd = quest ? quest.geoData : {};
    const type = gd.type || 'pythagoras';
    
    if (!this.snapPoints) this.snapPoints = [];
    this.snapPoints.length = 0;
    
    // Fond géré par le skin de canvas équipé
    
    ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    
    const cx = w / 2;
    const cy = h / 2;
    
    ctx.save();
    
    if (type === 'triangleInequality' || type === 'triangleConstruction') {
      const isFlat = gd.isFlat || false;
      const isIsosceles = gd.isIsosceles || false;
      
      const A = { x: cx - 140, y: cy + 60 };
      const B = { x: cx + 140, y: cy + 60 };
      const C = isFlat 
      ? { x: cx, y: cy + 60 } 
      : (isIsosceles ? { x: cx, y: cy - 90 } : { x: cx - 20, y: cy - 100 });
      
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(C.x, C.y); ctx.closePath();
      ctx.stroke();
      
      if (isIsosceles && !isFlat) {
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        const midAC = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
        const midBC = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };
        ctx.beginPath();
        ctx.moveTo(midAC.x - 5, midAC.y - 5); ctx.lineTo(midAC.x + 5, midAC.y + 5);
        ctx.moveTo(midBC.x - 5, midBC.y + 5); ctx.lineTo(midBC.x + 5, midBC.y - 5);
        ctx.stroke();
      }
      
      const points = [ { p: A, label: 'A' }, { p: B, label: 'B' }, { p: C, label: 'C' } ];
      points.forEach(pt => {
        ctx.fillStyle = "#ff0055";
        ctx.beginPath(); ctx.arc(pt.p.x, pt.p.y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px 'Fira Code', monospace";
        ctx.fillText(pt.label, pt.p.x - 6, pt.p.y - 10);
        this.snapPoints.push(pt.p);
      });
      
      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 12px 'Fira Code', monospace";
      ctx.fillText(`AB = ${gd.ab || '?'}`, cx - 25, cy + 80);
      ctx.fillText(`AC = ${gd.ac || '?'}`, (A.x + C.x) / 2 - 45, (A.y + C.y) / 2);
      ctx.fillText(`BC = ${gd.bc || '?'}`, (B.x + C.x) / 2 + 10, (B.y + C.y) / 2);
    }
    else if (type === 'pythagoras' || type === 'pythagore') {
      const A = { x: cx - 120, y: cy + 70 };
      const B = { x: cx + 120, y: cy + 70 };
      const C = { x: cx - 120, y: cy - 80 };
      
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(C.x, C.y); ctx.closePath();
      ctx.stroke();
      
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 0;
      ctx.strokeRect(A.x, A.y - 18, 18, 18);
      
      const vertices = [
        { p: A, label: 'A', ox: -16, oy: 16 },
        { p: B, label: 'B', ox: 12, oy: 16 },
        { p: C, label: 'C', ox: -16, oy: -12 }
      ];
      vertices.forEach(v => {
        ctx.fillStyle = "#ff0055";
        ctx.beginPath(); ctx.arc(v.p.x, v.p.y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px 'Fira Code', monospace";
        ctx.fillText(v.label, v.p.x + v.ox, v.p.y + v.oy);
        this.snapPoints.push(v.p);
      });
      
      ctx.fillStyle = "#00ff66";
      ctx.font = "bold 12px 'Fira Code', monospace";
      const targetLeg = gd.targetLeg || 'hypotenuse';
      ctx.fillText(`AB = ${targetLeg === 'AB' ? '?' : (gd.ab ? gd.ab + ' cm' : '3 cm')}`, cx - 10, A.y + 22);
      ctx.fillText(`AC = ${targetLeg === 'AC' ? '?' : (gd.ac ? gd.ac + ' cm' : '4 cm')}`, A.x - 65, cy);
      ctx.fillStyle = "#ff0055";
      ctx.fillText(`BC = ${targetLeg === 'hypotenuse' || targetLeg === 'BC' ? '?' : (gd.bc ? gd.bc + ' cm' : '5 cm')}`, cx, cy - 15);
    }
    else if (type === 'thales' || type === 'thalesTheorem' || type === 'thalesButterfly') {
      const isButterfly = gd.isButterfly || gd.configuration === 'papillon' || type === 'thalesButterfly';
      
      if (!isButterfly) {
        const A = { x: cx - 130, y: cy - 90 };
        const B = { x: cx - 40,  y: cy + 10 };
        const M = { x: cx + 10,  y: cy + 80 };
        const C = { x: cx + 110, y: cy + 10 };
        const N = { x: cx + 170, y: cy + 80 };
        
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y); ctx.lineTo(M.x, M.y);
        ctx.moveTo(A.x, A.y); ctx.lineTo(N.x, N.y);
        ctx.stroke();
        
        ctx.strokeStyle = "#00ff66";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#00ff66";
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.moveTo(B.x - 20, B.y); ctx.lineTo(C.x + 20, C.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(M.x - 20, M.y); ctx.lineTo(N.x + 20, N.y); ctx.stroke();
        
        ctx.fillStyle = "#00ff66";
        ctx.font = "bold 11px 'Fira Code', monospace";
        ctx.fillText("(d1)", C.x + 25, C.y + 4);
        ctx.fillText("(d2)", N.x + 25, N.y + 4);
        
        const pts = [
          { p: A, l: 'A', ox: -5, oy: -12 },
          { p: B, l: 'B', ox: -16, oy: -6 },
          { p: C, l: 'C', ox: 10, oy: -6 },
          { p: M, l: 'M', ox: -16, oy: 14 },
          { p: N, l: 'N', ox: 10, oy: 14 }
        ];
        pts.forEach(v => {
          ctx.fillStyle = "#ff0055";
          ctx.beginPath(); ctx.arc(v.p.x, v.p.y, 4.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px 'Fira Code', monospace";
          ctx.fillText(v.l, v.p.x + v.ox, v.p.y + v.oy);
          this.snapPoints.push(v.p);
        });
        
        if (gd.ab || gd.ac || gd.am) {
          ctx.font = "bold 11px 'Fira Code', monospace";
          ctx.fillStyle = "#ffd700";
          ctx.fillText(`AB = ${gd.ab || '?'} cm`, (A.x + B.x) / 2 - 45, (A.y + B.y) / 2);
          ctx.fillText(`AM = ${gd.am || '?'} cm`, (A.x + M.x) / 2 - 50, (A.y + M.y) / 2 + 15);
          ctx.fillText(`AC = ${gd.ac || '?'} cm`, (A.x + C.x) / 2 + 10, (A.y + C.y) / 2);
          ctx.fillText(`AN = ?`, (A.x + N.x) / 2 + 15, (A.y + N.y) / 2 + 15);
        }
      } else {
        const spreadX = Math.min(w, h) * 0.32;
        const spreadY = Math.min(w, h) * 0.22;
        
        const A = { x: cx, y: cy, label: "A" };
        const B = { x: cx - spreadX, y: cy - spreadY, label: "B" };
        const M = { x: cx + spreadX, y: cy - spreadY, label: "M" };
        const N = { x: cx - spreadX, y: cy + spreadY, label: "N" };
        const C = { x: cx + spreadX, y: cy + spreadY, label: "C" };
        
        ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 2.5; ctx.shadowColor = "#00f0ff"; ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(B.x, B.y); ctx.lineTo(C.x, C.y);
        ctx.moveTo(N.x, N.y); ctx.lineTo(M.x, M.y);
        ctx.stroke();
        
        ctx.strokeStyle = "#00ff66"; ctx.lineWidth = 3; ctx.shadowColor = "#00ff66";
        ctx.beginPath();
        ctx.moveTo(B.x - 15, B.y); ctx.lineTo(M.x + 15, M.y);
        ctx.moveTo(N.x - 15, N.y); ctx.lineTo(C.x + 15, C.y);
        ctx.stroke();
        
        ctx.fillStyle = "#00ff66"; ctx.font = "bold 11px 'Fira Code', monospace";
        ctx.fillText("(d1)", M.x + 20, M.y + 4);
        ctx.fillText("(d2)", C.x + 20, C.y + 4);
        
        const points = [A, B, C, M, N];
        points.forEach(p => {
          ctx.fillStyle = "#ff0055";
          ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
          this.snapPoints.push({ x: p.x, y: p.y });
        });
        
        ctx.font = "bold 13px 'Fira Code', monospace"; ctx.fillStyle = "#ffffff";
        const offsets = {
          A: { dx: 14, dy: -12, align: "left" },
          B: { dx: -18, dy: -12, align: "right" },
          M: { dx: 18, dy: -12, align: "left" },
          N: { dx: -18, dy: 18, align: "right" },
          C: { dx: 18, dy: 18, align: "left" }
        };
        
        points.forEach(p => {
          const off = offsets[p.label];
          ctx.textAlign = off.align;
          ctx.fillText(p.label, p.x + off.dx, p.y + off.dy);
        });
        
        if (gd.ab || gd.ac || gd.am) {
          ctx.font = "bold 11px 'Fira Code', monospace"; ctx.fillStyle = "#ffd700";
          ctx.textAlign = "right"; ctx.fillText(`AB = ${gd.ab || '?'} cm`, (A.x + B.x) / 2 - 14, (A.y + B.y) / 2);
          ctx.textAlign = "left";  ctx.fillText(`AM = ${gd.am || '?'} cm`, (A.x + M.x) / 2 + 14, (A.y + M.y) / 2);
          ctx.textAlign = "left";  ctx.fillText(`AC = ${gd.ac || '?'} cm`, (A.x + C.x) / 2 + 14, (A.y + C.y) / 2);
          ctx.textAlign = "right"; ctx.fillText(`AN = ?`, (A.x + N.x) / 2 - 14, (A.y + N.y) / 2);
        }
      }
    }
    else if (type === 'vectorTranslation') {
      const scale = 25;
      const startX = gd.startX !== undefined ? gd.startX : 1;
      const startY = gd.startY !== undefined ? gd.startY : 1;
      const vecX = gd.vecX !== undefined ? gd.vecX : 3;
      const vecY = gd.vecY !== undefined ? gd.vecY : 2;
      const endX = startX + vecX;
      const endY = startY + vecY;
      
      const pA = { x: cx + startX * scale - 40, y: cy - startY * scale + 40 };
      const pB = { x: cx + endX * scale - 40, y: cy - endY * scale + 40 };
      
      ctx.strokeStyle = "rgba(0, 240, 255, 0.25)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(40, cy + 40); ctx.lineTo(w - 40, cy + 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 40, 30); ctx.lineTo(cx - 40, h - 30); ctx.stroke();
      
      ctx.strokeStyle = "#ff0055"; ctx.lineWidth = 3; ctx.shadowColor = "#ff0055"; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.stroke();
      
      const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x);
      ctx.fillStyle = "#ff0055";
      ctx.beginPath();
      ctx.moveTo(pB.x, pB.y);
      ctx.lineTo(pB.x - 12 * Math.cos(angle - Math.PI / 6), pB.y - 12 * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(pB.x - 12 * Math.cos(angle + Math.PI / 6), pB.y - 12 * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = "#00f0ff"; ctx.shadowColor = "#00f0ff"; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(pA.x, pA.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.font = "bold 12px 'Fira Code', monospace";
      ctx.fillText(`A (${startX}, ${startY})`, pA.x - 20, pA.y + 18);
      
      ctx.fillStyle = "#ffd700";
      ctx.fillText(`u (${vecX}, ${vecY})`, (pA.x + pB.x) / 2 + 10, (pA.y + pB.y) / 2 - 10);
      
      ctx.fillStyle = "#00ff66"; ctx.shadowColor = "#00ff66"; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(pB.x, pB.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillText(`B = ?`, pB.x + 10, pB.y - 10);
      
      this.snapPoints.push(pA, pB);
    }
    else if (type === 'homothety' || type === 'tacticalZoom' || type === 'rotation' || type === 'turretRotation') {
      const isRotation = type === 'rotation' || type === 'turretRotation';
      const O = { x: cx - 140, y: cy + 30 };
      
      const A = { x: O.x + 60,  y: O.y - 20 };
      const B = { x: O.x + 100, y: O.y - 60 };
      const C = { x: O.x + 90,  y: O.y + 10 };
      
      let A_prime, B_prime, C_prime;
      
      if (!isRotation) {
        const k = gd.k !== undefined ? gd.k : 1.8;
        A_prime = { x: O.x + (A.x - O.x) * k, y: O.y + (A.y - O.y) * k };
        B_prime = { x: O.x + (B.x - O.x) * k, y: O.y + (B.y - O.y) * k };
        C_prime = { x: O.x + (C.x - O.x) * k, y: O.y + (C.y - O.y) * k };
        
        ctx.strokeStyle = "rgba(255, 215, 0, 0.4)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(O.x, O.y); ctx.lineTo(A_prime.x, A_prime.y);
        ctx.moveTo(O.x, O.y); ctx.lineTo(B_prime.x, B_prime.y);
        ctx.moveTo(O.x, O.y); ctx.lineTo(C_prime.x, C_prime.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = "#ffd700"; ctx.font = "bold 12px 'Fira Code', monospace";
        ctx.fillText(`Rapport k = ${k}`, cx, h - 25);
      } else {
        const theta = (gd.rotAngle || 60) * (Math.PI / 180);
        const rotatePoint = (P) => {
          const dx = P.x - O.x;
          const dy = P.y - O.y;
          return {
            x: O.x + dx * Math.cos(theta) - dy * Math.sin(theta),
            y: O.y + dx * Math.sin(theta) + dy * Math.cos(theta)
          };
        };
        A_prime = rotatePoint(A);
        B_prime = rotatePoint(B);
        C_prime = rotatePoint(C);
        
        ctx.strokeStyle = "#ffd700"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(O.x, O.y, 45, 0, theta, false); ctx.stroke();
        
        ctx.fillStyle = "#ffd700"; ctx.font = "bold 12px 'Fira Code', monospace";
        ctx.fillText(`Angle θ = ${gd.rotAngle || 60}°`, O.x + 55, O.y + 15);
      }
      
      ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 2; ctx.fillStyle = "rgba(0, 240, 255, 0.15)";
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(C.x, C.y); ctx.closePath();
      ctx.fill(); ctx.stroke();
      
      ctx.strokeStyle = "#ff0055"; ctx.lineWidth = 2.5; ctx.fillStyle = "rgba(255, 0, 85, 0.2)";
      ctx.shadowColor = "#ff0055"; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(A_prime.x, A_prime.y); ctx.lineTo(B_prime.x, B_prime.y); ctx.lineTo(C_prime.x, C_prime.y); ctx.closePath();
      ctx.fill(); ctx.stroke();
      
      ctx.fillStyle = "#ffd700";
      ctx.beginPath(); ctx.arc(O.x, O.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.font = "bold 13px 'Fira Code', monospace";
      ctx.fillText("O (Centre)", O.x - 20, O.y + 20);
      
      const allPts = [
        { p: O, l: 'O' }, { p: A, l: 'A' }, { p: B, l: 'B' }, { p: C, l: 'C' },
        { p: A_prime, l: "A'" }, { p: B_prime, l: "B'" }, { p: C_prime, l: "C'" }
      ];
      allPts.forEach(pt => this.snapPoints.push(pt.p));
    }
    else if (type === 'trigoComplete' || type === 'trigoCos') {
      const tw = Math.min(w, h) * 0.35;
      const th = Math.min(w, h) * 0.22;
      const A = { x: cx - tw, y: cy + th };
      const B = { x: cx + tw, y: cy + th };
      const C = { x: cx - tw, y: cy - th };
      
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "rgba(0, 240, 255, 0.1)";
      
      ctx.beginPath();
      ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(C.x, C.y);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      
      // Codage de l'angle droit en A
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 0;
      ctx.strokeRect(A.x, A.y - 18, 18, 18);
      
      // Arc d'angle sur le sommet B
      const radB = Math.atan2(th * 2, tw * 2);
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(B.x, B.y, 35, Math.PI, Math.PI + radB, false);
      ctx.stroke();
      
      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 13px 'Fira Code', monospace";
      ctx.fillText("α", B.x - 45, B.y - 8);
      
      const pts = [
        { p: A, label: 'A', ox: -18, oy: 15 },
        { p: B, label: 'B', ox: 10, oy: 5 },
        { p: C, label: 'C', ox: -18, oy: -10 }
      ];
      pts.forEach(v => {
        ctx.fillStyle = "#ff0055";
        ctx.shadowColor = "#ff0055";
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(v.p.x, v.p.y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px 'Fira Code', monospace";
        ctx.fillText(v.label, v.p.x + v.ox, v.p.y + v.oy);
        this.snapPoints.push(v.p);
      });
      
      ctx.font = "bold 12px 'Fira Code', monospace";
      ctx.fillStyle = "#00ff66";
      ctx.shadowColor = "#00ff66";
      ctx.shadowBlur = 8;
      
      const adjText = gd.adj ? `${gd.adj} cm` : '4 cm';
      const hypText = gd.hyp ? `${gd.hyp} cm` : '5 cm';
      const oppText = gd.opp ? `${gd.opp} cm` : '3 cm';
      
      ctx.fillText(`AB (adj) = ${adjText}`, cx - 35, A.y + 22);
      ctx.fillText(`BC (hyp) = ${hypText}`, cx - 10, cy - 12);
      ctx.fillStyle = "#ffd700";
      ctx.fillText(`AC (opp) = ${oppText}`, A.x - 75, cy);
    }
    else {
      ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI * 2); ctx.stroke();
      this.snapPoints.push({ x: cx, y: cy });
    }
    
    if (typeof this.drawCompass === "function") {
      this.drawCompass(ctx, w);
    }
    
    ctx.restore();
  },
  
  drawWorld6Vectors(w, h, quest) {
    this.drawWorld6Theorems(w, h, quest);
  },
  
  /* ==========================================================================
  OUTILS TACTIQUES SURIMPOSÉS (RÈGLE, ÉQUERRE, RAPPORTEUR)
  ========================================================================== */
  drawOverlayTool(w, h) {
    if (this.activeTool === "pointer") return;
    const ctx = this.ctx;
    const { x, y } = this.toolPos;

    ctx.save();
    ctx.translate(x, y);

    // 1. RÈGLE TACTIQUE (RULER)
    if (this.activeTool === "ruler") {
      const skin = (typeof SHOP_SKINS !== 'undefined' && this.equippedSkins)
        ? (SHOP_SKINS.find(s => s.id === this.equippedSkins.ruler) || { renderStyle: "assassin_blade" })
        : { renderStyle: "assassin_blade" };

      const rWidth = 280, rHeight = 48;

      if (skin.renderStyle === "dragstrip") {
        // --- BANDE DRAGSTRIP NITRO (CARBON & FIRE) ---
        ctx.fillStyle = "#0d1117";
        ctx.strokeStyle = "#ff9900";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#ff9900";
        ctx.shadowBlur = 16;

        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(0, 0, rWidth, rHeight, 6);
        } else {
          ctx.rect(0, 0, rWidth, rHeight);
        }
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let c = -rHeight; c < rWidth; c += 8) {
          ctx.beginPath(); ctx.moveTo(c, 0); ctx.lineTo(c + rHeight, rHeight); ctx.stroke();
        }

        ctx.fillStyle = "#ff9900";
        ctx.fillRect(0, 18, rWidth, 4);
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(0, 24, rWidth, 2);

        for (let rx = 0; rx < 24; rx += 6) {
          for (let ry = 0; ry < rHeight; ry += 6) {
            if (((rx + ry) / 6) % 2 === 0) {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(rx, ry, 6, 6);
            }
          }
        }

        ctx.strokeStyle = "#ff9900";
        ctx.lineWidth = 1.8;
        ctx.shadowColor = "#ff9900";
        ctx.shadowBlur = 8;
        for (let i = 30; i < rWidth - 10; i += 10) {
          const val = i - 30;
          const isMajor = val % 50 === 0;
          const isMedium = val % 20 === 0;
          const hTick = isMajor ? 18 : (isMedium ? 12 : 7);

          ctx.beginPath();
          ctx.moveTo(i, rHeight);
          ctx.lineTo(i, rHeight - hTick);
          ctx.stroke();

          if (isMajor) {
            ctx.fillStyle = "#ffd700";
            ctx.font = "bold 9px 'Fira Code', monospace";
            ctx.fillText(`${val}`, i - 6, rHeight - 20);
          }
        }

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px 'Fira Code', monospace";
        ctx.shadowBlur = 0;
        ctx.fillText("MOTORFEST_NITRO // DRAGSTRIP", 35, 13);

      } else {
        // --- LAME SECRÈTE GRADUÉE (ASSASSIN'S CREST) ---
        const bladeGrad = ctx.createLinearGradient(0, 0, rWidth, rHeight);
        bladeGrad.addColorStop(0, "#0f172a");
        bladeGrad.addColorStop(0.3, "#1e293b");
        bladeGrad.addColorStop(0.7, "#334155");
        bladeGrad.addColorStop(1, "#00f0ff");

        ctx.fillStyle = bladeGrad;
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 18;

        ctx.beginPath();
        ctx.moveTo(0, 6);
        ctx.lineTo(rWidth - 45, 6);
        ctx.lineTo(rWidth, rHeight / 2);
        ctx.lineTo(rWidth - 45, rHeight - 6);
        ctx.lineTo(0, rHeight - 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, rHeight / 2);
        ctx.lineTo(rWidth - 15, rHeight / 2);
        ctx.stroke();

        ctx.strokeStyle = "#00f0ff";
        ctx.fillStyle = "rgba(0, 240, 255, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(20, rHeight / 2 - 10);
        ctx.lineTo(28, rHeight / 2 + 10);
        ctx.lineTo(12, rHeight / 2 + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "#00f0ff";
        ctx.shadowBlur = 10;
        for (let i = 35; i < rWidth - 50; i += 10) {
          const val = i - 35;
          const isMajor = val % 50 === 0;
          const isMedium = val % 20 === 0;
          const hTick = isMajor ? 14 : (isMedium ? 10 : 5);

          ctx.beginPath();
          ctx.moveTo(i, 6);
          ctx.lineTo(i, 6 + hTick);
          ctx.stroke();

          if (isMajor) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 9px 'Fira Code', monospace";
            ctx.fillText(`${val}`, i - 5, 28);
          }
        }

        ctx.fillStyle = "#00f0ff";
        ctx.font = "bold 9px 'Fira Code', monospace";
        ctx.fillText("ASSASSIN_BLADE // 250MM", rWidth - 145, rHeight - 10);
      }
    }

    // 2. ÉQUERRE LASER (SQUARE)
    else if (this.activeTool === "square") {
      const skin = (typeof SHOP_SKINS !== 'undefined' && this.equippedSkins)
        ? (SHOP_SKINS.find(s => s.id === this.equippedSkins.square) || { renderStyle: "cyber_katana" })
        : { renderStyle: "cyber_katana" };

      const sSize = 160;

      if (skin.renderStyle === "cyber_katana") {
        // --- KATANA MONOMOLÉCULAIRE 90° ---
        ctx.strokeStyle = "#ff0055";
        ctx.lineWidth = 5;
        ctx.shadowColor = "#ff0055";
        ctx.shadowBlur = 22;

        ctx.beginPath();
        ctx.moveTo(0, -sSize);
        ctx.lineTo(0, 0);
        ctx.lineTo(sSize, 0);
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.8;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(0, -sSize + 10);
        ctx.lineTo(0, 0);
        ctx.lineTo(sSize - 10, 0);
        ctx.stroke();

        ctx.fillStyle = "#111827";
        ctx.strokeStyle = "#ff0055";
        ctx.lineWidth = 2;
        ctx.fillRect(-12, -12, 24, 24);
        ctx.strokeRect(-12, -12, 24, 24);

        ctx.strokeStyle = "#ffe600";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8, -8); ctx.lineTo(8, 8);
        ctx.moveTo(-8, 8); ctx.lineTo(8, -8);
        ctx.stroke();

        ctx.strokeStyle = "#ffe600";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#ffe600";
        ctx.shadowBlur = 12;
        ctx.strokeRect(0, -20, 20, 20);

        ctx.fillStyle = "#ffe600";
        ctx.font = "bold 10px 'Fira Code', monospace";
        ctx.fillText("90° LOCK", 26, -10);

        ctx.fillStyle = "#ff0055";
        ctx.font = "bold 9px 'Fira Code', monospace";
        ctx.fillText("CYBER_KATANA_90°", 15, -sSize + 15);

      } else if (skin.renderStyle === "void_arc") {
        // --- ÉQUERRE VOID ARC (ABYSSAL PURPLE) ---
        ctx.fillStyle = "rgba(168, 85, 247, 0.2)";
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 20;

        ctx.beginPath();
        ctx.moveTo(0, -sSize);
        ctx.lineTo(0, 0);
        ctx.lineTo(sSize, 0);
        ctx.lineTo(sSize, -24);
        ctx.lineTo(24, -24);
        ctx.lineTo(24, -sSize);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 10;
        for (let p = 40; p < sSize - 20; p += 35) {
          ctx.beginPath(); ctx.arc(12, -p, 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(p, -12, 2.5, 0, Math.PI * 2); ctx.fill();
        }

        ctx.strokeStyle = "#c084fc";
        ctx.strokeRect(0, -18, 18, 18);

        ctx.fillStyle = "#c084fc";
        ctx.font = "bold 9px 'Fira Code', monospace";
        ctx.fillText("VOID_ARC // 90°", 30, -30);

      } else {
        // --- ÉQUERRE REDSTONE BLOCK (MINECRAFT VOXEL) ---
        ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
        ctx.strokeStyle = "#ff2200";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#ff2200";
        ctx.shadowBlur = 18;

        ctx.beginPath();
        ctx.moveTo(0, -sSize);
        ctx.lineTo(0, 0);
        ctx.lineTo(sSize, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ff2200";
        ctx.fillRect(-6, -6, 12, 12);
        ctx.fillRect(sSize - 6, -6, 12, 12);
        ctx.fillRect(-6, -sSize - 6, 12, 12);

        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(8, -sSize + 15);
        ctx.lineTo(8, -8);
        ctx.lineTo(sSize - 15, -8);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px 'Fira Code', monospace";
        ctx.fillText("REDSTONE_90°", 20, -20);
      }
    }

    // 3. RAPPORTEUR HOLO (PROTRACTOR)
    else if (this.activeTool === "protractor") {
      const skin = (typeof SHOP_SKINS !== 'undefined' && this.equippedSkins)
        ? (SHOP_SKINS.find(s => s.id === this.equippedSkins.protractor) || { renderStyle: "vice_speedo" })
        : { renderStyle: "vice_speedo" };

      const radius = 115;

      if (skin.renderStyle === "vice_speedo") {
        // --- COMPTEUR VICE SUNSET (OUTRUN SYNTHWAVE) ---
        const sunGrad = ctx.createLinearGradient(0, -radius, 0, 0);
        sunGrad.addColorStop(0, "rgba(236, 72, 153, 0.4)");
        sunGrad.addColorStop(0.5, "rgba(249, 115, 22, 0.3)");
        sunGrad.addColorStop(1, "rgba(31, 5, 41, 0.85)");

        ctx.fillStyle = sunGrad;
        ctx.strokeStyle = "#ff007f";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#ff007f";
        ctx.shadowBlur = 20;

        ctx.beginPath();
        ctx.arc(0, 0, radius, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
        ctx.lineWidth = 1;
        for (let yG = -20; yG > -radius; yG -= 18) {
          ctx.beginPath();
          ctx.moveTo(-Math.sqrt(radius * radius - yG * yG), yG);
          ctx.lineTo(Math.sqrt(radius * radius - yG * yG), yG);
          ctx.stroke();
        }

        ctx.strokeStyle = "#00f0ff";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 10;

        for (let deg = 0; deg <= 180; deg += 10) {
          const rad = (deg * Math.PI) / 180;
          const isMajor = deg % 30 === 0;
          const tickLen = isMajor ? 16 : (deg % 10 === 0 ? 10 : 6);

          const xOuter = Math.cos(Math.PI + rad) * radius;
          const yOuter = Math.sin(Math.PI + rad) * radius;
          const xInner = Math.cos(Math.PI + rad) * (radius - tickLen);
          const yInner = Math.sin(Math.PI + rad) * (radius - tickLen);

          ctx.lineWidth = isMajor ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(xOuter, yOuter);
          ctx.lineTo(xInner, yInner);
          ctx.stroke();

          if (isMajor) {
            const xTxt = Math.cos(Math.PI + rad) * (radius - 28);
            const yTxt = Math.sin(Math.PI + rad) * (radius - 28);

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 9px 'Fira Code', monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`${deg}°`, xTxt, yTxt);
          }
        }

        ctx.strokeStyle = "#ff007f";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#ff007f";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -radius + 20);
        ctx.stroke();

        ctx.fillStyle = "#00f0ff";
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = "bold 9px 'Fira Code', monospace";
        ctx.fillStyle = "#ff007f";
        ctx.fillText("VICE_SPEEDO // 180°", -40, -12);

      } else {
        // --- CHRONOS TIME / AMBER HOLO ---
        ctx.fillStyle = "rgba(251, 191, 36, 0.18)";
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 15;

        ctx.beginPath();
        ctx.arc(0, 0, radius, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        for (let deg = 0; deg <= 180; deg += 15) {
          const rad = (deg * Math.PI) / 180;
          const xO = Math.cos(Math.PI + rad) * radius;
          const yO = Math.sin(Math.PI + rad) * radius;
          const xI = Math.cos(Math.PI + rad) * (radius - 12);
          const yI = Math.sin(Math.PI + rad) * (radius - 12);

          ctx.beginPath(); ctx.moveTo(xO, yO); ctx.lineTo(xI, yI); ctx.stroke();
        }

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px 'Fira Code', monospace";
        ctx.textAlign = "center";
        ctx.fillText("CHRONOS_180°", 0, -radius / 2);
      }
    }

    if (typeof this.drawCompass === "function") {
      this.drawCompass(ctx, w);
    }

    ctx.restore();
  }
});

// Instanciation globale une fois tous les prototypes rattachés
window.game = new GameEngine();