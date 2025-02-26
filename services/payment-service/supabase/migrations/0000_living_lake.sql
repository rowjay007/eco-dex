CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"details" jsonb NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid,
	"amount" numeric NOT NULL,
	"reason" varchar(255) NOT NULL,
	"status" varchar(20) NOT NULL,
	"provider_refund_id" varchar(255),
	"metadata" jsonb,
	"error_details" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"payment_method_id" uuid,
	"amount" numeric NOT NULL,
	"currency" varchar(3) DEFAULT 'NGN' NOT NULL,
	"status" varchar(20) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_transaction_id" varchar(255),
	"provider_reference" varchar(255),
	"metadata" jsonb,
	"error_details" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;