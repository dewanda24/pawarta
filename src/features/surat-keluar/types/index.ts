import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import * as schemas from '@/db/schema';

type OmitAudit<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'createdBy' | 'updatedBy'>;

export type OutgoingLetter = InferSelectModel<typeof schemas.outgoingLetters>;
export type InsertOutgoingLetter = OmitAudit<InferInsertModel<typeof schemas.outgoingLetters>>;
