ALTER TABLE "posts" ADD COLUMN "author_id" text REFERENCES "users"("id") ON DELETE SET NULL;
ALTER TABLE "posts" DROP COLUMN "author";
