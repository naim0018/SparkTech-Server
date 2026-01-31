import { Request } from 'express';
import mongoose, { Model } from 'mongoose';

/**
 * Get a tenant-specific model from the request's database connection
 * @param req Express Request object with tenantDb attached
 * @param modelName Name of the model (e.g., 'User', 'Product')
 * @param schema Mongoose schema for the model
 * @returns Tenant-specific model instance
 */
export function getTenantModel<T>(
  req: Request,
  modelName: string,
  schema: mongoose.Schema<T>
): Model<T> {
  if (!req.tenantDb) {
    throw new Error('Tenant database not initialized. Make sure tenantResolver middleware is applied.');
  }

  // Check if model already exists in this connection
  if (req.tenantDb.models[modelName]) {
    return req.tenantDb.models[modelName] as Model<T>;
  }

  // Create and return new model for this tenant
  return req.tenantDb.model<T>(modelName, schema);
}
