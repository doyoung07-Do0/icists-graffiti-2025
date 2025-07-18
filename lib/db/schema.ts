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

export const round_state = pgTable('round_state', {
  round: varchar('round', { enum: ['r1', 'r2', 'r3', 'r4'] })
    .primaryKey()
    .notNull(),
  status: varchar('status', { enum: ['locked', 'open', 'closed'] }).notNull(),
});

export type RoundState = InferSelectModel<typeof round_state>;

// Function to create team table for a specific round
const createTeamTable = (round: 'r1' | 'r2' | 'r3' | 'r4') => {
  return pgTable(`team_${round}`, {
    team: varchar('team', { length: 10 }).primaryKey(), // team1-team16
    s1: integer('s1').default(0).notNull(),
    s2: integer('s2').default(0).notNull(),
    s3: integer('s3').default(0).notNull(),
    s4: integer('s4').default(0).notNull(),
    s5: integer('s5').default(0).notNull(),
    pre_fund: integer('pre_fund'),
    post_fund: integer('post_fund'),
    submitted: boolean('submitted').default(false).notNull(),
  });
};

// Create team tables for each round
export const team_r1 = createTeamTable('r1');
export const team_r2 = createTeamTable('r2');
export const team_r3 = createTeamTable('r3');
export const team_r4 = createTeamTable('r4');

export type TeamRound = InferSelectModel<typeof team_r1>;

// Function to create startup table for a specific round
const createStartupTable = (round: 'r1' | 'r2' | 'r3' | 'r4') => {
  return pgTable(`startup_${round}`, {
    startup: varchar('startup', {
      enum: ['s1', 's2', 's3', 's4', 's5'],
    }).primaryKey(),
    pre_cap: integer('pre_cap'),
    yield: decimal('yield', { precision: 10, scale: 4 }),
    post_cap: integer('post_cap'),
  });
};

// Create startup tables for each round
export const startup_r1 = createStartupTable('r1');
export const startup_r2 = createStartupTable('r2');
export const startup_r3 = createStartupTable('r3');
export const startup_r4 = createStartupTable('r4');

export type StartupRound = InferSelectModel<typeof startup_r1>;
