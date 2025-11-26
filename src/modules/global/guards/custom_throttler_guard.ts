import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { createHash } from 'crypto';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * The default throttler guard uses the IP address to track requests.
   * We override it to use the JWT token to track requests.
   * We have to do performance test to see if we should parse the jwt and use the user.id
   */
  public override async getTracker(req: Record<string, any>) {
    const jwt = req.headers?.['authorization']?.split(' ')[1];

    if (jwt) return `jwt:${jwt}`;

    const ip_from_ips = Array.isArray(req.ips) && req.ips[0];
    const forwarded_ip = ip_from_ips || req.headers?.['x-forwarded-for'];
    const ip = forwarded_ip ?? req.ip ?? req.socket?.remoteAddress ?? 'unknown';

    return `ip:${ip}`;
  }

  /**
   * Generates a path key to be stored in Redis.
   * We generate it manually because the default throttler does not suffix by "throttler"
   * So the redis will be hard to clean up and maintain.
   */
  generateKey(context: ExecutionContext, suffix: string, name: string): string {
    const hashed_suffix = createHash('sha256').update(suffix).digest('hex');

    return `throttler:${hashed_suffix}:${name}`;
  }
}
