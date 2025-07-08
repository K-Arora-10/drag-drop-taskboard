import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import io from "socket.io-client";

const socket = io("https://drag-drop-taskboard-3vr0.onrender.com/");

const columns = [
  { id: "todo", label: "Todo" },
  { id: "inprogress", label: "In Progress" },
  { id: "done", label: "Done" },
];

export default function Dashboard() {
  const { logout } = useAuth();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [log, setLog] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
  });

  const fetchTasks = async () => {
    const res = await axios.get("/tasks");
    setTasks(res.data);
  };

  const fetchLogs = async () => {
    const res = await axios.get("/actions");
    setLog(res.data);
  };

  useEffect(() => {
    fetchTasks();
    fetchLogs();

    socket.on("task-created", fetchTasks);
    socket.on("task-updated", fetchTasks);
    socket.on("task-deleted", fetchTasks);

    return () => {
      socket.off("task-created");
      socket.off("task-updated");
      socket.off("task-deleted");
    };
  }, []);

  const groupedTasks = (status) =>
    tasks.filter((task) => task.status === status);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const task = tasks.find((t) => t._id === draggableId);
    if (!task) return;

    const updated = {
      ...task,
      status: destination.droppableId,
      updatedAt: task.updatedAt,
    };

    try {
      await axios.put(`/tasks/${task._id}`, updated);
      socket.emit("task-updated", updated);
      fetchTasks();
    } catch (err) {
      if (err.response?.status === 409) {
        alert("Conflict detected — someone else updated this task");
      }
    }
  };

  const handleSmartAssign = async (id) => {
    const res = await axios.post(`/tasks/smart-assign/${id}`);
    socket.emit("task-updated", res.data);
    fetchTasks();
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Welcome, {user.username}</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Task
        </button>
        <button
          onClick={logout}
          className="text-sm text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-50"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3 grid grid-cols-3 gap-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            {columns.map(({ id, label }) => (
              <Droppable droppableId={id} key={id}>
                {(provided) => (
                  <div
                    className="bg-white p-3 rounded shadow min-h-[400px] flex flex-col"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h3 className="text-lg font-medium mb-2">{label}</h3>
                    <div className="space-y-2 min-h-[10px]">
                      {groupedTasks(id).map((task, index) => (
                        <Draggable
                          draggableId={String(task._id)}
                          index={index}
                          key={task._id}
                        >
                          {(provided) => (
                            <div
                              className="bg-blue-100 rounded p-2 shadow-sm"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <h4 className="font-semibold">{task.title}</h4>
                              <p className="text-sm text-gray-600">
                                {task.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                Priority: {task.priority}
                              </p>
                              {task.assignedUser && (
                                <p className="text-xs text-gray-500">
                                  Assigned: {task.assignedUser.username}
                                </p>
                              )}
                              <button
                                onClick={() => handleSmartAssign(task._id)}
                                className="mt-1 text-xs bg-green-200 px-2 py-1 rounded"
                              >
                                Smart Assign
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </DragDropContext>
        </div>

        <div className="col-span-1 bg-white rounded shadow p-3 overflow-y-auto max-h-[500px]">
          <h3 className="text-lg font-medium mb-2">Activity Log</h3>
          {log.map((entry) => (
            <div key={entry._id} className="mb-2 text-sm text-gray-700">
              <span className="font-semibold">{entry.user.username}</span>{" "}
              {entry.action} <br />
              <span className="text-xs text-gray-500">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm relative">
            <button
              onClick={() => setShowCreate(false)}
              className="absolute top-2 right-3 text-xl"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-3">Create New Task</h3>
            <input
              type="text"
              placeholder="Title"
              className="w-full border mb-2 px-2 py-1 rounded"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />
            <textarea
              placeholder="Description"
              className="w-full border mb-2 px-2 py-1 rounded"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
            <select
              className="w-full border mb-2 px-2 py-1 rounded"
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({ ...newTask, priority: e.target.value })
              }
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <button
              className="bg-green-600 text-white px-4 py-1 rounded w-full"
              onClick={async () => {
                if (!newTask.title.trim()) return alert("Title required");
                try {
                  const res = await axios.post("/tasks", {
                    ...newTask,
                    status: "todo",
                  });
                  socket.emit("task-created", res.data);
                  fetchTasks();
                  setShowCreate(false);
                  setNewTask({
                    title: "",
                    description: "",
                    priority: "Medium",
                  });
                } catch (err) {
                  alert(err.response?.data?.message || "Error creating task");
                }
              }}
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
