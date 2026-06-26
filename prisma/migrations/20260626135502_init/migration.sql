-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "lastSeen" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorLog" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION,
    "flameDetected" BOOLEAN NOT NULL DEFAULT false,
    "gasLevel" DOUBLE PRECISION,
    "statusLevel" TEXT NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "smokePercent" DOUBLE PRECISION,
    "flameAO" INTEGER,
    "calibrationOffset" DOUBLE PRECISION,
    "rackUnit" TEXT,
    "firmwareVersion" TEXT,
    "dataSource" TEXT NOT NULL DEFAULT 'device',

    CONSTRAINT "SensorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'warning',
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sensorValue" DOUBLE PRECISION,
    "thresholdValue" DOUBLE PRECISION,
    "calibrationOffset" DOUBLE PRECISION,
    "rackUnit" TEXT,
    "sensorType" TEXT,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_deviceId_key" ON "Device"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_apiKey_key" ON "Device"("apiKey");

-- CreateIndex
CREATE INDEX "Device_status_idx" ON "Device"("status");

-- CreateIndex
CREATE INDEX "Device_lastSeen_idx" ON "Device"("lastSeen");

-- CreateIndex
CREATE INDEX "SensorLog_deviceId_idx" ON "SensorLog"("deviceId");

-- CreateIndex
CREATE INDEX "SensorLog_createdAt_idx" ON "SensorLog"("createdAt");

-- CreateIndex
CREATE INDEX "SensorLog_statusLevel_idx" ON "SensorLog"("statusLevel");

-- CreateIndex
CREATE INDEX "SensorLog_rackUnit_idx" ON "SensorLog"("rackUnit");

-- CreateIndex
CREATE INDEX "Alert_deviceId_idx" ON "Alert"("deviceId");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE INDEX "Alert_resolved_idx" ON "Alert"("resolved");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE INDEX "Alert_rackUnit_idx" ON "Alert"("rackUnit");

-- CreateIndex
CREATE INDEX "Alert_sensorType_idx" ON "Alert"("sensorType");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_key_key" ON "SystemSettings"("key");

-- CreateIndex
CREATE INDEX "SystemSettings_key_idx" ON "SystemSettings"("key");

-- AddForeignKey
ALTER TABLE "SensorLog" ADD CONSTRAINT "SensorLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
