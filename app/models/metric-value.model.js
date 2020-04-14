module.exports = (sequelize, Sequelize) => {
    const MetricValue = sequelize.define("metric-value", {
        date: {
            type: Sequelize.DATEONLY
        },
        value: {
            type: Sequelize.INTEGER
        },
        metric_id: {
            type: Sequelize.BOOLEAN
        },
        is_forecast: {
            type: Sequelize.BOOLEAN
        },
    });

    return MetricValue;
}