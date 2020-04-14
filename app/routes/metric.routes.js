module.exports = app => {
    const metrics = require("../controllers/tutorial.controller.js");

    var router = require("express").Router();

    // Create a new Tutorial
    router.post("/", metrics.create);

    // Retrieve all metrics
    router.get("/", metrics.findAll);

    // Retrieve all published metrics
    router.get("/published", metrics.findAllPublished);

    // Retrieve a single Tutorial with id
    router.get("/:id", metrics.findOne);

    // Update a Tutorial with id
    router.put("/:id", metrics.update);

    // Delete a Tutorial with id
    router.delete("/:id", metrics.delete);

    // Create a new Tutorial
    router.delete("/", metrics.deleteAll);

    app.use('/api/metrics', router);
};
