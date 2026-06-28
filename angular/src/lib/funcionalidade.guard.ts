import { inject } from "@angular/core";
import type { CanActivateFn } from "@angular/router";
import { PermissionService } from "./permission.service";
import { AuthService } from "./auth.service";
import { filter, map, take } from "rxjs/operators";

export function funcionalidadeGuard(pkFuncionalidade: number): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const permissions = inject(PermissionService);

    return auth.status$.pipe(
      filter((s) => s !== "checking"),
      take(1),
      map((s) => {
        if (s !== "authorized") {
          auth.login();
          return false;
        }
        if (!permissions.can(pkFuncionalidade)) {
          return false;
        }
        return true;
      })
    );
  };
}
