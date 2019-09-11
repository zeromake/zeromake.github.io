export default async function() {
    return {
        database: {
            storage: './blog.db',
            dialect: 'sqlite',
        },
    };
}
