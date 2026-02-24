/*
  Warnings:

  - The `split_method` column on the `expenses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `preferred_currency` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'GBP', 'RSD', 'JPY', 'CAD', 'AUD', 'CHF');

-- CreateEnum
CREATE TYPE "SplitMethod" AS ENUM ('EQUAL', 'PERCENTAGE', 'EXACT');

-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "split_method",
ADD COLUMN     "split_method" "SplitMethod" NOT NULL DEFAULT 'EQUAL';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "preferred_currency",
ADD COLUMN     "preferred_currency" "Currency" NOT NULL DEFAULT 'USD';
