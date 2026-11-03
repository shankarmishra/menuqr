import { useState, useEffect, useCallback } from 'react';
import { DESIGN_MANIFEST } from './manifest';
import type { DesignAssetSpec, AssetStatus, RevisionHistoryItem } from './manifest';

const STORAGE_KEY = 'menuqr_design_studio_manifest_v2';

export function getInitialAssets(): DesignAssetSpec[] {
  if (typeof window === 'undefined') return DESIGN_MANIFEST;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DESIGN_MANIFEST;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === DESIGN_MANIFEST.length) {
      // Merge with manifest so newly completed assets, sourceFiles, components, and statuses update seamlessly
      return DESIGN_MANIFEST.map((manifestItem) => {
        const cached = parsed.find((p: DesignAssetSpec) => p.id === manifestItem.id);
        if (!cached) return manifestItem;
        const status = (cached.status === 'NOT_STARTED' && manifestItem.status !== 'NOT_STARTED')
          ? manifestItem.status
          : cached.status;
        return {
          ...manifestItem,
          ...cached,
          status,
          sourceFile: manifestItem.sourceFile,
          componentName: manifestItem.componentName,
          creationMethod: manifestItem.creationMethod,
        };
      });
    }
    return DESIGN_MANIFEST;
  } catch {
    return DESIGN_MANIFEST;
  }
}

export function saveAssetsToStorage(assets: DesignAssetSpec[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  } catch (err) {
    console.error('Failed to save design studio manifest:', err);
  }
}

export interface StudioStats {
  totalPlanned: number;
  completedIllustrations: number;
  completedAnimations: number;
  readyForReview: number;
  approved: number;
  changesRequested: number;
  rejected: number;
  notStarted: number;
}

export function computeStudioStats(assets: DesignAssetSpec[]): StudioStats {
  let completedIllustrations = 0;
  let completedAnimations = 0;
  let readyForReview = 0;
  let approved = 0;
  let changesRequested = 0;
  let rejected = 0;
  let notStarted = 0;

  for (const asset of assets) {
    if (asset.type === 'illustration' && (asset.status === 'READY_FOR_REVIEW' || asset.status === 'APPROVED')) {
      completedIllustrations++;
    }
    if (asset.type === 'animation' && (asset.status === 'READY_FOR_REVIEW' || asset.status === 'APPROVED')) {
      completedAnimations++;
    }

    switch (asset.status) {
      case 'READY_FOR_REVIEW':
        readyForReview++;
        break;
      case 'APPROVED':
        approved++;
        break;
      case 'CHANGES_REQUESTED':
        changesRequested++;
        break;
      case 'REJECTED':
        rejected++;
        break;
      case 'NOT_STARTED':
      default:
        notStarted++;
        break;
    }
  }

  return {
    totalPlanned: assets.length,
    completedIllustrations,
    completedAnimations,
    readyForReview,
    approved,
    changesRequested,
    rejected,
    notStarted,
  };
}

export function useDesignStudioStore() {
  const [assets, setAssets] = useState<DesignAssetSpec[]>(getInitialAssets);

  useEffect(() => {
    saveAssetsToStorage(assets);
  }, [assets]);

  const updateAssetStatus = useCallback((id: string, status: AssetStatus, feedback?: string) => {
    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id !== id) return asset;

        const newRevision: RevisionHistoryItem = {
          id: `rev-${Date.now()}`,
          version: asset.version,
          timestamp: new Date().toISOString(),
          action:
            status === 'APPROVED'
              ? 'APPROVED'
              : status === 'REJECTED'
              ? 'REJECTED'
              : status === 'CHANGES_REQUESTED'
              ? 'CHANGES_REQUESTED'
              : 'UPDATED',
          feedback: feedback || (status === 'APPROVED' ? 'Approved by user review.' : undefined),
          author: 'Product Lead / Reviewer',
        };

        return {
          ...asset,
          status,
          lastModified: new Date().toISOString(),
          revisions: [newRevision, ...asset.revisions],
        };
      })
    );
  }, []);

  const requestRevision = useCallback((id: string, feedback: string) => {
    updateAssetStatus(id, 'CHANGES_REQUESTED', feedback);
  }, [updateAssetStatus]);

  const approveAsset = useCallback((id: string) => {
    updateAssetStatus(id, 'APPROVED');
  }, [updateAssetStatus]);

  const rejectAsset = useCallback((id: string, reason: string) => {
    updateAssetStatus(id, 'REJECTED', reason);
  }, [updateAssetStatus]);

  const resetAllToManifest = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setAssets(DESIGN_MANIFEST);
  }, []);

  const stats = computeStudioStats(assets);

  return {
    assets,
    stats,
    updateAssetStatus,
    requestRevision,
    approveAsset,
    rejectAsset,
    resetAllToManifest,
  };
}
