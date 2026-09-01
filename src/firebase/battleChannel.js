/**
 * battleChannel.js
 * Cross-client realtime communication & matchmaking queue management.
 */

export class BattleChannel {
  constructor(playerId, playerName, onMessage) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.onMessage = onMessage;
    this.channel = null;
    this.init();
  }

  init() {
    if (typeof window !== 'undefined') {
      if ('BroadcastChannel' in window) {
        this.channel = new BroadcastChannel('suidoku_1v1_realtime');
        this.channel.onmessage = (event) => {
          if (event.data && event.data.senderId !== this.playerId) {
            this.onMessage(event.data);
          }
        };
      }

      // Storage event listener for cross-context browser testing
      window.addEventListener('storage', (e) => {
        if (e.key === 'suidoku_pvp_bus' && e.newValue) {
          try {
            const payload = JSON.parse(e.newValue);
            if (payload && payload.senderId !== this.playerId) {
              this.onMessage(payload);
            }
          } catch (_) {}
        }
      });
    }
  }

  broadcast(message) {
    const payload = { ...message, senderId: this.playerId, _ts: Date.now() };
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (_) {}
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('suidoku_pvp_bus', JSON.stringify(payload));
      } catch (_) {}
    }
  }

  getMatchQueue() {
    try {
      const q = JSON.parse(localStorage.getItem('suidoku_pvp_queue') || '[]');
      return q.filter(item => Date.now() - item.timestamp < 30000);
    } catch {
      return [];
    }
  }

  addToQueue(ticket) {
    const queue = this.getMatchQueue().filter(t => t.playerId !== ticket.playerId);
    queue.push(ticket);
    localStorage.setItem('suidoku_pvp_queue', JSON.stringify(queue));
  }

  removeFromQueue(playerId) {
    const queue = this.getMatchQueue().filter(t => t.playerId !== playerId);
    localStorage.setItem('suidoku_pvp_queue', JSON.stringify(queue));
  }

  close() {
    if (this.channel) {
      try {
        this.channel.close();
      } catch (_) {}
    }
  }
}
