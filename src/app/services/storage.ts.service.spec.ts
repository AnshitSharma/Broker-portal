import { TestBed } from '@angular/core/testing';

import { StorageTsService } from './storage.ts.service';

describe('StorageTsService', () => {
  let service: StorageTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
