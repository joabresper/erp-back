import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesService } from "src/roles/roles.service";
import { UsersService } from "src/users/users.service";
import { CHECK_HIERARCHY_KEY, HierarchyEntity } from "../decorators/check-hierarchy.decorator";

@Injectable()
export class HierarchyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
    private rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const entityType = this.reflector.get<HierarchyEntity>(CHECK_HIERARCHY_KEY, context.getHandler());
    if (!entityType) return true;

    const { user, params, body } = context.switchToHttp().getRequest();
	const creatorLevel = Number(user.level);

    let targetLevel = 0;

	if (entityType === 'user') {
		if (body?.roleId !== undefined) {
			targetLevel = Number((await this.rolesService.findById(body.roleId)).level);
			if (params.id !== undefined) {
				const oldLevel = Number((await this.usersService.findByIdWithRole(params.id)).role.level);
				targetLevel = oldLevel > targetLevel ? oldLevel : targetLevel;
			}
		}
		else {
			targetLevel = Number((await this.usersService.findByIdWithRole(params.id)).role.level);
		}
	}

	if (entityType === 'role') {
		if (body?.level !== undefined) {
			targetLevel = Number(body.level);
			if (params.id !== undefined) {
				const oldLevel = Number((await this.rolesService.findById(params.id)).level);
				targetLevel = oldLevel > targetLevel ? oldLevel : targetLevel;
			}
		}
		else {
			targetLevel = Number((await this.rolesService.findById(params.id)).level);
		}
	}
    // VALIDACIÓN FINAL
    if (creatorLevel <= targetLevel) {
      throw new ForbiddenException(
        `You dont have sufficient hierarchy to perform this action.`
      );
    }

    return true;
  }
}