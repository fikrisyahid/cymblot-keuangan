ALTER TABLE "users" DROP COLUMN IF EXISTS "encryption_key";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "encryption_salt" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "encryption_verifier" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_data_encrypted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "balance" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "amount" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "is_encrypted";--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "amount" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ALTER COLUMN "amount" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "debts" ALTER COLUMN "amount" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "debts" ALTER COLUMN "remaining_amount" SET DATA TYPE text;
