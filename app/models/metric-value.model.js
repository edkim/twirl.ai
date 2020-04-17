module.exports = (sequelize, Sequelize) => {
    const MetricValue = sequelize.define("metric-value", {
        date: {
            type: Sequelize.DATEONLY
        },
        bookings: {
            type: Sequelize.INTEGER
        },
        expenses: {
            type: Sequelize.INTEGER
        },
        cash_collected: {
            type: Sequelize.INTEGER
        },
        billings: {
            type: Sequelize.INTEGER
        },
        balance: {
            type: Sequelize.INTEGER
        },
        is_forecast: {
            type: Sequelize.BOOLEAN
        },
    });

    return MetricValue;
}