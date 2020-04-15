module.exports = app => {
    const metricValues = require("../controllers/metric-value.controller.js");

    var router = require("express").Router();

    // Create a new metricValues
    router.post("/", metricValues.create);

    // Retrieve all metricValues
    router.get("/", metricValues.findAll);

    // Retrieve a single metricValue with id
    router.get("/:id", metricValues.findOne);

    // Update a Metric with id
    router.put("/:id", metricValues.update);

    // Delete a Metric with id
    router.delete("/:id", metricValues.delete);

    // Create a new Metric
    router.delete("/", metricValues.deleteAll);

    app.use('/api/metricValues', router);
};
