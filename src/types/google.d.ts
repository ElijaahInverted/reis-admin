interface TokenClient {
  requestAccessToken: (overrides?: { prompt?: string }) => void;
}

interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: { access_token?: string; error?: string }) => void;
}

interface Google {
  accounts: {
    oauth2: {
      initTokenClient: (config: TokenClientConfig) => TokenClient;
      revoke: (token: string, callback?: () => void) => void;
    };
  };
}

declare const google: Google;
