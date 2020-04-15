module.exports = app => {
    const metrics = require("../controllers/metric.controller.js");

    var router = require("express").Router();

    // Create a new Metric
    router.post("/", metrics.create);

    // Retrieve all metrics
    router.get("/", metrics.findAll);

    // Retrieve a single Met with id
    router.get("/:id", metrics.findOne);

    // Update a Metric with id
    router.put("/:id", metrics.update);

    // Delete a Metric with id
    router.delete("/:id", metrics.delete);

    // Create a new Metric
    router.delete("/", metrics.deleteAll);

    app.use('/api/metrics', router);
};
