module.exports = (sequelize, Sequelize) => {
    const Scenario = sequelize.define("scenario", {
        id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
    });

    return Scenario;
};
