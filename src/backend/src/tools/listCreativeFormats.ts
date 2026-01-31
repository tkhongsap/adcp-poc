import { getCreativeFormats } from '../data/loader.js';
import type { CreativeFormat, CreativeFormatSpecs } from '../types/data.js';

/**
 * Input parameters for the list_creative_formats tool
 */
export interface ListCreativeFormatsInput {
  type?: 'display' | 'video' | 'native' | 'audio';
}

/**
 * Output format for a single creative format
 */
export interface CreativeFormatOutput {
  format_id: string;
  name: string;
  type: 'display' | 'video' | 'native' | 'audio';
  dimensions?: string;
  specs: CreativeFormatSpecs;
}

/**
 * Tool result wrapper
 */
export interface ListCreativeFormatsResult {
  success: boolean;
  formats: CreativeFormatOutput[];
  count: number;
  filters_applied: {
    type?: string;
  };
}

/**
 * Transform a CreativeFormat to the tool output format
 */
function transformFormat(format: CreativeFormat): CreativeFormatOutput {
  return {
    format_id: format.format_id,
    name: format.name,
    type: format.type,
    dimensions: format.dimensions,
    specs: format.specs,
  };
}

/**
 * list_creative_formats tool implementation
 *
 * Gets available ad format specifications with optional filtering by type.
 *
 * @param input - Optional type filter (display, video, native, audio)
 * @returns Array of creative formats with their details and specifications
 */
export function listCreativeFormats(input?: ListCreativeFormatsInput): ListCreativeFormatsResult {
  const formats = getCreativeFormats({
    type: input?.type,
  });

  const transformedFormats = formats.map(transformFormat);

  return {
    success: true,
    formats: transformedFormats,
    count: transformedFormats.length,
    filters_applied: {
      type: input?.type,
    },
  };
}
