module.exports = {
  apps: [
    {
      name: "rdo",
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: ".",
      interpretor: "none",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],

  deploy: {
    production: {
      user: "root",
      host: "207.148.122.187",
      ref: "origin/main",
      repo: "git@github.com:jemmyphan/rdo.git",
      path: "/root/rdo",
      "pre-deploy-local": "",
      "post-deploy":
        "yarn install && yarn build && pm2 restart ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
