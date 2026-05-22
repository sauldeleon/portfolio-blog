UPDATE "users" SET "name" = "email" WHERE "name" IS NULL;
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_name_unique" UNIQUE("name");
