const config = {
  apps: {
    core: process.env.NEXT_PUBLIC_API_BASE_URL,
    ws: process.env.NEXT_PUBLIC_WEB_SOCKET_URL,
  },
  client: "itchy-fingers-scratcher",
};

export default config;
