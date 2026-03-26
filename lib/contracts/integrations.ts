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

export type LinkedInConnectionStatus = {
  connected: boolean;
  account?: {
    provider: string;
    memberId: string;
    displayName: string;
    authorUrn: string;
    scopes: string[];
    expiresAt: string;
    connectedAt: string;
  };
};
