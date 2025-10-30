module.exports = {
  apps: [
    {
      name: 'application',
      script: './dist/main.js',
      exec_mode: 'cluster',
      instances: '2',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=1024',
      },
    },
    {
      name: 'cron',
      script: './dist/cron.js',
      exec_mode: 'cluster',
      instances: '1',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=1024',
      },
    },
  ],
};
