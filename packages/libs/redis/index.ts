// packages/libs/prisma/prismadb.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

// Add error handlers
redis.on('error', (err) => {
  // ❌ Red X mark or 🚨 Warning sign for errors
  console.error('❌ Redis Error:', err);
  // You might want to implement more sophisticated error handling here,
  // such as graceful shutdown, health checks, or re-initialization.
});

redis.on('connect', () => {
  // ✅ Check mark or 🎉 Party popper for success
  console.log('✅ Redis connected successfully!');
});

redis.on('reconnecting', (delay: any) => {
  // 🔄 Cycle arrows or ⏳ Hourglass for reconnecting
  console.log(`🔄 Redis reconnecting in ${delay}ms...`);
});

redis.on('end', () => {
  // 🔚 End arrow or 👋 Waving hand for connection end
  console.log('👋 Redis connection ended.');
});

export default redis;
