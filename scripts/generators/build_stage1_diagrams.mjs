import fs from 'fs';
import path from 'path';
import { serializeDiagramData } from './compact_serializer.mjs';
import { STAGE1_DIAGRAMS } from './build_stage1_diagrams.mjs';

const full = path.join('src/data/academy/diagrams/stage1Diagrams.js');
const code = `/**
 * stage1Diagrams.js
 * 100% Pure Multilingual Native Translations for Academy Diagrams
 */

export const STAGE1_DIAGRAMS = ${serializeDiagramData(STAGE1_DIAGRAMS)};

export default STAGE1_DIAGRAMS;
`;

const lineCount = code.split('\n').length;
fs.writeFileSync(full, code, 'utf8');
console.log(`✅ Generated stage1Diagrams.js (${lineCount} lines)`);
