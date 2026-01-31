import { getAuthorizedProperties } from '../data/loader.js';
import type { AuthorizedProperty } from '../types/data.js';

/**
 * Input parameters for the list_authorized_properties tool
 * This tool takes no parameters
 */
export interface ListAuthorizedPropertiesInput {
  // No parameters - returns all authorized properties
}

/**
 * Output format for a single authorized property
 */
export interface AuthorizedPropertyOutput {
  property_id: string;
  name: string;
  domain: string;
  category: string;
  monthly_uniques: number;
  authorization_level: 'standard' | 'premium' | 'exclusive';
  available_formats: string[];
  discount_percent?: number;
  audience_profile?: string;
  special_capabilities?: string[];
}

/**
 * Tool result wrapper
 */
export interface ListAuthorizedPropertiesResult {
  success: boolean;
  properties: AuthorizedPropertyOutput[];
  count: number;
}

/**
 * Transform an AuthorizedProperty to the tool output format
 */
function transformProperty(property: AuthorizedProperty): AuthorizedPropertyOutput {
  const output: AuthorizedPropertyOutput = {
    property_id: property.property_id,
    name: property.name,
    domain: property.domain,
    category: property.category,
    monthly_uniques: property.monthly_uniques,
    authorization_level: property.authorization_level,
    available_formats: property.available_formats,
  };

  // Include optional fields only if they exist
  if (property.discount_percent !== undefined) {
    output.discount_percent = property.discount_percent;
  }
  if (property.audience_profile !== undefined) {
    output.audience_profile = property.audience_profile;
  }
  if (property.special_capabilities !== undefined) {
    output.special_capabilities = property.special_capabilities;
  }

  return output;
}

/**
 * list_authorized_properties tool implementation
 *
 * Gets all accessible publisher properties with authorization details.
 * This tool takes no parameters and returns all authorized properties.
 *
 * @returns Array of authorized properties with their details
 */
export function listAuthorizedProperties(): ListAuthorizedPropertiesResult {
  const properties = getAuthorizedProperties();

  const transformedProperties = properties.map(transformProperty);

  return {
    success: true,
    properties: transformedProperties,
    count: transformedProperties.length,
  };
}
