import * as fs from 'fs';
import * as util from 'util';

import defaultConfig from './config.default';

export default async function config() {
    const env = process.env.NODE_ENV || 'development';
    let envConfig = async () => {
        return {};
    };
    try {
        envConfig = await import(`./config.${env}`).then(m => m && m.default);
    } catch (err) {
        // tslint:disable-next-line: no-console
        console.error(err);
    }

    return Object.assign({}, await defaultConfig(), await envConfig());
}

if (typeof require !== 'undefined' && require.main === module) {
    const path = require.resolve('../../.sequelizerc');
    // tslint:disable-next-line: no-var-requires
    const sequeslizeConfig = require(path);
    const envs = [
        'development',
        'production',
        'unittest',
    ];

    const configPath = sequeslizeConfig.config;
    async function dbConfig() {
        const configs: {[name: string]: any} = {};
        for (const env of envs) {
            let envConfig = async () => {
                return {};
            };
            try {
                envConfig = await import(`./config.${env}`).then(m => m && m.default);
            } catch (err) {
                // tslint:disable-next-line: no-console
                console.error(err);
            }
            configs[env] = Object.assign({}, await defaultConfig(), await envConfig()).database;
        }
        const stream = fs.createWriteStream(configPath, {
            flags: 'w',
            encoding: 'utf-8',
        });
        const write: (check: any) => Promise<void> = (util.promisify(stream.write) as (e: any) => Promise<void>).bind(stream);
        await write('module.exports = ');
        await write(JSON.stringify(configs, null, 4));
        await write(';\n');
        stream.close();
    }
    dbConfig();
}
