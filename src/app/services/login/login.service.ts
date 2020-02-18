import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private _isLoggedIn: boolean = false;
  private _userDetails = null;

  set user(user) {
    this._userDetails = user;
  }

  get user() {
    return this._userDetails || null;
  }

  get isLoggedIn() {
    return this._isLoggedIn;
  }

  set isLoggedIn(loggedIn) {
    this._isLoggedIn = loggedIn;
  }

  constructor() { }
}
