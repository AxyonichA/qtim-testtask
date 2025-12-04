import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { Role, ROLES_KEY } from '../decorators/roles.decorator'
import { RequestWithUser } from '../decorators/current-user.decorator'


export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if(!requiredRoles || requiredRoles.length === 0) return true

    const request = context.switchToHttp().getRequest<RequestWithUser>()

    const user = request.user
    
    if (!user || !user.roles) {
      throw new ForbiddenException('No roles information in token');
    }

    const hasRole = user.roles.some((role) =>
      requiredRoles.includes(role),
    );

    if (!hasRole) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
} 