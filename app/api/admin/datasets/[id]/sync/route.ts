import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { prisma } from "@/lib/db/prisma";
import { createDatasetAdapter } from "@/lib/government-data/adapters";
import type { DatasetAdapterFixture } from "@/lib/government-data/evidence-types";

const schema = z.object({ correlationId: z.string().trim().min(1) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["admin"]);
    const { id } = await params;
    const { correlationId } = schema.parse(await request.json());
    const dataset = await prisma.governmentDataset.findUnique({
      where: { datasetId: id },
      include: { snapshots: { orderBy: { snapshotVersion: "desc" } } }
    });
    if (!dataset) return NextResponse.json({ error: "Dataset not found." }, { status: 404 });
    const adapter = createDatasetAdapter(id);
    const existingSnapshots = dataset.snapshots.map((snapshot) => ({
      id: snapshot.id,
      datasetId: snapshot.datasetId,
      snapshotVersion: snapshot.snapshotVersion,
      schemaVersion: snapshot.schemaVersion,
      verificationState: snapshot.verificationState,
      retrievedAt: snapshot.retrievedAt,
      recordCount: snapshot.recordCount,
      contentHash: snapshot.contentHash,
      normalizedRows: snapshot.normalizedData as Record<string, string | number | boolean | null>[],
      provenance: snapshot.sourceMetadata as DatasetAdapterFixture["provenance"],
      isLastSuccessful: snapshot.isLastSuccessful
    }));
    const startedAt = new Date();
    const result = await adapter.import({ existingSnapshots, now: startedAt, correlationId });

    await prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: { actorId: user.id, actorRole: user.role, entityType: "government_dataset", entityId: id, action: "dataset_sync_started", changes: { adapterKey: adapter.key } as Prisma.InputJsonValue, correlationId }
      });
      if (result.status === "SUCCEEDED" && result.snapshot) {
        await tx.governmentDatasetSnapshot.updateMany({ where: { datasetId: id, isLastSuccessful: true }, data: { isLastSuccessful: false } });
        const snapshot = await tx.governmentDatasetSnapshot.create({
          data: {
            id: result.snapshot.id,
            datasetId: id,
            snapshotVersion: result.snapshot.snapshotVersion,
            schemaVersion: result.snapshot.schemaVersion,
            verificationState: result.snapshot.verificationState,
            retrievedAt: result.snapshot.retrievedAt,
            recordCount: result.snapshot.recordCount,
            contentHash: result.snapshot.contentHash,
            normalizedData: result.snapshot.normalizedRows as Prisma.InputJsonValue,
            sourceMetadata: result.snapshot.provenance as Prisma.InputJsonValue,
            isLastSuccessful: true
          }
        });
        await tx.governmentDataset.update({ where: { datasetId: id }, data: { retrievalStatus: "SUCCESS", validationStatus: "PASSED", lastSyncedAt: startedAt, lastSuccessfulSyncedAt: startedAt, lastSyncAttemptedAt: startedAt, lastSyncError: null, failureMessage: null } });
        await tx.governmentDatasetSyncRun.create({ data: { datasetId: id, snapshotId: snapshot.id, adapterKey: adapter.key, status: "SUCCEEDED", correlationId, startedAt, completedAt: new Date(), previewCount: result.preview.recordCount, importedCount: result.preview.recordCount, previousSnapshotId: result.preservedSnapshot?.id } });
        await tx.auditLog.create({ data: { actorId: user.id, actorRole: user.role, entityType: "government_dataset_snapshot", entityId: snapshot.id, action: "dataset_snapshot_created", newState: { contentHash: snapshot.contentHash, recordCount: snapshot.recordCount } as Prisma.InputJsonValue, correlationId } });
        await tx.auditLog.create({ data: { actorId: user.id, actorRole: user.role, entityType: "government_dataset", entityId: id, action: "dataset_sync_succeeded", toStatus: "SUCCESS", changes: { snapshotId: snapshot.id } as Prisma.InputJsonValue, correlationId } });
      } else if (result.status === "SKIPPED_DUPLICATE") {
        await tx.governmentDataset.update({ where: { datasetId: id }, data: { lastSyncAttemptedAt: startedAt, lastSyncError: null, failureMessage: null } });
        await tx.governmentDatasetSyncRun.create({ data: { datasetId: id, snapshotId: result.snapshot?.id, adapterKey: adapter.key, status: "SKIPPED", correlationId, startedAt, completedAt: new Date(), previewCount: result.preview.recordCount, duplicateCount: 1, previousSnapshotId: result.preservedSnapshot?.id } });
        await tx.auditLog.create({ data: { actorId: user.id, actorRole: user.role, entityType: "government_dataset", entityId: id, action: "dataset_sync_skipped_duplicate", fromStatus: dataset.retrievalStatus, toStatus: dataset.retrievalStatus, changes: { preservedSnapshotId: result.preservedSnapshot?.id, contentHash: result.snapshot?.contentHash } as Prisma.InputJsonValue, correlationId } });
      } else {
        await tx.governmentDataset.update({ where: { datasetId: id }, data: { retrievalStatus: "FAILED", lastSyncAttemptedAt: startedAt, lastSyncError: result.failureMessage, failureMessage: result.failureMessage } });
        await tx.governmentDatasetSyncRun.create({ data: { datasetId: id, adapterKey: adapter.key, status: "FAILED", correlationId, startedAt, completedAt: new Date(), previewCount: result.preview.recordCount, failureMessage: result.failureMessage, previousSnapshotId: result.preservedSnapshot?.id } });
        await tx.auditLog.create({ data: { actorId: user.id, actorRole: user.role, entityType: "government_dataset", entityId: id, action: "dataset_sync_failed", fromStatus: dataset.retrievalStatus, toStatus: "FAILED", changes: { preservedSnapshotId: result.preservedSnapshot?.id } as Prisma.InputJsonValue, reason: result.failureMessage, correlationId } });
      }
    });
    return NextResponse.json({ status: result.status, preservedSnapshotId: result.preservedSnapshot?.id, snapshotId: result.snapshot?.id, flags: result.validationFlags });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to synchronize dataset." }, { status: 400 });
  }
}
