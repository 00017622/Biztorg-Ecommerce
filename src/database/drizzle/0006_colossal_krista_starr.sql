CREATE TABLE "shop_ratings" (
	"user_id" uuid NOT NULL,
	"shop_profile_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "message" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_profiles" ALTER COLUMN "is_online" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_profiles" ALTER COLUMN "verified" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_profiles" ALTER COLUMN "rating" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_profiles" ALTER COLUMN "subscribers" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_profiles" ALTER COLUMN "total_reviews" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_profiles" ALTER COLUMN "views" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "image_url" varchar(255);--> statement-breakpoint
ALTER TABLE "shop_ratings" ADD CONSTRAINT "shop_ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_ratings" ADD CONSTRAINT "shop_ratings_shop_profile_id_shop_profiles_id_fk" FOREIGN KEY ("shop_profile_id") REFERENCES "public"."shop_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_shop_rating" ON "shop_ratings" USING btree ("user_id","shop_profile_id");