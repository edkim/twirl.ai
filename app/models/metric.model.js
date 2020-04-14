module.exports = (sequelize, Sequelize) => {
    const Metric = sequelize.define("metric", {
        name: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
    });

    return Metric;
};
