// src/common/services/hashing.service.ts
import { Global, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Global()
@Injectable()
export class HashingService {
  private readonly SALT_ROUNDS = 10;

  async hash(data: string): Promise<string> {
    return await bcrypt.hash(data, this.SALT_ROUNDS);
  }

  async compare(data: string, encrypted: string): Promise<boolean> {
    return await bcrypt.compare(data, encrypted);
  }
}