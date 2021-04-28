module.exports = {
  apps: [
    {
      name: "app",
      script: "npm",
      args: "start",
      instances: 0,
      exec_mode: "cluster",
    },
  ],
};
