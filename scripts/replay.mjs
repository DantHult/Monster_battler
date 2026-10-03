import {readFile} from 'node:fs/promises';
import {replay} from '../lib/game/engine.ts';
import {CONTENT} from '../lib/game/content.ts';
const path=process.argv[2];if(!path)throw Error('Usage: node --experimental-strip-types scripts/replay.mjs <downloaded-battle-record.json>');
const record=JSON.parse(await readFile(path,'utf8')),g=record.game??record;
if(g.content_version!==CONTENT.version||g.rules_version!==CONTENT.rules_version)throw Error('Use the archived source release matching this record’s rules/content versions.');
if(record.content&&JSON.stringify(record.content)!==JSON.stringify(CONTENT))throw Error('The content snapshot differs from this release. Use the matching archived source.');
await replay(g);console.log('Replay verified:',g.turn,'turns,',g.outcome);
