import Debug from 'debug';

const debug = Debug('dev');

export default {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('Reports', {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID
        },
        userId: {
          allowNull: false,
          foreignKey: true,
          type: Sequelize.UUID
        },
        articleId: {
          allowNull: false,
          foreignKey: true,
          type: Sequelize.UUID
        },
        reason: {
          allowNull: false,
          type: Sequelize.STRING
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });
    } catch (error) {
      debug(error);
    }
  },
  down: async (queryInterface) => {
    try {
      await queryInterface.dropTable('Reports');
    } catch (error) {
      debug(error);
    }
  }
};
