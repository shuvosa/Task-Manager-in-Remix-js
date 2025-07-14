Task Manager

A simple web application for managing tasks, built with Remix.js and MongoDB.

Features





Add new tasks with a title and optional description



View a list of tasks sorted by creation date

Technologies Used





Remix.js: A full-stack web framework for building modern web applications



MongoDB: A NoSQL database for storing task data



Mongoose: An ODM (Object Data Modeling) library for MongoDB and Node.js

Installation and Setup





Clone the repository:
```
git clone https://github.com/shuvosa/Task-Manager-in-Remix-js.git
```


Install dependencies:

cd task-manager
```
npm install

```

Set up MongoDB database:





Create a MongoDB database and obtain the connection string (e.g., from MongoDB Atlas or a local instance)



Create a .env file in the root directory and add the connection string:
```
MONGODB_URI=your-mongodb-connection-string

```

Run the application:
```
npm run dev

The application will be available at http://localhost:3000
```
Usage





Add a new task: Fill in the title (required) and optional description in the form, then click "Add Task"



View tasks: The list of tasks will be displayed in a table below the form, sorted by creation date (newest first)

Code Structure





app/routes/_index.jsx:





Loader: Fetches tasks from MongoDB, sorts them by creation date, and returns them as JSON



Action: Handles form submissions to add new tasks and redirects to refresh the task list



UI Component: Displays the task form and task list table

Contributing





Fork the repository



Create a new branch for your feature or bug fix



Submit a pull request with a clear description of your changes

License

This project is licensed under the MIT License.
