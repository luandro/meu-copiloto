const { summarizeText } = require("../lib/summarize");

module.exports = (app, openai, tasks) => {
  // Tasks: List all tasks
  app.get("/tasks", async (req, res) => {
    try {
      const response = await tasks.tasks.list({
        tasklist: "@default",
        maxResults: 10,
      });
      // Sort tasks by due date and priority
      const sortedTasks = response.data.items.sort((a, b) => {
        const dueA = new Date(a.due),
          dueB = new Date(b.due);
        return dueA - dueB || a.position.localeCompare(b.position);
      });

      // Summarize tasks that are due first
      const today = new Date();
      const taskSummaries = sortedTasks.map((task) => {
        const dueDate = new Date(task.due);
        const isLate = today > dueDate;
        const lateDays = isLate
          ? Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))
          : 0;
        const status = isLate ? "está" : "para";
        const summary = `Tarefa: ${task.title}, ${status} ${lateDays > 0 ? `${lateDays} dias atrasados` : "hoje"}`;
        return summary;
      });

      res.json(taskSummaries);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  // Tasks: Update a task
  app.put("/tasks/:tasklist/:id", async (req, res) => {
    try {
      const { tasklist, id } = req.params;
      const task = req.body; // You'll need to validate and structure the task object correctly
      const response = await tasks.tasks.update({
        tasklist: tasklist,
        task: id,
        resource: task,
      });
      res.json(response.data);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // Tasks: Delete a task
  app.delete("/tasks/:tasklist/:id", async (req, res) => {
    try {
      const { tasklist, id } = req.params;
      await tasks.tasks.delete({
        tasklist: tasklist,
        task: id,
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // Tasks: Create a new task
  app.post("/tasks", async (req, res) => {
    try {
      const task = req.body; // You'll need to validate and structure the task object correctly
      const response = await tasks.tasks.insert({
        tasklist: "@default",
        resource: task,
      });
      res.status(201).json(response.data);
    } catch (error) {
      res.status(500).send(error);
    }
  });
};
