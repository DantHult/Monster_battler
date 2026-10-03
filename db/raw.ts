import {env} from 'cloudflare:workers';
import {RoomError} from '../lib/server/rooms.ts';
export function roomDb(){if(!env.DB)throw new RoomError('Room storage is unavailable. Please try again shortly.',503);return env.DB;}
