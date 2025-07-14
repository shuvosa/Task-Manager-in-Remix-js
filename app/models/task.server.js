import mongoose from 'mongoose'; // Import Mongoose to define schemas and models

// Define the schema for a Task.
// A schema describes the structure of your documents, default values, validators, etc.
const TaskSchema = new mongoose.Schema({
  // 'title' field:
  // - type: String (ensures the value stored is a string)
  // - required: true (means this field must be present when creating a Task)
  // - trim: true (removes whitespace from the beginning and end of the string)
  title: {
    type: String,
    required: true,
    trim: true,
  },
  // 'description' field:
  // - type: String
  // - trim: true
  // - default: '' (if no description is provided, it will default to an empty string)
  description: {
    type: String,
    trim: true,
    default: '',
  },
  // 'createdAt' field:
  // - type: Date (stores the date and time)
  // - default: Date.now (automatically sets the current date/time when a document is created)
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a Mongoose model from the schema.
// A model is a constructor that allows you to create instances of your documents.
// 'Task' is the singular name for the collection. Mongoose will pluralize it to 'tasks' in MongoDB.
// We use a check `mongoose.models.Task || mongoose.model('Task', TaskSchema)` to prevent
// recompiling the model in development mode with hot-reloading, which can happen if
// this file is re-evaluated multiple times. If 'Task' model already exists, use it; otherwise, create it.
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

// Export the Task model so it can be imported and used in other parts of the application
// to perform CRUD (Create, Read, Update, Delete) operations on the 'tasks' collection.
export default Task;
