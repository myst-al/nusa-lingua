// PM2 ecosystem config — process manager untuk NusaLingua server
// Jalankan: pm2 start deploy/ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: "nusalingua-server",
      script: "server/dist/server/src/index.js",
      cwd: __dirname + "/..",
      instances: 1,                 // bisa di-set "max" untuk cluster mode
      exec_mode: "fork",            // ganti "cluster" kalau scale horizontal
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",   // restart kalau RAM > 500MB

      // Env file path
      env_file: ".env",

      // Override NODE_ENV
      env: {
        NODE_ENV: "production",
      },

      // Logs
      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // Graceful restart
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
};
