import type { InferSelectModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  decimal,
  integer,
  unique,
} from 'drizzle-orm/pg-core';

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const messageDeprecated = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable('Message_v2', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  'Vote_v2',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  'Stream',
  {
    id: uuid('id').notNull().defaultRandom(),
    chatId: uuid('chatId').notNull(),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  }),
);

export type Stream = InferSelectModel<typeof stream>;

// Investment Game Schema
export const investmentRound = pgTable('InvestmentRound', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull(), // Pre-seed, Seed, Series A, Series B
  isActive: boolean('isActive').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type InvestmentRound = InferSelectModel<typeof investmentRound>;

export const teamPortfolio = pgTable('TeamPortfolio', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  roundId: uuid('roundId')
    .notNull()
    .references(() => investmentRound.id),
  teamName: varchar('teamName', { length: 20 }).notNull(), // team1, team2, etc.
  startup: varchar('startup', { length: 50 }).notNull(), // startup1, startup2, etc.
  investmentAmount: decimal('investmentAmount', { precision: 15, scale: 2 }).notNull().default('0'),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type TeamPortfolio = InferSelectModel<typeof teamPortfolio>;

export const teamCapital = pgTable('TeamCapital', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  roundId: uuid('roundId')
    .notNull()
    .references(() => investmentRound.id),
  teamName: varchar('teamName', { length: 20 }).notNull(), // team1, team2, etc.
  totalCapital: decimal('totalCapital', { precision: 15, scale: 2 }).notNull().default('0'),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type TeamCapital = InferSelectModel<typeof teamCapital>;

export const teamMarketCap = pgTable('TeamMarketCap', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  roundId: uuid('roundId')
    .notNull()
    .references(() => investmentRound.id),
  teamName: varchar('teamName', { length: 50 }).notNull(),
  marketCap: decimal('marketCap', { precision: 20, scale: 2 }).notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export type TeamMarketCap = InferSelectModel<typeof teamMarketCap>;

// New Team Tables Schema

// Function to create team table schema
export const createTeamTable = (teamNumber: number) => {
  const tableName = `team${teamNumber}` as const;
  
  return pgTable(tableName, {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    roundName: varchar('round_name', { length: 20, enum: ['r1', 'r2', 'r3', 'r4'] })
      .notNull(),
    s1: integer('s1').notNull().default(0),
    s2: integer('s2').notNull().default(0),
    s3: integer('s3').notNull().default(0),
    s4: integer('s4').notNull().default(0),
    remain: integer('remain').notNull().default(0),
    total: integer('total').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  }, (table) => ({
    unq: unique().on(table.roundName),
  }));
};

// Create team table types
export const team1 = createTeamTable(1);
export const team2 = createTeamTable(2);
export const team3 = createTeamTable(3);
export const team4 = createTeamTable(4);
export const team5 = createTeamTable(5);
export const team6 = createTeamTable(6);
export const team7 = createTeamTable(7);
export const team8 = createTeamTable(8);
export const team9 = createTeamTable(9);
export const team10 = createTeamTable(10);
export const team11 = createTeamTable(11);
export const team12 = createTeamTable(12);
export const team13 = createTeamTable(13);
export const team14 = createTeamTable(14);
export const team15 = createTeamTable(15);
export const team16 = createTeamTable(16);

// Team table type
export type TeamTable = ReturnType<typeof createTeamTable>;
export type TeamRecord = {
  id: string;
  roundName: 'r1' | 'r2' | 'r3' | 'r4';
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  remain: number;
  total: number;
  updatedAt: Date;
};

// Union type of all team table names
export type TeamTableName = `team${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16}`;
