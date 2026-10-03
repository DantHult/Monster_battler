// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
export {};
import {sqliteTable,text,integer,primaryKey} from 'drizzle-orm/sqlite-core';
export const matches=sqliteTable('matches',{
 id:text('id').primaryKey(),state:text('state').notNull(),version:integer('version').notNull().default(0),p0_token_hash:text('p0_token_hash').notNull(),p1_token_hash:text('p1_token_hash'),created_at:integer('created_at').notNull(),p0_seen:integer('p0_seen').notNull(),p1_seen:integer('p1_seen').notNull(),journal:text('journal').notNull(),
});
export const feedback=sqliteTable('feedback',{
 room_id:text('room_id').notNull().references(()=>matches.id),player:integer('player').notNull(),stage:text('stage').notNull(),answers:text('answers').notNull(),created_at:integer('created_at').notNull(),
},t=>[primaryKey({columns:[t.room_id,t.player,t.stage]})]);
