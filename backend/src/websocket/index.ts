import { Server } from 'socket.io';
import { logger } from './utils/logger';

export const initWebSocket = (io: Server) => {
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });

    // Join room for specific updates
    socket.on('join:dashboard', () => {
      socket.join('dashboard');
      logger.info(`Client ${socket.id} joined dashboard room`);
    });

    socket.on('join:inventory', () => {
      socket.join('inventory');
      logger.info(`Client ${socket.id} joined inventory room`);
    });
  });
};

// Helper function to emit events (will be used by services)
export const emitInventoryUpdate = (io: Server, data: any) => {
  io.to('inventory').emit('inventory:update', data);
  io.to('dashboard').emit('dashboard:update', data);
};

export const emitScanEvent = (io: Server, data: any) => {
  io.to('inventory').emit('scan:complete', data);
  io.to('dashboard').emit('scan:complete', data);
};
