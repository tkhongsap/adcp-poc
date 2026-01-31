import {
  getMediaBuyById,
  updateMediaBuy as updateMediaBuyData,
  getDeliveryMetrics,
  updateDeliveryMetrics,
} from '../data/loader.js';
import type { MediaBuy, DeliveryMetrics, TargetingOverlay } from '../types/data.js';

/**
 * Update operations for remove_geo
 */
export interface RemoveGeoOperation {
  countries: string[];
}

/**
 * Update operations for add_geo
 */
export interface AddGeoOperation {
  countries: string[];
}

/**
 * Update operations for adjust_bid
 */
export interface AdjustBidOperation {
  device: string;
  change_percent: number;
}

/**
 * Update operations for set_daily_cap
 */
export interface SetDailyCapOperation {
  amount: number;
}

/**
 * Update operations for shift_budget
 */
export interface ShiftBudgetOperation {
  from_audience?: string;
  to_audience?: string;
  from_device?: string;
  to_device?: string;
  percent: number;
}

/**
 * All possible update operations
 */
export interface MediaBuyUpdates {
  remove_geo?: RemoveGeoOperation;
  add_geo?: AddGeoOperation;
  adjust_bid?: AdjustBidOperation;
  set_daily_cap?: SetDailyCapOperation;
  shift_budget?: ShiftBudgetOperation;
}

/**
 * Input parameters for the update_media_buy tool
 */
export interface UpdateMediaBuyInput {
  media_buy_id: string;
  updates: MediaBuyUpdates;
}

/**
 * Details of a single change applied
 */
export interface ChangeApplied {
  operation: string;
  details: string;
  previous_value?: string | number | string[];
  new_value?: string | number | string[];
}

/**
 * Output format for the update_media_buy tool
 */
export interface UpdateMediaBuyOutput {
  media_buy_id: string;
  success: boolean;
  changes_applied: ChangeApplied[];
  estimated_impact: {
    budget_change?: number;
    reach_change_percent?: number;
    efficiency_improvement?: string;
    description: string;
  };
}

/**
 * Tool result wrapper
 */
export interface UpdateMediaBuyResult {
  success: boolean;
  result: UpdateMediaBuyOutput | null;
  error?: string;
}

/**
 * Apply remove_geo operation to media buy
 */
function applyRemoveGeo(
  mediaBuy: MediaBuy,
  metrics: DeliveryMetrics,
  operation: RemoveGeoOperation
): ChangeApplied | null {
  const countriesToRemove = operation.countries.map(c => c.toUpperCase());
  const changes: ChangeApplied = {
    operation: 'remove_geo',
    details: `Removed countries: ${countriesToRemove.join(', ')}`,
    previous_value: [],
    new_value: [],
  };

  let anyRemoved = false;

  // Update targeting in each package
  for (const pkg of mediaBuy.packages) {
    const targeting = pkg.targeting_overlay;
    if (targeting.geo_country_any_of) {
      const previousGeos = [...targeting.geo_country_any_of];
      const newGeos = previousGeos.filter(geo => !countriesToRemove.includes(geo.toUpperCase()));

      if (newGeos.length !== previousGeos.length) {
        changes.previous_value = previousGeos;
        targeting.geo_country_any_of = newGeos;
        changes.new_value = newGeos;
        anyRemoved = true;
      }
    }
  }

  // Update metrics by_geo - remove the geo data
  for (const country of countriesToRemove) {
    if (metrics.by_geo[country]) {
      delete metrics.by_geo[country];
    }
  }

  return anyRemoved ? changes : null;
}

/**
 * Apply add_geo operation to media buy
 */
function applyAddGeo(
  mediaBuy: MediaBuy,
  operation: AddGeoOperation
): ChangeApplied | null {
  const countriesToAdd = operation.countries.map(c => c.toUpperCase());
  const changes: ChangeApplied = {
    operation: 'add_geo',
    details: `Added countries: ${countriesToAdd.join(', ')}`,
    previous_value: [],
    new_value: [],
  };

  let anyAdded = false;

  // Update targeting in each package
  for (const pkg of mediaBuy.packages) {
    const targeting = pkg.targeting_overlay;
    if (!targeting.geo_country_any_of) {
      targeting.geo_country_any_of = [];
    }

    const previousGeos = [...targeting.geo_country_any_of];
    const newGeos = [...new Set([...previousGeos, ...countriesToAdd])];

    if (newGeos.length !== previousGeos.length) {
      changes.previous_value = previousGeos;
      targeting.geo_country_any_of = newGeos;
      changes.new_value = newGeos;
      anyAdded = true;
    }
  }

  return anyAdded ? changes : null;
}

/**
 * Apply adjust_bid operation
 */
function applyAdjustBid(
  metrics: DeliveryMetrics,
  operation: AdjustBidOperation
): ChangeApplied | null {
  const device = operation.device.toLowerCase();
  const bidKey = `${device}_cpm`;

  // Check if we have current bids for this device
  const currentBid = metrics.current_bids[bidKey];

  if (currentBid === undefined) {
    // Try to find any bid key containing the device name
    const matchingKey = Object.keys(metrics.current_bids).find(k =>
      k.toLowerCase().includes(device)
    );

    if (!matchingKey) {
      return null;
    }

    const oldBid = metrics.current_bids[matchingKey];
    const change = oldBid * (operation.change_percent / 100);
    const newBid = Math.round((oldBid + change) * 100) / 100;

    metrics.current_bids[matchingKey] = newBid;

    return {
      operation: 'adjust_bid',
      details: `Adjusted ${matchingKey} by ${operation.change_percent}%`,
      previous_value: oldBid,
      new_value: newBid,
    };
  }

  const oldBid = currentBid;
  const change = oldBid * (operation.change_percent / 100);
  const newBid = Math.round((oldBid + change) * 100) / 100;

  metrics.current_bids[bidKey] = newBid;

  return {
    operation: 'adjust_bid',
    details: `Adjusted ${device} bid by ${operation.change_percent}%`,
    previous_value: oldBid,
    new_value: newBid,
  };
}

/**
 * Apply set_daily_cap operation
 */
function applySetDailyCap(
  metrics: DeliveryMetrics,
  operation: SetDailyCapOperation
): ChangeApplied {
  // Store daily cap in current_bids for simplicity
  const previousCap = metrics.current_bids['daily_cap'];
  metrics.current_bids['daily_cap'] = operation.amount;

  return {
    operation: 'set_daily_cap',
    details: `Set daily budget cap to $${operation.amount}`,
    previous_value: previousCap ?? 'unlimited',
    new_value: operation.amount,
  };
}

/**
 * Apply shift_budget operation
 */
function applyShiftBudget(
  mediaBuy: MediaBuy,
  metrics: DeliveryMetrics,
  operation: ShiftBudgetOperation
): ChangeApplied {
  const details: string[] = [];

  if (operation.from_device && operation.to_device) {
    details.push(
      `Shifted ${operation.percent}% budget from ${operation.from_device} to ${operation.to_device}`
    );

    // Adjust device-based metrics if they exist
    const fromDevice = operation.from_device.toLowerCase();
    const toDevice = operation.to_device.toLowerCase();

    if (metrics.by_device[fromDevice] && metrics.by_device[toDevice]) {
      const shiftAmount = metrics.by_device[fromDevice].spend * (operation.percent / 100);
      metrics.by_device[fromDevice].spend -= shiftAmount;
      metrics.by_device[toDevice].spend += shiftAmount;
    }
  }

  if (operation.from_audience && operation.to_audience) {
    details.push(
      `Shifted ${operation.percent}% allocation from ${operation.from_audience} to ${operation.to_audience}`
    );

    // Update targeting overlays if audience segments exist
    for (const pkg of mediaBuy.packages) {
      const targeting = pkg.targeting_overlay as TargetingOverlay;
      // Look for any audience-related targeting
      if (targeting.sports_interest && Array.isArray(targeting.sports_interest)) {
        const fromIdx = targeting.sports_interest.findIndex(
          s => s.toLowerCase() === operation.from_audience?.toLowerCase()
        );
        const toIdx = targeting.sports_interest.findIndex(
          s => s.toLowerCase() === operation.to_audience?.toLowerCase()
        );

        // If to_audience not present, add it
        if (toIdx === -1 && operation.to_audience) {
          targeting.sports_interest.push(operation.to_audience);
        }
      }
    }
  }

  return {
    operation: 'shift_budget',
    details: details.join('; ') || `Shifted ${operation.percent}% of budget`,
    previous_value: 'original allocation',
    new_value: `${operation.percent}% shifted`,
  };
}

/**
 * Calculate estimated impact of changes
 */
function calculateEstimatedImpact(
  mediaBuy: MediaBuy,
  metrics: DeliveryMetrics,
  changesApplied: ChangeApplied[]
): UpdateMediaBuyOutput['estimated_impact'] {
  const descriptions: string[] = [];
  let budgetChange = 0;
  let reachChangePercent = 0;
  let efficiencyImprovement = '';

  for (const change of changesApplied) {
    switch (change.operation) {
      case 'remove_geo': {
        const removedCountries = change.new_value as string[];
        const previousCountries = change.previous_value as string[];
        const removedCount = previousCountries.length - removedCountries.length;
        reachChangePercent -= removedCount * 10; // Rough estimate: -10% per country
        descriptions.push(`Reach reduced by removing geo targets`);
        break;
      }
      case 'add_geo': {
        const addedCount = (change.new_value as string[]).length - (change.previous_value as string[]).length;
        reachChangePercent += addedCount * 8; // Rough estimate: +8% per country
        descriptions.push(`Reach expanded to new markets`);
        break;
      }
      case 'adjust_bid': {
        const oldBid = change.previous_value as number;
        const newBid = change.new_value as number;
        const bidChange = newBid - oldBid;

        if (bidChange < 0) {
          efficiencyImprovement = `CPM reduced by $${Math.abs(bidChange).toFixed(2)}`;
          descriptions.push(`Bid efficiency improved`);
        } else {
          descriptions.push(`Bid competitiveness increased`);
        }
        break;
      }
      case 'set_daily_cap': {
        const cap = change.new_value as number;
        budgetChange = -Math.max(0, (metrics.total_spend / 30) - cap) * 30; // Rough monthly impact
        descriptions.push(`Daily spend capped at $${cap}`);
        break;
      }
      case 'shift_budget':
        descriptions.push(`Budget allocation optimized`);
        efficiencyImprovement = efficiencyImprovement || 'Improved targeting efficiency expected';
        break;
    }
  }

  return {
    budget_change: budgetChange !== 0 ? budgetChange : undefined,
    reach_change_percent: reachChangePercent !== 0 ? reachChangePercent : undefined,
    efficiency_improvement: efficiencyImprovement || undefined,
    description: descriptions.join('. ') || 'Changes applied successfully',
  };
}

/**
 * update_media_buy tool implementation
 *
 * Updates an existing media buy with various optimization operations.
 *
 * @param input - Media buy ID and updates object containing operations
 * @returns Success status, changes applied, and estimated impact
 */
export function updateMediaBuy(input: UpdateMediaBuyInput): UpdateMediaBuyResult {
  // Validate required fields
  if (!input.media_buy_id) {
    return {
      success: false,
      result: null,
      error: 'Missing required field: media_buy_id',
    };
  }

  if (!input.updates || Object.keys(input.updates).length === 0) {
    return {
      success: false,
      result: null,
      error: 'Missing required field: updates object with at least one operation',
    };
  }

  // Get the media buy
  const mediaBuy = getMediaBuyById(input.media_buy_id);
  if (!mediaBuy) {
    return {
      success: false,
      result: null,
      error: `Media buy not found: ${input.media_buy_id}`,
    };
  }

  // Get delivery metrics
  const metricsResult = getDeliveryMetrics(input.media_buy_id);
  if (!metricsResult || Array.isArray(metricsResult)) {
    return {
      success: false,
      result: null,
      error: `Delivery metrics not found for: ${input.media_buy_id}`,
    };
  }

  const metrics = metricsResult;
  const changesApplied: ChangeApplied[] = [];

  // Apply each update operation
  if (input.updates.remove_geo) {
    const change = applyRemoveGeo(mediaBuy, metrics, input.updates.remove_geo);
    if (change) {
      changesApplied.push(change);
    }
  }

  if (input.updates.add_geo) {
    const change = applyAddGeo(mediaBuy, input.updates.add_geo);
    if (change) {
      changesApplied.push(change);
    }
  }

  if (input.updates.adjust_bid) {
    const change = applyAdjustBid(metrics, input.updates.adjust_bid);
    if (change) {
      changesApplied.push(change);
    }
  }

  if (input.updates.set_daily_cap) {
    const change = applySetDailyCap(metrics, input.updates.set_daily_cap);
    changesApplied.push(change);
  }

  if (input.updates.shift_budget) {
    const change = applyShiftBudget(mediaBuy, metrics, input.updates.shift_budget);
    changesApplied.push(change);
  }

  // Persist changes to in-memory state
  updateMediaBuyData(input.media_buy_id, mediaBuy);
  updateDeliveryMetrics(input.media_buy_id, metrics);

  // Calculate estimated impact
  const estimatedImpact = calculateEstimatedImpact(mediaBuy, metrics, changesApplied);

  return {
    success: true,
    result: {
      media_buy_id: input.media_buy_id,
      success: changesApplied.length > 0,
      changes_applied: changesApplied,
      estimated_impact: estimatedImpact,
    },
  };
}
