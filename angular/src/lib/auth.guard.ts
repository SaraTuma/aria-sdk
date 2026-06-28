import { inject } from "@angular/core";
import type { CanActivateFn } from "@angular/router";
import { filter, map, take } from "rxjs/operators";
import { AuthService } from "./auth.service";

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  return auth.status$.pipe(
    filter((s) => s !== "checking"),
    take(1),
    map((s) => {
      if (s === "authorized") return true;
      auth.login();
      return false;
    })
  );
};
