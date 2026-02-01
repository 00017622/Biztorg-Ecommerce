ALTER TABLE "subcategories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "subcategories" CASCADE;--> statement-breakpoint
ALTER TABLE "attributes" RENAME COLUMN "subcategory_id" TO "category_id";--> statement-breakpoint
ALTER TABLE "products" RENAME COLUMN "subcategory_id" TO "category_id";--> statement-breakpoint
ALTER TABLE "attributes" DROP CONSTRAINT "attributes_subcategory_id_subcategories_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_subcategory_id_subcategories_id_fk";
--> statement-breakpoint
DROP INDEX "subcategory_slug_unique";--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "image_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "category_slug_unique" ON "attributes" USING btree ("category_id","slug");