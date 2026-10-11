module.exports = {
  apps: [
    {
      name: "hio",
      script: "node",
      interpreter: "none",
      args: "scripts/local-dev.mjs",
      cwd: "/home/user/webapp",
      watch: false,
      instances: 1,
      exec_mode: "fork",
    },
  ],
};
