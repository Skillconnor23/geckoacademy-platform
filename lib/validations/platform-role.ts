import { z } from 'zod';
import { platformRoleEnum } from '@/lib/db/schema';

export const platformRoleSchema = z.enum(platformRoleEnum);

export type PlatformRoleInput = z.infer<typeof platformRoleSchema>;
