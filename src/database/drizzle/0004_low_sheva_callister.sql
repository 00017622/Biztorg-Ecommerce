ALTER TABLE "regions" DROP CONSTRAINT "regions_parent_id_regions_id_fk";
--> statement-breakpoint
ALTER TABLE "product_images" ALTER COLUMN "image_url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "regions" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "regions" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "temp_credentials" ADD CONSTRAINT "temp_credentials_email_unique" UNIQUE("email");