import { relations } from "drizzle-orm/relations";
import { investmentRound, teamMarketCap, user, suggestion, document, chat, message, messageV2, stream, roundReturns, teamCapital, teamPortfolio, vote, voteV2 } from "./schema";

export const teamMarketCapRelations = relations(teamMarketCap, ({one}) => ({
	investmentRound: one(investmentRound, {
		fields: [teamMarketCap.roundId],
		references: [investmentRound.id]
	}),
}));

export const investmentRoundRelations = relations(investmentRound, ({many}) => ({
	teamMarketCaps: many(teamMarketCap),
	teamCapitals: many(teamCapital),
	teamPortfolios: many(teamPortfolio),
}));

export const suggestionRelations = relations(suggestion, ({one}) => ({
	user: one(user, {
		fields: [suggestion.userId],
		references: [user.id]
	}),
	document: one(document, {
		fields: [suggestion.documentId],
		references: [document.createdAt]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	suggestions: many(suggestion),
	chats: many(chat),
	roundReturns: many(roundReturns),
	documents: many(document),
}));

export const documentRelations = relations(document, ({one, many}) => ({
	suggestions: many(suggestion),
	user: one(user, {
		fields: [document.userId],
		references: [user.id]
	}),
}));

export const messageRelations = relations(message, ({one, many}) => ({
	chat: one(chat, {
		fields: [message.chatId],
		references: [chat.id]
	}),
	votes: many(vote),
}));

export const chatRelations = relations(chat, ({one, many}) => ({
	messages: many(message),
	user: one(user, {
		fields: [chat.userId],
		references: [user.id]
	}),
	messageV2s: many(messageV2),
	streams: many(stream),
	votes: many(vote),
	voteV2s: many(voteV2),
}));

export const messageV2Relations = relations(messageV2, ({one, many}) => ({
	chat: one(chat, {
		fields: [messageV2.chatId],
		references: [chat.id]
	}),
	voteV2s: many(voteV2),
}));

export const streamRelations = relations(stream, ({one}) => ({
	chat: one(chat, {
		fields: [stream.chatId],
		references: [chat.id]
	}),
}));

export const roundReturnsRelations = relations(roundReturns, ({one}) => ({
	user: one(user, {
		fields: [roundReturns.calculatedById],
		references: [user.id]
	}),
}));

export const teamCapitalRelations = relations(teamCapital, ({one}) => ({
	investmentRound: one(investmentRound, {
		fields: [teamCapital.roundId],
		references: [investmentRound.id]
	}),
}));

export const teamPortfolioRelations = relations(teamPortfolio, ({one}) => ({
	investmentRound: one(investmentRound, {
		fields: [teamPortfolio.roundId],
		references: [investmentRound.id]
	}),
}));

export const voteRelations = relations(vote, ({one}) => ({
	chat: one(chat, {
		fields: [vote.chatId],
		references: [chat.id]
	}),
	message: one(message, {
		fields: [vote.messageId],
		references: [message.id]
	}),
}));

export const voteV2Relations = relations(voteV2, ({one}) => ({
	chat: one(chat, {
		fields: [voteV2.chatId],
		references: [chat.id]
	}),
	messageV2: one(messageV2, {
		fields: [voteV2.messageId],
		references: [messageV2.id]
	}),
}));