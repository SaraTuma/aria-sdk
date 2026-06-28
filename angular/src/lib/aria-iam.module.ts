import { NgModule } from "@angular/core";
import type { ModuleWithProviders } from "@angular/core";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { ARIA_IAM_CONFIG, AriaIamConfig } from "./aria-iam.config";
import { AuthInterceptor } from "./auth.interceptor";
import { CanPipe } from "./can.pipe";

@NgModule({
  imports: [CanPipe],
  exports: [CanPipe],
})
export class AriaIamModule {
  static forRoot(config: AriaIamConfig): ModuleWithProviders<AriaIamModule> {
    return {
      ngModule: AriaIamModule,
      providers: [
        { provide: ARIA_IAM_CONFIG, useValue: config },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
      ],
    };
  }
}
