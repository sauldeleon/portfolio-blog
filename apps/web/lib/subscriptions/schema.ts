import { z } from 'zod'

/**
 * Fields a subscriber (via their token link) or an admin can change.
 * Shared by the public manage form, the admin edit modal and both APIs.
 */
export const subscriptionNameSchema = z.string().trim().min(1).max(100)
export const subscriptionLocaleSchema = z.enum(['en', 'es'])

export const subscriptionDetailsSchema = z.object({
  name: subscriptionNameSchema,
  locale: subscriptionLocaleSchema,
})

export type SubscriptionDetails = z.infer<typeof subscriptionDetailsSchema>
