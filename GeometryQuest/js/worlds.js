const GAME_WORLDS = {
  // ------------------------------------------------------------------------
  // MONDE 1 : RADAR TACTIQUE & REPÉRAGE SPATIAL
  // ------------------------------------------------------------------------
  1: {
    name: "Monde 1 : Radar Tactique & Repérage Spatial",
    icon: "🗺️",
    ranks: [
      // RANG 1 : NOOB (CE1) — Quadrillage 5x5 & Repérage de case
      {
        rankId: "RANG 1",
        rankTitle: "NOOB",
        generate: () => {
          const cols = ["A", "B", "C", "D", "E"];
          const colIdx = randomInt(0, 4);
          const rowNum = randomInt(1, 5);
          const col = cols[colIdx];
          const structType = randomInt(0, 3);
          
          if (structType === 0) {
            const ans = `${col},${rowNum}`;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${rowNum},${col}`;
              if (i === 2) return `${cols[(colIdx + 1) % 5]},${rowNum}`;
              if (i === 3) return `${col},${(rowNum % 5) + 1}`;
              return `${cols[(colIdx + i) % 5]},${((rowNum + i) % 5) + 1}`;
            });
            
            return {
              title: "Radar Tactique : Repérage de Case",
              desc: "Un conteneur de ravitaillement est détecté sur le radar tactique. Analyse la grille et désigne le codage de la case ciblée.",
              answer: ans,
              hint: "Pour désigner une case sur un quadrillage, lis d'abord la lettre de la colonne au bas de la grille, puis le numéro de la ligne sur le côté gauche.",
              geoData: { type: 'crate', col, row: rowNum, gridSize: 5, hideTarget: false, isCell: true, targetType: 'cell' },
              demo: { exampleQuestion: "Saisir la case du conteneur repéré", exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const askColumn = Math.random() < 0.5;
            const ans = askColumn ? `Colonne ${col}` : `Ligne ${rowNum}`;
            const options = buildUniqueOptions(ans, (i) => {
              if (askColumn) return `Colonne ${cols[(colIdx + i) % 5]}`;
              return `Ligne ${((rowNum + i - 1) % 5) + 1}`;
            });
            
            return {
              title: "Radar Tactique : Localisation de Signal",
              desc: `Le signal est verrouillé dans la case (${col},${rowNum}). Sur quelle ${askColumn ? 'colonne' : 'ligne'} exacte se situe-t-il ?`,
              answer: ans,
              hint: askColumn ? "La colonne correspond à la lettre (axe horizontal au bas de la grille)." : "La ligne correspond au numéro (axe vertical sur le côté).",
              geoData: { type: 'crate', col, row: rowNum, gridSize: 5, hideTarget: false, isCell: true, targetType: 'cell' },
              demo: { exampleQuestion: `Extraire la ${askColumn ? 'colonne' : 'ligne'} pour (${col},${rowNum})`, exampleAnswer: ans },
              options
            };
          } else if (structType === 2) {
            const ans = `${col},${rowNum}`;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${rowNum},${col}`;
              if (i === 2) return `${cols[(colIdx + 2) % 5]},${rowNum}`;
              return `${cols[(colIdx + i) % 5]},${((rowNum + i) % 5) + 1}`;
            });
            
            return {
              title: "Positionnement de Signal",
              desc: `Déploie la balise tactique exactement sur la colonne ${col} et la ligne ${rowNum}. Indique le nom de sa case en combinant sa colonne et sa ligne.`,
              answer: ans,
              hint: "Le codage d'une case s'écrit en associant la lettre de sa colonne et le numéro de sa ligne, séparés par une virgule.",
              geoData: { type: 'crate', col, row: rowNum, gridSize: 5, hideTarget: false, isCell: true, targetType: 'cell' },
              demo: { exampleQuestion: `Codage pour la colonne ${col} et la ligne ${rowNum}`, exampleAnswer: ans },
              options
            };
          } else {
            const isEast = colIdx < 4;
            const nextCol = isEast ? cols[colIdx + 1] : cols[colIdx - 1];
            const dirName = isEast ? "l'Est" : "l'Ouest";
            const ans = `${nextCol},${rowNum}`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${col},${rowNum}`;
              if (i === 2) return `${cols[(colIdx + i) % 5]},${rowNum}`;
              return `${nextCol},${((rowNum + i) % 5) + 1}`;
            });
            
            return {
              title: "Déplacement Tactique d'une Case",
              desc: `Un robot est positionné en (${col},${rowNum}). Il effectue un déplacement d'une case vers ${dirName}. Quelle est sa nouvelle case ?`,
              answer: ans,
              hint: `Un déplacement vers ${dirName} modifie la lettre de colonne vers la ${isEast ? 'droite' : 'gauche'}.`,
              geoData: { type: 'cardinalPath', col: nextCol, row: rowNum, startCol: col, startRow: rowNum, endCol: nextCol, endRow: rowNum, gridSize: 5 },
              demo: { exampleQuestion: `Case après 1 pas vers ${dirName} depuis (${col},${rowNum})`, exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 2 : NOVICE (CE2) — Déplacements fléchés & Échelles
      {
        rankId: "RANG 2",
        rankTitle: "NOVICE",
        generate: () => {
          const cols = ["A", "B", "C", "D", "E"];
          const structType = randomInt(0, 3);
          const scaleM = randomPick([50, 100, 200, 250, 500]);
          
          const stepE = randomPick([1, 2, 3]);
          const stepN = randomPick([1, 2, 3]);
          const startC = randomInt(0, 4 - stepE);
          const startR = randomInt(0, 4 - stepN);
          
          const endC = startC + stepE;
          const endR = startR + stepN;
          
          const startPos = `${cols[startC]},${startR + 1}`;
          const endPos = `${cols[endC]},${endR + 1}`;
          
          if (structType === 0) {
            const ans = endPos;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return startPos;
              if (i === 2) return `${cols[startC]},${endR + 1}`;
              if (i === 3) return `${cols[endC]},${startR + 1}`;
              return `${cols[(endC + i) % 5]},${((endR + i) % 5) + 1}`;
            });
            
            return {
              title: "Plan de Vol Drone : Recherche de Destination",
              desc: `Un drone prend son départ sur la case (${startPos}). Il effectue un déplacement de ${stepE} case(s) vers l'Est, puis ${stepN} case(s) vers le Nord. Sur quelle case le drone termine-t-il son parcours ?`,
              answer: ans,
              hint: "Suis l'itinéraire carreau par carreau : un déplacement vers l'Est décale vers la droite, tandis qu'un déplacement vers le Nord fait monter vers le haut.",
              geoData: { type: 'cardinalPath', col: cols[endC], row: endR + 1, startCol: cols[startC], startRow: startR + 1, endCol: cols[endC], endRow: endR + 1, gridSize: 5, scale: `1 case = ${scaleM} m`, hideTarget: true },
              demo: { exampleQuestion: `Départ (${startPos}) + ${stepE}E, ${stepN}N`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const ans = startPos;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return endPos;
              if (i === 2) return `${cols[startC]},${endR + 1}`;
              return `${cols[(startC + i) % 5]},${((startR + i) % 5) + 1}`;
            });
            
            return {
              title: "Plan de Vol Drone : Origine du Trajet",
              desc: `Un drone atterrit en (${endPos}) après avoir franchi ${stepE} case(s) vers l'Est et ${stepN} case(s) vers le Nord. Quelle était sa case de départ ?`,
              answer: ans,
              hint: `Effectue le trajet inverse depuis (${endPos}) : recule de ${stepE} case(s) vers l'Ouest et descends de ${stepN} case(s) vers le Sud.`,
              geoData: { type: 'cardinalPath', col: cols[endC], row: endR + 1, startCol: cols[startC], startRow: startR + 1, endCol: cols[endC], endRow: endR + 1, gridSize: 5, scale: `1 case = ${scaleM} m` },
              demo: { exampleQuestion: `Arrivée (${endPos}) issue de ${stepE}E, ${stepN}N`, exampleAnswer: ans },
              options
            };
          } else if (structType === 2) {
            const totalCases = stepE + stepN;
            const totalDistM = totalCases * scaleM;
            const ans = `${totalDistM} m`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${(totalCases + 1) * scaleM} m`;
              if (i === 2) return `${totalCases} m`;
              if (i === 3) return `${(totalCases - 1) * scaleM} m`;
              return `${(totalCases + i) * scaleM} m`;
            });
            
            return {
              title: "Plan de Vol Drone : Mesure du Trajet",
              desc: `Un drone s'élance depuis (${startPos}) et franchit ${stepE} case(s) vers l'Est puis ${stepN} case(s) vers le Nord. Si 1 case = ${scaleM} m, combien de mètres a-t-il parcourus au total ?`,
              answer: ans,
              hint: `Le nombre total de cases franchies (${stepE} + ${stepN} = ${totalCases}) doit être multiplié par la valeur métrique de l'échelle (${scaleM} m par case).`,
              geoData: { type: 'cardinalPath', col: cols[endC], row: endR + 1, startCol: cols[startC], startRow: startR + 1, endCol: cols[endC], endRow: endR + 1, gridSize: 5, scale: `1 case = ${scaleM} m` },
              demo: { exampleQuestion: `Distance pour ${totalCases} cases (${scaleM} m/case)`, exampleAnswer: ans },
              options
            };
          } else {
            const ans = `${stepE}O, ${stepN}S`;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${stepE}E, ${stepN}N`;
              if (i === 2) return `${stepN}O, ${stepE}S`;
              if (i === 3) return `${stepE}N, ${stepN}O`;
              return `${stepE + i}O, ${stepN}S`;
            });
            
            return {
              title: "Ordre de Retrait : Trajet Retour",
              desc: `Le drone a exécuté un itinéraire de ${stepE} case(s) vers l'Est suivi de ${stepN} case(s) vers le Nord. Quelle instruction inverse permet de le ramener au point de départ ?`,
              answer: ans,
              hint: "Pour inverser un trajet sur une carte, chaque direction doit être remplacée par son opposée : l'Ouest (O) annule l'Est (E), et le Sud (S) annule le Nord (N).",
              geoData: { type: 'cardinalPath', col: cols[endC], row: endR + 1, startCol: cols[startC], startRow: startR + 1, endCol: cols[endC], endRow: endR + 1, gridSize: 5 },
              demo: { exampleQuestion: `Ordre inverse pour ${stepE}E, ${stepN}N`, exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 3 : APPRENTI (CM1) — Grand Radar 8x8
      {
        rankId: "RANG 3",
        rankTitle: "APPRENTI",
        generate: () => {
          const cols = ["A", "B", "C", "D", "E", "F", "G", "H"];
          const colIdx = randomInt(0, 7);
          const rowNum = randomInt(1, 8);
          const col = cols[colIdx];
          const structType = randomInt(0, 3);
          
          if (structType === 0) {
            const ans = `${col},${rowNum}`;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${rowNum},${col}`;
              if (i === 2) return `${cols[(colIdx + 1) % 8]},${rowNum}`;
              return `${cols[(colIdx + i) % 8]},${((rowNum + i) % 8) + 1}`;
            });
            
            return {
              title: "Radar Étendu 8x8 : Détection de Balise",
              desc: "Une balise d'interception apparaît sur le radar étendu à 8 colonnes et 8 lignes. Indique la case exacte occupée par ce signal.",
              answer: ans,
              hint: "Sur une grille 8x8, repère la colonne désignée par une lettre de A à H, puis remonte le long de cette colonne jusqu'au numéro de ligne correspondant de 1 à 8.",
              geoData: { type: 'crate', col, row: rowNum, gridSize: 8, hideTarget: false, isCell: true, targetType: 'cell' },
              demo: { exampleQuestion: "Indiquer la case de la balise repérée", exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const stepE = 2;
            const stepN = 3;
            const endCIdx = (colIdx + stepE) % 8;
            const endRNum = ((rowNum - 1 + stepN) % 8) + 1;
            const ans = `${cols[endCIdx]},${endRNum}`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${col},${rowNum}`;
              return `${cols[(endCIdx + i) % 8]},${((endRNum + i - 1) % 8) + 1}`;
            });
            
            return {
              title: "Radar Étendu 8x8 : Déplacement Composé",
              desc: `Depuis la case (${col},${rowNum}), une unité effectue un déplacement de 2 cases vers l'Est et 3 cases vers le Nord sur le réseau 8x8. Sur quelle case se trouve-t-elle ?`,
              answer: ans,
              hint: "Décale-toi de 2 colonnes vers la droite (Est) et remonte de 3 lignes vers le haut (Nord).",
              geoData: { type: 'cardinalPath', col: cols[endCIdx], row: endRNum, startCol: col, startRow: rowNum, endCol: cols[endCIdx], endRow: endRNum, gridSize: 8, hideTarget: true },
              demo: { exampleQuestion: `Case atteinte depuis (${col},${rowNum}) + 2E, 3N`, exampleAnswer: ans },
              options
            };
          } else if (structType === 2) {
            const stepE = 3;
            const stepN = 2;
            const startCIdx = (colIdx - stepE + 8) % 8;
            const startRNum = ((rowNum - 1 - stepN + 8) % 8) + 1;
            const ans = `${cols[startCIdx]},${startRNum}`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${col},${rowNum}`;
              return `${cols[(startCIdx + i) % 8]},${((startRNum + i - 1) % 8) + 1}`;
            });
            
            return {
              title: "Radar Étendu 8x8 : Recherche d'Origine",
              desc: `Une unité est positionnée sur la case (${col},${rowNum}) après avoir exécuté un trajet de 3 cases à l'Est et 2 cases au Nord. Quelle était sa case d'origine ?`,
              answer: ans,
              hint: "Pour retrouver la case d'origine, décale-toi de 3 lettres vers la gauche (Ouest) et descends de 2 numéros de ligne (Sud).",
              geoData: { type: 'cardinalPath', col, row: rowNum, startCol: cols[startCIdx], startRow: startRNum, endCol: col, endRow: rowNum, gridSize: 8 },
              demo: { exampleQuestion: `Provenance si arrivée en (${col},${rowNum})`, exampleAnswer: ans },
              options
            };
          } else {
            const isEast = colIdx >= 4;
            const isNorth = rowNum >= 5;
            let sector = "";
            if (isNorth && !isEast) sector = "Secteur Nord-Ouest";
            else if (isNorth && isEast) sector = "Secteur Nord-Est";
            else if (!isNorth && !isEast) sector = "Secteur Sud-Ouest";
            else sector = "Secteur Sud-Est";
            
            const ans = sector;
            const options = buildUniqueOptions(ans, () => shuffleArray([
              "Secteur Nord-Ouest", "Secteur Nord-Est", "Secteur Sud-Ouest", "Secteur Sud-Est"
            ])[0]);
            
            return {
              title: "Radar Étendu 8x8 : Verrouillage de Zone",
              desc: `Analyse la position de la cible active (${col},${rowNum}) sur la matrice 8x8. Dans quel quadrant ou secteur géographique se situe-t-elle ?`,
              answer: ans,
              hint: "Colonnes A à D = Ouest | Colonnes E à H = Est | Lignes 5 à 8 = Nord | Lignes 1 à 4 = Sud.",
              geoData: { type: 'crate', col, row: rowNum, gridSize: 8, hideTarget: false, isCell: true, targetType: 'cell' },
              demo: { exampleQuestion: `Secteur de la case (${col},${rowNum})`, exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 4 : CONFIRMÉ (CM2) — Directions cardinales & Trajets
      {
        rankId: "RANG 4",
        rankTitle: "CONFIRMÉ",
        generate: () => {
          const cols = ["A", "B", "C", "D", "E"];
          const structType = randomInt(0, 3);
          const unitScaleKm = randomPick([10, 15, 20, 25, 50]);
          
          const stepS = randomPick([1, 2, 3]);
          const stepE = randomPick([1, 2, 3]);
          const startC = randomInt(0, 4 - stepE);
          const startR = randomInt(stepS, 4);
          
          const endC = startC + stepE;
          const endR = startR - stepS;
          
          if (structType === 0) {
            const totalDistKm = (stepS + stepE) * unitScaleKm;
            const ans = `${totalDistKm} km`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${(stepS + stepE) * (unitScaleKm + 5)} km`;
              if (i === 2) return `${totalDistKm - unitScaleKm} km`;
              return `${totalDistKm + i * unitScaleKm} km`;
            });
            
            return {
              title: "Trajectoire Rover : Calcul de Distance",
              desc: `Le Rover effectue plusieurs pas successifs : ${stepS} pas vers le Sud puis ${stepE} pas vers l'Est. Si la valeur métrique d'un pas est fixée à ${unitScaleKm} km, quelle est la distance totale parcourue sur le terrain ?`,
              answer: ans,
              hint: "La distance totale s'obtient en faisant la somme de tous les pas franchis le long des différentes directions cardinales, puis en multipliant ce total par la valeur de l'échelle.",
              geoData: { type: 'dronePath2D', col: cols[endC], row: endR + 1, startCol: cols[startC], startRow: startR + 1, endCol: cols[endC], endRow: endR + 1, gridSize: 5, scale: `1 pas = ${unitScaleKm} km` },
              demo: { exampleQuestion: `Distance pour ${stepS} pas S + ${stepE} pas E (${unitScaleKm} km/pas)`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const ans = `${stepS}N, ${stepE}O`;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${stepS}S, ${stepE}E`;
              if (i === 2) return `${stepE}N, ${stepS}O`;
              return `${stepS + i}N, ${stepE}O`;
            });
            
            return {
              title: "Trajectoire Rover : Ordre de Trajet Retour",
              desc: `Un Rover a exécuté un parcours composé de ${stepS} pas vers le Sud suivi de ${stepE} pas vers l'Est. Quelle instruction de déplacement inverse permet de le ramener directement à son point de départ ?`,
              answer: ans,
              hint: "Pour inverser un trajet sur une carte, chaque direction cardinale doit être remplacée par son opposée : le Nord (N) annule le Sud (S), et l'Ouest (O) annule l'Est (E).",
              geoData: { type: 'dronePath2D', col: cols[endC], row: endR + 1, startCol: cols[startC], startRow: startR + 1, endCol: cols[endC], endRow: endR + 1, gridSize: 5, scale: `1 pas = ${unitScaleKm} km` },
              demo: { exampleQuestion: `Ordre inverse de ${stepS}S, ${stepE}E`, exampleAnswer: ans },
              options
            };
          } else if (structType === 2) {
            const startPos = `${cols[startC]},${startR + 1}`;
            const ans = startPos;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${cols[endC]},${endR + 1}`;
              return `${cols[(startC + i) % 5]},${((startR + i) % 5) + 1}`;
            });
            
            return {
              title: "Trajectoire Rover : Identification du Départ",
              desc: `Le Rover a atteint la case (${cols[endC]},${endR + 1}) après avoir fait ${stepS} pas vers le Sud et ${stepE} pas vers l'Est. Quelle était sa position de départ ?`,
              answer: ans,
              hint: "Remonte l'itinéraire depuis l'arrivée : fais les pas inverses vers le Nord et vers l'Ouest.",
              geoData: { type: 'dronePath2D', col: cols[endC], row: endR + 1, startCol: cols[startC], startRow: startR + 1, endCol: cols[endC], endRow: endR + 1, gridSize: 5 },
              demo: { exampleQuestion: `Départ si arrivée (${cols[endC]},${endR + 1})`, exampleAnswer: ans },
              options
            };
          } else {
            const totalDist = (stepS + stepE) * unitScaleKm;
            const ans = `${unitScaleKm} km`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${unitScaleKm + 5} km`;
              if (i === 2) return `${totalDist} km`;
              return `${unitScaleKm + i * 10} km`;
            });
            
            return {
              title: "Trajectoire Rover : Calcul d'Échelle",
              desc: `Un parcours mesuré à ${totalDist} km au total correspond à ${stepS + stepE} pas franchis sur la carte. Quelle est la valeur de l'échelle pour 1 pas ?`,
              answer: ans,
              hint: `Divise la distance totale par le nombre de pas : ${totalDist} / ${stepS + stepE}.`,
              geoData: { type: 'dronePath2D', col: cols[endC], row: endR + 1, startCol: cols[startC], startRow: startR + 1, endCol: cols[endC], endRow: endR + 1, gridSize: 5 },
              demo: { exampleQuestion: `Échelle pour 1 pas si ${stepS + stepE} pas = ${totalDist} km`, exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 5 : EXPERT (6ème) — Repère orthogonal (x,y)
      {
        rankId: "RANG 5",
        rankTitle: "EXPERT",
        generate: () => {
          const x = randomPick([1, 2, 3, 4, 5]);
          const y = randomPick([1, 2, 3, 4, 5]);
          const scaleM = randomPick([50, 100, 200, 250, 500]);
          const structType = randomInt(0, 3);
          
          if (structType === 0) {
            const realX = x * scaleM;
            const realY = y * scaleM;
            const ans = `${x},${y}`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${y},${x}`;
              if (i === 2) return `${realX},${realY}`;
              return `${x + i},${y}`;
            });
            
            return {
              title: "Repère Orthogonal : Saisie des Coordonnées",
              desc: `Un drone stationne dans le quadrant positif du repère orthogonal. Analyse sa position à ${realX} m de l'axe vertical et ${realY} m de l'axe horizontal (1 unité = ${scaleM} m) et détermine son couple de coordonnées (x,y).`,
              answer: ans,
              hint: "Dans un repère orthogonal du plan, la première coordonnée est l'abscisse x (lue sur l'axe horizontal) et la seconde coordonnée est l'ordonnée y (lue sur l'axe vertical).",
              geoData: { type: 'orthogonal2D', x, y, scale: `1 unité = ${scaleM} m` },
              demo: { exampleQuestion: `Coordonnées pour x=${realX}m et y=${realY}m`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const distToY = x * scaleM;
            const ans = `${distToY} m`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${y * scaleM} m`;
              if (i === 2) return `${x} m`;
              return `${distToY + i * scaleM} m`;
            });
            
            return {
              title: "Repère Orthogonal : Distance à l'Axe des Ordonnées",
              desc: `Un point est positionné dans un repère orthogonal aux coordonnées (${x},${y}) (1 unité = ${scaleM} m). Quelle est sa distance horizontale par rapport à l'axe des ordonnées ?`,
              answer: ans,
              hint: "La distance horizontale entre un point et l'axe vertical des ordonnées correspond à la valeur de son abscisse x, multipliée par la valeur de l'unité de graduation.",
              geoData: { type: 'orthogonal2D', x, y, scale: `1 unité = ${scaleM} m` },
              demo: { exampleQuestion: `Distance à l'axe des ordonnées pour x=${x}`, exampleAnswer: ans },
              options
            };
          } else if (structType === 2) {
            const distToX = y * scaleM;
            const ans = `${distToX} m`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${x * scaleM} m`;
              if (i === 2) return `${y} m`;
              return `${distToX + i * scaleM} m`;
            });
            
            return {
              title: "Repère Orthogonal : Distance à l'Axe des Abscisses",
              desc: `Un point est positionné dans un repère orthogonal aux coordonnées (${x},${y}) (1 unité = ${scaleM} m). Quelle est sa distance verticale par rapport à l'axe des abscisses ?`,
              answer: ans,
              hint: "La distance verticale entre un point et l'axe horizontal des abscisses correspond à la valeur de son ordonnée y, multipliée par la valeur de l'unité de graduation.",
              geoData: { type: 'orthogonal2D', x, y, scale: `1 unité = ${scaleM} m` },
              demo: { exampleQuestion: `Distance à l'axe des abscisses pour y=${y}`, exampleAnswer: ans },
              options
            };
          } else {
            const totalM = (x + y) * scaleM;
            const ans = `${totalM} m`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${x * scaleM} m`;
              if (i === 2) return `${y * scaleM} m`;
              return `${totalM + i * scaleM} m`;
            });
            
            return {
              title: "Repère Orthogonal : Distance Orthogonale à l'Origine",
              desc: `Un robot se déplace de l'origine (0,0) au point (${x},${y}) en suivant exclusivement le quadrillage du repère. Quelle est la distance totale parcourue en mètres (1 unité = ${scaleM} m) ?`,
              answer: ans,
              hint: `Additionne l'abscisse x et l'ordonnée y, puis multiplie la somme par l'échelle : (${x} + ${y}) × ${scaleM} m.`,
              geoData: { type: 'orthogonal2D', x, y, scale: `1 unité = ${scaleM} m` },
              demo: { exampleQuestion: `Distance le long des axes pour (${x},${y})`, exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 6 : CHAMPION (5ème) — Repère à 4 quadrants & Symétries
      {
        rankId: "RANG 6",
        rankTitle: "CHAMPION",
        generate: () => {
          const absX = randomPick([1, 2, 3, 4]);
          const absY = randomPick([1, 2, 3, 4]);
          const randX = absX * (Math.random() < 0.5 ? 1 : -1);
          const randY = absY * (Math.random() < 0.5 ? 1 : -1);
          const structType = randomInt(0, 3);
          
          if (structType === 0) {
            const ans = `${-randX},${randY}`;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${randX},${-randY}`;
              if (i === 2) return `${-randX},${-randY}`;
              return `${randX + i},${randY}`;
            });
            
            return {
              title: "Repère à 4 Quadrants : Symétrie Axiale",
              desc: `Une cible est localisée dans le repère par ses coordonnées (${randX},${randY}). Quelles sont les coordonnées du point symétrique par rapport à l'axe des ordonnées (y) ?`,
              answer: ans,
              hint: "La symétrie axiale par rapport à l'axe des ordonnées inverse le signe de l'abscisse x tout en conservant la même ordonnée y : l'image du point (x,y) devient (-x,y).",
              geoData: { type: 'orthogonalRelatives', x: randX, y: randY, scale: "1 grad = 100 m" },
              demo: { exampleQuestion: `Symétrique de (${randX},${randY}) par rapport à y`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            let qName = "";
            if (randX > 0 && randY > 0) qName = "Quadrant (+,+) - En haut à droite";
            else if (randX < 0 && randY > 0) qName = "Quadrant (-,+) - En haut à gauche";
            else if (randX < 0 && randY < 0) qName = "Quadrant (-,-) - En bas à gauche";
            else qName = "Quadrant (+,-) - En bas à droite";
            
            const ans = qName;
            const options = buildUniqueOptions(ans, () => shuffleArray([
              "Quadrant (+,+) - En haut à droite",
              "Quadrant (-,+) - En haut à gauche",
              "Quadrant (-,-) - En bas à gauche",
              "Quadrant (+,-) - En bas à droite"
            ])[0]);
            
            return {
              title: "Repère à 4 Quadrants : Identification de Secteur",
              desc: `Un bâtiment est repéré par un couple de coordonnées (${randX},${randY}) comportant des valeurs positives ou négatives. Dans quel quadrant du plan centré en (0,0) se situe-t-il ?`,
              answer: ans,
              hint: "Le signe des coordonnées détermine le quadrant : (+,+) se situe en haut à droite, (-,+) en haut à gauche, (-,-) en bas à gauche, et (+,-) en bas à droite.",
              geoData: { type: 'orthogonalRelatives', x: randX, y: randY, scale: "1 grad = 100 m" },
              demo: { exampleQuestion: `Quadrant pour (${randX},${randY})`, exampleAnswer: ans },
              options
            };
          } else if (structType === 2) {
            const ans = `${-randX},${-randY}`;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${-randX},${randY}`;
              if (i === 2) return `${randX},${-randY}`;
              return `${randX + i},${randY - i}`;
            });
            
            return {
              title: "Repère à 4 Quadrants : Symétrie Centrale O(0,0)",
              desc: `Un point A a pour coordonnées (${randX},${randY}). Quelles sont les coordonnées du point A' symétrique de A par rapport à l'origine O(0,0) ?`,
              answer: ans,
              hint: "La symétrie centrale par rapport à l'origine O(0,0) inverse simultanément le signe des deux coordonnées : l'image de (x,y) devient (-x,-y).",
              geoData: { type: 'orthogonalRelatives', x: randX, y: randY, scale: "1 grad = 100 m" },
              demo: { exampleQuestion: `Symétrique de (${randX},${randY}) par rapport à O(0,0)`, exampleAnswer: ans },
              options
            };
          } else {
            const ans = `${randX},${-randY}`;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${-randX},${randY}`;
              if (i === 2) return `${-randX},${-randY}`;
              return `${randX},${randY + i}`;
            });
            
            return {
              title: "Repère à 4 Quadrants : Symétrie par rapport à (x)",
              desc: `Une balise est en position (${randX},${randY}). Saisis les coordonnées de son point symétrique par rapport à l'axe des abscisses (x).`,
              answer: ans,
              hint: "La symétrie axiale par rapport à l'axe des abscisses inverse le signe de l'ordonnée y tout en conservant la même abscisse x : l'image de (x,y) devient (x,-y).",
              geoData: { type: 'orthogonalRelatives', x: randX, y: randY, scale: "1 grad = 100 m" },
              demo: { exampleQuestion: `Symétrique de (${randX},${randY}) par rapport à l'axe x`, exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 7 : LÉGENDAIRE (4ème) — Perspective cavalière & Fuyantes
      {
        rankId: "RANG 7",
        rankTitle: "LÉGENDAIRE",
        generate: () => {
          const virtCm = randomPick([2, 3, 4, 5, 6]);
          const coeffK = 0.5;
          const structType = randomInt(0, 3);
          
          if (structType === 0) {
            const realMeters = virtCm / coeffK;
            const ans = `${realMeters} m`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${virtCm} m`;
              if (i === 2) return `${virtCm * coeffK} m`;
              return `${realMeters + i * 2} m`;
            });
            
            return {
              title: "Perspective Cavalière : Profondeur Réelle",
              desc: `Sur une représentation en perspective cavalière (k = 0,5, échelle 1 cm = 1 m), la longueur d'une arête fuyante mesure ${virtCm} cm sur le dessin. En tenant compte du coefficient de réduction k, calcule la profondeur réelle du solide.`,
              answer: ans,
              hint: "En perspective cavalière, la longueur réelle d'une arête fuyante s'obtient en divisant la longueur mesurée sur le dessin par le coefficient de réduction k de la fuyante.",
              geoData: { type: 'spatial3D', x: virtCm, y: virtCm, z: 3, scale: "Coefficient k = 0.5" },
              demo: { exampleQuestion: `Profondeur pour fuyante de ${virtCm} cm (k=0,5)`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const realMeters = virtCm * 2;
            const drawnCm = realMeters * coeffK;
            const ans = `${drawnCm} cm`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${realMeters} cm`;
              if (i === 2) return `${realMeters / coeffK} cm`;
              return `${drawnCm + i} cm`;
            });
            
            return {
              title: "Perspective Cavalière : Tracé de Fuyante",
              desc: `Une fuyante possède une profondeur réelle de ${realMeters} m. Quelle longueur exacte en cm doit-on lui donner sur le dessin (k = 0,5, 1 cm = 1 m) ?`,
              answer: ans,
              hint: `Longueur dessinée = Profondeur réelle × k = ${realMeters} × 0,5 = ${drawnCm} cm.`,
              geoData: { type: 'spatial3D', x: drawnCm, y: drawnCm, z: 3, scale: "Coefficient k = 0.5" },
              demo: { exampleQuestion: `Longueur fuyante pour profondeur de ${realMeters} m`, exampleAnswer: ans },
              options
            };
          } else if (structType === 2) {
            const ans = "En traits pointillés";
            const options = buildUniqueOptions(ans, () => shuffleArray([
              "En traits pointillés",
              "En traits pleins continus",
              "En ligne rouge fine",
              "Elles ne sont pas tracées"
            ])[0]);
            
            return {
              title: "Perspective Cavalière : Arêtes Invisibles",
              desc: "Selon les conventions de représentation géométrique en perspective cavalière, comment doivent être dessinées les arêtes non visibles d'un solide ?",
              answer: ans,
              hint: "Les règles de la perspective cavalière imposent de tracer les arêtes directement visibles en traits pleins continus et les arêtes cachées en traits pointillés.",
              geoData: { type: 'spatial3D', x: 3, y: 3, z: 3, scale: "Perspective Cavalière" },
              demo: { exampleQuestion: "Représentation des arêtes cachées", exampleAnswer: ans },
              options
            };
          } else {
            const ans = "En vraie grandeur (dimensions réelles)";
            const options = buildUniqueOptions(ans, () => shuffleArray([
              "En vraie grandeur (dimensions réelles)",
              "Réduite de moitié (coefficient k)",
              "Déformée selon un angle de 45°",
              "Agrandie d'un facteur 2"
            ])[0]);
            
            return {
              title: "Perspective Cavalière : Propriété de la Face Avant",
              desc: "En perspective cavalière, comment la face avant du solide est-elle conservée sur le dessin ?",
              answer: ans,
              hint: "La face avant étant parallèle au plan de dessin, elle conserve ses formes, ses angles et ses dimensions réelles sans aucune déformation.",
              geoData: { type: 'spatial3D', x: 3, y: 3, z: 3, scale: "Perspective Cavalière" },
              demo: { exampleQuestion: "Conservation de la face avant", exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 8 : HACKER PGM (3ème) — Repérage 3D cartésien (x,y,z)
      {
        rankId: "RANG 8",
        rankTitle: "HACKER PGM",
        generate: () => {
          const dimX = randomPick([2, 3, 4, 5]);
          const dimY = randomPick([2, 3, 4, 5]);
          const dimZ = randomPick([6, 7, 8, 9]);
          const scaleM = randomPick([1, 2, 5, 10]);
          const structType = randomInt(0, 3);
          
          if (structType === 0) {
            const ans = `${dimX},${dimY},${dimZ}`;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${dimY},${dimX},${dimZ}`;
              if (i === 2) return `${dimX},${dimZ},${dimY}`;
              return `${dimX + i},${dimY},${dimZ}`;
            });
            
            return {
              title: "Repérage 3D dans l'Espace : Triplet de Coordonnées",
              desc: `Dans un repère à trois dimensions ayant pour origine l'un des sommets d'un parallélépipède rectangle de dimensions ${dimX} × ${dimY} × ${dimZ} unités, détermine le triplet (x,y,z) représentant la position du sommet opposé.`,
              answer: ans,
              hint: "Le positionnement d'un point dans l'espace s'effectue au moyen d'un triplet (x,y,z) où x désigne l'abscisse (profondeur), y l'ordonnée (largeur) et z la cote ou altitude (hauteur).",
              geoData: { type: 'spatial3D', x: dimX, y: dimY, z: dimZ, scale: "1 unité = 1 m" },
              demo: { exampleQuestion: `Triplet du sommet opposé pour ${dimX}x${dimY}x${dimZ}`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const realZ = dimZ * scaleM;
            const ans = `${realZ} m`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${dimX * scaleM} m`;
              if (i === 2) return `${dimY * scaleM} m`;
              return `${realZ + i * scaleM} m`;
            });
            
            return {
              title: "Repérage 3D dans l'Espace : Altitude et Cote",
              desc: `Un vecteur de positionnement indique le triplet (${dimX},${dimY},${dimZ}) pour un mobile en vol (1 unité = ${scaleM} m). Quelle est son altitude verticale z par rapport au plan de référence en mètres ?`,
              answer: ans,
              hint: "La troisième composante z du triplet (x,y,z) mesure l'altitude ou cote, c'est-à-dire la hauteur perpendiculaire au plan horizontal défini par les axes x et y.",
              geoData: { type: 'spatial3D', x: dimX, y: dimY, z: dimZ, scale: `1 unité = ${scaleM} m` },
              demo: { exampleQuestion: `Altitude z réelle pour triplet (${dimX},${dimY},${dimZ})`, exampleAnswer: ans },
              options
            };
            } else if (structType === 2) {
            const volM3 = dimX * dimY * dimZ * Math.pow(scaleM, 3);
            const ans = `${volM3} m³`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${dimX * dimY * dimZ} m³`;
              if (i === 2) return `${(dimX + dimY + dimZ) * scaleM} m³`;
              return `${volM3 + i * 10} m³`;
            });
            
            return {
              title: "Repérage 3D dans l'Espace : Volume du Solide",
              desc: `Un conteneur a pour dimensions spatiales x = ${dimX}, y = ${dimY}, z = ${dimZ} (1 unité = ${scaleM} m). Calcule son volume total en m³.`,
              answer: ans,
              hint: "Volume V = Longueur × Largeur × Hauteur (x × y × z × échelle).",
              geoData: { type: 'spatial3D', x: dimX, y: dimY, z: dimZ, scale: `1 unité = ${scaleM} m` },
              demo: { exampleQuestion: `Volume d'un bloc de ${dimX}x${dimY}x${dimZ} unités`, exampleAnswer: ans },
              options
            };
          } else {
            const ans = `${dimX},${dimY},0`;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${dimX},0,${dimZ}`;
              if (i === 2) return `0,${dimY},${dimZ}`;
              return `${dimX + i},${dimY},0`;
            });
            
            return {
              title: "Repérage 3D dans l'Espace : Projection au Sol",
              desc: `Un drone est au point (${dimX},${dimY},${dimZ}). Quelles sont les coordonnées (x,y,z) de sa projection orthogonale au sol (plan xy) ?`,
              answer: ans,
              hint: "La projection orthogonale sur le plan du sol (xy) annule la cote d'altitude (z = 0) tout en conservant l'abscisse x et l'ordonnée y.",
              geoData: { type: 'spatial3D', x: dimX, y: dimY, z: dimZ, scale: "1 unité = 1 m" },
              demo: { exampleQuestion: `Projection au sol de (${dimX},${dimY},${dimZ})`, exampleAnswer: ans },
              options
            };
          }
        }
      }
    ]
  },
  
  // ------------------------------------------------------------------------
  // MONDE 2 : LASER SCOPE & FIGURES PLANES
  // ------------------------------------------------------------------------
  2: {
    name: "Monde 2 : Laser Scope & Figures Planes",
    icon: "📐",
    ranks: [
      // RANG 1 (NOOB - CE1/CE2) : Identification de formes & sommets
      {
        rankId: "RANG 1",
        rankTitle: "NOOB",
        generate: () => {
          const mode = randomPick(['descToName', 'nameToVertices', 'shapeProperties']);
          const shapes = [
            { name: "Triangle", corners: 3, descCorners: "3 sommets et 3 côtés" },
            { name: "Rectangle", corners: 4, descCorners: "4 sommets et 4 angles droits" },
            { name: "Carré", corners: 4, descCorners: "4 sommets et 4 côtés égaux" },
            { name: "Triangle rectangle", corners: 3, descCorners: "3 sommets et 1 angle droit" },
            { name: "Cercle", corners: 0, descCorners: "0 sommet (ligne courbe fermée)" }
          ];
          const target = randomPick(shapes);
          
          const buildOptionsLocal = (correct, distractors) => {
            const set = new Set([correct]);
            for (const d of shuffleArray(distractors)) {
              if (set.size >= 4) break;
              set.add(d);
            }
            return shuffleArray(Array.from(set));
          };
          
          if (mode === 'descToName') {
            const ans = target.name;
            const distractors = shapes.filter(s => s.name !== ans).map(s => s.name);
            return {
              title: "Analyse de Forme & Hitbox Géométrique",
              desc: `Un signal laser dessine une figure ayant ${target.descCorners}. Quel type de figure géométrique est identifié dans le viseur ?`,
              answer: ans,
              hint: "Identifie la figure plane en comptant son nombre de côtés et de sommets.",
              geoData: { type: 'shapeIdent', shape: target.name, corners: target.corners, scale: "Visuel 1:1" },
              demo: { exampleQuestion: `Identifier la figure ayant ${target.descCorners}`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          } else if (mode === 'nameToVertices') {
            const ans = `${target.corners} sommets`;
            const distractors = [0, 1, 2, 3, 4, 5, 6].filter(c => c !== target.corners).map(c => `${c} sommets`);
            return {
              title: "Dénombrement des Sommets : Laser Scope",
              desc: `Observe le polygone à ${target.corners === 0 ? '0 côté droit' : target.corners + ' côtés'} représenté dans le viseur laser (${target.name}). Combien de sommets possède cette figure ?`,
              answer: ans,
              hint: `Dans tout polygone, le nombre de sommets (coins) est égal au nombre de côtés. Un ${target.name.toLowerCase()} possède ${target.corners} sommets.`,
              geoData: { type: 'shapeIdent', shape: target.name, corners: target.corners, scale: "Visuel 1:1" },
              demo: { exampleQuestion: `Nombre de sommets d'un ${target.name.toLowerCase()}`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          } else {
            const zeroCornerShape = "Cercle";
            const ans = zeroCornerShape;
            const distractors = ["Triangle", "Rectangle", "Carré", "Losange"];
            return {
              title: "Caractérisation des Lignes de Contour",
              desc: "Parmi les figures géométriques suivantes, laquelle ne possède aucun sommet et est formée par une ligne courbe fermée ?",
              answer: ans,
              hint: "Le cercle est la seule figure plane usuelle sans aucun sommet ni bord droit.",
              geoData: { type: 'shapeIdent', shape: zeroCornerShape, corners: 0, scale: "Visuel 1:1" },
              demo: { exampleQuestion: "Figure plane n'ayant aucun sommet", exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          }
        }
      },
      
      // RANG 2 (NOVICE - CE2/CM1) : Caractérisation des Quadrilatères
      {
        rankId: "RANG 2",
        rankTitle: "NOVICE",
        generate: () => {
          const mode = randomPick(['quadToName', 'nameToProp', 'parallelFocus']);
          const quads = [
            { name: "Rectangle", props: "4 angles droits" },
            { name: "Carré", props: "4 côtés de même longueur et 4 angles droits" },
            { name: "Losange", props: "4 côtés de même longueur" },
            { name: "Parallélogramme", props: "des côtés opposés parallèles deux à deux" }
          ];
          const target = randomPick(quads);
          
          const buildOptionsLocal = (correct, distractors) => {
            const set = new Set([correct]);
            for (const d of shuffleArray(distractors)) {
              if (set.size >= 4) break;
              set.add(d);
            }
            return shuffleArray(Array.from(set));
          };
          
          if (mode === 'quadToName') {
            const ans = target.name;
            const distractors = quads.filter(q => q.name !== ans).map(q => q.name);
            return {
              title: "Caractérisation des Quadrilatères",
              desc: `Un quadrilatère possède ${target.props}. De quelle figure plane s'agit-il ?`,
              answer: ans,
              hint: "Rappelle-toi les propriétés des côtés et des angles droits spécifiques à ce quadrilatère.",
              geoData: { type: 'quadProps', shape: target.name, scale: "Visuel 1:1" },
              demo: { exampleQuestion: `Quadrilatère ayant ${target.props}`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          } else if (mode === 'nameToProp') {
            const ans = target.props;
            const distractors = quads.filter(q => q.name !== target.name).map(q => q.props);
            return {
              title: "Propriétés du Quadrilatère",
              desc: `Quelle est la propriété géométrique caractérisant le ${target.name} visualisé dans le réticule ?`,
              answer: ans,
              hint: `Par définition, le ${target.name.toLowerCase()} se caractérise par : ${target.props}.`,
              geoData: { type: 'quadProps', shape: target.name, scale: "Visuel 1:1" },
              demo: { exampleQuestion: `Propriété du ${target.name}`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          } else {
            const ans = "Parallélogramme";
            const distractors = ["Rectangle", "Carré", "Trapèze", "Cerf-volant"];
            return {
              title: "Quadrilatère & Parallélisme des Côtés",
              desc: "Quel quadrilatère a pour condition minimale d'avoir ses côtés opposés parallèles deux à deux, sans imposer d'angles droits ni de côtés tous égaux ?",
              answer: ans,
              hint: "Par définition, le parallélogramme est le quadrilatère dont les côtés opposés sont parallèles deux à deux.",
              geoData: { type: 'quadProps', shape: ans, scale: "Visuel 1:1" },
              demo: { exampleQuestion: "Quadrilatère aux côtés opposés parallèles 2 à 2", exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          }
        }
      },
      
      // RANG 3 (APPRENTI - CM1) : Classification des Triangles
      {
        rankId: "RANG 3",
        rankTitle: "APPRENTI",
        generate: () => {
          const mode = randomPick(['propToTriangle', 'triangleToProp', 'equalSidesCount']);
          const triangles = [
            { shape: "Triangle rectangle", props: "1 angle droit" },
            { shape: "Triangle isocèle", props: "exactement 2 côtés de même longueur" },
            { shape: "Triangle équilatéral", props: "3 côtés de même longueur" },
            { shape: "Triangle rectangle isocèle", props: "1 angle droit et 2 côtés de même longueur" }
          ];
          const target = randomPick(triangles);
          
          const buildOptionsLocal = (correct, distractors) => {
            const set = new Set([correct]);
            for (const d of shuffleArray(distractors)) {
              if (set.size >= 4) break;
              set.add(d);
            }
            return shuffleArray(Array.from(set));
          };
          
          if (mode === 'propToTriangle') {
            const ans = target.shape;
            const distractors = triangles.filter(t => t.shape !== ans).map(t => t.shape);
            return {
              title: "Classification des Triangles",
              desc: `Un faisceau triangulaire possède : ${target.props}. Quel est le type précis de ce triangle ?`,
              answer: ans,
              hint: `Un triangle possédant ${target.props} s'appelle un ${ans.toLowerCase()}.`,
              geoData: { type: 'triangleClass', shape: target.shape, scale: "Échelle 1:1" },
              demo: { exampleQuestion: `Triangle avec ${target.props}`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          } else if (mode === 'triangleToProp') {
            const ans = target.props;
            const distractors = triangles.filter(t => t.shape !== target.shape).map(t => t.props);
            return {
              title: "Caractéristique du Triangle",
              desc: `Quelle est la propriété géométrique fondamentale caractérisant le ${target.shape} ?`,
              answer: ans,
              hint: `Le ${target.shape.toLowerCase()} se définit par : ${target.props}.`,
              geoData: { type: 'triangleClass', shape: target.shape, scale: "Échelle 1:1" },
              demo: { exampleQuestion: `Caractéristique du ${target.shape.toLowerCase()}`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          } else {
            const pickIso = triangles.find(t => t.shape === "Triangle isocèle");
            const ans = "2 côtés";
            const distractors = ["3 côtés", "0 côté", "4 côtés"];
            return {
              title: "Dénombrement de Côtés Égaux",
              desc: "Combien de côtés de même longueur possède obligatoirement un triangle isocèle ?",
              answer: ans,
              hint: "Un triangle isocèle possède exactement 2 côtés de même longueur.",
              geoData: { type: 'triangleClass', shape: pickIso.shape, scale: "Échelle 1:1" },
              demo: { exampleQuestion: "Nombre de côtés égaux d'un triangle isocèle", exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          }
        }
      },
      
      // RANG 4 (CONFIRMÉ - CM2) : Cercle, Rayon et Diamètre
      {
        rankId: "RANG 4",
        rankTitle: "CONFIRMÉ",
        generate: () => {
          const mode = randomPick(['calcRadius', 'calcDiameter', 'circleVocab']);
          const rVal = randomInt(5, 35);
          const dVal = rVal * 2;
          
          const buildOptionsLocal = (correct, distractors) => {
            const set = new Set([correct]);
            for (const d of shuffleArray(distractors)) {
              if (set.size >= 4) break;
              set.add(d);
            }
            return shuffleArray(Array.from(set));
          };
          
          if (mode === 'calcRadius') {
            const ans = `${rVal} m`;
            const distractors = [`${dVal} m`, `${rVal + 4} m`, `${Math.max(1, rVal - 3)} m`, `${dVal + 5} m`].filter(v => v !== ans);
            return {
              title: "Cercle Laser : Calcul du Rayon",
              desc: `Un disque laser balaye une zone circulaire dont le diamètre total mesure D = ${dVal} m. Quelle est la longueur R de son rayon ?`,
              answer: ans,
              hint: `Dans tout cercle, le rayon est la moitié du diamètre (R = D / 2). Pour D = ${dVal} m, R = ${dVal} / 2 = ${rVal} m.`,
              geoData: { type: 'circleRadius', r: rVal, d: dVal, showMode: 'diameter', scale: "Visuel 1:1" },
              demo: { exampleQuestion: `Rayon R pour un diamètre D = ${dVal} m`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          } else if (mode === 'calcDiameter') {
            const ans = `${dVal} m`;
            const distractors = [`${rVal} m`, `${dVal + 6} m`, `${Math.max(2, dVal - 4)} m`, `${rVal + 15} m`].filter(v => v !== ans);
            return {
              title: "Cercle Laser : Calcul du Diamètre",
              desc: `La portée d'une balise circulaire est définie par un rayon R = ${rVal} m. Quel est son diamètre total D ?`,
              answer: ans,
              hint: `Dans tout cercle, le diamètre est le double du rayon (D = 2 × R). Pour R = ${rVal} m, D = 2 × ${rVal} = ${dVal} m.`,
              geoData: { type: 'circleRadius', r: rVal, d: dVal, showMode: 'radius', scale: "Visuel 1:1" },
              demo: { exampleQuestion: `Diamètre D pour un rayon R = ${rVal} m`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          } else {
            const ans = "Le Diamètre";
            const distractors = ["Le Rayon", "La Corde", "L'Arc de cercle", "La Tangente"];
            return {
              title: "Analyse du Cercle : Ligne Remarquable",
              desc: "Comment appelle-t-on un segment qui relie deux points d'un cercle en passant obligatoirement par son centre O ?",
              answer: ans,
              hint: "Le segment reliant deux points du cercle et passant par son centre est le diamètre (D = 2 × R).",
              geoData: { type: 'circleRadius', r: 10, d: 20, showMode: 'diameter', scale: "Visuel 1:1" },
              demo: { exampleQuestion: "Segment passant par le centre reliant 2 points du cercle", exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          }
        }
      },
      
      // RANG 5 (EXPERT - 6ème) : Classification et Mesure d'Angles
      {
        rankId: "RANG 5",
        rankTitle: "EXPERT",
        generate: () => {
          const mode = randomPick(['degToCategory', 'categoryToDef', 'bisectorCalc']);
          const angleConfigs = [
            { cat: "Angle aigu", deg: randomInt(15, 75), def: "est strictly comprise entre 0° et 90°" },
            { cat: "Angle droit", deg: 90, def: "est exactement égale à 90°" },
            { cat: "Angle obtus", deg: randomInt(102, 168), def: "est strictly comprise entre 90° et 180°" },
            { cat: "Angle plat", deg: 180, def: "est exactement égale à 180°" }
          ];
          const target = randomPick(angleConfigs);
          
          const buildOptionsLocal = (correct, distractors) => {
            const set = new Set([correct]);
            for (const d of shuffleArray(distractors)) {
              if (set.size >= 4) break;
              set.add(d);
            }
            return shuffleArray(Array.from(set));
          };
          
          if (mode === 'degToCategory') {
            const ans = target.cat;
            const distractors = ["Angle aigu", "Angle droit", "Angle obtus", "Angle plat"].filter(c => c !== ans);
            return {
              title: "Classification des Angles",
              desc: `Le capteur du réticule enregistre un angle mesurant ${target.deg}°. Dans quelle catégorie se classe cet angle ?`,
              answer: ans,
              hint: `Classification des angles : nul (0°), aigu (entre 0° et 90°), droit (90°), obtus (entre 90° et 180°), plat (180°).`,
              geoData: { type: 'angleType', deg: target.deg, angleCat: target.cat, scale: "Rapporteur 1°" },
              demo: { exampleQuestion: `Catégorie d'un angle de ${target.deg}°`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          } else if (mode === 'categoryToDef') {
            const ans = `Sa mesure ${target.def}`;
            const distractors = angleConfigs.filter(a => a.cat !== target.cat).map(a => `Sa mesure ${a.def}`);
            return {
              title: "Caractérisation de l'Angle",
              desc: `Quelle est la définition géométrique exacte d'un ${target.cat.toLowerCase()} ?`,
              answer: ans,
              hint: `Par définition, pour un ${target.cat.toLowerCase()}, sa mesure ${target.def}.`,
              geoData: { type: 'angleType', deg: target.deg, angleCat: target.cat, scale: "Rapporteur 1°" },
              demo: { exampleQuestion: `Définition de l'${target.cat.toLowerCase()}`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          } else {
            const initialAngle = randomPick([48, 64, 76, 110, 128, 142, 156]);
            const halfAngle = initialAngle / 2;
            const ans = `${halfAngle}°`;
            const distractors = [`${initialAngle}°`, `${halfAngle + 10}°`, `${Math.max(10, halfAngle - 15)}°`, `${initialAngle - 20}°`].filter(v => v !== ans);
            return {
              title: "Partage d'Angle & Bissectrice",
              desc: `La bissectrice d'un angle mesurant ${initialAngle}° le partage en deux angles adjacents égaux. Quelle est la mesure de chacun des deux angles obtenus ?`,
              answer: ans,
              hint: `La bissectrice est la demi-droite qui partage un angle en deux angles de même mesure : ${initialAngle}° / 2 = ${halfAngle}°.`,
              geoData: { type: 'angleType', deg: halfAngle, angleCat: "Bissectrice", scale: "Rapporteur 1°" },
              demo: { exampleQuestion: `Mesure de l'angle divisé par la bissectrice pour ${initialAngle}°`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          }
        }
      },
      
      // RANG 6 (CHAMPION - 5ème) : Somme des angles d'un triangle & Diagonales
      {
        rankId: "RANG 6",
        rankTitle: "CHAMPION",
        generate: () => {
          const mode = randomPick(['triangleSumGeneral', 'isoscelesSum', 'diagonalsCheck']);
          
          const buildOptionsLocal = (correct, distractors) => {
            const set = new Set([correct]);
            for (const d of shuffleArray(distractors)) {
              if (set.size >= 4) break;
              set.add(d);
            }
            return shuffleArray(Array.from(set));
          };
          
          if (mode === 'triangleSumGeneral') {
            const pairs = [
              { a: 38, b: 77, target: 65 },
              { a: 55, b: 85, target: 40 },
              { a: 42, b: 68, target: 70 },
              { a: 62, b: 58, target: 60 },
              { a: 29, b: 93, target: 58 },
              { a: 51, b: 74, target: 55 }
            ];
            const chosen = randomPick(pairs);
            const ans = `${chosen.target}°`;
            const distractors = [
              `${chosen.target + 15}°`,
              `${Math.max(10, chosen.target - 10)}°`,
              `${Math.min(170, chosen.target + 25)}°`,
              `${chosen.target + 5}°`
            ].filter(v => v !== ans);
            
            return {
              title: "Somme des Angles d'un Triangle",
              desc: `Dans un triangle ABC, deux des angles mesurent respectivement ${chosen.a}° et ${chosen.b}°. Quelle est la mesure du troisième angle ?`,
              answer: ans,
              hint: `Dans tout triangle, la somme des trois angles est égale à 180°. Le troisième angle vaut : 180° - (${chosen.a}° + ${chosen.b}°) = ${chosen.target}°.`,
              geoData: { type: 'triangleSum', angleA: chosen.a, angleB: chosen.b, targetAngle: chosen.target, scale: "Rapporteur 1°" },
              demo: { exampleQuestion: `Calcul du 3ème angle pour ${chosen.a}° et ${chosen.b}°`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          } else if (mode === 'isoscelesSum') {
            const isVertexGiven = Math.random() < 0.5;
            if (isVertexGiven) {
              const vertexAngle = randomPick([40, 50, 70, 80, 100]);
              const baseAngle = (180 - vertexAngle) / 2;
              const ans = `${baseAngle}°`;
              const distractors = [`${vertexAngle}°`, `${baseAngle + 10}°`, `${baseAngle - 15}°`, `${180 - vertexAngle}°`].filter(v => v !== ans);
              return {
                title: "Triangle Isocèle : Angles à la Base",
                desc: `Dans un triangle isocèle principal, l'angle au sommet mesure ${vertexAngle}°. Quelle est la mesure de chacun des deux angles égaux à la base ?`,
                answer: ans,
                hint: `Les angles à la base d'un triangle isocèle sont de même mesure : (180° - ${vertexAngle}°) / 2 = ${baseAngle}°.`,
                geoData: { type: 'triangleSum', angleA: vertexAngle, angleB: baseAngle, targetAngle: baseAngle, scale: "Rapporteur 1°" },
                demo: { exampleQuestion: `Angles à la base pour un angle au sommet de ${vertexAngle}°`, exampleAnswer: ans },
                options: buildOptionsLocal(ans, distractors)
              };
            } else {
              const baseAngle = randomPick([35, 50, 65, 70]);
              const vertexAngle = 180 - 2 * baseAngle;
              const ans = `${vertexAngle}°`;
              const distractors = [`${baseAngle}°`, `${vertexAngle + 15}°`, `${vertexAngle - 10}°`, `${2 * baseAngle}°`].filter(v => v !== ans);
              return {
                title: "Triangle Isocèle : Angle au Sommet",
                desc: `Dans un triangle isocèle, l'un des angles égaux à la base mesure ${baseAngle}°. Quelle est la mesure de l'angle au sommet principal ?`,
                answer: ans,
                hint: `Angle au sommet = 180° - (2 × ${baseAngle}°) = 180° - ${2 * baseAngle}° = ${vertexAngle}°.`,
                geoData: { type: 'triangleSum', angleA: baseAngle, angleB: baseAngle, targetAngle: vertexAngle, scale: "Rapporteur 1°" },
                demo: { exampleQuestion: `Angle au sommet pour un angle à la base de ${baseAngle}°`, exampleAnswer: ans },
                options: buildOptionsLocal(ans, distractors)
              };
            }
          } else {
            const diagConfigs = [
              { name: "Carré", props: "se coupent en leur milieu, sont perpendiculaires et sont de même longueur" },
              { name: "Losange", props: "se coupent en leur milieu et sont perpendiculaires sans être de même longueur" },
              { name: "Rectangle", props: "se coupent en leur milieu et sont de même longueur sans être perpendiculaires" },
              { name: "Parallélogramme", props: "se coupent en leur milieu sans être ni perpendiculaires ni de même longueur" }
            ];
            const target = randomPick(diagConfigs);
            const ans = target.name;
            const distractors = ["Carré", "Losange", "Rectangle", "Parallélogramme"].filter(n => n !== ans);
            
            return {
              title: "Diagonales des Quadrilatères",
              desc: `Dans le viseur, les diagonales d'un quadrilatère ${target.props}. Quelle est la nature exacte de ce quadrilatère ?`,
              answer: ans,
              hint: `Diagonales des quadrilatères : si elles ont pour seule propriété de se couper en leur milieu sans être ni perpendiculaires ni de même longueur, c'est un parallélogramme.`,
              geoData: { type: 'diagProps', shape: target.name, scale: "Visuel 1:1" },
              demo: { exampleQuestion: `Quadrilatère dont les diagonales ${target.props}`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          }
        }
      },
      
      // RANG 7 (LÉGENDAIRE - 4ème) : Pythagore & Cosinus
      {
        rankId: "RANG 7",
        rankTitle: "LÉGENDAIRE",
        generate: () => {
          const mode = randomPick(['pythagorasHypotenuse', 'pythagorasLeg', 'trigoCosinus']);
          
          const buildOptionsLocal = (correct, distractors) => {
            const set = new Set([correct]);
            for (const d of shuffleArray(distractors)) {
              if (set.size >= 4) break;
              set.add(d);
            }
            return shuffleArray(Array.from(set));
          };
          
          const triples = [
            { a: 3, b: 4, c: 5 },
            { a: 6, b: 8, c: 10 },
            { a: 5, b: 12, c: 13 },
            { a: 8, b: 15, c: 17 },
            { a: 9, b: 12, c: 15 },
            { a: 12, b: 16, c: 20 }
          ];
          const t = randomPick(triples);
          
          if (mode === 'pythagorasHypotenuse') {
            const ans = `${t.c} cm`;
            const distractors = [`${t.c + 2} cm`, `${t.c - 1} cm`, `${t.a + t.b} cm`, `${t.c + 5} cm`].filter(v => v !== ans);
            return {
              title: "Théorème de Pythagore : Hypoténuse",
              desc: `Un triangle ABC est rectangle en A, avec AB = ${t.a} cm et AC = ${t.b} cm. Calcule la longueur de l'hypoténuse [BC].`,
              answer: ans,
              hint: `Théorème de Pythagore : Si ABC est rectangle en A, alors BC² = AB² + AC². Ici : BC² = ${t.a}² + ${t.b}² = ${t.a * t.a + t.b * t.b} ⇒ BC = √${t.c * t.c} = ${t.c} cm.`,
              geoData: { type: 'trigoCos', adj: t.a, hyp: t.c, cosVal: (t.a / t.c).toFixed(1), scale: "Visuel 1:1" },
              demo: { exampleQuestion: `Hypoténuse pour côtés adjacents de ${t.a} cm et ${t.b} cm`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          } else if (mode === 'pythagorasLeg') {
            const ans = `${t.b} cm`;
            const distractors = [`${t.b + 3} cm`, `${t.b - 2} cm`, `${t.c - t.a} cm`, `${t.b + 5} cm`].filter(v => v !== ans);
            return {
              title: "Théorème de Pythagore : Côté de l'Angle Droit",
              desc: `Dans un triangle ABC rectangle en A, l'hypoténuse BC mesure ${t.c} cm et le côté AB mesure ${t.a} cm. Calcule la longueur du côté AC.`,
              answer: ans,
              hint: `Théorème de Pythagore : AC² = BC² - AB² = ${t.c}² - ${t.a}² = ${t.c * t.c - t.a * t.a} ⇒ AC = √${t.b * t.b} = ${t.b} cm.`,
              geoData: { type: 'trigoCos', adj: t.a, hyp: t.c, cosVal: (t.a / t.c).toFixed(1), scale: "Visuel 1:1" },
              demo: { exampleQuestion: `AC si BC = ${t.c} cm et AB = ${t.a} cm`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          } else {
            const cosConfigs = [
              { adj: 6, hyp: 10, cos: "0,6" },
              { adj: 8, hyp: 10, cos: "0,8" },
              { adj: 3, hyp: 5, cos: "0,6" },
              { adj: 4, hyp: 5, cos: "0,8" }
            ];
            const pickedCos = randomPick(cosConfigs);
            const isFormula = Math.random() < 0.5;
            
            if (isFormula) {
              const ans = "Côté Adjacent / Hypoténuse";
              const distractors = [
                "Côté Opposé / Hypoténuse",
                "Côté Opposé / Côté Adjacent",
                "Hypoténuse / Côté Adjacent"
              ];
              return {
                title: "Cosinus d'un Angle Aigu : Formule",
                desc: "Dans un triangle rectangle, quelle est la formule exacte exprimant le Cosinus d'un angle aigu ?",
                answer: ans,
                hint: "Formule du Cosinus : Dans un triangle rectangle, cos(angle) = Côté Adjacent / Hypoténuse.",
                geoData: { type: 'trigoCos', adj: pickedCos.adj, hyp: pickedCos.hyp, cosVal: pickedCos.cos, scale: "Formule" },
                demo: { exampleQuestion: "Formule du Cosinus", exampleAnswer: ans },
                options: buildOptionsLocal(ans, distractors)
              };
            } else {
              const ans = `${pickedCos.adj} cm`;
              const distractors = [`${pickedCos.hyp} cm`, `${pickedCos.adj + 2} cm`, `${Math.max(1, pickedCos.adj - 2)} cm`, `${pickedCos.hyp + 2} cm`].filter(v => v !== ans);
              return {
                title: "Cosinus : Calcul du Côté Adjacent",
                desc: `Dans un triangle ABC rectangle en A, l'hypoténuse BC mesure ${pickedCos.hyp} cm et cos(B) = ${pickedCos.cos}. Calcule la longueur du côté adjacent AB.`,
                answer: ans,
                hint: `Formule du Cosinus : cos(angle) = Côté Adjacent / Hypoténuse. On en déduit : Côté Adjacent = Hypoténuse × cos(angle) = ${pickedCos.hyp} × ${pickedCos.cos} = ${pickedCos.adj} cm.`,
                geoData: { type: 'trigoCos', adj: pickedCos.adj, hyp: pickedCos.hyp, cosVal: pickedCos.cos, scale: "Visuel 1:1" },
                demo: { exampleQuestion: `Adjacent pour hypoténuse ${pickedCos.hyp} cm et cos = ${pickedCos.cos}`, exampleAnswer: ans },
                options: buildOptionsLocal(ans, distractors)
              };
            }
          }
        }
      },
      
      // RANG 8 (HACKER PGM - 3ème) : Thalès, Trigonométrie, Scratch & Sphère
      {
        rankId: "RANG 8",
        rankTitle: "HACKER PGM",
        generate: () => {
          const mode = randomPick(['thalesTheorem', 'trigoComplete', 'scratchAlgo', 'sphereSection']);
          
          const buildOptionsLocal = (correct, distractors) => {
            const set = new Set([correct]);
            for (const d of shuffleArray(distractors)) {
              if (set.size >= 4) break;
              set.add(d);
            }
            return shuffleArray(Array.from(set));
          };
          
          if (mode === 'thalesTheorem') {
            const ab = randomInt(2, 5);
            const factor = randomInt(2, 3);
            const ac = ab * factor;
            const am = randomInt(3, 6);
            const an = am * factor;
            const ans = `${an} cm`;
            const distractors = [`${an + 2} cm`, `${Math.max(1, an - 1)} cm`, `${an * 2} cm`, `${an + 4} cm`].filter(v => v !== ans);
            
            return {
              title: "Théorème de Thalès : Calcul de Longueur",
              desc: `Deux droites sécantes en A sont coupées par deux parallèles (BM) et (CN). Si AB = ${ab} cm, AC = ${ac} cm et AM = ${am} cm, calcule la longueur AN.`,
              answer: ans,
              hint: `Théorème de Thalès : Si (BM) ∥ (CN), alors AB / AC = AM / AN = BM / CN. On calcule : ${ab} / ${ac} = ${am} / AN ⇒ AN = (${am} × ${ac}) / ${ab} = ${an} cm.`,
              geoData: { type: 'triangleClass', shape: "Triangle rectangle", scale: "Configuration Thalès" },
              demo: { exampleQuestion: `AN pour AB = ${ab}, AC = ${ac}, AM = ${am}`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          } else if (mode === 'trigoComplete') {
            const trigoRules = [
              { name: "Sinus", formula: "Côté Opposé / Hypoténuse" },
              { name: "Cosinus", formula: "Côté Adjacent / Hypoténuse" },
              { name: "Tangente", formula: "Côté Opposé / Côté Adjacent" },
              { name: "Relation Tangente", formula: "tan(α) = sin(α) / cos(α)" }
            ];
            const picked = randomPick(trigoRules);
            const ans = picked.formula;
            const distractors = [
              "Côté Opposé / Hypoténuse",
              "Côté Adjacent / Hypoténuse",
              "Côté Opposé / Côté Adjacent",
              "tan(α) = sin(α) / cos(α)",
              "tan(α) = cos(α) / sin(α)"
            ].filter(f => f !== ans);
            
            return {
              title: `Trigonométrie Complète : ${picked.name}`,
              desc: `Dans un triangle rectangle, quelle est la formule exacte correspondant à : ${picked.name} ?`,
              answer: ans,
              hint: `Rapports trigonométriques : sin(α) = Opposé / Hypoténuse, cos(α) = Adjacent / Hypoténuse, tan(α) = Opposé / Adjacent.`,
              geoData: { type: 'trigoCos', adj: 4, hyp: 5, cosVal: "0,8", scale: "Formules 3ème" },
              demo: { exampleQuestion: `Formule de : ${picked.name}`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          } else if (mode === 'scratchAlgo') {
            const polyConfigs = [
              { name: "Triangle équilatéral", sides: 3, angle: 120 },
              { name: "Carré", sides: 4, angle: 90 },
              { name: "Pentagone régulier", sides: 5, angle: 72 },
              { name: "Hexagone régulier", sides: 6, angle: 60 },
              { name: "Octogone régulier", sides: 8, angle: 45 }
            ];
            const target = randomPick(polyConfigs);
            const ans = `${target.angle}°`;
            const distractors = [`${180 - target.angle}°`, "360°", `${target.angle + 30}°`, `${target.angle / 2}°`].filter(v => v !== ans);
            
            return {
              title: "Algorithmique Scratch : Tracé de Polygones",
              desc: `Dans un script Scratch de géométrie, un lutin doit tracer un ${target.name.toLowerCase()} (${target.sides} côtés égaux). De quel angle en degrés doit-il tourner à chaque sommet ?`,
              answer: ans,
              hint: `Géométrie algorithmique : Pour tracer un polygone régulier à n côtés dans Scratch, l'angle de rotation à chaque sommet est égal à 360° / n. Pour n = ${target.sides}, l'angle vaut 360° / ${target.sides} = ${target.angle}°.`,
              geoData: { type: 'shapeIdent', shape: target.name, corners: target.sides, scale: "Scratch 360°/n" },
              demo: { exampleQuestion: `Angle Scratch pour un ${target.name.toLowerCase()}`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          } else {
            const sphereConfigs = [
              { R: 10, d: 6, rSec: 8 },
              { R: 13, d: 5, rSec: 12 },
              { R: 15, d: 9, rSec: 12 },
              { R: 25, d: 15, rSec: 20 }
            ];
            const chosen = randomPick(sphereConfigs);
            const ans = `${chosen.rSec} cm`;
            const distractors = [`${chosen.rSec + 2} cm`, `${Math.max(1, chosen.rSec - 2)} cm`, "4 cm", "16 cm", `${chosen.R} cm`].filter(v => v !== ans);
            
            return {
              title: "Section Plane d'une Sphère",
              desc: `Une sphère de rayon R = ${chosen.R} cm est coupée par un plan situé à une distance d = ${chosen.d} cm de son centre. Calcule le rayon r du cercle de section.`,
              answer: ans,
              hint: `Section de sphère : Le rayon r du cercle de section s'obtient par le théorème de Pythagore : r = √(R² - d²) = √(${chosen.R}² - ${chosen.d}²) = √(${chosen.R * chosen.R} - ${chosen.d * chosen.d}) = √${chosen.rSec * chosen.rSec} = ${chosen.rSec} cm.`,
              geoData: { type: 'circleRadius', r: chosen.rSec, d: chosen.R, showMode: 'radius', scale: "Section de Sphère" },
              demo: { exampleQuestion: `Rayon r de section pour R = ${chosen.R} cm et d = ${chosen.d} cm`, exampleAnswer: ans },
              options: buildOptionsLocal(ans, distractors)
            };
          }
        }
      }
    ]
  },
  
  // ------------------------------------------------------------------------
  // MONDE 3 : HITBOX & RELATIONS GÉOMÉTRIQUES
  // ------------------------------------------------------------------------
  3: {
    name: "Monde 3 : Hitbox & Relations Géométriques",
    icon: "📏",
    ranks: [
      // RANG 1 : NOOB (CE1 — Alignement de points)
      {
        rankId: "RANG 1",
        rankTitle: "NOOB",
        generate: () => {
          const pts = shuffleArray(["A", "B", "C", "D", "E", "F", "K", "M", "N", "P", "Q", "R"]).slice(0, 3);
          const [p1, p2, p3] = pts;
          const lineName = randomPick(["(d1)", "(d2)", "(Δ)", "(L1)", "(D1)"]);
          const mode = randomPick(["check", "condition", "definition"]);
          
          if (mode === "check") {
            const isAligned = Math.random() < 0.5;
            const ans = isAligned ? "Oui, ils sont parfaitement alignés" : "Non, ils ne sont pas alignés";
            const optionsSet = new Set([
              "Oui, ils sont parfaitement alignés",
              "Non, ils ne sont pas alignés",
              "Seulement deux d'entre eux sont alignés",
              "Impossible à déterminer sans mesure"
            ]);
            return {
              title: "Contrôle d'Alignement à la Règle Laser",
              desc: `Le faisceau de la règle laser relie les balises ${p1} et ${p2}. La balise ${p3} se trouve sur le terrain. Les points ${p1}, ${p2} et ${p3} sont-ils alignés ?`,
              answer: ans,
              hint: "Examine la ligne de visée laser : si le rayon passe exactement par les trois points, alors ils sont alignés.",
              geoData: { type: 'alignmentCheck', p1, p2, p3, isAligned },
              demo: { exampleQuestion: `Vérification d'alignement des balises ${p1}, ${p2} et ${p3}`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          } else if (mode === "condition") {
            const ans = `Appartenir à la droite (${p1}${p2})`;
            const optionsSet = new Set([
              ans,
              `Être perpendiculaire à (${p1}${p2})`,
              `Former un angle droit au point ${p1}`,
              `Être située à 10 m de la droite (${p1}${p2})`
            ]);
            return {
              title: "Alignement de Balises & Ligne de Tir",
              desc: `Deux balises ${p1} et ${p2} définissent la ligne de tir ${lineName}. Quelle condition géométrique la balise ${p3} doit-elle vérifier pour être alignée avec ${p1} et ${p2} ?`,
              answer: ans,
              hint: "Trois points distincts sont alignés s'ils appartiennent tous à une même ligne droite support.",
              geoData: { type: 'alignmentCheck', p1, p2, p3, isAligned: true },
              demo: { exampleQuestion: `Condition d'alignement de ${p3} avec ${p1} et ${p2}`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          } else {
            const ans = "Elles appartiennent toutes à une même ligne droite";
            const optionsSet = new Set([
              ans,
              "Elles forment un triangle rectangle",
              "Elles sont toutes situées à égale distance du centre",
              "Elles sont reliées par des segments perpendiculaires"
            ]);
            return {
              title: "Définition de l'Alignement de Cibles",
              desc: `Sur le radar de ciblage, quelle est la définition exacte de trois cibles ${p1}, ${p2} et ${p3} dites alignées ?`,
              answer: ans,
              hint: "Par définition, des points alignés appartiennent à une seule et même droite.",
              geoData: { type: 'alignmentCheck', p1, p2, p3, isAligned: true },
              demo: { exampleQuestion: "Définition de points alignés", exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          }
        }
      },
      
      // RANG 2 : NOVICE (CE2 — Notations géométriques [AB], (AB), [AB), AB)
      {
        rankId: "RANG 2",
        rankTitle: "NOVICE",
        generate: () => {
          const pts = shuffleArray(["A", "B", "C", "D", "E", "F", "K", "M", "N", "P", "Q", "R"]).slice(0, 2);
          const [p1, p2] = pts;
          const targetType = randomPick(["segment", "droite", "demi-droite", "longueur"]);
          const dist = randomInt(15, 85);
          
          let ans = "";
          let descText = "";
          let titleText = "";
          
          if (targetType === "segment") {
            ans = `[${p1}${p2}]`;
            titleText = "Notation : Segment de Droite";
            descText = `Le câble laser est délimité par ses deux bornes d'arrêt ${p1} et ${p2}. Quelle est la notation géométrique exacte de ce segment ?`;
          } else if (targetType === "droite") {
            ans = `(${p1}${p2})`;
            titleText = "Notation : Droite Illimitée";
            descText = `La ligne de tir s'étend indéfiniment dans les deux sens en passant par les balises ${p1} et ${p2}. Quelle est sa notation géométrique exacte ?`;
          } else if (targetType === "demi-droite") {
            ans = `[${p1}${p2})`;
            titleText = "Notation : Demi-Droite d'Origine";
            descText = `Le faisceau laser a son origine fixe en ${p1} et se prolonge indéfiniment en passant par ${p2}. Quelle est la notation exacte de cette demi-droite ?`;
          } else {
            ans = `${p1}${p2}`;
            titleText = "Notation : Longueur / Distance";
            descText = `La télémétrie indique un écartement de ${dist} m entre la balise ${p1} et la balise ${p2}. Quelle est la notation géométrique exacte représentant la mesure de cette distance ?`;
          }
          
          const optionsSet = new Set([
            `[${p1}${p2}]`,
            `(${p1}${p2})`,
            `[${p1}${p2})`,
            `${p1}${p2}`
          ]);
          
          return {
            title: titleText,
            desc: descText,
            answer: ans,
            hint: "Rappel des conventions : Segment = [AB] | Droite = (AB) | Demi-droite = [AB) | Longueur = AB.",
            geoData: { type: 'notationsCheck', targetType, p1, p2 },
            demo: { exampleQuestion: `Notation mathématique pour un ${targetType} défini par ${p1} et ${p2}`, exampleAnswer: ans },
            options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
          };
        }
      },
      
      // RANG 3 : APPRENTI (CM1 — Droites perpendiculaires & Angle droit)
      {
        rankId: "RANG 3",
        rankTitle: "APPRENTI",
        generate: () => {
          const d1 = randomPick(["(d1)", "(L1)", "(Δ1)", "(D1)"]);
          let d2 = randomPick(["(d2)", "(L2)", "(Δ2)", "(D2)"]);
          while (d2 === d1) d2 = randomPick(["(d2)", "(L2)", "(Δ2)", "(D2)"]);
          const mode = randomPick(["relation", "symbol", "measure"]);
          
          if (mode === "relation") {
            const isRight = Math.random() < 0.5;
            const angle = isRight ? 90 : randomPick([30, 45, 60, 75, 105, 120, 135]);
            const ans = isRight ? "Droites perpendiculaires" : "Droites sécantes non perpendiculaires";
            const optionsSet = new Set([
              "Droites perpendiculaires",
              "Droites sécantes non perpendiculaires",
              "Droites parallèles",
              "Droites confondues"
            ]);
            
            return {
              title: "Droites Perpendiculaires & Intersection",
              desc: `L'intersection entre la droite ${d1} et la droite ${d2} forme un angle mesuré à ${angle}°. Quelle est la relation géométrique entre ces deux droites ?`,
              answer: ans,
              hint: "Deux droites sont perpendiculaires si et seulement si elles se coupent en formant un angle droit (90°).",
              geoData: { type: 'rightAngleCheck', deg: angle, d1, d2, isPerpendicular: isRight },
              demo: { exampleQuestion: `Relation pour un angle de ${angle}° entre ${d1} et ${d2}`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          } else if (mode === "symbol") {
            const ans = `${d1} ⊥ ${d2}`;
            const optionsSet = new Set([
              `${d1} ⊥ ${d2}`,
              `${d1} // ${d2}`,
              `${d1} = ${d2}`,
              `${d1} ∈ ${d2}`
            ]);
            
            return {
              title: "Symbole Officiel de Perpendicularité",
              desc: `Les droites ${d1} et ${d2} se coupent en formant un angle droit (90°). Quelle est la notation mathématique rigoureuse exprimant qu'elles sont perpendiculaires ?`,
              answer: ans,
              hint: "Le symbole ⊥ indique la perpendicularité, tandis que // indique le parallélisme.",
              geoData: { type: 'rightAngleCheck', deg: 90, d1, d2, isPerpendicular: true },
              demo: { exampleQuestion: `Notation mathématique pour ${d1} et ${d2} perpendiculaires`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          } else {
            const ans = "90°";
            const optionsSet = new Set(["90°", "180°", "45°", "0°"]);
            
            return {
              title: "Mesure d'Angle Droit à l'Équerre Laser",
              desc: `Si la droite ${d1} est perpendiculaire à la droite ${d2} (${d1} ⊥ ${d2}), quelle est la mesure exacte de l'angle d'intersection formé ?`,
              answer: ans,
              hint: "Par définition, un angle droit mesuré à l'équerre fait exactement 90°.",
              geoData: { type: 'rightAngleCheck', deg: 90, d1, d2, isPerpendicular: true },
              demo: { exampleQuestion: "Mesure d'un angle formé par des droites perpendiculaires", exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          }
        }
      },
      
      // RANG 4 : CONFIRMÉ (CM2 — Droites parallèles & Écartement constant)
      {
        rankId: "RANG 4",
        rankTitle: "CONFIRMÉ",
        generate: () => {
          const d1 = randomPick(["(d1)", "(L1)", "(Δ1)", "(D1)"]);
          let d2 = randomPick(["(d2)", "(L2)", "(Δ2)", "(D2)"]);
          while (d2 === d1) d2 = randomPick(["(d2)", "(L2)", "(Δ2)", "(D2)"]);
          const dist = randomInt(3, 15) * 10;
          const mode = randomPick(["spacing", "qualification", "symbol"]);
          
          if (mode === "spacing") {
            const ans = `${dist} m`;
            const optionsSet = new Set([ans]);
            optionsSet.add(`${Math.round(dist / 2)} m`);
            optionsSet.add(`${dist * 2} m`);
            optionsSet.add("0 m");
            let k = 1;
            while (optionsSet.size < 4) {
              optionsSet.add(`${dist + k * 15} m`);
              k++;
            }
            
            return {
              title: "Droites Parallèles & Écartement Constant",
              desc: `Deux rails magnétiques parallèles ${d1} et ${d2} conservent un écartement constant. Si la distance qui les sépare est de ${dist} m au point A, quelle sera la distance entre ces rails 2 km plus loin ?`,
              answer: ans,
              hint: "Deux droites parallèles (notées d1 ∥ d2) ne se coupent jamais et gardent une distance constante entre elles.",
              geoData: { type: 'parallelTheorem', dist, d1, d2 },
              demo: { exampleQuestion: `Écartement à 2 km pour des rails distants de ${dist} m`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          } else if (mode === "qualification") {
            const ans = "Droites parallèles";
            const optionsSet = new Set([
              "Droites parallèles",
              "Droites perpendiculaires",
              "Droites sécantes non perpendiculaires",
              "Droites confondues"
            ]);
            
            return {
              title: "Caractérisation de Trajectoires Parallèles",
              desc: `Deux trajectoires rectilignes ${d1} et ${d2} restent situées dans un même plan sans jamais se croiser, en maintenant un écartement constant de ${dist} m. Comment qualifie-t-on ces droites ?`,
              answer: ans,
              hint: "Deux droites coplanaires qui ne se coupent jamais sont parallèles.",
              geoData: { type: 'parallelTheorem', dist, d1, d2 },
              demo: { exampleQuestion: `Relation entre droites à écartement constant de ${dist} m`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          } else {
            const ans = `${d1} // ${d2}`;
            const optionsSet = new Set([
              `${d1} // ${d2}`,
              `${d1} ⊥ ${d2}`,
              `${d1} = ${d2}`,
              `${d1} ∈ ${d2}`
            ]);
            
            return {
              title: "Symbole Officiel de Parallélisme",
              desc: `Les droites ${d1} et ${d2} sont parallèles dans le plan. Quelle est l'écriture mathématique symbolique correcte ?`,
              answer: ans,
              hint: "Le symbole // signifie « est parallèle à ».",
              geoData: { type: 'parallelTheorem', dist, d1, d2 },
              demo: { exampleQuestion: `Notation symbolique pour ${d1} et ${d2} parallèles`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          }
        }
      },
      
      // RANG 5 : EXPERT (6ème — Théorèmes de perpendicularité et parallélisme)
      {
        rankId: "RANG 5",
        rankTitle: "EXPERT",
        generate: () => {
          const lineSets = [
            { d1: "(d1)", d2: "(d2)", d3: "(d3)" },
            { d1: "(L1)", d2: "(L2)", d3: "(L3)" },
            { d1: "(Δ1)", d2: "(Δ2)", d3: "(Δ3)" },
            { d1: "(D1)", d2: "(D2)", d3: "(D3)" }
          ];
          const { d1, d2, d3 } = randomPick(lineSets);
          const mode = randomPick(["perpToSame", "parallelAndPerp", "parallelToSame"]);
          
          if (mode === "perpToSame") {
            const ans = `${d1} et ${d2} sont parallèles`;
            const optionsSet = new Set([
              `${d1} et ${d2} sont parallèles`,
              `${d1} et ${d2} sont perpendiculaires`,
              `${d1} et ${d2} sont sécantes à 45°`,
              `${d1} et ${d2} sont confondues`
            ]);
            
            return {
              title: "Théorème de Perpendicularité & Parallélisme",
              desc: `On sait que la droite ${d1} est perpendiculaire à ${d3} (${d1} ⊥ ${d3}), et que la droite ${d2} est aussi perpendiculaire à ${d3} (${d2} ⊥ ${d3}). Que conclut le théorème géométrique pour ${d1} et ${d2} ?`,
              answer: ans,
              hint: "Propriété fondamentale : Si deux droites sont perpendiculaires à une même troisième, alors elles sont parallèles entre elles.",
              geoData: { type: 'parallelPerpTheorem', d1, d2, d3, theoremType: 'perpToSame' },
              demo: { exampleQuestion: `Relation entre ${d1} et ${d2} si toutes deux ⊥ à ${d3}`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          } else if (mode === "parallelAndPerp") {
            const ans = `${d1} est perpendiculaire à ${d3}`;
            const optionsSet = new Set([
              `${d1} est perpendiculaire à ${d3}`,
              `${d1} est parallèle à ${d3}`,
              `${d1} est sécante à 30° avec ${d3}`,
              `${d1} ne rencontre jamais ${d3}`
            ]);
            
            return {
              title: "Théorème des Parallèles & Perpendiculaires",
              desc: `On sait que la droite ${d1} est parallèle à ${d2} (${d1} // ${d2}), et que ${d2} est perpendiculaire à ${d3} (${d2} ⊥ ${d3}). Quelle est la relation géométrique entre ${d1} et ${d3} ?`,
              answer: ans,
              hint: "Propriété fondamentale : Si deux droites sont parallèles, toute droite perpendiculaire à l'une est aussi perpendiculaire à l'autre.",
              geoData: { type: 'parallelPerpTheorem', d1, d2, d3, theoremType: 'parallelAndPerp' },
              demo: { exampleQuestion: `Relation entre ${d1} et ${d3} si ${d1}//${d2} et ${d2}⊥${d3}`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          } else {
            const ans = `${d1} et ${d2} sont parallèles`;
            const optionsSet = new Set([
              `${d1} et ${d2} sont parallèles`,
              `${d1} et ${d2} sont perpendiculaires`,
              `${d1} et ${d2} se coupent à 90°`,
              `${d1} et ${d2} sont obliques`
            ]);
            
            return {
              title: "Théorème de Transitivité du Parallélisme",
              desc: `On sait que la droite ${d1} est parallèle à ${d3} (${d1} // ${d3}) et que la droite ${d2} est parallèle à ${d3} (${d2} // ${d3}). Que conclut la propriété géométrique pour ${d1} et ${d2} ?`,
              answer: ans,
              hint: "Propriété fondamentale : Si deux droites sont parallèles à une même troisième, alors elles sont parallèles entre elles.",
              geoData: { type: 'parallelPerpTheorem', d1, d2, d3, theoremType: 'parallelToSame' },
              demo: { exampleQuestion: `Relation entre ${d1} et ${d2} si toutes deux // à ${d3}`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          }
        }
      },
      
      // RANG 6 : CHAMPION (5ème — Angles alternes-internes et correspondants)
      {
        rankId: "RANG 6",
        rankTitle: "CHAMPION",
        generate: () => {
          const lineSets = [
            { d1: "(d1)", d2: "(d2)", secant: "(Δ)" },
            { d1: "(L1)", d2: "(L2)", secant: "(D)" },
            { d1: "(Δ1)", d2: "(Δ2)", secant: "(S)" }
          ];
          const { d1, d2, secant } = randomPick(lineSets);
          const rawAngle = randomInt(4, 16) * 5;
          const angleVal = rawAngle === 90 ? 75 : rawAngle;
          const supAngle = 180 - angleVal;
          const mode = randomPick(["alternate", "corresponding", "reciprocal"]);
          
          if (mode === "alternate") {
            const ans = `${angleVal}°`;
            const optionsSet = new Set([ans]);
            optionsSet.add(`${supAngle}°`);
            optionsSet.add("90°");
            optionsSet.add(`${angleVal > 45 ? angleVal - 20 : angleVal + 20}°`);
            let offset = 15;
            while (optionsSet.size < 4) {
              optionsSet.add(`${angleVal + offset}°`);
              offset += 10;
            }
            
            return {
              title: "Angles Alternes-Internes & Parallèles",
              desc: `Deux droites parallèles ${d1} et ${d2} sont coupées par une sécante ${secant}. Si l'un des angles alternes-internes mesure ${angleVal}°, quelle est la mesure du second angle alternes-internes ?`,
              answer: ans,
              hint: "Si deux droites parallèles sont coupées par une sécante, alors les angles alternes-internes qu'elles forment sont de même mesure.",
              geoData: { type: 'alternateInternal', angle: angleVal, angleType: 'alternes-internes', d1, d2, secant },
              demo: { exampleQuestion: `Mesure de l'angle alternes-internes associé pour ${angleVal}°`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          } else if (mode === "corresponding") {
            const ans = `${angleVal}°`;
            const optionsSet = new Set([ans]);
            optionsSet.add(`${supAngle}°`);
            optionsSet.add("90°");
            optionsSet.add(`${angleVal > 45 ? angleVal - 20 : angleVal + 20}°`);
            let offset = 15;
            while (optionsSet.size < 4) {
              optionsSet.add(`${angleVal + offset}°`);
              offset += 10;
            }
            
            return {
              title: "Angles Correspondants & Parallèles",
              desc: `Deux droites parallèles ${d1} et ${d2} sont coupées par une sécante ${secant}. Si l'un des angles correspondants mesure ${angleVal}°, quelle est la mesure du second angle correspondant ?`,
              answer: ans,
              hint: "Si deux droites parallèles sont coupées par une sécante, alors les angles correspondants qu'elles forment sont de même mesure.",
              geoData: { type: 'alternateInternal', angle: angleVal, angleType: 'correspondants', d1, d2, secant },
              demo: { exampleQuestion: `Mesure de l'angle correspondant associé pour ${angleVal}°`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          } else {
            const ans = `${d1} et ${d2} sont parallèles`;
            const optionsSet = new Set([
              `${d1} et ${d2} sont parallèles`,
              `${d1} et ${d2} sont perpendiculaires`,
              `${d1} et ${d2} se coupent à ${angleVal}°`,
              "On ne peut pas conclure"
            ]);
            
            return {
              title: "Réciproque des Angles Alternes-Internes",
              desc: `Deux droites ${d1} et ${d2} sont coupées par une sécante ${secant}. Elles forment deux angles alternes-internes de même mesure (${angleVal}°). Que peut-on en déduire pour ${d1} et ${d2} ?`,
              answer: ans,
              hint: "Réciproque : Si deux droites coupées par une sécante forment des angles alternes-internes de même mesure, alors elles sont parallèles.",
              geoData: { type: 'alternateInternal', angle: angleVal, angleType: 'alternes-internes', d1, d2, secant },
              demo: { exampleQuestion: `Conclusion si deux angles alternes-internes mesurent tous deux ${angleVal}°`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          }
        }
      },
      
      // RANG 7 : LÉGENDAIRE (4ème — Distance d'un point à une droite)
      {
        rankId: "RANG 7",
        rankTitle: "LÉGENDAIRE",
        generate: () => {
          const points = shuffleArray(["H", "K", "P", "Q", "R", "S"]).slice(0, 2);
          const [hPoint, footPoint] = [points[0], `${points[0]}'`];
          const lineNames = shuffleArray(["(d)", "(Δ)", "(L)", "(D)"]);
          const lineName = lineNames[0];
          const distVal = randomInt(3, 12) * 10;
          const mode = randomPick(["numeric", "angle", "definition"]);
          
          if (mode === "numeric") {
            const ans = `${distVal} m`;
            const optionsSet = new Set([ans]);
            optionsSet.add(`${Math.round(distVal / 2)} m`);
            optionsSet.add(`${distVal * 2} m`);
            optionsSet.add(`${distVal + 15} m`);
            let offset = 5;
            while (optionsSet.size < 4) {
              optionsSet.add(`${distVal + offset} m`);
              offset += 10;
            }
            
            return {
              title: "Calcul de la Distance d'un Point à une Droite",
              desc: `Soit le segment perpendiculaire [${hPoint}${footPoint}] reliant le point ${hPoint} à la droite ${lineName}. Quelle est la distance exacte du point ${hPoint} à la droite ${lineName} ?`,
              answer: ans,
              hint: `La distance du point ${hPoint} à la droite ${lineName} est égale à la longueur du segment perpendiculaire [${hPoint}${footPoint}].`,
              geoData: { type: 'pointLineDist', dist: distVal, hPoint, lineName, footPoint },
              demo: { exampleQuestion: `Distance du point ${hPoint} à la droite ${lineName} si [${hPoint}${footPoint}] = ${distVal} m`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          } else if (mode === "angle") {
            const ans = "Angle droit (90°)";
            const optionsSet = new Set([
              "Angle droit (90°)",
              "Angle aigu de 45°",
              "Angle plat de 180°",
              "Angle obtus de 120°"
            ]);
            
            return {
              title: "Distance d'un Point à une Droite : Angle Requis",
              desc: `Pour mesurer la distance minimale d'un point ${hPoint} à une droite ${lineName}, sous quel angle géométrique le segment [${hPoint}${footPoint}] doit-il couper la droite ${lineName} ?`,
              answer: ans,
              hint: "La distance d'un point à une droite est la longueur du segment perpendiculaire issu de ce point.",
              geoData: { type: 'pointLineDist', dist: distVal, hPoint, lineName, footPoint },
              demo: { exampleQuestion: `Angle requis pour mesurer la distance du point ${hPoint} à ${lineName}`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          } else {
            const ans = "La longueur du segment perpendiculaire issu du point à la droite";
            const optionsSet = new Set([
              "La longueur du segment perpendiculaire issu du point à la droite",
              "La longueur de n'importe quel segment reliant le point à la droite",
              "La distance entre deux points de la droite",
              "Le rayon du cercle tangent passant par le point"
            ]);
            
            return {
              title: "Définition Géométrique : Distance d'un Point à une Droite",
              desc: `Quelle est la définition géométrique exacte de la distance d'un point ${hPoint} à une droite ${lineName} ?`,
              answer: ans,
              hint: "C'est la plus courte distance entre le point et la droite, mesurée le long de la perpendiculaire.",
              geoData: { type: 'pointLineDist', dist: distVal, hPoint, lineName, footPoint },
              demo: { exampleQuestion: `Définition de la distance du point ${hPoint} à la droite ${lineName}`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          }
        }
      },
      
      // RANG 8 : HACKER PGM (3ème — Droites remarquables du triangle)
      {
        rankId: "RANG 8",
        rankTitle: "HACKER PGM",
        generate: () => {
          const lineTypes = ["Hauteur", "Médiatrice", "Bissectrice", "Médiane"];
          const targetLine = randomPick(lineTypes);
          const triName = randomPick(["ABC", "PQR", "KLM", "EFG"]);
          const mode = randomPick(["identification", "property", "concurrency"]);
          
          if (mode === "identification") {
            let descText = "";
            let ans = "";
            
            if (targetLine === "Hauteur") {
              ans = "La Hauteur";
              descText = `Dans le triangle ${triName}, quelle droite remarquable passe par un sommet et est perpendiculaire au côté opposé ?`;
            } else if (targetLine === "Médiatrice") {
              ans = "La Médiatrice";
              descText = `Dans le triangle ${triName}, quelle droite remarquable est perpendiculaire à un côté et passe par son milieu exact ?`;
            } else if (targetLine === "Bissectrice") {
              ans = "La Bissectrice";
              descText = `Dans le triangle ${triName}, quelle demi-droite remarquable partage un angle en deux angles de même mesure ?`;
            } else {
              ans = "La Médiane";
              descText = `Dans le triangle ${triName}, quelle droite remarquable passe par un sommet et le milieu du côté opposé ?`;
            }
            
            const optionsSet = new Set(["La Hauteur", "La Médiatrice", "La Bissectrice", "La Médiane"]);
            return {
              title: `Droites Remarquables : ${targetLine.toUpperCase()}`,
              desc: descText,
              answer: ans,
              hint: "Hauteur = Sommet ⊥ Côté opposé | Médiatrice = Milieu ⊥ Côté | Bissectrice = Partage d'angle | Médiane = Sommet au Milieu.",
              geoData: { type: 'triangleRemarkableLine', lineType: targetLine, triangle: triName },
              demo: { exampleQuestion: `Identification de la droite remarquable : ${targetLine}`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          } else if (mode === "property") {
            let propDesc = "";
            let ans = "";
            
            if (targetLine === "Hauteur") {
              ans = "Elle passe par un sommet et est perpendiculaire au côté opposé";
              propDesc = "Quelle est la définition exacte de la Hauteur d'un triangle ?";
            } else if (targetLine === "Médiatrice") {
              ans = "Elle est perpendiculaire à un côté et passe par son milieu";
              propDesc = "Quelle est la définition exacte de la Médiatrice d'un côté de triangle ?";
            } else if (targetLine === "Bissectrice") {
              ans = "Elle partage un angle du triangle en deux angles de même mesure";
              propDesc = "Quelle est la définition exacte de la Bissectrice d'un angle dans un triangle ?";
            } else {
              ans = "Elle passe par un sommet et le milieu du côté opposé";
              propDesc = "Quelle est la définition exacte de la Médiane d'un triangle ?";
            }
            
            const optionsSet = new Set([
              "Elle passe par un sommet et est perpendiculaire au côté opposé",
              "Elle est perpendiculaire à un côté et passe par son milieu",
              "Elle partage un angle du triangle en deux angles de même mesure",
              "Elle passe par un sommet et le milieu du côté opposé"
            ]);
            
            return {
              title: `Caractérisation de la ${targetLine}`,
              desc: propDesc,
              answer: ans,
              hint: "Chaque droite remarquable possède sa propre caractéristique d'intersection et d'angle.",
              geoData: { type: 'triangleRemarkableLine', lineType: targetLine, triangle: triName },
              demo: { exampleQuestion: `Définition de la ${targetLine}`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          } else {
            let ans = "";
            let descText = "";
            
            if (targetLine === "Médiatrice") {
              ans = "Le centre du cercle circonscrit au triangle";
              descText = `Les trois médiatrices d'un triangle ${triName} sont concourantes. Que représente leur point d'intersection ?`;
            } else if (targetLine === "Hauteur") {
              ans = "L'orthocentre du triangle";
              descText = `Les trois hauteurs d'un triangle ${triName} se coupent en un même point. Comment appelle-t-on ce point de concours ?`;
            } else if (targetLine === "Bissectrice") {
              ans = "Le centre du cercle inscrit dans le triangle";
              descText = "En quel point remarquable se croisent les trois bissectrices des angles d'un triangle ?";
            } else {
              ans = "Le centre de gravité du triangle";
              descText = `Les trois médianes d'un triangle ${triName} se coupent en un point unique. Quel est ce point ?`;
            }
            
            const optionsSet = new Set([
              "Le centre du cercle circonscrit au triangle",
              "L'orthocentre du triangle",
              "Le centre du cercle inscrit dans le triangle",
              "Le centre de gravité du triangle"
            ]);
            
            return {
              title: `Point de Concours des ${targetLine}s`,
              desc: descText,
              answer: ans,
              hint: "Médiatrices → Cercle circonscrit | Hauteurs → Orthocentre | Bissectrices → Cercle inscrit | Médianes → Centre de gravité.",
              geoData: { type: 'triangleRemarkableLine', lineType: targetLine, triangle: triName },
              demo: { exampleQuestion: `Point de concours des ${targetLine.toLowerCase()}s`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          }
        }
      }
    ]
  },
  
  // ------------------------------------------------------------------------
  // MONDE 4 : MIROIR NUMÉRIQUE & SYMÉTRIES
  // ------------------------------------------------------------------------
  4: {
    name: "Monde 4 : Miroir Numérique & Symétries",
    icon: "🪞",
    ranks: [
      // RANG 1 : NOOB (CE1/CE2) — Initiation Pliage & Axe Miroir
      {
        rankId: "RANG 1",
        rankTitle: "NOOB",
        generate: () => {
          const isInverse = Math.random() < 0.5;
          const dist = randomInt(2, 8);
          const scaleMeter = 5;
          const ansName = "Symétrie axiale";
          const ansSuperpose = "Elles se superposent exactement";
          
          if (isInverse) {
            const distractors = [
              "Translation simple (Glissement)",
              "Rotation de 180° sans pliage",
              "Agrandissement (Homothétie)",
              "Décalage vertical parallèle"
            ];
            return {
              title: "Symétrie Axiale & Effet Miroir",
              desc: "Un motif géométrique sur quadrillage est plié le long d'une ligne droite centrale. Quelle transformation géométrique plane permet d'obtenir la figure exacte superposable par pliage de part et d'autre de cette ligne ?",
              answer: ansName,
              hint: "Fiche Cours : La symétrie axiale est la transformation géométrique qui associe à chaque point une image par pliage le long d'une droite appelée axe de symétrie.",
              geoData: { type: 'axialGrid', distA: dist, xOrig: -dist, hideTarget: false, scale: `1 carreau = ${scaleMeter} m` },
              demo: { exampleQuestion: "Transformation géométrique plane simulant le pliage le long d'un axe", exampleAnswer: ansName },
              options: buildUniqueOptions(ansName, () => shuffleArray(distractors)[0])
            };
          } else {
            const distractors = [
              "Elles se croisent à un angle droit de 90°",
              "L'image devient deux fois plus grande que l'original",
              "Elles s'annulent et s'effacent de la grille",
              "Elles glissent de 5 carreaux vers le bas"
            ];
            return {
              title: "Pliage le long de l'Axe de Symétrie",
              desc: "Si l'on plie une feuille comportant une figure plane et son axe de symétrie, que se passe-t-il pour la figure d'origine et son image de l'autre côté de l'axe ?",
              answer: ansSuperpose,
              hint: "Fiche Cours : Lorsque deux figures sont symétriques par rapport à une droite, le pliage du papier le long de cet axe fait coïncider et superposer exactement chaque point.",
              geoData: { type: 'axialGrid', distA: dist, xOrig: -dist, hideTarget: false, scale: `1 carreau = ${scaleMeter} m` },
              demo: { exampleQuestion: "Effet du pliage d'une feuille le long de l'axe de symétrie", exampleAnswer: ansSuperpose },
              options: buildUniqueOptions(ansSuperpose, () => shuffleArray(distractors)[0])
            };
          }
        }
      },
      
      // RANG 2 : NOVICE (CE2/CM1) — Symétrie sur Quadrillage
      {
        rankId: "RANG 2",
        rankTitle: "NOVICE",
        generate: () => {
          const isInverse = Math.random() < 0.5;
          const dist = randomInt(2, 9);
          const unitScale = 2;
          
          if (isInverse) {
            const errorOffset = randomInt(1, 3);
            const errDist = dist + errorOffset;
            const ansErr = "Position incorrecte (écart de distance)";
            const distractors = [
              "Position exacte et conforme",
              "Rotation de 180° réussie",
              "Alignement parallèle parfait"
            ];
            
            return {
              title: "Validation d'un Point Symétrique sur Quadrillage",
              desc: `Un point d'ancrage A se situe à ${dist} carreaux à gauche d'un axe vertical. Si son image A' apparaît à ${errDist} carreaux à droite de l'axe, que peut-on conclure sur cette projection ?`,
              answer: ansErr,
              hint: "Fiche Cours : La symétrie axiale impose l'égal écartement : le segment [AA'] doit être perpendiculaire à l'axe, et l'axe doit couper ce segment en son milieu exact.",
              geoData: { type: 'axialGridError', distA: dist, errDist: errDist, xOrig: -dist, hideTarget: false, scale: `1 carreau = ${unitScale} m` },
              demo: { exampleQuestion: `Analyse d'une image A' située à ${errDist} carreaux au lieu de ${dist}`, exampleAnswer: ansErr },
              options: buildUniqueOptions(ansErr, () => shuffleArray(distractors)[0])
            };
          } else {
            const ansDist = `${dist} carreaux (à la même distance)`;
            const distractors = [
              `${dist * 2} carreaux (distance doublée)`,
              `${Math.max(1, dist - 1)} carreaux (distance réduite)`,
              "0 carreau (sur l'axe de symétrie)"
            ];
            
            return {
              title: "Symétrie Axiale sur Quadrillage : Égalité des Distances",
              desc: `Sur un réseau quadrillé, un point d'ancrage A est situé à ${dist} carreaux d'un axe de symétrie vertical. À quelle distance de l'axe, du côté opposé, doit se placer son point image A' ?`,
              answer: ansDist,
              hint: "Fiche Cours : Sur un quadrillage, le symétrique d'un point par rapport à un axe se construit en comptant le même nombre de carreaux perpendiculairement à l'axe.",
              geoData: { type: 'axialGrid', distA: dist, xOrig: -dist, hideTarget: false, scale: `1 carreau = ${unitScale} m` },
              demo: { exampleQuestion: `Distance d'un point symétrique A' si A est à ${dist} carreaux`, exampleAnswer: ansDist },
              options: buildUniqueOptions(ansDist, () => shuffleArray(distractors)[0])
            };
          }
        }
      },
      
      // RANG 3 : APPRENTI (CM1/CM2/6ème) — Axes des Figures Usuelles
      {
        rankId: "RANG 3",
        rankTitle: "APPRENTI",
        generate: () => {
          const isInverse = Math.random() < 0.5;
          const shapes = [
            { name: "Carré", axes: 4, label: "4 axes de symétrie" },
            { name: "Rectangle non carré", axes: 2, label: "2 axes de symétrie (médiatrices des côtés)" },
            { name: "Losange non carré", axes: 2, label: "2 axes de symétrie (supports des diagonales)" },
            { name: "Triangle équilatéral", axes: 3, label: "3 axes de symétrie" },
            { name: "Triangle isocèle non équilatéral", axes: 1, label: "1 axe de symétrie" },
            { name: "Cercle", axes: 999, label: "Une infinité d'axes de symétrie" }
          ];
          
          const picked = randomPick(shapes);
          const ansAxes = picked.label;
          
          if (isInverse) {
            const possibleAxes = ["1 axe", "2 axes", "3 axes", "4 axes", "Une infinité d'axes", "0 axe"];
            return {
              title: "Axes de Symétrie des Figures Usuelles",
              desc: `Combien d'axes de symétrie possède la figure plane usuelle suivante : ${picked.name} ?`,
              answer: ansAxes,
              hint: "Fiche Cours : Carré = 4 axes | Rectangle = 2 axes | Losange = 2 axes | Triangle équilatéral = 3 axes | Triangle isocèle = 1 axe | Cercle = Une infinité d'axes.",
              geoData: { type: 'symmetryAxes', shape: picked.name, axesCount: picked.axes, hideTarget: true },
              demo: { exampleQuestion: `Nombre d'axes de symétrie d'un ${picked.name}`, exampleAnswer: ansAxes },
              options: buildUniqueOptions(ansAxes, () => shuffleArray(possibleAxes.filter(a => a !== ansAxes))[0])
            };
          } else {
            const targetShape = picked.name;
            const candidates = shapes.filter(s => s.axes !== picked.axes).map(s => s.name);
            
            return {
              title: "Identification de Figure par ses Axes de Symétrie",
              desc: `Quelle figure géométrique plane usuelle possède exactement ${ansAxes} de symétrie ?`,
              answer: targetShape,
              hint: "Fiche Cours : Le nombre d'axes de symétrie permet de caractériser les polygones usuels.",
              geoData: { type: 'symmetryAxes', shape: targetShape, axesCount: picked.axes, hideTarget: true },
              demo: { exampleQuestion: `Figure plane usuelle possédant ${ansAxes} de symétrie`, exampleAnswer: targetShape },
              options: buildUniqueOptions(targetShape, () => shuffleArray(candidates)[0])
            };
          }
        }
      },
      
      // RANG 4 : CONFIRMÉ (6ème) — Isométrie & Inversion d'Orientation
      {
        rankId: "RANG 4",
        rankTitle: "CONFIRMÉ",
        generate: () => {
          const isInverse = Math.random() < 0.5;
          
          if (isInverse) {
            const ansOrient = "Elle inverse l'orientation (effet miroir)";
            const distractors = [
              "L'orientation reste strictly conservée",
              "La figure pivote de 90° dans le sens horaire",
              "La figure est agrandie d'un facteur 2",
              "Les angles sont tous modifiés de 45°"
            ];
            
            return {
              title: "Symétrie Axiale & Orientation de la Figure",
              desc: "Comment la symétrie axiale modifie-t-elle l'orientation (le sens de parcours des sommets) d'une figure plane ?",
              answer: ansOrient,
              hint: "Fiche Cours : La symétrie axiale inverse l'orientation de la figure (effet miroir).",
              geoData: { type: 'symmetryProperties', shapeName: 'figure', hideTarget: false },
              demo: { exampleQuestion: "Modification de l'orientation d'une figure par symétrie axiale", exampleAnswer: ansOrient },
              options: buildUniqueOptions(ansOrient, () => shuffleArray(distractors)[0])
            };
          } else {
            const ansIsometrie = "Toutes ces grandeurs sont conservées à l'identique";
            const distractors = [
              "Les longueurs doublent mais les angles sont conservés",
              "Seul le périmètre est conservé, pas l'aire",
              "L'aire est divisée par deux par le pliage",
              "Toutes les mesures sont modifiées"
            ];
            
            return {
              title: "Symétrie Axiale & Isométrie",
              desc: "Lorsqu'une figure géométrique subit une symétrie axiale, que peut-on affirmer concernant les longueurs de ses côtés, la mesure de ses angles, son périmètre et son aire ?",
              answer: ansIsometrie,
              hint: "Fiche Cours : La symétrie axiale est une isométrie : elle conserve les distances, l'alignement des points, les mesures d'angles, les périmètres et les aires.",
              geoData: { type: 'symmetryProperties', shapeName: 'figure', length: 12, hideTarget: false },
              demo: { exampleQuestion: "Conservation des grandeurs par la symétrie axiale", exampleAnswer: ansIsometrie },
              options: buildUniqueOptions(ansIsometrie, () => shuffleArray(distractors)[0])
            };
          }
        }
      },
      
      // RANG 5 : EXPERT (6ème) — Médiatrice d'un Segment & Équidistance
      {
        rankId: "RANG 5",
        rankTitle: "EXPERT",
        generate: () => {
          const isInverse = Math.random() < 0.5;
          
          if (isInverse) {
            const ansEquidist = "MA = MB (M est équidistant de A et B)";
            const distractors = [
              "MA + MB = AB²",
              "MA = 2 × MB",
              "MA et MB sont perpendiculaires",
              "MA = MB / 2"
            ];
            
            return {
              title: "Caractérisation de la Médiatrice par l'Équidistance",
              desc: "Si un point M appartient à la médiatrice d'un segment [AB], quelle relation d'égalité associe les distances MA et MB ?",
              answer: ansEquidist,
              hint: "Fiche Cours : Tout point M situé sur la médiatrice d'un segment [AB] est à égale distance de ses extrémités (MA = MB).",
              geoData: { type: 'mediatrixDist', hideTarget: false, scale: "1 cm = 10 m" },
              demo: { exampleQuestion: "Relation entre MA et MB si M appartient à la médiatrice de [AB]", exampleAnswer: ansEquidist },
              options: buildUniqueOptions(ansEquidist, () => shuffleArray(distractors)[0])
            };
          } else {
            const ansDef = "La Médiatrice du segment [AB]";
            const distractors = [
              "La Hauteur issue de A",
              "La Bissectrice du segment [AB]",
              "La Médiane passant par O",
              "La Tangente au segment [AB]"
            ];
            
            return {
              title: "Médiatrice d'un Segment & Axe de Symétrie",
              desc: "Quelle est la droite remarquable du plan qui constitue l'axe de symétrie perpendiculaire d'un segment [AB] en passant par son milieu exact ?",
              answer: ansDef,
              hint: "Fiche Cours : La médiatrice d'un segment [AB] est la droite perpendiculaire au segment [AB] qui passe par son milieu.",
              geoData: { type: 'mediatrixDist', hideTarget: false, scale: "1 cm = 10 m" },
              demo: { exampleQuestion: "Nom de la droite perpendiculaire à [AB] passant par son milieu", exampleAnswer: ansDef },
              options: buildUniqueOptions(ansDef, () => shuffleArray(distractors)[0])
            };
          }
        }
      },
      
      // RANG 6 : CHAMPION (5ème) — Symétrie Centrale & Orientation
      {
        rankId: "RANG 6",
        rankTitle: "CHAMPION",
        generate: () => {
          const isInverse = Math.random() < 0.5;
          const xArr = [-5, -4, -3, -2, 2, 3, 4, 5];
          const yArr = [-5, -4, -3, -2, 2, 3, 4, 5];
          const x = randomPick(xArr);
          const y = randomPick(yArr);
          
          if (isInverse) {
            const ansOrient = "L'orientation (sens de parcours) est conservée";
            const distractors = [
              "L'orientation est inversée (effet miroir)",
              "La figure est déformée par cisaillement",
              "L'aire est réduite de moitié",
              "Les angles sont tous inversés à -90°"
            ];
            
            return {
              title: "Symétrie Centrale & Conservation de l'Orientation",
              desc: "Contrairement à la symétrie axiale (effet miroir), comment évolue l'orientation (le sens de parcours des sommets) d'une figure plane après une symétrie centrale de centre O ?",
              answer: ansOrient,
              hint: "Fiche Cours : Dans le plan, la symétrie centrale est équivalente à une rotation de 180°. Elle conserve l'orientation de la figure.",
              geoData: { type: 'centralSymDirect', orig: [x, y], xOrig: x, yOrig: y, hideTarget: false },
              demo: { exampleQuestion: "Évolution de l'orientation d'une figure après une symétrie centrale", exampleAnswer: ansOrient },
              options: buildUniqueOptions(ansOrient, () => shuffleArray(distractors)[0])
            };
          } else {
            const ansCentral = "La Symétrie centrale de centre O";
            const distractors = [
              "La Symétrie axiale d'axe O",
              "La Translation de vecteur O",
              "L'Homothétie de rapport 0",
              "La Projection orthogonale en O"
            ];
            
            return {
              title: "Symétrie Centrale & Demi-tour de 180°",
              desc: "Quelle transformation géométrique fait effectuer à une figure un demi-tour (180°) autour d'un point O, de sorte que O soit le milieu du segment [MM'] reliant chaque point à son image ?",
              answer: ansCentral,
              hint: "Fiche Cours : La symétrie centrale de centre O est la transformation du plan qui fait effectuer à une figure un demi-tour (180°) autour de O.",
              geoData: { type: 'centralSymDirect', orig: [x, y], xOrig: x, yOrig: y, hideTarget: false },
              demo: { exampleQuestion: "Transformation effectuant un demi-tour de 180° autour d'un point O", exampleAnswer: ansCentral },
              options: buildUniqueOptions(ansCentral, () => shuffleArray(distractors)[0])
            };
          }
        }
      },
      
      // RANG 7 : LÉGENDAIRE (5ème/4ème) — Droites Images Parallèles
      {
        rankId: "RANG 7",
        rankTitle: "LÉGENDAIRE",
        generate: () => {
          const isInverse = Math.random() < 0.5;
          const rangeVal = randomInt(5, 14) * 10;
          
          if (isInverse) {
            const ansLen = "A'B' = L (longueur conservée)";
            const distractors = [
              "A'B' = L / 2 (longueur divisée par 2)",
              "A'B' = 2 × L (longueur doublée)",
              "A'B' = L² (longueur au carré)",
              "A'B' dépend de la position de O"
            ];
            
            return {
              title: "Symétrie Centrale & Isométrie",
              desc: "Si un segment [AB] mesure une longueur donnée L, quelle sera la longueur de son segment image [A'B'] après une symétrie centrale de centre O ?",
              answer: ansLen,
              hint: "Fiche Cours : La symétrie centrale est une isométrie : elle conserve les longueurs (A'B' = AB).",
              geoData: { type: 'centralSymParallel', range: rangeVal, hideTarget: false },
              demo: { exampleQuestion: "Longueur du segment image [A'B'] par symétrie centrale", exampleAnswer: ansLen },
              options: buildUniqueOptions(ansLen, () => shuffleArray(distractors)[0])
            };
          } else {
            const ansParallel = "(d') est parallèle à (d)";
            const distractors = [
              "(d') est perpendiculaire à (d)",
              "(d') est sécante à (d) en O",
              "(d') est confondue avec (d)",
              "(d') forme un angle de 45° avec (d)"
            ];
            
            return {
              title: "Image d'une Droite par Symétrie Centrale",
              desc: "Quelle est la position relative de la droite image (d') obtenue par la symétrie centrale de centre O d'une droite (d) ne passant pas par O ?",
              answer: ansParallel,
              hint: "Fiche Cours : L'image d'une droite (d) par une symétrie centrale de centre O est une droite (d') qui lui est strictly parallèle.",
              geoData: { type: 'centralSymParallel', range: rangeVal, hideTarget: false },
              demo: { exampleQuestion: "Position relative d'une droite (d) et de son image (d') par symétrie centrale", exampleAnswer: ansParallel },
              options: buildUniqueOptions(ansParallel, () => shuffleArray(distractors)[0])
            };
          }
        }
      },
      
      // RANG 8 : HACKER PGM (5ème/3ème) — Centre de Symétrie des Figures
      {
        rankId: "RANG 8",
        rankTitle: "HACKER PGM",
        generate: () => {
          const isInverse = Math.random() < 0.5;
          const shapes = [
            { name: "Parallélogramme", center: "À l'intersection de ses diagonales" },
            { name: "Rectangle", center: "À l'intersection de ses diagonales" },
            { name: "Losange", center: "À l'intersection de ses diagonales" },
            { name: "Carré", center: "À l'intersection de ses diagonales" },
            { name: "Cercle", center: "Au centre O du cercle" },
            { name: "Segment", center: "Au milieu du segment" }
          ];
          
          if (isInverse) {
            const quadShapes = shapes.filter(s => s.center === "À l'intersection de ses diagonales");
            const picked = randomPick(quadShapes);
            const ansLoc = picked.center;
            const distractors = [
              "Au sommet supérieur gauche",
              "Sur le milieu du plus grand côté",
              "Au centre du cercle inscrit",
              "Il n'en possède aucun"
            ];
            
            return {
              title: "Localisation du Centre de Symétrie des Figures Usuelles",
              desc: `Où se situe le centre de symétrie O d'un ${picked.name.toLowerCase()} ?`,
              answer: ansLoc,
              hint: "Fiche Cours : Parallélogramme, Rectangle, Losange, Carré = Le point d'intersection de leurs diagonales.",
              geoData: { type: 'centerOfSymmetry', shape: picked.name, hideTarget: false },
              demo: { exampleQuestion: `Emplacement du centre de symétrie d'un ${picked.name.toLowerCase()}`, exampleAnswer: ansLoc },
              options: buildUniqueOptions(ansLoc, () => shuffleArray(distractors)[0])
            };
          } else {
            const picked = randomPick(shapes);
            const ansCenter = "Le Centre de symétrie de la figure";
            const distractors = [
              "L'Axe de symétrie principal",
              "Le Foyer de dilatation",
              "Le Sommet d'invariance",
              "Le Centre de gravité orthogonal"
            ];
            
            return {
              title: "Centre de Symétrie d'une Figure Plane",
              desc: `Comment nomme-t-on le point O tel qu'un ${picked.name.toLowerCase()} soit sa propre image par un demi-tour (180°) autour de ce point ?`,
              answer: ansCenter,
              hint: "Fiche Cours : Un point O est centre de symétrie d'une figure si la figure est sa propre image par la symétrie de centre O.",
              geoData: { type: 'centerOfSymmetry', shape: picked.name, hideTarget: false },
              demo: { exampleQuestion: `Nom du point O rendant un ${picked.name.toLowerCase()} invariant par un demi-tour de 180°`, exampleAnswer: ansCenter },
              options: buildUniqueOptions(ansCenter, () => shuffleArray(distractors)[0])
            };
          }
        }
      }
    ]
  },
  
  // ------------------------------------------------------------------------
  // MONDE 5 : CRAFT 3D & GÉOMÉTRIE DE L'ESPACE
  // ------------------------------------------------------------------------
  5: {
    name: "Monde 5 : Craft 3D & Géométrie de l'Espace",
    icon: "📦",
    ranks: [
      // RANG 1 : NOOB (CE1-CE2) — Solides usuels : Propriétés physiques & Tri
      {
        rankId: "RANG 1",
        rankTitle: "NOOB",
        generate: () => {
          const structType = randomInt(0, 2);
          const rollingSolids = ["Cylindre", "Cône", "Sphère", "Boule"];
          const slidingSolids = ["Cube", "Pavé droit", "Pyramide à base carrée", "Prisme droit"];
          
          if (structType === 0) {
            const targetSolid = Math.random() < 0.5 
            ? randomPick(rollingSolids)
            : randomPick(slidingSolids);
            const isRolling = rollingSolids.includes(targetSolid);
            const ans = isRolling ? "Solide qui peut rouler" : "Solide qui glisse uniquement";
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return isRolling ? "Solide qui glisse uniquement" : "Solide qui peut rouler";
              if (i === 2) return "Figure plane à 2 dimensions";
              return "Polygone régulier convexe";
            });
            
            return {
              title: "Tri d'Inventaire : Dynamique des Solides",
              desc: `Dans le module de stockage, tu inspectes un bloc en forme de [${targetSolid}]. En analysant la nature de ses surfaces, quelle est sa propriété de déplacement sur le plan incliné ?`,
              answer: ans,
              hint: "Les solides possédant au moins une surface courbe (cylindre, cône, sphère) peuvent rouler. Les polyèdres constitués exclusivement de faces planes glissent uniquement.",
              geoData: { type: 'solid3D', solid: targetSolid, scale: "Tri physique Cycle 2" },
              demo: { exampleQuestion: `Propriété de déplacement du ${targetSolid}`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const isCurvedTarget = Math.random() < 0.5;
            const targetSolid = isCurvedTarget
            ? randomPick(rollingSolids)
            : randomPick(slidingSolids);
            const ans = isCurvedTarget ? "Au moins une surface courbe" : "Uniquement des faces planes";
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return isCurvedTarget ? "Uniquement des faces planes" : "Au moins une surface courbe";
              if (i === 2) return "Aucune face ni surface";
              return "Uniquement des faces circulaires";
            });
            
            return {
              title: "Tri d'Inventaire : Caractérisation des Surfaces",
              desc: `Examine la structure géométrique d'un module de type [${targetSolid}]. Quelle caractéristique décrit la nature de ses surfaces ?`,
              answer: ans,
              hint: "Les polyèdres (cube, pavé, pyramide, prisme) ne possèdent que des faces planes. Les solides de révolution (cône, cylindre, sphère) comportent au moins une surface courbe.",
              geoData: { type: 'solid3D', solid: targetSolid, scale: "Analyse des faces" },
              demo: { exampleQuestion: `Nature des surfaces du ${targetSolid}`, exampleAnswer: ans },
              options
            };
          } else {
            const ans = "Cylindre";
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return "Cube";
              if (i === 2) return "Pyramide à base carrée";
              return "Pavé droit";
            });
            
            return {
              title: "Tri d'Inventaire : Identification du Solide",
              desc: "Un module de fret possède 2 faces planes circulaires identiques et 1 surface latérale courbe. Il peut rouler ou glisser selon sa position. Quel est ce solide ?",
              answer: ans,
              hint: "Le solide ayant deux bases circulaires parallèles et planes et une surface latérale enroulée est un cylindre.",
              geoData: { type: 'solid3D', solid: "Cylindre", scale: "Identification tactile" },
              demo: { exampleQuestion: "Solide à 2 disques plats et 1 surface courbe", exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 2 : NOVICE (CE2-CM1) — Dénombrement : Faces, Sommets, Arêtes
      {
        rankId: "RANG 2",
        rankTitle: "NOVICE",
        generate: () => {
          const structType = randomInt(0, 2);
          const solids = [
            { name: "Cube", faces: 6, vertices: 8, edges: 12, faceType: "6 carrés" },
            { name: "Pavé droit", faces: 6, vertices: 8, edges: 12, faceType: "6 rectangles" },
            { name: "Pyramide à base carrée", faces: 5, vertices: 5, edges: 8, faceType: "1 carré et 4 triangles" },
            { name: "Prisme droit triangulaire", faces: 5, vertices: 6, edges: 9, faceType: "2 triangles et 3 rectangles" }
          ];
          const target = randomPick(solids);
          
          if (structType === 0) {
            const ans = `${target.edges} arêtes`;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${target.vertices} arêtes`;
              if (i === 2) return `${target.faces} arêtes`;
              return `${target.edges + (i % 2 === 0 ? 2 : -2)} arêtes`;
            });
            
            return {
              title: `Squelette de Solide : Arêtes du ${target.name}`,
              desc: `Pour assembler l'armature d'un conteneur en forme de [${target.name}], combien de tiges métalliques (arêtes) sont nécessaires ?`,
              answer: ans,
              hint: "Pour un prisme ou une pyramide, compte séparément le nombre de bases et de faces latérales.",
              geoData: { type: 'cuboidProps', solid: target.name, scale: "Structure polyédrique" },
              demo: { exampleQuestion: `Nombre d'arêtes d'un ${target.name}`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const ans = `${target.vertices} sommets`;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${target.edges} sommets`;
              if (i === 2) return `${target.faces} sommets`;
              return `${target.vertices + (i % 2 === 0 ? 3 : -1)} sommets`;
            });
            
            return {
              title: `Squelette de Solide : Sommets du ${target.name}`,
              desc: `Des connecteurs sphériques renforcent les coins (sommets) du module [${target.name}]. Combien de sommets possède ce solide ?`,
              answer: ans,
              hint: `Un sommet est le point de jonction d'au moins trois arêtes. Le ${target.name.toLowerCase()} possède ${target.vertices} sommets.`,
              geoData: { type: 'cuboidProps', solid: target.name, scale: "Structure polyédrique" },
              demo: { exampleQuestion: `Nombre de sommets d'un ${target.name}`, exampleAnswer: ans },
              options
            };
          } else {
            const ans = target.faceType;
            const options = buildUniqueOptions(ans, (i) => {
              const allFaceTypes = [
                "6 carrés",
                "6 rectangles",
                "1 carré et 4 triangles",
                "2 triangles et 3 rectangles",
                "2 pentagones et 5 rectangles"
              ];
              const available = allFaceTypes.filter(f => f !== ans);
              return available[(i - 1) % available.length];
            });
            
            return {
              title: `Composition des Faces : ${target.name}`,
              desc: `De quelles faces polygonales planes est constitué le solide [${target.name}] ?`,
              answer: ans,
              hint: `Analyse les polygones délimitant le solide. Pour un ${target.name.toLowerCase()}, le blindage comprend : ${target.faceType}.`,
              geoData: { type: 'cuboidProps', solid: target.name, scale: "Analyse des faces" },
              demo: { exampleQuestion: `Nature des faces d'un ${target.name}`, exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 3 : APPRENTI (CM1-CM2) — Prismes droits et Pyramides à base n côtés
      {
        rankId: "RANG 3",
        rankTitle: "APPRENTI",
        generate: () => {
          const structType = randomInt(0, 2);
          const n = randomInt(3, 6);
          const polygonNames = { 3: "triangle", 4: "quadrilatère", 5: "pentagone", 6: "hexagone" };
          const baseName = polygonNames[n];
          
          if (structType === 0) {
            const targetProp = randomInt(0, 2);
            let ans = "";
            let questionText = "";
            let formulaExplanation = "";
            
            if (targetProp === 0) {
              const edges = 3 * n;
              ans = `${edges} arêtes`;
              questionText = "son nombre total d'arêtes";
              formulaExplanation = `Un prisme droit à base à ${n} côtés possède 3 × n = 3 × ${n} = ${edges} arêtes.`;
            } else if (targetProp === 1) {
              const faces = n + 2;
              ans = `${faces} faces`;
              questionText = "son nombre total de faces";
              formulaExplanation = `Un prisme droit à base à ${n} côtés possède n + 2 = ${n} + 2 = ${faces} faces.`;
            } else {
              const vertices = 2 * n;
              ans = `${vertices} sommets`;
              questionText = "son nombre total de sommets";
              formulaExplanation = `Un prisme droit à base à ${n} côtés possède 2 × n = 2 × ${n} = ${vertices} sommets.`;
            }
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${3 * n + 2} ${ans.split(' ')[1]}`;
              if (i === 2) return `${2 * n + 1} ${ans.split(' ')[1]}`;
              return `${n + 3} ${ans.split(' ')[1]}`;
            });
            
            return {
              title: "Calculateur de Polyèdres : Prisme Droit",
              desc: `Un prisme droit possède deux bases parallèles ayant la forme d'un ${baseName} (${n} côtés). Calcule ${questionText}.`,
              answer: ans,
              hint: formulaExplanation,
              geoData: { type: 'prismProps', solid: "Prisme", nSides: n, scale: "Polygone à n côtés" },
              demo: { exampleQuestion: `Nombre pour prisme à base (${baseName})`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const targetProp = randomInt(0, 1);
            let ans = "";
            let questionText = "";
            let formulaExplanation = "";
            
            if (targetProp === 0) {
              const edges = 2 * n;
              ans = `${edges} arêtes`;
              questionText = "son nombre total d'arêtes";
              formulaExplanation = `Une pyramide dont la base a ${n} côtés possède 2 × n = 2 × ${n} = ${edges} arêtes.`;
            } else {
              const faces = n + 1;
              ans = `${faces} faces`;
              questionText = "son nombre total de faces (et sommets)";
              formulaExplanation = `Une pyramide dont la base a ${n} côtés possède n + 1 = ${n} + 1 = ${faces} faces.`;
            }
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${3 * n} ${ans.split(' ')[1]}`;
              if (i === 2) return `${n + 2} ${ans.split(' ')[1]}`;
              return `${2 * n + 2} ${ans.split(' ')[1]}`;
            });
            
            return {
              title: "Calculateur de Polyèdres : Pyramide",
              desc: `Une pyramide a pour base un polygone de ${n} côtés (${baseName}). Calcule ${questionText}.`,
              answer: ans,
              hint: formulaExplanation,
              geoData: { type: 'pyramidProps', solid: "Pyramide", nSides: n, scale: "Polygone à n côtés" },
              demo: { exampleQuestion: `Nombre pour pyramide à base (${baseName})`, exampleAnswer: ans },
              options
            };
          } else {
            const edges = 3 * n;
            const ans = `${n} côtés (${baseName})`;
            
            const options = buildUniqueOptions(ans, (i) => {
              const altN = (n + i) % 4 + 3;
              return `${altN} côtés (${polygonNames[altN]})`;
            });
            
            return {
              title: "Inversion de Formule : Base du Prisme",
              desc: `Un prisme droit comporte exactement ${edges} arêtes. Combien de côtés possède son polygone de base ?`,
              answer: ans,
              hint: `Pour un prisme droit, Nombre d'arêtes = 3 × n. Donc n = ${edges} / 3 = ${n} côtés (${baseName}).`,
              geoData: { type: 'prismProps', solid: "Prisme", nSides: n, scale: "Dénombrement inverse" },
              demo: { exampleQuestion: `Côtés de la base si un prisme compte ${edges} arêtes`, exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 4 : CONFIRMÉ (CM2-6ème) — Patrons & Surfaces dépliées 2D
      {
        rankId: "RANG 4",
        rankTitle: "CONFIRMÉ",
        generate: () => {
          const structType = randomInt(0, 2);
          
          if (structType === 0) {
            const edge = randomInt(2, 8);
            const faceArea = edge * edge;
            const totalArea = 6 * faceArea;
            const ans = `${totalArea} cm²`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${4 * faceArea} cm²`;
              if (i === 2) return `${edge * edge * edge} cm²`;
              if (i === 3) return `${6 * edge} cm²`;
              return `${totalArea + i * 12} cm²`;
            });
            
            return {
              title: "Patronage 2D : Surface Dépliée du Cube",
              desc: `Un patron de cube en carton rigide est composé de 6 carrés adjacents d'arête a = ${edge} cm. Quelle est l'aire totale de la feuille nécessaire pour découper ce patron ?`,
              answer: ans,
              hint: `Aire d'un carré de base = a × a = ${edge} × ${edge} = ${faceArea} cm². Aire totale = 6 × ${faceArea} = ${totalArea} cm².`,
              geoData: { type: 'cubeNet', side: edge, scale: "Patron 2D déplié" },
              demo: { exampleQuestion: `Surface d'un patron de cube d'arête ${edge} cm`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const L = randomInt(4, 8);
            const l = randomInt(2, 4);
            const h = randomInt(3, 6);
            
            const areaBase = L * l;
            const areaSide1 = L * h;
            const areaSide2 = l * h;
            const totalArea = 2 * (areaBase + areaSide1 + areaSide2);
            const vol = L * l * h;
            const ans = `${totalArea} cm²`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${vol} cm²`;
              if (i === 2) return `${areaBase + areaSide1 + areaSide2} cm²`;
              if (i === 3) return `${2 * (L * l + L * h)} cm²`;
              return `${totalArea + i * 10} cm²`;
            });
            
            return {
              title: "Patronage 2D : Aire du Pavé Droit",
              desc: `Calcule la surface totale de matériau nécessaire pour fabriquer le patron d'un pavé droit de dimensions L = ${L} cm, l = ${l} cm et h = ${h} cm.`,
              answer: ans,
              hint: `Le patron réunit 3 paires de rectangles identiques. Aire = 2 × (L×l + L×h + l×h) = ${totalArea} cm².`,
              geoData: { type: 'cuboidNet', L, l, h, scale: "Patron 2D déplié" },
              demo: { exampleQuestion: `Surface du patron pour pavé ${L}x${l}x${h} cm`, exampleAnswer: ans },
              options
            };
          } else {
            const edge = randomInt(3, 8);
            const faceArea = edge * edge;
            const totalArea = 6 * faceArea;
            const ans = `${edge} cm`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${faceArea} cm`;
              if (i === 2) return `${Math.round(totalArea / 6)} cm`;
              return `${edge + i} cm`;
            });
            
            return {
              title: "Inversion de Patron : Dimension de l'Arête",
              desc: `La surface totale d'un patron de cube déplié mesure exactement ${totalArea} cm². Quelle est la longueur a de chaque arête de ce cube ?`,
              answer: ans,
              hint: `1) Aire d'une face = Surface totale / 6 = ${totalArea} / 6 = ${faceArea} cm². 2) Arête a = √${faceArea} = ${edge} cm.`,
              geoData: { type: 'cubeNet', side: edge, scale: "Recherche d'arête" },
              demo: { exampleQuestion: `Arête d'un cube dont le patron mesure ${totalArea} cm²`, exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 5 : EXPERT (6ème) — Perspective Cavalière & Volume du Pavé Droit
      {
        rankId: "RANG 5",
        rankTitle: "EXPERT",
        generate: () => {
          const structType = randomInt(0, 2);
          
          if (structType === 0) {
            const L = randomInt(4, 9);
            const l = randomInt(2, 5);
            const h = randomInt(3, 7);
            const volume = L * l * h;
            const areaSurf = 2 * (L * l + L * h + l * h);
            const ans = `${volume} m³`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${areaSurf} m³`;
              if (i === 2) return `${(L + l + h) * 2} m³`;
              if (i === 3) return `${L * l} m³`;
              return `${volume + i * 12} m³`;
            });
            
            return {
              title: "Capacité de Fret : Volume du Pavé Droit",
              desc: `Un conteneur parallélépipédique a pour dimensions : longueur L = ${L} m, largeur l = ${l} m et hauteur h = ${h} m. Calcule son volume V en m³.`,
              answer: ans,
              hint: `Volume du pavé droit V = Longueur × Largeur × Hauteur = ${L} × ${l} × ${h} = ${volume} m³.`,
              geoData: { type: 'cuboidVol', L, l, h, vol: volume, scale: "Unité : m³" },
              demo: { exampleQuestion: `Volume d'un pavé ${L}m x ${l}m x ${h}m`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const L = randomInt(3, 7);
            const l = randomInt(2, 4);
            const h = randomInt(2, 6);
            const baseArea = L * l;
            const volume = baseArea * h;
            const ans = `${h} m`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${baseArea} m`;
              if (i === 2) return `${Math.round(volume / L)} m`;
              return `${h + i} m`;
            });
            
            return {
              title: "Dimension Inconnue : Hauteur du Pavé Droit",
              desc: `Un réservoir parallélépipédique a un volume V = ${volume} m³ et une surface de base B = ${baseArea} m² (avec L = ${L} m, l = ${l} m). Quelle est sa hauteur h ?`,
              answer: ans,
              hint: `Volume V = Base × h ⇒ Hauteur h = Volume / Base = ${volume} / ${baseArea} = ${h} m.`,
              geoData: { type: 'cuboidVol', L, l, h, vol: volume, scale: "Hauteur manquante" },
              demo: { exampleQuestion: `Hauteur h pour V = ${volume} m³ et Base = ${baseArea} m²`, exampleAnswer: ans },
              options
            };
          } else {
            const realDepth = randomInt(2, 6) * 2;
            const k = 0.5;
            const drawnDepth = realDepth * k;
            const ans = `${drawnDepth} cm`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${realDepth} cm`;
              if (i === 2) return `${realDepth * 2} cm`;
              return `${drawnDepth + i} cm`;
            });
            
            return {
              title: "Perspective Cavalière : Fuyantes et Échelle",
              desc: `Sur un schéma en perspective cavalière (coefficient de réduction k = 0,5), une arête fuyante a une profondeur réelle de ${realDepth} cm. Quelle longueur exacte faut-il lui donner sur le tracé 2D ?`,
              answer: ans,
              hint: `En perspective cavalière, la longueur dessinée sur une fuyante = Longueur réelle × k = ${realDepth} × 0,5 = ${drawnDepth} cm.`,
              geoData: { type: 'cavalierRules', solid: "Pavé droit", scale: "Perspective cavalière" },
              demo: { exampleQuestion: `Longueur tracée pour fuyante réelle de ${realDepth} cm (k=0,5)`, exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 6 : CHAMPION (5ème) — Prisme droit & Cylindre : Aire latérale & Volume
      {
        rankId: "RANG 6",
        rankTitle: "CHAMPION",
        generate: () => {
          const structType = randomInt(0, 2);
          const PI = 3.14;
          
          if (structType === 0) {
            const R = randomInt(2, 6);
            const h = randomInt(4, 9);
            const baseArea = Math.round(PI * R * R * 100) / 100;
            const volume = Math.round(baseArea * h * 100) / 100;
            const ans = `${volume} m³`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${Math.round((volume / 3) * 100) / 100} m³`;
              if (i === 2) return `${Math.round(2 * PI * R * h * 100) / 100} m³`;
              return `${Math.round((volume + i * 15) * 100) / 100} m³`;
            });
            
            return {
              title: "Réservoir de Carburant : Volume du Cylindre",
              desc: `Un réservoir cylindrique a un rayon de base R = ${R} m et une hauteur h = ${h} m. En prenant π ≈ 3,14, calcule son volume V en m³.`,
              answer: ans,
              hint: `1) Aire de la base B = π × R² = 3,14 × ${R * R} = ${baseArea} m². 2) Volume V = B × h = ${baseArea} × ${h} = ${volume} m³.`,
              geoData: { type: 'cylinderVol', R, h, B: baseArea, vol: volume, scale: "Formule V = B x h" },
              demo: { exampleQuestion: `Volume d'un cylindre R = ${R}m, h = ${h}m`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const pBase = randomInt(10, 24);
            const h = randomInt(5, 12);
            const latArea = pBase * h;
            const ans = `${latArea} cm²`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${pBase + h} cm²`;
              if (i === 2) return `${Math.round(latArea / 2)} cm²`;
              return `${latArea + i * 12} cm²`;
            });
            
            return {
              title: "Blindage Latéral : Prisme Droit",
              desc: `Un prisme droit a un périmètre de base P = ${pBase} cm et une hauteur h = ${h} cm. Calcule la surface totale de son aire latérale.`,
              answer: ans,
              hint: `Aire latérale A = Périmètre de la base × Hauteur = P × h = ${pBase} × ${h} = ${latArea} cm².`,
              geoData: { type: 'prismArea', pBase, h, latArea, scale: "Formule A_lat = P x h" },
              demo: { exampleQuestion: `Aire latérale pour P = ${pBase} cm et h = ${h} cm`, exampleAnswer: ans },
              options
            };
          } else {
            const R = randomInt(2, 5);
            const h = randomInt(3, 7);
            const baseArea = Math.round(PI * R * R * 100) / 100;
            const volume = Math.round(baseArea * h * 100) / 100;
            const ans = `${h} m`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${baseArea} m`;
              if (i === 2) return `${h * 3} m`;
              return `${h + i} m`;
            });
            
            return {
              title: "Calibration de Cuve : Hauteur du Cylindre",
              desc: `Une cuve cylindrique de volume V = ${volume} m³ possède une surface de base B = ${baseArea} m² (rayon R = ${R} m). Calcule sa hauteur h.`,
              answer: ans,
              hint: `Volume V = B × h ⇒ Hauteur h = V / B = ${volume} / ${baseArea} = ${h} m.`,
              geoData: { type: 'cylinderVol', R, h, B: baseArea, vol: volume, scale: "Calcul de h" },
              demo: { exampleQuestion: `Hauteur h si V = ${volume} m³ et Base = ${baseArea} m²`, exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 7 : LÉGENDAIRE (4ème) — Pyramide & Cône de Révolution (Volume 1/3)
      {
        rankId: "RANG 7",
        rankTitle: "LÉGENDAIRE",
        generate: () => {
          const structType = randomInt(0, 2);
          const PI = 3.14;
          
          if (structType === 0) {
            const baseSide = randomInt(3, 6);
            const baseArea = baseSide * baseSide;
            const h = randomInt(2, 5) * 3;
            const volume = Math.round((1 / 3) * baseArea * h);
            const fullCylinderVol = baseArea * h;
            const ans = `${volume} m³`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${fullCylinderVol} m³`;
              if (i === 2) return `${Math.round(fullCylinderVol / 2)} m³`;
              return `${volume + i * 8} m³`;
            });
            
            return {
              title: "Espace Conique & Pyramidal : Volume Pyramide",
              desc: `Une superstructure pyramidale à base carrée a une surface de base B = ${baseArea} m² (côté = ${baseSide} m) et une hauteur h = ${h} m. Calcule son volume V en m³.`,
              answer: ans,
              hint: `Volume d'une pyramide V = (1/3) × Base × Hauteur = (1/3) × ${baseArea} × ${h} = ${volume} m³.`,
              geoData: { type: 'pyramidVol', B: baseArea, h, vol: volume, scale: "Formule V = 1/3 B h" },
              demo: { exampleQuestion: `Volume pyramide pour Base = ${baseArea} m² et h = ${h} m`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const R = randomInt(3, 6);
            const h = randomInt(2, 5) * 3;
            const baseArea = Math.round(PI * R * R * 100) / 100;
            const volumeCone = Math.round((1 / 3) * baseArea * h * 100) / 100;
            const volumeCyl = Math.round(baseArea * h * 100) / 100;
            const ans = `${volumeCone} m³`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${volumeCyl} m³`;
              if (i === 2) return `${Math.round((volumeCone * 2) * 100) / 100} m³`;
              return `${Math.round((volumeCone + i * 10) * 100) / 100} m³`;
            });
            
            return {
              title: "Tuyère de Propulsion : Volume du Cône",
              desc: `Un réservoir conique de tuyère possède un rayon de base R = ${R} m et une hauteur h = ${h} m. En prenant π ≈ 3,14, calcule son volume V.`,
              answer: ans,
              hint: `1) Aire de base B = π × R² = 3,14 × ${R * R} = ${baseArea} m². 2) Volume conique V = (1/3) × B × h = ${volumeCone} m³.`,
              geoData: { type: 'coneVol', R, h, vol: volumeCone, scale: "Formule V = 1/3 π R² h" },
              demo: { exampleQuestion: `Volume cône R = ${R} m, h = ${h} m`, exampleAnswer: ans },
              options
            };
          } else {
            const ans = "Le volume du cylindre est 3 fois plus grand";
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return "Le volume du cône est 3 fois plus grand";
              if (i === 2) return "Les deux volumes sont rigoureusement égaux";
              return "Le volume du cylindre est 2 fois plus grand";
            });
            
            return {
              title: "Analyse Comparative : Cylindre vs Cône",
              desc: "Un cylindre et un cône de révolution possèdent exactement le même rayon de base R et la même hauteur h. Quelle relation lie leurs volumes ?",
              answer: ans,
              hint: "Le volume du cône vaut V_cône = (1/3) × V_cylindre. Par conséquent, le volume du cylindre est exactement 3 fois supérieur à celui du cône.",
              geoData: { type: 'coneVol', R: 5, h: 9, vol: 0, scale: "Rapport de volume 1:3" },
              demo: { exampleQuestion: "Rapport de volume entre cylindre et cône de même base et hauteur", exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 8 : HACKER PGM (3ème) — Sphère & Boule / Sections / Homothétie k³
      {
        rankId: "RANG 8",
        rankTitle: "HACKER PGM",
        generate: () => {
          const structType = randomInt(0, 2);
          const PI = 3.14;
          
          if (structType === 0) {
            const isSphereArea = Math.random() < 0.5;
            const R = randomInt(2, 6);
            
            if (isSphereArea) {
              const area = Math.round(4 * PI * R * R * 100) / 100;
              const volumeBall = Math.round((4 / 3) * PI * R * R * R * 100) / 100;
              const ans = `${area} km²`;
              
              const options = buildUniqueOptions(ans, (i) => {
                if (i === 1) return `${volumeBall} km²`;
                if (i === 2) return `${Math.round(PI * R * R * 100) / 100} km²`;
                return `${Math.round((area + i * 25) * 100) / 100} km²`;
              });
              
              return {
                title: "Station Orbitale : Surface de la Sphère",
                desc: `Une coque externe sphérique a un rayon R = ${R} km. Calcule son aire totale A (surface externe) avec π ≈ 3,14.`,
                answer: ans,
                hint: `Aire de la sphère A = 4 × π × R² = 4 × 3,14 × ${R * R} = ${area} km².`,
                geoData: { type: 'sphereVsBall', R, area, scale: "Sphère : Surface A = 4πR²" },
                demo: { exampleQuestion: `Aire de la sphère R = ${R} km`, exampleAnswer: ans },
                options
              };
            } else {
              const volumeBall = Math.round((4 / 3) * PI * R * R * R * 100) / 100;
              const areaSphere = Math.round(4 * PI * R * R * 100) / 100;
              const ans = `${volumeBall} km³`;
              
              const options = buildUniqueOptions(ans, (i) => {
                if (i === 1) return `${areaSphere} km³`;
                if (i === 2) return `${Math.round((2 / 3) * PI * R * R * R * 100) / 100} km³`;
                return `${Math.round((volumeBall + i * 30) * 100) / 100} km³`;
              });
              
              return {
                title: "Astéroïde Plein : Volume de la Boule",
                desc: `Un noyau d'astéroïde massif (boule pleine) a un rayon R = ${R} km. Calcule son volume total V en km³ (π ≈ 3,14).`,
                answer: ans,
                hint: `Volume de la boule V = (4/3) × π × R³ = (4/3) × 3,14 × ${R * R * R} = ${volumeBall} km³.`,
                geoData: { type: 'sphereVsBall', R, vol: volumeBall, scale: "Boule : Volume V = 4/3πR³" },
                demo: { exampleQuestion: `Volume de la boule R = ${R} km`, exampleAnswer: ans },
                options
              };
            }
          } else if (structType === 1) {
            const triplet = Math.random() < 0.5 
            ? { R: 5, d: 3, r: 4 } 
            : { R: 10, d: 6, r: 8 };
            const ans = `${triplet.r} cm`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${triplet.R - triplet.d} cm`;
              if (i === 2) return `${triplet.R} cm`;
              return `${triplet.r + i} cm`;
            });
            
            return {
              title: "Section Plane : Rayon du Cercle de Section",
              desc: `Une sphère de rayon R = ${triplet.R} cm est coupée par un plan situé à une distance d = ${triplet.d} cm de son centre O. Calcule le rayon r du cercle de section obtenu.`,
              answer: ans,
              hint: `Par le théorème de Pythagore : r = √(R² - d²) = √(${triplet.R * triplet.R - triplet.d * triplet.d}) = ${triplet.r} cm.`,
              geoData: { type: 'circleRadius', r: triplet.r, d: triplet.R, showMode: 'radius', scale: "Section r = √(R²-d²)" },
              demo: { exampleQuestion: `Rayon r si R = ${triplet.R} cm et distance d = ${triplet.d} cm`, exampleAnswer: ans },
              options
            };
          } else {
            const k = randomInt(2, 4);
            const initialVol = randomInt(3, 7);
            const finalVol = initialVol * Math.pow(k, 3);
            const ans = `${finalVol} m³`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${initialVol * k} m³`;
              if (i === 2) return `${initialVol * k * k} m³`;
              return `${finalVol + i * 20} m³`;
            });
            
            return {
              title: "Agrandissement 3D : Facteur de Échelle k³",
              desc: `Un réservoir cubique de volume V = ${initialVol} m³ subit un agrandissement à l'échelle k = ${k}. Quel est le volume V' du nouveau réservoir agrandi ?`,
              answer: ans,
              hint: `Lors d'un agrandissement de rapport k, les volumes sont multipliés par k³ : V' = V × k³ = ${initialVol} × ${Math.pow(k, 3)} = ${finalVol} m³.`,
              geoData: { type: 'tacticalZoom', mode: 'volume', k, origValue: initialVol, newValue: finalVol, scale: `Facteur k = ${k}` },
              demo: { exampleQuestion: `Volume agrandi pour V = ${initialVol} m³ avec k = ${k}`, exampleAnswer: ans },
              options
            };
          }
        }
      }
    ]
  },
  
  // ------------------------------------------------------------------------
  // MONDE 6 : VECTOR SCOPE & THEOREMES
  // ------------------------------------------------------------------------
  6: {
    name: "Monde 6 : Vector Scope & Théorèmes",
    icon: "🚀",
    ranks: [
      // RANG 1 : NOOB (CE1/CE2) — Déplacements sur Quadrillage & Repérage
      {
        rankId: "RANG 1",
        rankTitle: "NOOB",
        generate: () => {
          const cols = ["A", "B", "C", "D", "E"];
          const structType = randomInt(0, 2);
          
          if (structType === 0) {
            const stepE = randomInt(1, 2);
            const stepN = randomInt(1, 2);
            const startCIdx = randomInt(0, 4 - stepE);
            const startRNum = randomInt(1, 5 - stepN);
            
            const endCIdx = startCIdx + stepE;
            const endRNum = startRNum + stepN;
            
            const startPos = `${cols[startCIdx]},${startRNum}`;
            const ans = `${cols[endCIdx]},${endRNum}`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return startPos;
              if (i === 2) return `${cols[Math.min(4, startCIdx + stepN)]},${startRNum + stepE}`;
              if (i === 3) return `${cols[endCIdx]},${startRNum}`;
              return `${cols[(endCIdx + i) % 5]},${((endRNum + i) % 5) + 1}`;
            });
            
            return {
              title: "Déplacement Cardinal : Recherche de Destination",
              desc: `Une unité tactique part de la case (${startPos}). Elle avance de ${stepE} case(s) vers l'Est puis de ${stepN} case(s) vers le Nord. Quelle est sa case d'arrivée ?`,
              answer: ans,
              hint: "Vers l'Est : décale les lettres vers la droite. Vers le Nord : augmente les numéros de ligne vers le haut.",
              geoData: { type: 'cardinalPath', col: cols[endCIdx], row: endRNum, startCol: cols[startCIdx], startRow: startRNum, endCol: cols[endCIdx], endRow: endRNum, gridSize: 5, scaleRatio: 10, scale: "1 cm = 10 m" },
              demo: { exampleQuestion: `Déplacement depuis (${startPos}) + ${stepE}E, ${stepN}N`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const stepE = randomInt(1, 2);
            const stepN = randomInt(1, 2);
            const startCIdx = randomInt(0, 4 - stepE);
            const startRNum = randomInt(1, 5 - stepN);
            
            const endCIdx = startCIdx + stepE;
            const endRNum = startRNum + stepN;
            
            const endPos = `${cols[endCIdx]},${endRNum}`;
            const ans = `${cols[startCIdx]},${startRNum}`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return endPos;
              if (i === 2) return `${cols[Math.min(4, endCIdx + stepE)]},${Math.min(5, endRNum + stepN)}`;
              if (i === 3) return `${cols[startCIdx]},${endRNum}`;
              return `${cols[(startCIdx + i) % 5]},${((startRNum + i) % 5) + 1}`;
            });
            
            return {
              title: "Inversion de Trajet : Recherche du Départ",
              desc: `Un drone atterrit sur la case (${endPos}) après avoir effectué ${stepE} case(s) vers l'Est et ${stepN} case(s) vers le Nord. Quelle était sa case d'origine ?`,
              answer: ans,
              hint: "Pour retrouver la case de départ, effectue le trajet inverse : recule vers l'Ouest et régresses vers le Sud.",
              geoData: { type: 'cardinalPath', col: cols[endCIdx], row: endRNum, startCol: cols[startCIdx], startRow: startRNum, endCol: cols[endCIdx], endRow: endRNum, gridSize: 5, scaleRatio: 10, scale: "1 cm = 10 m" },
              demo: { exampleQuestion: `Origine du drone arrivé en (${endPos})`, exampleAnswer: ans },
              options
            };
          } else {
            const stepE = randomInt(1, 3);
            const stepN = randomInt(1, 3);
            const scaleM = randomPick([10, 20, 25, 50]);
            const totalCases = stepE + stepN;
            const totalMeters = totalCases * scaleM;
            const ans = `${totalMeters} m`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${stepE * stepN * scaleM} m`;
              if (i === 2) return `${totalCases} m`;
              if (i === 3) return `${stepE * scaleM} m`;
              return `${(totalCases + i) * scaleM} m`;
            });
            
            return {
              title: "Calcul de Distance à l'Échelle",
              desc: `Un rover franchit ${stepE} case(s) vers l'Est puis ${stepN} case(s) vers le Nord. Si 1 case = ${scaleM} m sur le terrain, quelle distance totale en mètres a-t-il parcourue ?`,
              answer: ans,
              hint: `Distance = (Nombre total de cases) × Échelle = (${stepE} + ${stepN}) × ${scaleM} m = ${totalMeters} m.`,
              geoData: { type: 'cardinalPath', col: 'D', row: 4, startCol: 'A', startRow: 1, endCol: 'D', endRow: 4, gridSize: 5, scaleRatio: scaleM, scale: `1 case = ${scaleM} m` },
              demo: { exampleQuestion: `Distance pour ${stepE}E + ${stepN}N à ${scaleM}m/case`, exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 2 : NOVICE (CE2/CM1) — Symétrie Axiale & Quadrillage
      {
        rankId: "RANG 2",
        rankTitle: "NOVICE",
        generate: () => {
          const structType = randomInt(0, 2);
          const dist = randomInt(2, 6);
          
          if (structType === 0) {
            const ans = `${dist} carreaux`;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${dist * 2} carreaux`;
              if (i === 2) return `${Math.max(1, Math.floor(dist / 2))} carreaux`;
              if (i === 3) return `${dist + 2} carreaux`;
              return `${dist + i} carreaux`;
            });
            
            return {
              title: "Égalité de Distance à l'Axe de Symétrie",
              desc: `Un point A est situé à ${dist} carreaux à gauche d'un axe de symétrie vertical. À quelle distance exacte à droite de l'axe se situe son point symétrique A' ?`,
              answer: ans,
              hint: "Par symétrie axiale sur quadrillage, le point symétrique se situe à la même distance de l'axe, du côté opposé.",
              geoData: { type: 'axialGrid', distA: dist, xOrig: -dist, hideTarget: false, scaleRatio: 10, scale: "1 cm = 10 m" },
              demo: { exampleQuestion: `Distance à l'axe de A' si A est à ${dist} carreaux`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const ans = "Elles se superposent exactement";
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return "Elles se croisent à un angle droit de 90°";
              if (i === 2) return "L'image devient deux fois plus grande";
              if (i === 3) return "Elles glissent de 5 carreaux vers le bas";
              return "Elles s'annulent sur la grille";
            });
            
            return {
              title: "Propriété du Pliage le Long de l'Axe",
              desc: "Si l'on plie une feuille quadrillée exactement le long de son axe de symétrie, que se passe-t-il pour la figure originale et son image ?",
              answer: ans,
              hint: "Deux figures symétriques par rapport à une droite se superposent parfaitement par pliage le long de cet axe.",
              geoData: { type: 'axialGrid', distA: dist, xOrig: -dist, hideTarget: false, scaleRatio: 10, scale: "Pliage axiale" },
              demo: { exampleQuestion: "Effet du pliage le long de l'axe de symétrie", exampleAnswer: ans },
              options
            };
          } else {
            const totalDist = dist * 2;
            const ans = `${totalDist} carreaux`;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${dist} carreaux`;
              if (i === 2) return `${dist + 1} carreaux`;
              if (i === 3) return `${totalDist + 2} carreaux`;
              return `${totalDist + i * 2} carreaux`;
            });
            
            return {
              title: "Distance Entre un Point et son Symétrique",
              desc: `Un point A se trouve à ${dist} carreaux d'un axe vertical de symétrie. Quelle est la distance totale en carreaux entre le point A et son image A' ?`,
              answer: ans,
              hint: `Distance AA' = 2 × (distance à l'axe) = 2 × ${dist} = ${totalDist} carreaux.`,
              geoData: { type: 'axialGrid', distA: dist, xOrig: -dist, hideTarget: false, scaleRatio: 10, scale: "1 cm = 10 m" },
              demo: { exampleQuestion: `Distance totale AA' pour A à ${dist} carreaux de l'axe`, exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 3 : APPRENTI (CM1) — Droites Parallèles & Perpendiculaires
      {
        rankId: "RANG 3",
        rankTitle: "APPRENTI",
        generate: () => {
          const structType = randomInt(0, 2);
          const lineSets = [
            { d1: "(d1)", d2: "(d2)", d3: "(d3)" },
            { d1: "(L1)", d2: "(L2)", d3: "(L3)" },
            { d1: "(Δ1)", d2: "(Δ2)", d3: "(Δ3)" },
            { d1: "(D1)", d2: "(D2)", d3: "(D3)" }
          ];
          const { d1, d2, d3 } = randomPick(lineSets);
          
          if (structType === 0) {
            const ans = `${d1} et ${d2} sont parallèles`;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${d1} et ${d2} sont perpendiculaires`;
              if (i === 2) return `${d1} et ${d2} sont sécantes à 45°`;
              if (i === 3) return `${d1} et ${d2} sont confondues`;
              return `${d1} et ${d2} sont obliques`;
            });
            
            return {
              title: "Règle des Droites Perpendiculaires à une Même Droite",
              desc: `Si deux rails rectilignes ${d1} et ${d2} coupent tous deux la ligne de fond ${d3} à angle droit (${d1} ⊥ ${d3} et ${d2} ⊥ ${d3}), comment sont situées les voies ${d1} et ${d2} l'une par rapport à l'autre ?`,              answer: ans,
              hint: "Propriété : Si deux droites sont perpendiculaires à une même troisième, alors elles sont parallèles entre elles.",
              geoData: { type: 'parallelPerpTheorem', d1, d2, d3, theoremType: 'perpToSame', scaleRatio: 10, scale: "1 cm = 10 m" },
              demo: { exampleQuestion: `Relation entre ${d1} et ${d2} si toutes deux ⊥ à ${d3}`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const ans = `${d1} est perpendiculaire à ${d3}`;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${d1} est parallèle à ${d3}`;
              if (i === 2) return `${d1} et ${d3} ne se coupent jamais`;
              if (i === 3) return `${d1} est oblique par rapport à ${d3}`;
              return `${d1} est confondue avec ${d3}`;
            });
            
            return {
              title: "Théorème : Parallèle et Perpendiculaire",
              desc: `On sait que la droite ${d1} est parallèle à ${d2} (${d1} // ${d2}) et que ${d2} est perpendiculaire à ${d3} (${d2} ⊥ ${d3}). Quelle est la relation géométrique entre ${d1} et ${d3} ?`,
              answer: ans,
              hint: "Propriété : Si deux droites sont parallèles, toute droite perpendiculaire à l'une est aussi perpendiculaire à l'autre.",
              geoData: { type: 'parallelPerpTheorem', d1, d2, d3, theoremType: 'parallelAndPerp', scaleRatio: 10, scale: "1 cm = 10 m" },
              demo: { exampleQuestion: `Relation entre ${d1} et ${d3} si ${d1}//${d2} et ${d2}⊥${d3}`, exampleAnswer: ans },
              options
            };
          } else {
            const ans = `${d1} et ${d2} sont parallèles`;
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${d1} et ${d2} sont perpendiculaires`;
              if (i === 2) return `${d1} et ${d2} se coupent à 90°`;
              if (i === 3) return `${d1} et ${d2} sont obliques`;
              return `${d1} et ${d2} n'appartiennent pas au même plan`;
            });
            
            return {
              title: "Théorème : Transitivité du Parallélisme",
              desc: `Si la droite ${d1} est parallèle à ${d3} (${d1} // ${d3}) et que la droite ${d2} est également parallèle à ${d3} (${d2} // ${d3}), que peut-on déduire pour ${d1} et ${d2} ?`,
              answer: ans,
              hint: "Propriété : Si deux droites sont parallèles à une même troisième, alors elles sont parallèles entre elles.",
              geoData: { type: 'parallelPerpTheorem', d1, d2, d3, theoremType: 'perpToSame', scaleRatio: 10, scale: "1 cm = 10 m" },
              demo: { exampleQuestion: `Relation entre ${d1} et ${d2} si toutes deux // à ${d3}`, exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 4 : CONFIRMÉ (CM2) — Quadrilatères Particuliers & Diagonales
      {
        rankId: "RANG 4",
        rankTitle: "CONFIRMÉ",
        generate: () => {
          const structType = randomInt(0, 2);
          
          if (structType === 0) {
            const quadConfigs = [
              { name: "Losange", props: "4 côtés de même longueur et des côtés opposés parallèles deux à deux" },
              { name: "Rectangle", props: "4 angles droits et des côtés opposés égaux deux à deux" },
              { name: "Carré", props: "4 côtés de même longueur et 4 angles droits" },
              { name: "Parallélogramme", props: "des côtés opposés parallèles deux à deux sans imposer d'angles droits" }
            ];
            const target = randomPick(quadConfigs);
            const ans = target.name;
            
            const options = buildUniqueOptions(ans, (i) => {
              const remaining = ["Losange", "Rectangle", "Carré", "Parallélogramme", "Trapèze"].filter(n => n !== ans);
              return remaining[i % remaining.length];
            });
            
            return {
              title: "Identification de Quadrilatère Particulier",
              desc: `Un quadrilatère possède ${target.props}. De quel quadrilatère s'agit-il ?`,
              answer: ans,
              hint: `Définition : Le quadrilatère caractérisé par ${target.props} est le ${ans.toLowerCase()}.`,
              geoData: { type: 'quadProps', shape: target.name, scaleRatio: 10, scale: "Analyse CM2" },
              demo: { exampleQuestion: `Quadrilatère ayant ${target.props}`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const diagConfigs = [
              { name: "Carré", props: "se coupent en leur milieu, sont de même longueur et sont perpendiculaires" },
              { name: "Losange", props: "se coupent en leur milieu et sont perpendiculaires sans être de même longueur" },
              { name: "Rectangle", props: "se coupent en leur milieu et sont de même longueur sans être perpendiculaires" },
              { name: "Parallélogramme", props: "se coupent en leur milieu sans être ni perpendiculaires ni de même longueur" }
            ];
            const target = randomPick(diagConfigs);
            const ans = target.name;
            
            const options = buildUniqueOptions(ans, (i) => {
              const remaining = ["Carré", "Losange", "Rectangle", "Parallélogramme"].filter(n => n !== ans);
              return remaining[i % remaining.length];
            });
            
            return {
              title: "Propriété des Diagonales de Quadrilatères",
              desc: `Les diagonales d'un quadrilatère ${target.props}. Quelle est sa nature géométrique exacte ?`,
              answer: ans,
              hint: "Propriétés des diagonales : Carré (milieu, égales, ⊥) | Losange (milieu, ⊥) | Rectangle (milieu, égales) | Parallélogramme (milieu).",
              geoData: { type: 'quadProps', shape: target.name, scaleRatio: 10, scale: "Diagonales" },
              demo: { exampleQuestion: `Quadrilatère dont les diagonales ${target.props}`, exampleAnswer: ans },
              options
            };
          } else {
            const isSquare = Math.random() < 0.5;
            if (isSquare) {
              const side = randomInt(4, 15);
              const perim = 4 * side;
              const ans = `${side} cm`;
              
              const options = buildUniqueOptions(ans, (i) => {
                if (i === 1) return `${perim} cm`;
                if (i === 2) return `${side * side} cm`;
                if (i === 3) return `${Math.round(perim / 2)} cm`;
                return `${side + i} cm`;
              });
              
              return {
                title: "Calcul de Côté à Partir du Périmètre",
                desc: `Un carré a un périmètre total de P = ${perim} cm. Quelle est la longueur d'un de ses côtés ?`,
                answer: ans,
                hint: `Périmètre du carré P = 4 × côté ⇒ Côté = P / 4 = ${perim} / 4 = ${side} cm.`,
                geoData: { type: 'quadProps', shape: "Carré", scaleRatio: 10, scale: "Calcul de côté" },
                demo: { exampleQuestion: `Côté d'un carré de périmètre P = ${perim} cm`, exampleAnswer: ans },
                options
              };
            } else {
              const L = randomInt(6, 15);
              const l = randomInt(2, L - 1);
              const perim = 2 * (L + l);
              const ans = `${l} cm`;
              
              const options = buildUniqueOptions(ans, (i) => {
                if (i === 1) return `${L + l} cm`;
                if (i === 2) return `${L} cm`;
                if (i === 3) return `${L * l} cm`;
                return `${l + i} cm`;
              });
              
              return {
                title: "Dimension Manquante du Rectangle",
                desc: `Un rectangle a un périmètre de P = ${perim} cm et une longueur L = ${L} cm. Quelle est sa largeur l ?`,
                answer: ans,
                hint: `Demi-périmètre (L + l) = P / 2 = ${perim / 2} cm. Donc Largeur l = ${perim / 2} - ${L} = ${l} cm.`,
                geoData: { type: 'quadProps', shape: "Rectangle", scaleRatio: 10, scale: "Calcul de largeur" },
                demo: { exampleQuestion: `Largeur l pour P = ${perim} cm et L = ${L} cm`, exampleAnswer: ans },
                options
              };
            }
          }
        }
      },
      
      // RANG 5 : EXPERT (6ème) — Symétrie Axiale, Isométrie & Médiatrice
      {
        rankId: "RANG 5",
        rankTitle: "EXPERT",
        generate: () => {
          const structType = randomInt(0, 2);
          
          if (structType === 0) {
            const len = randomInt(8, 35);
            const ans = `${len} cm`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${len * 2} cm`;
              if (i === 2) return `${Math.max(1, Math.floor(len / 2))} cm`;
              if (i === 3) return `${len + 5} cm`;
              return `${len + i} cm`;
            });
            
            return {
              title: "Symétrie Axiale & Isométrie (Conservation)",
              desc: `Un segment [AB] mesure AB = ${len} cm. Quelle est la longueur de son segment image [A'B'] par une symétrie axiale par rapport à une droite (d) ?`,
              answer: ans,
              hint: "Propriété : La symétrie axiale conserve les distances (A'B' = AB). La figure image est superposable à la figure initiale.",
              geoData: { type: 'symmetryProperties', shapeName: 'segment', length: len, hideTarget: false, scaleRatio: 10, scale: "1 cm = 10 m" },
              demo: { exampleQuestion: `Longueur de [A'B'] par symétrie axiale si AB = ${len} cm`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const ans = "MA = MB (M est à égale distance de A et B)";
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return "MA + MB = AB²";
              if (i === 2) return "MA = 2 × MB";
              if (i === 3) return "MA = MB / 2";
              return "MA et MB sont perpendiculaires";
            });
            
            return {
              title: "Caractérisation de la Médiatrice par l'Équidistance",
              desc: "Si un point M appartient à la médiatrice d'un segment [AB], quelle relation vérifient les distances MA et MB ?",
              answer: ans,
              hint: "Propriété : La médiatrice d'un segment [AB] est l'ensemble de tous les points du plan situés à égale distance des extrémités A et B (MA = MB).",
              geoData: { type: 'mediatrixDist', hideTarget: false, scaleRatio: 10, scale: "Équidistance" },
              demo: { exampleQuestion: "Relation entre MA et MB si M est sur la médiatrice de [AB]", exampleAnswer: ans },
              options
            };
          } else {
            const ans = "La droite perpendiculaire à [AB] passant par son milieu";
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return "La demi-droite qui partage un angle en deux angles égaux";
              if (i === 2) return "La droite passant par un sommet et perpendiculaire au côté opposé";
              if (i === 3) return "La droite passant par un sommet et le milieu du côté opposé";
              return "Une droite parallèle à [AB] située à 5 cm";
            });
            
            return {
              title: "Définition Géométrique de la Médiatrice",
              desc: "Quelle est la définition géométrique exacte de la médiatrice d'un segment [AB] ?",
              answer: ans,
              hint: "Définition : La médiatrice d'un segment [AB] est la droite perpendiculaire au segment [AB] qui passe par son milieu.",
              geoData: { type: 'mediatrixDist', hideTarget: false, scaleRatio: 10, scale: "Définition" },
              demo: { exampleQuestion: "Définition de la médiatrice d'un segment [AB]", exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 6 : CHAMPION (5ème) — Symétrie Centrale & Orientation
      {
        rankId: "RANG 6",
        rankTitle: "CHAMPION",
        generate: () => {
          const structType = randomInt(0, 2);
          
          if (structType === 0) {
            const x = randomPick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]);
            const y = randomPick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]);
            const symX = -x;
            const symY = -y;
            const ans = `${symX},${symY}`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${symX},${y}`;
              if (i === 2) return `${x},${symY}`;
              if (i === 3) return `${y},${x}`;
              return `${symX + i},${symY}`;
            });
            
            return {
              title: "Symétrie Centrale : Coordonnées de l'Image",
              desc: `Un point M a pour coordonnées (${x},${y}) dans un repère centré en O(0,0). Quelles sont les coordonnées de son image M' par la symétrie centrale de centre O ?`,
              answer: ans,
              hint: "Propriété : L'image d'un point M(x,y) par la symétrie centrale de centre O(0,0) est le point M'(-x,-y).",
              geoData: { type: 'centralSymDirect', orig: [x, y], sym: [symX, symY], xOrig: x, yOrig: y, P: [0, 0], hideTarget: false, scaleRatio: 10, scale: "1 cm = 10 m" },
              demo: { exampleQuestion: `Coordonnées de M' pour M(${x},${y}) par symétrie de centre O`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const ans = "(d') est strictement parallèle à (d)";
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return "(d') est perpendiculaire à (d)";
              if (i === 2) return "(d') coupe (d) au point O à un angle de 45°";
              if (i === 3) return "(d') est confondue avec (d)";
              return "(d') est oblique sans être parallèle";
            });
            
            return {
              title: "Image d'une Droite par Symétrie Centrale",
              desc: "Quelle est la position relative de la droite image (d') obtenue par la symétrie centrale de centre O d'une droite (d) ne passant pas par O ?",
              answer: ans,
              hint: "Propriété : L'image d'une droite (d) par une symétrie centrale de centre O est une droite (d') qui lui est strictement parallèle ((d) // (d')).",
              geoData: { type: 'centralSymParallel', range: 100, hideTarget: false, scaleRatio: 10, scale: "1 cm = 10 m" },
              demo: { exampleQuestion: "Position relative d'une droite (d) et de son image (d') par symétrie centrale", exampleAnswer: ans },
              options
            };
          } else {
            const ans = "L'orientation est conservée (demi-tour de 180°)";
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return "L'orientation est inversée (effet miroir)";
              if (i === 2) return "L'orientation pivote obligatoirement de 90°";
              if (i === 3) return "L'aire est divisée par deux";
              return "Les longueurs sont multipliées par -1";
            });
            
            return {
              title: "Symétrie Centrale & Orientation de la Figure",
              desc: "Contrairement à la symétrie axiale (effet miroir), comment évolue l'orientation (sens de parcours des sommets) d'une figure après une symétrie centrale ?",
              answer: ans,
              hint: "La symétrie centrale correspond à une rotation de 180° dans le plan : elle conserve l'orientation de la figure.",
              geoData: { type: 'centralSymDirect', orig: [3, 4], xOrig: 3, yOrig: 4, hideTarget: false },
              demo: { exampleQuestion: "Évolution de l'orientation par symétrie centrale", exampleAnswer: ans },
              options
            };
          }
        }
      },
      
      // RANG 7 : LÉGENDAIRE (4ème) — Translation, Rotation & Pythagore
      {
        rankId: "RANG 7",
        rankTitle: "LÉGENDAIRE",
        generate: () => {
          const structType = randomInt(0, 2);
          
          if (structType === 0) {
            const stepX = randomPick([2, 3, 4, 5]);
            const stepY = randomPick([1, 2, 3, 4]);
            const startX = randomPick([1, 2, 3]);
            const startY = randomPick([1, 2, 3]);
            const endX = startX + stepX;
            const endY = startY + stepY;
            const ans = `${endX},${endY}`;
            
            const options = buildUniqueOptions(ans, (i) => {
              if (i === 1) return `${startX - stepX},${startY - stepY}`;
              if (i === 2) return `${endX},${startY}`;
              if (i === 3) return `${startX},${endY}`;
              return `${endX + i},${endY}`;
            });
            
            return {
              title: "Translation : Glissement de Point dans le Plan",
              desc: `Un point A(${startX},${startY}) subit un glissement par translation de ${stepX} unités vers la droite (Est) et ${stepY} unités vers le haut (Nord). Quelles sont les coordonnées du point image B ?`,
              answer: ans,
              hint: "Dans une translation, les coordonnées de l'image s'obtiennent en ajoutant le déplacement horizontal à x et le déplacement vertical à y : B(x + dx, y + dy).",
              geoData: { type: 'vectorTranslation', startX, startY, vecX: stepX, vecY: stepY, scaleRatio: 10, scale: "1 cm = 10 m" },
              demo: { exampleQuestion: `Position B pour A(${startX},${startY}) + glissement (${stepX},${stepY})`, exampleAnswer: ans },
              options
            };
          } else if (structType === 1) {
            const rotConfigs = [
              { angle: 90, sense: "horaire", start: "Nord", end: "Est" },
              { angle: 90, sense: "anti-horaire", start: "Nord", end: "Ouest" },
              { angle: 180, sense: "horaire", start: "Nord", end: "Sud" },
              { angle: 90, sense: "horaire", start: "Ouest", end: "Nord" },
              { angle: 90, sense: "anti-horaire", start: "Est", end: "Nord" }
            ];
            const rot = randomPick(rotConfigs);
            const ans = rot.end;
            
            const options = buildUniqueOptions(ans, (i) => {
              const dirs = ["Nord", "Sud", "Est", "Ouest"].filter(d => d !== ans);
              return dirs[i % dirs.length];
            });
            
            return {
              title: "Rotation Autour d'un Centre O",
              desc: `Une tourelle laser orientée vers le ${rot.start} effectue une rotation de centre O d'un angle de ${rot.angle}° dans le sens ${rot.sense}. Quelle est sa nouvelle orientation ?`,
              answer: ans,
              hint: `Une rotation de ${rot.angle}° (${rot.sense}) depuis le ${rot.start} réoriente la visée vers le ${rot.end}.`,
              geoData: { type: 'turretRotation', startDir: rot.start, endDir: rot.end, rotAngle: rot.angle, sense: rot.sense, scaleRatio: 10, scale: `Angle ${rot.angle}°` },
              demo: { exampleQuestion: `Orientation après rotation de ${rot.angle}° (${rot.sense}) depuis ${rot.start}`, exampleAnswer: ans },
              options
            };
          } else {
            const pythTriples = [
              { a: 3, b: 4, c: 5 },
              { a: 6, b: 8, c: 10 },
              { a: 5, b: 12, c: 13 },
              { a: 8, b: 15, c: 17 },
              { a: 9, b: 12, c: 15 },
              { a: 12, b: 16, c: 20 }
            ];
            const triple = randomPick(pythTriples);
            const subVariant = randomInt(0, 2);
            
            if (subVariant === 0) {
              const ans = `${triple.c} cm`;
              const options = buildUniqueOptions(ans, (i) => {
                if (i === 1) return `${triple.a + triple.b} cm`;
                if (i === 2) return `${triple.a * triple.a + triple.b * triple.b} cm`;
                if (i === 3) return `${triple.c + 2} cm`;
                return `${triple.c + i} cm`;
              });
              
              return {
                title: "Théorème de Pythagore : Calcul de l'Hypoténuse",
                desc: `Un triangle ABC est rectangle en A. Les côtés de l'angle droit mesurent AB = ${triple.a} cm et AC = ${triple.b} cm. Calcule la longueur de l'hypoténuse [BC].`,
                answer: ans,
                hint: `Théorème de Pythagore : BC² = AB² + AC² = ${triple.a}² + ${triple.b}² = ${triple.a*triple.a} + ${triple.b*triple.b} = ${triple.c*triple.c} ⇒ BC = √${triple.c*triple.c} = ${triple.c} cm.`,
                geoData: { type: 'pythagoras', targetLeg: 'hypotenuse', ab: triple.a, ac: triple.b, bc: triple.c, scaleRatio: 10, scale: "Pythagore" },
                demo: { exampleQuestion: `Hypoténuse BC si AB = ${triple.a} cm et AC = ${triple.b} cm`, exampleAnswer: ans },
                options
              };
            } else if (subVariant === 1) {
              const ans = `${triple.b} cm`;
              const options = buildUniqueOptions(ans, (i) => {
                if (i === 1) return `${triple.c - triple.a} cm`;
                if (i === 2) return `${triple.c * triple.c + triple.a * triple.a} cm`;
                if (i === 3) return `${triple.c + triple.a} cm`;
                return `${triple.b + i} cm`;
              });
              
              return {
                title: "Théorème de Pythagore : Côté de l'Angle Droit",
                desc: `Dans un triangle ABC rectangle en A, l'hypoténuse BC mesure ${triple.c} cm et le côté AB mesure ${triple.a} cm. Calcule la longueur du côté AC.`,
                answer: ans,
                hint: `Théorème de Pythagore : AC² = BC² - AB² = ${triple.c}² - ${triple.a}² = ${triple.c*triple.c} - ${triple.a*triple.a} = ${triple.b*triple.b} ⇒ AC = √${triple.b*triple.b} = ${triple.b} cm.`,
                geoData: { type: 'pythagoras', targetLeg: 'AC', ab: triple.a, ac: triple.b, bc: triple.c, scaleRatio: 10, scale: "Pythagore" },
                demo: { exampleQuestion: `Côté AC si BC = ${triple.c} cm et AB = ${triple.a} cm`, exampleAnswer: ans },
                options
              };
            } else {
              const isRight = Math.random() < 0.5;
              let sideC = triple.c;
              if (!isRight) sideC = triple.c + 1;
              
              const ans = isRight ? "Oui, le triangle est rectangle" : "Non, le triangle n'est pas rectangle";
              const options = buildUniqueOptions(ans, (i) => {
                if (i === 1) return isRight ? "Non, le triangle n'est pas rectangle" : "Oui, le triangle est rectangle";
                if (i === 2) return "On ne peut pas conclure sans mesurer les angles";
                return "Le triangle est équilatéral";
              });
              
              return {
                title: "Réciproque du Théorème de Pythagore",
                desc: `Un triangle ABC a pour côtés AB = ${triple.a} cm, AC = ${triple.b} cm et BC = ${sideC} cm. Est-il rectangle ?`,
                answer: ans,
                hint: `Réciproque : Compare BC² (${sideC}² = ${sideC*sideC}) et AB² + AC² (${triple.a}² + ${triple.b}² = ${triple.a*triple.a + triple.b*triple.b}). Si l'égalité est vérifiée, le triangle est rectangle.`,
                geoData: { type: 'pythagoras', targetLeg: 'none', ab: triple.a, ac: triple.b, bc: sideC, scaleRatio: 10, scale: "Réciproque" },
                demo: { exampleQuestion: `Test si triangle avec côtés ${triple.a}, ${triple.b}, ${sideC} est rectangle`, exampleAnswer: ans },
                options
              };
            }
          }
        }
      },
      
      // RANG 8 : HACKER PGM (3ème) — Homothétie, Thalès & Trigonométrie / Scratch
      {
        rankId: "RANG 8",
        rankTitle: "HACKER PGM",
        generate: () => {
          const structType = randomInt(0, 2);
          
          if (structType === 0) {
            const k = randomPick([2, 3, 4, 5]);
            const dimensionMode = randomPick(['longueur', 'aire', 'volume']);
            
            if (dimensionMode === 'longueur') {
              const origL = randomInt(5, 20);
              const newL = origL * k;
              const ans = `${newL} cm`;
              
              const options = buildUniqueOptions(ans, (i) => {
                if (i === 1) return `${origL + k} cm`;
                if (i === 2) return `${origL * k * k} cm`;
                if (i === 3) return `${origL} cm`;
                return `${newL + i * 2} cm`;
              });
              
              return {
                title: "Homothétie : Agrandissement de Longueur (k)",
                desc: `Un segment de longueur L = ${origL} cm subit une homothétie de rapport k = ${k}. Quelle est la longueur L' du segment agrandi ?`,
                answer: ans,
                hint: `Par une homothétie de rapport k, les longueurs sont multipliées par k : L' = L × k = ${origL} × ${k} = ${newL} cm.`,
                geoData: { type: 'homothety', mode: 'longueur', k, origValue: origL, newValue: newL, scaleRatio: 10, scale: `Rapport k = ${k}` },
                demo: { exampleQuestion: `Longueur agrandie pour L = ${origL} cm avec k = ${k}`, exampleAnswer: ans },
                options
              };
            } else if (dimensionMode === 'aire') {
              const origA = randomInt(4, 15);
              const newA = origA * k * k;
              const ans = `${newA} cm²`;
              
              const options = buildUniqueOptions(ans, (i) => {
                if (i === 1) return `${origA * k} cm²`;
                if (i === 2) return `${origA * k * k * k} cm²`;
                if (i === 3) return `${origA + k * k} cm²`;
                return `${newA + i * 10} cm²`;
              });
              
              return {
                title: "Homothétie : Variation d'Aire (k²)",
                desc: `Une surface géométrique d'aire A = ${origA} cm² subit une homothétie de rapport k = ${k}. Quelle est son aire A' après agrandissement ?`,
                answer: ans,
                hint: `Par une homothétie de rapport k, les aires sont multipliées par k² : A' = A × k² = ${origA} × ${k * k} = ${newA} cm².`,
                geoData: { type: 'homothety', mode: 'aire', k, origValue: origA, newValue: newA, scaleRatio: 10, scale: `Rapport k = ${k}` },
                demo: { exampleQuestion: `Aire agrandie pour A = ${origA} cm² avec k = ${k}`, exampleAnswer: ans },
                options
              };
            } else {
              const origV = randomInt(2, 8);
              const newV = origV * k * k * k;
              const ans = `${newV} cm³`;
              
              const options = buildUniqueOptions(ans, (i) => {
                if (i === 1) return `${origV * k} cm³`;
                if (i === 2) return `${origV * k * k} cm³`;
                if (i === 3) return `${origV + Math.pow(k, 3)} cm³`;
                return `${newV + i * 15} cm³`;
              });
              
              return {
                title: "Homothétie 3D : Variation de Volume (k³)",
                desc: `Un solide de volume V = ${origV} cm³ subit une homothétie de rapport k = ${k}. Quel est son nouveau volume V' ?`,
                answer: ans,
                hint: `Par une homothétie de rapport k, les volumes sont multipliés par k³ : V' = V × k³ = ${origV} × ${Math.pow(k, 3)} = ${newV} cm³.`,
                geoData: { type: 'homothety', mode: 'volume', k, origValue: origV, newValue: newV, scaleRatio: 10, scale: `Rapport k = ${k}` },
                demo: { exampleQuestion: `Volume agrandi pour V = ${origV} cm³ avec k = ${k}`, exampleAnswer: ans },
                options
              };
            }
          } else if (structType === 1) {
            const isButterfly = Math.random() < 0.5;
            const ab = randomInt(2, 6);
            const factor = randomInt(2, 4);
            const ac = ab * factor;
            const am = randomInt(2, 8);
            const exactAN = Math.abs(am * factor);
            const ans = `${exactAN} cm`;
            
            const optionsSet = new Set([ans]);
            const invAN = Math.abs(Math.round((am * ab) / ac));
            if (invAN > 0 && invAN !== exactAN) optionsSet.add(`${invAN} cm`);
            const addAN = Math.abs(am + (ac - ab));
            if (addAN !== exactAN) optionsSet.add(`${addAN} cm`);
            
            let offset = 1;
            while (optionsSet.size < 4) {
              const candidate = Math.max(1, exactAN + (offset % 2 === 0 ? offset : -offset));
              optionsSet.add(`${candidate} cm`);
              offset++;
            }
            
            const configName = isButterfly ? "en papillon" : "en triangles emboîtés";
            
            return {
              title: `Théorème de Thalès (${configName})`,
              desc: `Deux droites sécantes en A sont coupées par deux parallèles (BM) et (CN) (${configName}). Si AB = ${ab} cm, AC = ${ac} cm et AM = ${am} cm, calcule la longueur AN.`,
              answer: ans,
              hint: `Théorème de Thalès : AB / AC = AM / AN ⇒ ${ab} / ${ac} = ${am} / AN ⇒ AN = (${am} × ${ac}) / ${ab} = ${exactAN} cm.`,
              geoData: { 
                type: 'thales', 
                ab, ac, am, an: exactAN, 
                isButterfly,
                configuration: isButterfly ? 'papillon' : 'emboite' 
              },
              demo: { exampleQuestion: `AN pour AB = ${ab}, AC = ${ac}, AM = ${am} (${configName})`, exampleAnswer: ans },
              options: shuffleArray(Array.from(optionsSet)).slice(0, 4)
            };
          } else {
            const subVariant = randomInt(0, 1);
            
            if (subVariant === 0) {
              const trigoRules = [
                { name: "Tangente", formula: "Côté Opposé / Côté Adjacent" },
                { name: "Sinus", formula: "Côté Opposé / Hypoténuse" },
                { name: "Cosinus", formula: "Côté Adjacent / Hypoténuse" },
                { name: "Identité fondamentale", formula: "tan(α) = sin(α) / cos(α)" }
              ];
              const picked = randomPick(trigoRules);
              const ans = picked.formula;
              
              const options = buildUniqueOptions(ans, (i) => {
                const formulas = [
                  "Côté Opposé / Côté Adjacent",
                  "Côté Opposé / Hypoténuse",
                  "Côté Adjacent / Hypoténuse",
                  "tan(α) = sin(α) / cos(α)",
                  "tan(α) = cos(α) / sin(α)"
                ].filter(f => f !== ans);
                return formulas[i % formulas.length];
              });
              
              return {
                title: `Trigonométrie Complète : ${picked.name}`,
                desc: `Dans un triangle rectangle, quelle est la formule exacte correspondant à : ${picked.name} ?`,
                answer: ans,
                hint: "Moyens mnémotechniques : SOH (Sinus = Opposé/Hypoténuse), CAH (Cosinus = Adjacent/Hypoténuse), TOA (Tangente = Opposé/Adjacent).",
                geoData: { type: 'trigoComplete', adj: 4, opp: 3, hyp: 5, cosVal: "0,8", scale: "Trigonométrie" },
                demo: { exampleQuestion: `Formule de : ${picked.name}`, exampleAnswer: ans },
                options
              };
            } else {
              const polyConfigs = [
                { name: "Triangle équilatéral", sides: 3, angle: 120 },
                { name: "Carré", sides: 4, angle: 90 },
                { name: "Pentagone régulier", sides: 5, angle: 72 },
                { name: "Hexagone régulier", sides: 6, angle: 60 },
                { name: "Octogone régulier", sides: 8, angle: 45 }
              ];
              const target = randomPick(polyConfigs);
              const ans = `${target.angle}°`;
              
              const options = buildUniqueOptions(ans, (i) => {
                if (i === 1) return `${180 - target.angle}°`;
                if (i === 2) return "360°";
                if (i === 3) return `${target.angle + 30}°`;
                return `${target.angle / 2}°`;
              });
              
              return {
                title: "Algorithmique Scratch : Angle de Rotation",
                desc: `Dans un script Scratch de géométrie, un lutin doit tracer un ${target.name} (${target.sides} côtés égaux). De quel angle de rotation en degrés doit-il tourner à chaque sommet ?`,
                answer: ans,
                hint: `Géométrie algorithmique : Angle de rotation = 360° / (nombre de côtés) = 360° / ${target.sides} = ${target.angle}°.`,
                geoData: { type: 'homothety', mode: 'longueur', k: 1, scaleRatio: 10, scale: "Scratch 360°/n" },
                demo: { exampleQuestion: `Angle Scratch pour un ${target.name}`, exampleAnswer: ans },
                options
              };
            }
          }
        }
      }
    ]
  }
}; 