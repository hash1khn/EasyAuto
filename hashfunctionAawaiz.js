const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Convert UUID to Base58 string
function uuidToShortId(uuid) {
  const hex = uuid.replace(/-/g, '');
  let bigInt = BigInt('0x' + hex);
  let result = '';
  
  while (bigInt > 0n) {
    const remainder = bigInt % 58n;
    bigInt = bigInt / 58n;
    result = BASE58_ALPHABET[Number(remainder)] + result;
  }
  
  return result;
}

// Convert Base58 string back to UUID
function shortIdToUuid(shortId) {
  let bigInt = 0n;
  
  for (const char of shortId) {
    const index = BASE58_ALPHABET.indexOf(char);
    if (index === -1) throw new Error('Invalid character');
    bigInt = bigInt * 58n + BigInt(index);
  }
  
  let hex = bigInt.toString(16).padStart(32, '0');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Format short ID for display (grouped with hyphens)
function formatShortId(shortId, groupSize = 4) {
  return shortId
    .match(new RegExp(`.{1,${groupSize}}`, 'g'))
    .join('-');
}

// Parse user input (with or without hyphens)
function parseInput(input) {
  return input.replace(/[^1-9A-HJ-NP-Za-km-z]/g, '');
}

// Example usage:
const invoiceUuid = 'deaf2b94-1996-4687-9f61-6e4c66e02695';

// Convert to short ID
const shortId = uuidToShortId(invoiceUuid); // "2Y1KbZJqyWn7Xc3FpNv4dH"
console.log(shortId); // Display short ID

// Display formatted version (grouped)
const displayId = formatShortId(shortId); // "2Y1K-bZJq-yWn7-Xc3F-pNv4-dH"

// Convert back to UUID from user input
const userInput = '2Y1K-bZJq-yWn7-Xc3F-pNv4-dH';
const originalUuid = shortIdToUuid(parseInput(userInput)); // Original UUID
