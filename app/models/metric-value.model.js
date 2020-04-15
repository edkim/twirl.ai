module.exports = (sequelize, Sequelize) => {
    const MetricValue = sequelize.define("metric-value", {
        date: {
            type: Sequelize.DATEONLY
        },
        metric_id: {
            type: Sequelize.INTEGER
        },
        value: {
            type: Sequelize.INTEGER
        },
        is_forecast: {
            type: Sequelize.BOOLEAN
        },
    });

    return MetricValue;
}