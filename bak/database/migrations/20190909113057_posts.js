'use strict';
const tableName = 'posts';

module.exports = {

    /**
     * @param {import('sequelize').QueryInterface} queryInterface
     * @param {import('sequelize')} Sequelize
     */
    up(queryInterface, Sequelize) {
        return queryInterface.createTable(tableName, {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            deleted: {
                type: Sequelize.TINYINT.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            status: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            title: Sequelize.STRING,
            type: Sequelize.STRING,
            preview: Sequelize.STRING(2048),
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
            }
        });
    },

    /**
     * @param {import('sequelize').QueryInterface} queryInterface
     * @param {import('sequelize')} Sequelize
     */
    down(queryInterface) {
        return queryInterface.dropTable(tableName);
    }
};
