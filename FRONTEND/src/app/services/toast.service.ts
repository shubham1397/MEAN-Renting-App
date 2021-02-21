import { Injectable } from "@angular/core";
import { ToastConfig, Toaster, ToastType } from "ngx-toast-notifications";

@Injectable({
  providedIn: "root",
})
export class ToastService {

  constructor(private toaster: Toaster) {}

  showToast(type,text) {
    this.toaster.open({
      text: text,
      type: type,
    });
  }

}
