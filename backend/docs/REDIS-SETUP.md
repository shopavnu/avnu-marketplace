# Redis Setup Guide for Avnu Marketplace

This document outlines how to set up Redis for our Shopify integration's distributed processing and caching needs.

## Redis Requirements

Our application uses Redis for:

1. **Distributed Queue Processing** - Reliable webhook handling using Bull
2. **Multi-level Caching** - Reducing API load with cache layers
3. **Webhook Deduplication** - Preventing duplicate webhook processing
4. **Circuit Breaker State** - Tracking circuit states across instances
5. **API Rate Limit Tracking** - Managing the connection pool

## Redis Configuration

We use separate Redis databases to isolate different concerns:

- **DB 0**: Application caching (API responses, metadata)
- **DB 1**: Bull queues (webhook processing)
- **DB 2**: Webhook deduplication and tracking

## Environment Variables

The following environment variables control Redis configuration:

```
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS_ENABLED=false
REDIS_CACHE_DB=0
REDIS_QUEUE_DB=1
REDIS_WEBHOOK_DB=2
REDIS_TTL_SECONDS=86400

# Bull Queue Configuration
QUEUE_CONCURRENCY=3
QUEUE_ATTEMPTS=3
QUEUE_BACKOFF_DELAY=5000
```

## Setup Instructions

### Local Development

1. Install Redis locally:

```bash
# macOS with Homebrew
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server.service
sudo systemctl start redis-server.service
```

2. Verify Redis is running:

```bash
redis-cli ping
# Should return PONG
```

3. Update your `.env` file with the appropriate Redis configuration.

### Production Setup

For production environments, we recommend using a managed Redis service like AWS ElastiCache, Azure Cache for Redis, or Redis Labs.

#### AWS ElastiCache Setup

1. Create an ElastiCache Redis cluster (Redis version 6.x or newer)
2. Enable encryption in transit and at rest
3. Set up a parameter group with appropriate memory policies
4. Configure VPC security groups to allow access from your application servers
5. Use the provided endpoint in your environment variables

```
REDIS_HOST=your-redis-cluster.xxxxxx.region.cache.amazonaws.com
REDIS_PORT=6379
REDIS_TLS_ENABLED=true
```

#### Redis High Availability Configuration

For production, we recommend:

- Redis cluster with at least 3 nodes
- Auto-failover enabled
- Memory size based on expected data volume:
  - Minimum 1GB for small deployments (dozens of merchants)
  - 2-4GB for medium deployments (hundreds of merchants)
  - 8GB+ for large deployments (thousands of merchants)
- Reserved memory policy: 25% (redis.conf: maxmemory-policy volatile-lru)

## Redis Monitoring

To monitor Redis health and performance:

1. Use the Redis INFO command to get basic stats
2. Set up Redis alerts for:
   - High memory usage (>80% of max memory)
   - High CPU utilization
   - Increased latency (>10ms)
   - Connection count approaching max_clients
3. Monitor eviction rate and hit ratio to tune cache settings

## Testing Redis Connection

You can test your Redis connection using:

```bash
# From your application server
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD

# In the Redis CLI
AUTH $REDIS_PASSWORD (if password is set)
SET test:key "Hello World"
GET test:key
# Should return "Hello World"
```

## Troubleshooting

Common Redis issues and solutions:

1. **Connection Refused**: Check firewall rules and network connectivity
2. **Authentication Error**: Verify password is correct in .env
3. **High Memory Usage**: Monitor and adjust TTLs for cached items
4. **Slow Performance**: Check for large keys or inefficient access patterns

## Additional Resources

- [Redis Official Documentation](https://redis.io/documentation)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md)
- [ioredis Client Documentation](https://github.com/luin/ioredis)
