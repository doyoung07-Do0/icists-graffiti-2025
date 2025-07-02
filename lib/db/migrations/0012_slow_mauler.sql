ALTER TABLE "Stream" DROP CONSTRAINT "Stream_chatId_streamId_pk";--> statement-breakpoint
ALTER TABLE "Stream" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "Stream" ADD CONSTRAINT "chat_stream_unique" UNIQUE("chatId","streamId");