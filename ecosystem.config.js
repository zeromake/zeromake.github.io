module.exports = {
    apps: [{
        name: 'zeromake-blog',
        script: './out/main.js',
        instances: -1,
        autorestart: true,
        watch: false,
        exec_mode: 'cluster',
        max_memory_restart: '1G'
    }],
};
