export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'transport_radar',
  },
  opensky: {
    baseUrl: process.env.OPENSKY_BASE_URL ?? 'https://opensky-network.org/api',
    clientId: process.env.OPENSKY_CLIENT_ID!,
    clientSecret: process.env.OPENSKY_CLIENT_SECRET!,
    tokenUrl:
      process.env.OPENSKY_TOKEN_URL ??
      'https://opensky-network.org/api/v2/token',
  },
  planespotters: {
    baseUrl:
      process.env.PLANESPOTTERS_BASE_URL ?? 'https://api.planespotters.net',
  },
});
