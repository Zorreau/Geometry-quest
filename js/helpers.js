function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray(array) {
  if (!Array.isArray(array)) return [];
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildUniqueOptions(correctOption, distractorGenerator) {
  const correctStr = String(correctOption).trim();
  const optionsSet = new Set([correctStr]);
  let attempts = 0;
  
  while (optionsSet.size < 4 && attempts < 100) {
    attempts++;
    const candidate = distractorGenerator(attempts);
    if (candidate !== undefined && candidate !== null) {
      const candidateStr = String(candidate).trim();
      if (candidateStr.length > 0) {
        optionsSet.add(candidateStr);
      }
    }
  }
  
  return shuffleArray(Array.from(optionsSet)).slice(0, 4);
}
