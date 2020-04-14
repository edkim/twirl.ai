module.exports = (sequelize, Sequelize) => {
    const Scenario = sequelize.define("scenario", {
        name: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
    });

    return Scenario;
};
