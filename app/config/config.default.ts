export async function config() {
    return {
        database: {
            storage: './blog.db',
            dialect: 'sqlite',
        },
    };
}
