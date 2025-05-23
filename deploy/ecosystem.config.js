module.exports = {
  apps: [
    {
      name: 'billd-blog-server',
      exec_mode: 'fork', // cluster,fork
      instances: '1',
      script: './dist/index.js',
      args: `start`,
      env: {
        NODE_ENV: 'production',
        NODE_APP_RELEASE_PROJECT_ENV: 'prod',
        NODE_APP_RELEASE_PROJECT_PORT: 3100,
        NODE_APP_RELEASE_PROJECT_NAME: 'vue3-blog-server',
      },
    },
  ],
};
