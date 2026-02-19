CREATE TABLE "transfers" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"from_account_id" text NOT NULL,
	"to_account_id" text NOT NULL,
	"amount" text NOT NULL,
	"fee" text DEFAULT '0' NOT NULL,
	"description" text NOT NULL,
	"note" text,
	"date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "encryption_salt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "encryption_verifier" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "is_data_encrypted" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_from_account_id_accounts_id_fk" FOREIGN KEY ("from_account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_to_account_id_accounts_id_fk" FOREIGN KEY ("to_account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transfers_user_id_idx" ON "transfers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transfers_user_date_idx" ON "transfers" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "transfers_from_account_idx" ON "transfers" USING btree ("user_id","from_account_id");--> statement-breakpoint
CREATE INDEX "transfers_to_account_idx" ON "transfers" USING btree ("user_id","to_account_id");