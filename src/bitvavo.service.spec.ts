import { TestBed } from '@angular/core/testing';

import { BitvavoService } from './bitvavo.service';

describe('BitvavoService', () => {
  let service: BitvavoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BitvavoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
