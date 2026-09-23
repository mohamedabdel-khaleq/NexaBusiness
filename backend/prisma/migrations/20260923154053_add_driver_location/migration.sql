-- AlterTable
ALTER TABLE "DeliveryDriver" ADD COLUMN     "latitude" DECIMAL(10,7),
ADD COLUMN     "locationUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "longitude" DECIMAL(10,7);
