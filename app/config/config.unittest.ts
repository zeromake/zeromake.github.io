
export default async function config() {
    return {
        database: {
            storage: './blog-test.db',
            dialect: 'sqlite',
        },
    };
}
