// app/routes/_index.jsx

import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react"; // Remix React hooks for data, forms, and navigation state
import { json, redirect } from "@remix-run/node"; // Remix Node utilities for responses and redirects
import connectToDatabase from "~/utils/db.server"; // Import the database connection utility
import Task from "~/models/task.server"; // Import the Mongoose Task model

/**
 * loader function:
 * This function runs on the server whenever the route is accessed (e.g., direct URL visit, client-side navigation).
 * Its purpose is to fetch data needed by the component and return it.
 *
 * @returns {Response} A Remix JSON response containing the fetched tasks.
 * @description
 * 1. Connects to the MongoDB database.
 * 2. Fetches all tasks from the 'tasks' collection using the Mongoose Task model.
 * - `Task.find({})`: Finds all documents in the collection.
 * - `.sort({ createdAt: -1 })`: Sorts the results by `createdAt` in descending order (newest first).
 * - `.lean()`: Converts Mongoose documents to plain JavaScript objects. This is important
 * because Mongoose documents have extra methods and properties that are not necessary
 * for passing across the network and can sometimes cause serialization issues.
 * 3. Converts the `_id` field of each task from an ObjectId to a string, as ObjectId is not
 * directly serializable to JSON and causes issues when passed from server to client.
 * 4. Returns the tasks as a JSON response.
 */
export async function loader() {
  try {
    await connectToDatabase(); // Establish connection to MongoDB

    // Fetch all tasks, sort them by creation date (newest first), and convert to plain objects
    const tasks = await Task.find({}).sort({ createdAt: -1 }).lean();

    // Mongoose ObjectIds are not directly serializable to JSON when passed from loader to client.
    // Convert them to strings.
    const serializableTasks = tasks.map(task => ({
      ...task,
      _id: task._id.toString(), // Convert ObjectId to string
      createdAt: task.createdAt.toISOString() // Convert Date to ISO string for consistent serialization
    }));

    // Return the tasks as a JSON response. This data will be available to the component via useLoaderData().
    return json({ tasks: serializableTasks });
  } catch (error) {
    console.error("Failed to load tasks:", error);
    // In a real application, you might want to return an error status or a user-friendly message.
    throw json({ message: "Failed to load tasks." }, { status: 500 });
  }
}

/**
 * action function:
 * This function runs on the server when a form is submitted to this route using a POST, PUT, PATCH, or DELETE method.
 * Its purpose is to handle data mutations (create, update, delete).
 *
 * @param {Request} request The incoming HTTP request object.
 * @returns {Response} A Remix JSON response or a redirect.
 * @description
 * 1. Connects to the MongoDB database.
 * 2. Parses the form data from the request.
 * 3. Extracts 'title' and 'description' from the form data.
 * 4. Basic validation: Checks if the title is provided. If not, returns an error message.
 * 5. Creates a new Task document in the database using the Task model.
 * 6. Redirects to the homepage ("/") after successful submission, triggering a re-validation
 * of the `loader` function and refreshing the task list in the UI.
 * 7. Handles potential errors during the process, returning an error message if something goes wrong.
 */
export async function action({ request }) {
  try {
    await connectToDatabase(); // Establish connection to MongoDB

    // Parse the form data from the request
    const formData = await request.formData();
    const title = formData.get("title"); // Get the value of the 'title' input
    const description = formData.get("description"); // Get the value of the 'description' input

    // Basic server-side validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return json({ errors: { title: "Title is required." } }, { status: 400 });
    }

    // Create a new task instance and save it to the database
    const newTask = new Task({ title: title.trim(), description: description ? description.trim() : '' });
    await newTask.save(); // Save the new task document

    // Redirect to the home page. This causes the loader to re-run, fetching the updated list.
    return redirect("/");
  } catch (error) {
    console.error("Failed to add task:", error);
    // Return an error message to the client, which can be accessed via useActionData()
    return json({ message: "Failed to add task. Please try again." }, { status: 500 });
  }
}

// Default export for the UI component of this route.
// This component receives data from the loader and displays it, and also contains the form.
export default function Index() {
  const { tasks } = useLoaderData(); // Get the tasks data fetched by the loader
  const actionData = useActionData(); // Get data returned by the action function (e.g., error messages)
  const navigation = useNavigation(); // Get navigation state (e.g., if a form is submitting)

  // Determine if a submission is in progress.
  // navigation.state will be 'submitting' or 'loading' during form submission,
  // indicating that the action is processing the form data.
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gradient-to-br from-blue-500 to-indigo-600 font-inter">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl p-8 space-y-8 my-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
          My Task Manager
        </h1>

        {/* Task Submission Form */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Add New Task</h2>
          {/*
            Form component from Remix. It automatically handles POST requests to the current route's action.
            `replace` prop prevents adding a new entry to the browser history,
            which is good for form submissions that trigger a redirect.
          */}
          <Form method="post" className="space-y-4" replace>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Buy groceries"
                disabled={isSubmitting} // Disable input while submitting
              />
              {/* Display validation error for title if available from actionData */}
              {actionData?.errors?.title && (
                <p className="mt-1 text-sm text-red-600">{actionData.errors.title}</p>
              )}
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Milk, eggs, bread"
                disabled={isSubmitting} // Disable textarea while submitting
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting} // Disable button while submitting
            >
              {isSubmitting ? "Adding Task..." : "Add Task"}
            </button>
            {/* Display general action error message if available */}
            {actionData?.message && (
              <p className="mt-2 text-sm text-red-600 text-center">{actionData.message}</p>
            )}
          </Form>
        </div>

        {/* Task List Table */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Your Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center">No tasks yet. Add one above!</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{task.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(task.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
