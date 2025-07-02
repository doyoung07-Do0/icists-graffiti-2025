import type { InferSelectModel } from 'drizzle-orm';
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
  integer, 
  decimal, 
  pgEnum,
  unique
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    streamId: text('streamId').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => ({
    // Add a unique constraint on chatId and streamId
    chatStreamUnique: unique('chat_stream_unique').on(table.chatId, table.streamId),
  })
);

export type Stream = InferSelectModel<typeof stream>;

// Investment Game Tables

export const roundStatusEnum = pgEnum('round_status', ['locked', 'open', 'closed']);

export const teams = pgTable('teams', {
  id: integer('id').primaryKey().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }), // Optional: Link to Clerk user ID
  currentCapital: decimal('current_capital', { precision: 20, scale: 4 })
    .notNull()
    .default('1000.0000'),
});

export const gameRounds = pgTable('game_rounds', {
  id: integer('id').primaryKey().notNull(),
  roundNumber: integer('round_number').notNull().unique(),
  status: roundStatusEnum('status').notNull(),
  
  // Yields for each sector (can be null until round ends)
  yieldS1: decimal('yield_s1', { precision: 10, scale: 4 }),
  yieldS2: decimal('yield_s2', { precision: 10, scale: 4 }),
  yieldS3: decimal('yield_s3', { precision: 10, scale: 4 }),
  yieldS4: decimal('yield_s4', { precision: 10, scale: 4 }),
  
  // Market caps for each sector (can be null)
  marketCapS1: decimal('market_cap_s1', { precision: 20, scale: 4 }),
  marketCapS2: decimal('market_cap_s2', { precision: 20, scale: 4 }),
  marketCapS3: decimal('market_cap_s3', { precision: 20, scale: 4 }),
  marketCapS4: decimal('market_cap_s4', { precision: 20, scale: 4 }),
});

export const portfolios = pgTable('portfolios', {
  teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  roundId: integer('round_id').notNull().references(() => gameRounds.id, { onDelete: 'cascade' }),
  
  // Investment amounts in each sector (default to 0)
  investmentS1: decimal('investment_s1', { precision: 20, scale: 4 }).notNull().default('0'),
  investmentS2: decimal('investment_s2', { precision: 20, scale: 4 }).notNull().default('0'),
  investmentS3: decimal('investment_s3', { precision: 20, scale: 4 }).notNull().default('0'),
  investmentS4: decimal('investment_s4', { precision: 20, scale: 4 }).notNull().default('0'),
  
  // Capital tracking
  capitalAtStart: decimal('capital_at_start', { precision: 20, scale: 4 }).notNull(),
  capitalAtEnd: decimal('capital_at_end', { precision: 20, scale: 4 }),
  
  // Submission status
  isSubmitted: boolean('is_submitted').notNull().default(false),
  submittedAt: timestamp('submitted_at'),
}, (table) => ({
  // Composite primary key
  pk: primaryKey({ columns: [table.teamId, table.roundId] }),
}));

// Relations
export const teamsRelations = relations(teams, ({ many }) => ({
  portfolios: many(portfolios),
}));

export const gameRoundsRelations = relations(gameRounds, ({ many }) => ({
  portfolios: many(portfolios),
}));

export const portfoliosRelations = relations(portfolios, ({ one }) => ({
  team: one(teams, {
    fields: [portfolios.teamId],
    references: [teams.id],
  }),
  round: one(gameRounds, {
    fields: [portfolios.roundId],
    references: [gameRounds.id],
  }),
}));

// Types
export type Team = InferSelectModel<typeof teams>;
export type NewTeam = typeof teams.$inferInsert;

export type GameRound = InferSelectModel<typeof gameRounds>;
export type NewGameRound = typeof gameRounds.$inferInsert;

export type Portfolio = InferSelectModel<typeof portfolios>;
export type NewPortfolio = typeof portfolios.$inferInsert;