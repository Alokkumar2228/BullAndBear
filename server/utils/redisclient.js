import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config(); // load .env variables

const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    reconnectStrategy: (retries) => {
      console.log(` Redis reconnect attempt #${retries}`);
      return Math.min(retries * 100, 3000);
    },
  },
});

//   Handle important events
client.on('connect', () => console.log('  Redis Client Connected'));
client.on('ready', () => console.log(' Redis Client Ready'));
client.on('reconnecting', () => console.log(' Redis Reconnecting...'));
client.on('end', () => console.log(' Redis Connection Closed'));
client.on('error', (err) => console.error(' Redis Client Error:', err));

//   Keep-alive ping to prevent idle disconnects (every 10 seconds)
setInterval(async () => {
  try {
    await client.ping();
    // console.log('Redis ping successful');
  } catch (err) {
    console.error('Redis ping failed:', err);
  }
}, 10000);


(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error(' Redis initial connection failed:', err);
  }
})();

export default client;
