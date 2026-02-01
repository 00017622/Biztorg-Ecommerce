DROP INDEX "category_attribute_value_unique";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "price" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "category_attribute_values" ADD COLUMN "attribute_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_urgent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "contact_name" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "contact_phone" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "enable_telegram" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "category_attribute_values" ADD CONSTRAINT "category_attribute_values_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "category_attribute_value_unique" ON "category_attribute_values" USING btree ("category_id","attribute_id","attribute_value_id");--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "show_number";