CREATE TABLE "attribute_attribute_values" (
	"attribute_id" uuid NOT NULL,
	"attribute_value_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "category_attributes" (
	"category_id" uuid NOT NULL,
	"attribute_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "attribute_values" DROP CONSTRAINT "attribute_values_attribute_id_attributes_id_fk";
--> statement-breakpoint
ALTER TABLE "attributes" DROP CONSTRAINT "attributes_category_id_categories_id_fk";
--> statement-breakpoint
DROP INDEX "attribute_slug_unique";--> statement-breakpoint
DROP INDEX "category_slug_unique";--> statement-breakpoint
ALTER TABLE "attribute_attribute_values" ADD CONSTRAINT "attribute_attribute_values_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attribute_attribute_values" ADD CONSTRAINT "attribute_attribute_values_attribute_value_id_attribute_values_id_fk" FOREIGN KEY ("attribute_value_id") REFERENCES "public"."attribute_values"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "attribute_value_unique" ON "attribute_attribute_values" USING btree ("attribute_id","attribute_value_id");--> statement-breakpoint
CREATE UNIQUE INDEX "category_attribute_unique" ON "category_attributes" USING btree ("category_id","attribute_id");--> statement-breakpoint
CREATE UNIQUE INDEX "attribute_values_slug_unique" ON "attribute_values" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "attributes_slug_unique" ON "attributes" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "attribute_values" DROP COLUMN "attribute_id";--> statement-breakpoint
ALTER TABLE "attributes" DROP COLUMN "category_id";