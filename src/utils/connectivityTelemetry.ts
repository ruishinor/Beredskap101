export type ConnectivityState = 'ONLINE' | 'OFFLINE' | 'DEGRADED';

export class ConnectivityTelemetry extends EventTarget {
  private state: ConnectivityState = 'ONLINE';
  private heartbeatIntervalId: number | null = null;
  private readonly heartbeatUrl: string;

  constructor(heartbeatUrl = '/api/healthz') {
    super();
    this.heartbeatUrl = heartbeatUrl;
    this.initListeners();
  }

  private initListeners() {
    window.addEventListener('online', () => this.evaluateConnectivity());
    window.addEventListener('offline', () => {
      void this.evaluateConnectivity();
    });
    this.startHeartbeat();
    // Run an initial check immediately
    this.evaluateConnectivity();
  }

  private async evaluateConnectivity() {
    try {
      const start = performance.now();
      const res = await fetch(this.heartbeatUrl, { method: 'GET', cache: 'no-store' });
      const duration = performance.now() - start;
      
      if (res.ok) {
        let status = '';
        let source = '';
        try {
          const body = await res.clone().json();
          status = String(body?.status || '').toLowerCase();
          source = String(body?.source || '').toLowerCase();
        } catch {
          // HEAD-era health checks and static hosts may not return JSON.
        }

        if (status === 'offline-ready' || source === 'service-worker') {
          this.updateState('DEGRADED');
          return;
        }

        // If ping exceeds 1500ms, mark as DEGRADED (high latency / packet loss)
        this.updateState(duration > 1500 ? 'DEGRADED' : 'ONLINE');
      } else {
        this.updateState((await this.hasCachedShell()) ? 'DEGRADED' : 'OFFLINE');
      }
    } catch {
      this.updateState((await this.hasCachedShell()) ? 'DEGRADED' : 'OFFLINE');
    }
  }

  private async hasCachedShell() {
    if (!('caches' in window)) return false;

    try {
      return Boolean((await caches.match('/index.html')) || (await caches.match('/')));
    } catch {
      return false;
    }
  }

  private updateState(newState: ConnectivityState) {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      this.dispatchEvent(new CustomEvent('statechange', { 
        detail: { current: newState, previous: oldState } 
      }));
    }
  }

  private startHeartbeat() {
    this.heartbeatIntervalId = window.setInterval(() => {
      this.evaluateConnectivity();
    }, 15000); // Poll every 15s
  }

  public getStatus(): ConnectivityState {
    return this.state;
  }

  public destroy() {
    if (this.heartbeatIntervalId) clearInterval(this.heartbeatIntervalId);
  }
}

// Export singleton instance for global use
export const telemetryInstance = new ConnectivityTelemetry();
