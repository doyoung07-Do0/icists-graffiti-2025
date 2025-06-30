import { pgTable, unique, uuid, varchar, integer, timestamp, foreignKey, numeric, text, boolean, json, primaryKey } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"




export const team6 = pgTable("team6", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundName: varchar("round_name", { length: 20 }).notNull(),
	s1: integer().default(0).notNull(),
	s2: integer().default(0).notNull(),
	s3: integer().default(0).notNull(),
	s4: integer().default(0).notNull(),
	remain: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		team6RoundNameUnique: unique("team6_round_name_unique").on(table.roundName),
	}
});

export const team7 = pgTable("team7", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundName: varchar("round_name", { length: 20 }).notNull(),
	s1: integer().default(0).notNull(),
	s2: integer().default(0).notNull(),
	s3: integer().default(0).notNull(),
	s4: integer().default(0).notNull(),
	remain: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		team7RoundNameUnique: unique("team7_round_name_unique").on(table.roundName),
	}
});

export const team8 = pgTable("team8", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundName: varchar("round_name", { length: 20 }).notNull(),
	s1: integer().default(0).notNull(),
	s2: integer().default(0).notNull(),
	s3: integer().default(0).notNull(),
	s4: integer().default(0).notNull(),
	remain: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		team8RoundNameUnique: unique("team8_round_name_unique").on(table.roundName),
	}
});

export const team9 = pgTable("team9", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundName: varchar("round_name", { length: 20 }).notNull(),
	s1: integer().default(0).notNull(),
	s2: integer().default(0).notNull(),
	s3: integer().default(0).notNull(),
	s4: integer().default(0).notNull(),
	remain: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		team9RoundNameUnique: unique("team9_round_name_unique").on(table.roundName),
	}
});

export const teamMarketCap = pgTable("TeamMarketCap", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundId: uuid().notNull(),
	teamName: varchar({ length: 50 }).notNull(),
	marketCap: numeric({ precision: 20, scale:  2 }).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		teamMarketCapRoundIdInvestmentRoundIdFk: foreignKey({
			columns: [table.roundId],
			foreignColumns: [investmentRound.id],
			name: "TeamMarketCap_roundId_InvestmentRound_id_fk"
		}),
	}
});

export const user = pgTable("User", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 64 }).notNull(),
	password: varchar({ length: 64 }),
});

export const suggestion = pgTable("Suggestion", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	documentId: uuid().notNull(),
	documentCreatedAt: timestamp({ mode: 'string' }).notNull(),
	originalText: text().notNull(),
	suggestedText: text().notNull(),
	description: text(),
	isResolved: boolean().default(false).notNull(),
	userId: uuid().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		suggestionUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Suggestion_userId_User_id_fk"
		}),
		suggestionDocumentIdDocumentCreatedAtDocumentIdCreatedAtF: foreignKey({
			columns: [table.documentId, table.documentCreatedAt],
			foreignColumns: [document.createdAt, document.id],
			name: "Suggestion_documentId_documentCreatedAt_Document_id_createdAt_f"
		}),
	}
});

export const message = pgTable("Message", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	chatId: uuid().notNull(),
	role: varchar().notNull(),
	content: json().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		messageChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Message_chatId_Chat_id_fk"
		}),
	}
});

export const chat = pgTable("Chat", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	userId: uuid().notNull(),
	title: text().notNull(),
	visibility: varchar().default('private').notNull(),
},
(table) => {
	return {
		chatUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Chat_userId_User_id_fk"
		}),
	}
});

export const messageV2 = pgTable("Message_v2", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	chatId: uuid().notNull(),
	role: varchar().notNull(),
	parts: json().notNull(),
	attachments: json().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		messageV2ChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Message_v2_chatId_Chat_id_fk"
		}),
	}
});

export const stream = pgTable("Stream", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	chatId: uuid().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		streamChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Stream_chatId_Chat_id_fk"
		}),
	}
});

export const roundReturns = pgTable("RoundReturns", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundName: varchar({ length: 20 }).notNull(),
	s1Return: numeric({ precision: 10, scale:  2 }).notNull(),
	s2Return: numeric({ precision: 10, scale:  2 }).notNull(),
	s3Return: numeric({ precision: 10, scale:  2 }).notNull(),
	s4Return: numeric({ precision: 10, scale:  2 }).notNull(),
	calculatedAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	calculatedById: uuid(),
},
(table) => {
	return {
		roundReturnsCalculatedByIdUserIdFk: foreignKey({
			columns: [table.calculatedById],
			foreignColumns: [user.id],
			name: "RoundReturns_calculatedById_User_id_fk"
		}),
		roundReturnsRoundNameUnique: unique("RoundReturns_roundName_unique").on(table.roundName),
	}
});

export const teamCapital = pgTable("TeamCapital", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundId: uuid().notNull(),
	teamName: varchar({ length: 20 }).notNull(),
	totalCapital: numeric({ precision: 15, scale:  2 }).default('0').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		teamCapitalRoundIdInvestmentRoundIdFk: foreignKey({
			columns: [table.roundId],
			foreignColumns: [investmentRound.id],
			name: "TeamCapital_roundId_InvestmentRound_id_fk"
		}),
	}
});

export const teamPortfolio = pgTable("TeamPortfolio", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundId: uuid().notNull(),
	teamName: varchar({ length: 20 }).notNull(),
	startup: varchar({ length: 50 }).notNull(),
	investmentAmount: numeric({ precision: 15, scale:  2 }).default('0').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		teamPortfolioRoundIdInvestmentRoundIdFk: foreignKey({
			columns: [table.roundId],
			foreignColumns: [investmentRound.id],
			name: "TeamPortfolio_roundId_InvestmentRound_id_fk"
		}),
	}
});

export const investmentRound = pgTable("InvestmentRound", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	isActive: boolean().default(false).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	returnsCalculated: boolean().default(false).notNull(),
	nextRoundUnlocked: boolean().default(false).notNull(),
});

export const team1 = pgTable("team1", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundName: varchar("round_name", { length: 20 }).notNull(),
	s1: integer().default(0).notNull(),
	s2: integer().default(0).notNull(),
	s3: integer().default(0).notNull(),
	s4: integer().default(0).notNull(),
	remain: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		team1RoundNameUnique: unique("team1_round_name_unique").on(table.roundName),
	}
});

export const team10 = pgTable("team10", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundName: varchar("round_name", { length: 20 }).notNull(),
	s1: integer().default(0).notNull(),
	s2: integer().default(0).notNull(),
	s3: integer().default(0).notNull(),
	s4: integer().default(0).notNull(),
	remain: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		team10RoundNameUnique: unique("team10_round_name_unique").on(table.roundName),
	}
});

export const team11 = pgTable("team11", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundName: varchar("round_name", { length: 20 }).notNull(),
	s1: integer().default(0).notNull(),
	s2: integer().default(0).notNull(),
	s3: integer().default(0).notNull(),
	s4: integer().default(0).notNull(),
	remain: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		team11RoundNameUnique: unique("team11_round_name_unique").on(table.roundName),
	}
});

export const team12 = pgTable("team12", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundName: varchar("round_name", { length: 20 }).notNull(),
	s1: integer().default(0).notNull(),
	s2: integer().default(0).notNull(),
	s3: integer().default(0).notNull(),
	s4: integer().default(0).notNull(),
	remain: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		team12RoundNameUnique: unique("team12_round_name_unique").on(table.roundName),
	}
});

export const team13 = pgTable("team13", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundName: varchar("round_name", { length: 20 }).notNull(),
	s1: integer().default(0).notNull(),
	s2: integer().default(0).notNull(),
	s3: integer().default(0).notNull(),
	s4: integer().default(0).notNull(),
	remain: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		team13RoundNameUnique: unique("team13_round_name_unique").on(table.roundName),
	}
});

export const team14 = pgTable("team14", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundName: varchar("round_name", { length: 20 }).notNull(),
	s1: integer().default(0).notNull(),
	s2: integer().default(0).notNull(),
	s3: integer().default(0).notNull(),
	s4: integer().default(0).notNull(),
	remain: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		team14RoundNameUnique: unique("team14_round_name_unique").on(table.roundName),
	}
});

export const team15 = pgTable("team15", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundName: varchar("round_name", { length: 20 }).notNull(),
	s1: integer().default(0).notNull(),
	s2: integer().default(0).notNull(),
	s3: integer().default(0).notNull(),
	s4: integer().default(0).notNull(),
	remain: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		team15RoundNameUnique: unique("team15_round_name_unique").on(table.roundName),
	}
});

export const team16 = pgTable("team16", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundName: varchar("round_name", { length: 20 }).notNull(),
	s1: integer().default(0).notNull(),
	s2: integer().default(0).notNull(),
	s3: integer().default(0).notNull(),
	s4: integer().default(0).notNull(),
	remain: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		team16RoundNameUnique: unique("team16_round_name_unique").on(table.roundName),
	}
});

export const team2 = pgTable("team2", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundName: varchar("round_name", { length: 20 }).notNull(),
	s1: integer().default(0).notNull(),
	s2: integer().default(0).notNull(),
	s3: integer().default(0).notNull(),
	s4: integer().default(0).notNull(),
	remain: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		team2RoundNameUnique: unique("team2_round_name_unique").on(table.roundName),
	}
});

export const team3 = pgTable("team3", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundName: varchar("round_name", { length: 20 }).notNull(),
	s1: integer().default(0).notNull(),
	s2: integer().default(0).notNull(),
	s3: integer().default(0).notNull(),
	s4: integer().default(0).notNull(),
	remain: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		team3RoundNameUnique: unique("team3_round_name_unique").on(table.roundName),
	}
});

export const team4 = pgTable("team4", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundName: varchar("round_name", { length: 20 }).notNull(),
	s1: integer().default(0).notNull(),
	s2: integer().default(0).notNull(),
	s3: integer().default(0).notNull(),
	s4: integer().default(0).notNull(),
	remain: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		team4RoundNameUnique: unique("team4_round_name_unique").on(table.roundName),
	}
});

export const team5 = pgTable("team5", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roundName: varchar("round_name", { length: 20 }).notNull(),
	s1: integer().default(0).notNull(),
	s2: integer().default(0).notNull(),
	s3: integer().default(0).notNull(),
	s4: integer().default(0).notNull(),
	remain: integer().default(0).notNull(),
	total: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		team5RoundNameUnique: unique("team5_round_name_unique").on(table.roundName),
	}
});

export const vote = pgTable("Vote", {
	chatId: uuid().notNull(),
	messageId: uuid().notNull(),
	isUpvoted: boolean().notNull(),
},
(table) => {
	return {
		voteChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Vote_chatId_Chat_id_fk"
		}),
		voteMessageIdMessageIdFk: foreignKey({
			columns: [table.messageId],
			foreignColumns: [message.id],
			name: "Vote_messageId_Message_id_fk"
		}),
		voteChatIdMessageIdPk: primaryKey({ columns: [table.chatId, table.messageId], name: "Vote_chatId_messageId_pk"}),
	}
});

export const voteV2 = pgTable("Vote_v2", {
	chatId: uuid().notNull(),
	messageId: uuid().notNull(),
	isUpvoted: boolean().notNull(),
},
(table) => {
	return {
		voteV2ChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Vote_v2_chatId_Chat_id_fk"
		}),
		voteV2MessageIdMessageV2IdFk: foreignKey({
			columns: [table.messageId],
			foreignColumns: [messageV2.id],
			name: "Vote_v2_messageId_Message_v2_id_fk"
		}),
		voteV2ChatIdMessageIdPk: primaryKey({ columns: [table.chatId, table.messageId], name: "Vote_v2_chatId_messageId_pk"}),
	}
});

export const document = pgTable("Document", {
	id: uuid().defaultRandom().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	title: text().notNull(),
	content: text(),
	userId: uuid().notNull(),
	text: varchar().default('text').notNull(),
},
(table) => {
	return {
		documentUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Document_userId_User_id_fk"
		}),
		documentIdCreatedAtPk: primaryKey({ columns: [table.id, table.createdAt], name: "Document_id_createdAt_pk"}),
	}
});