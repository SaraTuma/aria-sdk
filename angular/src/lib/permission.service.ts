import { Injectable, Inject } from "@angular/core";
import { BehaviorSubject, filter, firstValueFrom } from "rxjs";
import { getPkContaFromToken } from "@aria-iam/core";
import { ARIA_IAM_CONFIG, AriaIamConfig } from "./aria-iam.config";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: "root" })
export class PermissionService {
  private allowedSubject = new BehaviorSubject<number[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  // emits true once the first load() call finishes — guards must not act before this
  private readySubject = new BehaviorSubject<boolean>(false);

  allowed$ = this.allowedSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  ready$ = this.readySubject.asObservable();

  constructor(
    @Inject(ARIA_IAM_CONFIG) private config: AriaIamConfig,
    private auth: AuthService
  ) {}

  private loadPromise: Promise<void> | null = null;

  async load(
    appId: number,
    fetchPermissions: (pkConta: number, appId: number) => Promise<number[]>
  ): Promise<void> {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      await firstValueFrom(
        this.auth.status$.pipe(filter((s) => s !== "checking"))
      );

      const pkConta =
        getPkContaFromToken(this.config.tokenNamespace) ??
        (this.auth.user as { conta?: { pkConta?: number } } | null)?.conta?.pkConta ??
        null;

      if (!pkConta) { this.loadPromise = null; return; }

      this.loadingSubject.next(true);
      try {
        this.allowedSubject.next(await fetchPermissions(pkConta, appId));
      } finally {
        this.loadingSubject.next(false);
        this.readySubject.next(true);
      }
    })();
    return this.loadPromise;
  }

  can(pkFuncionalidade: number): boolean {
    return this.allowedSubject.value.includes(pkFuncionalidade);
  }
}
