export type XConnectionStatus = {
  connected: boolean;
  account?: {
    provider: string;
    userId: string;
    username: string;
    scopes: string[];
    expiresAt: string;
    connectedAt: string;
  };
};
