import { inject } from "@angular/core";
import { Router, type CanActivateFn } from "@angular/router";
import { of } from "rxjs";
import { filter, map, switchMap, take } from "rxjs/operators";
import { PermissionService } from "./permission.service";
import { AuthService } from "./auth.service";

export function funcionalidadeGuard(
  pkFuncionalidade: number,
  redirectTo?: string
): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const permissions = inject(PermissionService);
    const router = inject(Router);

    return auth.status$.pipe(
      filter((s) => s !== "checking"),
      take(1),
      switchMap((s) => {
        if (s !== "authorized") {
          auth.login();
          return of(false);
        }

        // Wait until load() has been called and the first fetch completed.
        // Without this, can() always returns false because permissions
        // are loaded inside ngOnInit — which runs after the guard.
        return permissions.ready$.pipe(
          filter((isReady) => isReady),
          take(1),
          map(() => {
            if (permissions.can(pkFuncionalidade)) return true;
            return redirectTo ? router.createUrlTree([redirectTo]) : false;
          })
        );
      })
    );
  };
}
