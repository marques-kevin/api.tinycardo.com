module.exports = {
  apps: [
    {
      name: 'application',
      script: './dist/src/main.js',
      exec_mode: 'cluster',
      instances: '2',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=1024',
      },
    },
  ],
};
