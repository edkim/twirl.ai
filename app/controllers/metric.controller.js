const db = require("../models");
const Metric = db.metrics;
const Op = db.Sequelize.Op;

// Create and Save a new Metric
exports.create = (req, res) => {
    // Validate request
    if (!req.body.title) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // Create a Metric
    const tutorial = {
        title: req.body.title,
        description: req.body.description,
        published: req.body.published ? req.body.published : false
    };

    // Save Metric in the database
    Metric.create(metric)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Metric."
            });
        });
};

// Retrieve all Metrics from the database.
exports.findAll = (req, res) => {
    const title = req.query.title;
    var condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

    Metric.findAll({ where: condition })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving metrics."
            });
        });
};

// Find a single Metric with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Metric.findByPk(id)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Metric with id=" + id
            });
        });
};

// Update a Metric by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    Metric.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Metric was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Metric with id=${id}. Maybe Metric was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Metric with id=" + id
            });
        });
};

// Delete a Metric with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Metric.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Metric was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Metric with id=${id}. Maybe Metric was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Metric with id=" + id
            });
        });
};

// Delete all Metrics from the database.
exports.deleteAll = (req, res) => {
    Metric.destroy({
        where: {},
        truncate: false
    })
        .then(nums => {
            res.send({ message: `${nums} Metrics were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all metrics."
            });
        });
};