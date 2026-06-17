import english from "./english.json" assert { type: "json" };
import reading from "./reading.json" assert { type: "json" };
import science from "./science.json" assert { type: "json" };
import math from "./math.json" assert { type: "json" };

const referenceMap = { english, math, reading, science };

export function getReference(section) {
  return referenceMap[section.toLowerCase()] || null;
}

export default referenceMap;
