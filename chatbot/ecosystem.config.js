module.exports = {
  apps: [
    {
      name: "app",
      script: "npm",
      args: "start",
      instances: 4,
      exec_mode: "cluster",
    },
  ],
};
