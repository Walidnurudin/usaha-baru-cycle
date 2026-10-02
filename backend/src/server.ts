// backend/src/server.ts
import app from './app';
import { env } from './config/env';

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Toko Sepeda Usaha Baru Cycle Backend Server running at: http://localhost:${PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
});
