import { Ratelimit } from '@upstash/ratelimit'

import { redis } from '../redis'

export const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1m'),
    })
  : null

export const likesRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1, '24h'),
    })
  : null
