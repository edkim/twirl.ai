module.exports = (sequelize, Sequelize) => {
    const MetricValue = sequelize.define("metric-value", {
        date: {
            type: Sequelize.DATE
        },
        scenario_id: {
            type: Sequelize.STRING
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