CREATE TABLE "telegram_deadline_digest" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"digest_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "telegram_deadline_digest_user_date_unique" UNIQUE("user_id","digest_date")
);
--> statement-breakpoint
ALTER TABLE "notification_delivery" ALTER COLUMN "project_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_telegram_account" ADD COLUMN "daily_deadline_digest_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "telegram_deadline_digest" ADD CONSTRAINT "telegram_deadline_digest_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;