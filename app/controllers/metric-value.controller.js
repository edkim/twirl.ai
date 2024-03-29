const db = require("../models");
const MetricValue = db.metricValues;

// Create and Save a new MetricValue
exports.create = (req, res) => {
    console.log('creating metricvalue', req.body)
    // Validate request
    if (!req.body.date) {
        res.status(400).send({
            message: "Date can not be empty!"
        });
        return;
    }

    // Create a MetricValue
    const metricValue = {
        date: req.body.date,
        scenario_id: req.body.scenarioId,
        bookings: req.body.bookings,
        expenses: req.body.expenses,
        cash_collected: req.body.cashCollected,
        billings: req.body.billings,
        balance: req.body.balance,
        is_forecast: req.body.is_forecast,
    };

    // Save MetricValue in the database
    MetricValue.create(metricValue)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the MetricValue."
            });
        });
};

exports.createMany = (req, res) => {
    console.log('creating bulk metricvalue', req.body)
    // Validate request
    if (!req.body[0].date) {
        res.status(400).send({
            message: "Must send an array, and Date can not be empty!"
        });
        return;
    }

    let savedMetricValues = [] // For the response; doesn't work yet
    req.body.forEach(d => {
        // Create a MetricValue
        const metricValue = {
            date: d.date,
            scenario_id: d.scenarioId,
            bookings: d.bookings,
            expenses: d.expenses,
            cash_collected: d.cashCollected,
            billings: d.billings,
            balance: d.balance,
            is_forecast: d.is_forecast,
        }

        // TODO: send back an array after all data is saved
        MetricValue.create(metricValue)
            .then(data => {
                savedMetricValues.push(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the MetricValue."
                })

                return
            })
        
    })

    res.send(savedMetricValues) // Not working yet. Sends []
}

// Retrieve all MetricValues from the database.
exports.findAll = (req, res) => {
    const id = req.query.id;
    var condition = scenarioId ? { scenario_id: id } : null;

    MetricValue.findAll({ where: condition })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving MetricValues."
            });
        });
};

// Find a single MetricValue with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    MetricValue.findByPk(id)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving MetricValue with id=" + id
            });
        });
};

// Update a MetricValue by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    MetricValue.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "MetricValue was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update MetricValue with id=${id}. Maybe MetricValue was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating MetricValue with id=" + id
            });
        });
};

// Delete a MetricValue with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    MetricValue.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "MetricValue was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete MetricValue with id=${id}. Maybe MetricValue was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete MetricValue with id=" + id
            });
        });
};

// Delete all MetricValues from the database.
exports.deleteAll = (req, res) => {
    MetricValue.destroy({
        where: {},
        truncate: false
    })
        .then(nums => {
            res.send({ message: `${nums} MetricValues were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all MetricValues."
            });
        });
};
