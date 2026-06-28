import { Pipe, PipeTransform } from "@angular/core";
import { PermissionService } from "./permission.service";

@Pipe({ name: "can", pure: false, standalone: true })
export class CanPipe implements PipeTransform {
  constructor(private permissions: PermissionService) {}

  transform(pkFuncionalidade: number): boolean {
    return this.permissions.can(pkFuncionalidade);
  }
}
