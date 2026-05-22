ALTER TABLE "users" RENAME COLUMN "username" TO "email";

ALTER TABLE "users" DROP CONSTRAINT "users_username_unique";

ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");
