import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Save data to storage
   * @param key Storage key
   * @param value Data to store
   */
  setItem(key: string, value: any): void {
    if (this.isBrowser) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  /**
   * Get data from storage
   * @param key Storage key
   * @returns The stored data or null if not found
   */
  getItem(key: string): any {
    if (this.isBrowser) {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          return JSON.parse(item);
        } catch (e) {
          return item;
        }
      }
      return null;
    }
    return null;
  }

  /**
   * Remove item from storage
   * @param key Storage key
   */
  removeItem(key: string): void {
    if (this.isBrowser) {
      localStorage.removeItem(key);
    }
  }

  /**
   * Clear all storage
   */
  clear(): void {
    if (this.isBrowser) {
      localStorage.clear();
    }
  }
}