import { SetMetadata } from '@nestjs/common';

export type HierarchyEntity = 'user' | 'role';
export const CHECK_HIERARCHY_KEY = 'checkHierarchy';

export const CheckHierarchy = (entity: HierarchyEntity) => 
  SetMetadata(CHECK_HIERARCHY_KEY, entity);