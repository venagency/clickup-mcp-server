import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import { z } from "zod";
import configuration from "./config.js";
import {
  createDocumentPageTool,
  createDocumentTool,
  getDocumentPagesTool,
  getDocumentTool,
  handleCreateDocument,
  handleCreateDocumentPage,
  handleGetDocument,
  handleGetDocumentPages,
  handleListDocumentPages,
  handleListDocuments,
  handleUpdateDocumentPage,
  listDocumentPagesTool,
  listDocumentsTool,
  updateDocumentPageTool,
} from "./tools/documents.js";
import {
  createFolderTool,
  deleteFolderTool,
  getFolderTool,
  handleCreateFolder,
  handleDeleteFolder,
  handleGetFolder,
  handleUpdateFolder,
  updateFolderTool,
} from "./tools/folder.js";
import {
  addTimeEntryTool,
  attachTaskFileTool,
  createBulkTasksTool,
  createTaskCommentTool,
  createTaskTool,
  deleteBulkTasksTool,
  deleteTaskTool,
  deleteTimeEntryTool,
  duplicateTaskTool,
  getCurrentTimeEntryTool,
  getTaskCommentsTool,
  getTaskTimeEntriesTool,
  getTaskTool,
  getWorkspaceTasksTool,
  handleAddTimeEntry,
  handleAttachTaskFile,
  handleCreateBulkTasks,
  handleCreateTask,
  handleCreateTaskComment,
  handleDeleteBulkTasks,
  handleDeleteTask,
  handleDeleteTimeEntry,
  handleDuplicateTask,
  handleGetCurrentTimeEntry,
  handleGetTask,
  handleGetTaskComments,
  handleGetTaskTimeEntries,
  handleGetWorkspaceTasks,
  handleMoveBulkTasks,
  handleMoveTask,
  handleStartTimeTracking,
  handleStopTimeTracking,
  handleUpdateBulkTasks,
  handleUpdateTask,
  moveBulkTasksTool,
  moveTaskTool,
  startTimeTrackingTool,
  stopTimeTrackingTool,
  updateBulkTasksTool,
  updateTaskTool,
} from "./tools/index.js";
import {
  createListInFolderTool,
  createListTool,
  deleteListTool,
  getListTool,
  handleCreateList,
  handleCreateListInFolder,
  handleDeleteList,
  handleGetList,
  handleUpdateList,
  updateListTool,
} from "./tools/list.js";
import {
  addTagToTaskTool,
  getSpaceTagsTool,
  handleAddTagToTask,
  handleGetSpaceTags,
  handleRemoveTagFromTask,
  removeTagFromTaskTool,
} from "./tools/tag.js";
import { handleGetWorkspaceHierarchy } from "./tools/workspace.js";

const server = new McpServer({
  name: "clickup-mcp-server",
  version: "0.7.2",
});

const app = express();
app.use(express.json());

server.tool(
  "get_workspace_hierarchy",
  "Get Workspace Hierarchy",
  {},
  async () => {
    const hierarchy = (await handleGetWorkspaceHierarchy()) as Tool;
    return hierarchy;
  }
);

server.tool(
  getTaskTool.name,
  getTaskTool.description,
  {
    taskId: z
      .string()
      .describe(
        "Task ID to retrieve. This can be a ClickUp task ID (e.g., '123-456') or a custom task ID (e.g., 'DEV-1234')."
      ),

    taskName: z
      .string()
      .optional()
      .describe(
        "Name of task to retrieve. Can be used alone for a global search, or with listName for faster lookup."
      ),
    listName: z
      .string()
      .optional()
      .describe(
        "Name of list containing the task. Optional but recommended when using taskName."
      ),
    customTaskId: z
      .string()
      .optional()
      .describe(
        "Custom task ID (e.g., 'DEV-1234'). Only use this if you want to explicitly force custom ID lookup. In most cases, you can just use taskId which auto-detects ID format."
      ),
    subtasks: z
      .boolean()
      .optional()
      .describe(
        "Whether to include subtasks in the response. Set to true to retrieve full details of all subtasks."
      ),
  },
  async (params) => {
    return (await handleGetTask(params)) as Tool;
  }
);

server.tool(
  createTaskTool.name,
  createTaskTool.description,
  {
    listName: z.string().describe("Name of the list to create the task in."),
    taskName: z.string().describe("Name of the task to create."),
    description: z.string().optional().describe("Description of the task."),
    assignees: z
      .array(z.string())
      .optional()
      .describe("Array of user IDs to assign to the task."),
    tags: z
      .array(z.string())
      .optional()
      .describe("Array of tag names to add to the task."),
    status: z.string().optional().describe("Status to set for the task."),
    priority: z.number().optional().describe("Priority of the task."),
    dueDate: z
      .string()
      .optional()
      .describe("Due date of the task (YYYY-MM-DD)."),
    startDate: z
      .string()
      .optional()
      .describe("Start date of the task (YYYY-MM-DD)."),
    customFields: z
      .array(z.object({ id: z.string(), value: z.any() }))
      .optional()
      .describe("Array of custom fields to set for the task."),
    parentTask: z
      .string()
      .optional()
      .describe("ID of the parent task, if creating a subtask."),
  },
  async (params) => {
    return (await handleCreateTask(params)) as Tool;
  }
);

server.tool(
  updateTaskTool.name,
  updateTaskTool.description,
  {
    taskId: z.string().describe("ID of the task to update."),
    taskName: z.string().optional().describe("New name for the task."),
    description: z
      .string()
      .optional()
      .describe("New description for the task."),
    assignees: z
      .array(z.string())
      .optional()
      .describe("New array of user IDs to assign to the task."),
    tags: z
      .array(z.string())
      .optional()
      .describe("New array of tag names to add to the task."),
    status: z.string().optional().describe("New status to set for the task."),
    priority: z.number().optional().describe("New priority of the task."),
    dueDate: z
      .string()
      .optional()
      .describe("New due date of the task (YYYY-MM-DD)."),
    startDate: z
      .string()
      .optional()
      .describe("New start date of the task (YYYY-MM-DD)."),
    customFields: z
      .array(z.object({ id: z.string(), value: z.any() }))
      .optional()
      .describe("New array of custom fields to set for the task."),
    parentTask: z.string().optional().describe("New ID of the parent task."),
  },
  async (params) => {
    return (await handleUpdateTask(params)) as Tool;
  }
);

server.tool(
  moveTaskTool.name,
  moveTaskTool.description,
  {
    taskId: z.string().describe("ID of the task to move."),
    newListId: z.string().describe("ID of the list to move the task to."),
    newStatus: z
      .string()
      .optional()
      .describe("New status for the task in the new list."),
  },
  async (params) => {
    return (await handleMoveTask(params)) as Tool;
  }
);

server.tool(
  duplicateTaskTool.name,
  duplicateTaskTool.description,
  {
    taskId: z.string().describe("ID of the task to duplicate."),
    newTaskName: z
      .string()
      .optional()
      .describe(
        "Name for the new duplicated task. Defaults to the original task name."
      ),
    options: z
      .object({
        includeDescription: z
          .boolean()
          .optional()
          .describe("Include task description."),
        includeAttachments: z
          .boolean()
          .optional()
          .describe("Include task attachments."),
        includeSubtasks: z
          .boolean()
          .optional()
          .describe("Include task subtasks."),
        includeChecklists: z
          .boolean()
          .optional()
          .describe("Include task checklists."),
        includeComments: z
          .boolean()
          .optional()
          .describe("Include task comments."),
        includeAssignees: z
          .boolean()
          .optional()
          .describe("Include task assignees."),
        includeCustomFields: z
          .boolean()
          .optional()
          .describe("Include task custom fields."),
        remapDates: z
          .boolean()
          .optional()
          .describe("Remap due dates and start dates."),
        remapAssignees: z.boolean().optional().describe("Remap assignees."),
      })
      .optional()
      .describe("Options for duplicating the task."),
  },
  async (params) => {
    return (await handleDuplicateTask(params)) as Tool;
  }
);

server.tool(
  deleteTaskTool.name,
  deleteTaskTool.description,
  {
    taskId: z.string().describe("ID of the task to delete."),
  },
  async (params) => {
    return (await handleDeleteTask(params)) as Tool;
  }
);

server.tool(
  getTaskCommentsTool.name,
  getTaskCommentsTool.description,
  {
    taskId: z.string().describe("ID of the task to get comments for."),
    includeReplies: z
      .boolean()
      .optional()
      .describe("Include replies to comments."),
  },
  async (params) => {
    return (await handleGetTaskComments(params)) as Tool;
  }
);

server.tool(
  createTaskCommentTool.name,
  createTaskCommentTool.description,
  {
    taskId: z.string().describe("ID of the task to add a comment to."),
    commentText: z.string().describe("Text of the comment."),
    assignee: z
      .string()
      .optional()
      .describe("User ID to assign the comment to."),
    notifyAll: z
      .boolean()
      .optional()
      .describe("Notify all users watching the task."),
  },
  async (params) => {
    return (await handleCreateTaskComment(params)) as Tool;
  }
);

server.tool(
  attachTaskFileTool.name,
  attachTaskFileTool.description,
  {
    taskId: z.string().describe("ID of the task to attach the file to."),
    filePath: z.string().describe("Path to the file to attach."),
    fileName: z
      .string()
      .optional()
      .describe("Name of the file. Defaults to the original file name."),
  },
  async (params) => {
    // Note: handleAttachTaskFile in server.ts might need adjustment
    // if it expects a different structure for file path/content in SSE context.
    // For now, assuming it can handle a file path.
    return (await handleAttachTaskFile(params)) as Tool;
  }
);

server.tool(
  createBulkTasksTool.name,
  createBulkTasksTool.description,
  {
    listId: z.string().describe("ID of the list to create the tasks in."),
    tasks: z
      .array(
        z.object({
          name: z.string().describe("Name of the task."),
          description: z
            .string()
            .optional()
            .describe("Description of the task."),
          assignees: z
            .array(z.string())
            .optional()
            .describe("Array of user IDs to assign to the task."),
          tags: z
            .array(z.string())
            .optional()
            .describe("Array of tag names to add to the task."),
          status: z.string().optional().describe("Status to set for the task."),
          priority: z.number().optional().describe("Priority of the task."),
          dueDate: z
            .string()
            .optional()
            .describe("Due date of the task (YYYY-MM-DD)."),
          startDate: z
            .string()
            .optional()
            .describe("Start date of the task (YYYY-MM-DD)."),
          customFields: z
            .array(z.object({ id: z.string(), value: z.any() }))
            .optional()
            .describe("Array of custom fields to set for the task."),
          parentTask: z
            .string()
            .optional()
            .describe("ID of the parent task, if creating a subtask."),
        })
      )
      .describe("Array of task objects to create."),
  },
  async (params) => {
    return (await handleCreateBulkTasks(params)) as Tool;
  }
);

server.tool(
  updateBulkTasksTool.name,
  updateBulkTasksTool.description,
  {
    tasks: z
      .array(
        z.object({
          id: z.string().describe("ID of the task to update."),
          name: z.string().optional().describe("New name for the task."),
          description: z
            .string()
            .optional()
            .describe("New description for the task."),
          assignees: z
            .array(z.string())
            .optional()
            .describe("New array of user IDs to assign to the task."),
          tags: z
            .array(z.string())
            .optional()
            .describe("New array of tag names to add to the task."),
          status: z
            .string()
            .optional()
            .describe("New status to set for the task."),
          priority: z.number().optional().describe("New priority of the task."),
          dueDate: z
            .string()
            .optional()
            .describe("New due date of the task (YYYY-MM-DD)."),
          startDate: z
            .string()
            .optional()
            .describe("New start date of the task (YYYY-MM-DD)."),
          customFields: z
            .array(z.object({ id: z.string(), value: z.any() }))
            .optional()
            .describe("New array of custom fields to set for the task."),
          parentTask: z
            .string()
            .optional()
            .describe("New ID of the parent task."),
        })
      )
      .describe("Array of task objects to update."),
  },
  async (params) => {
    return (await handleUpdateBulkTasks(params)) as Tool;
  }
);

server.tool(
  moveBulkTasksTool.name,
  moveBulkTasksTool.description,
  {
    taskIds: z.array(z.string()).describe("Array of task IDs to move."),
    newListId: z.string().describe("ID of the list to move the tasks to."),
    newStatus: z
      .string()
      .optional()
      .describe("New status for the tasks in the new list."),
  },
  async (params) => {
    return (await handleMoveBulkTasks(params)) as Tool;
  }
);

server.tool(
  deleteBulkTasksTool.name,
  deleteBulkTasksTool.description,
  {
    taskIds: z.array(z.string()).describe("Array of task IDs to delete."),
  },
  async (params) => {
    return (await handleDeleteBulkTasks(params)) as Tool;
  }
);

server.tool(
  getWorkspaceTasksTool.name,
  getWorkspaceTasksTool.description,
  {
    workspaceId: z
      .string()
      .optional()
      .describe(
        "ID of the workspace to get tasks from. Defaults to the current workspace."
      ),
    listIds: z
      .array(z.string())
      .optional()
      .describe("Array of list IDs to filter tasks by."),
    statuses: z
      .array(z.string())
      .optional()
      .describe("Array of statuses to filter tasks by."),
    assignees: z
      .array(z.string())
      .optional()
      .describe("Array of user IDs to filter tasks by."),
    tags: z
      .array(z.string())
      .optional()
      .describe("Array of tag names to filter tasks by."),
    dueDateGreaterThan: z
      .string()
      .optional()
      .describe("Filter tasks with due date greater than (YYYY-MM-DD)."),
    dueDateLessThan: z
      .string()
      .optional()
      .describe("Filter tasks with due date less than (YYYY-MM-DD)."),
    createdDateGreaterThan: z
      .string()
      .optional()
      .describe("Filter tasks with created date greater than (YYYY-MM-DD)."),
    createdDateLessThan: z
      .string()
      .optional()
      .describe("Filter tasks with created date less than (YYYY-MM-DD)."),
    updatedDateGreaterThan: z
      .string()
      .optional()
      .describe("Filter tasks with updated date greater than (YYYY-MM-DD)."),
    updatedDateLessThan: z
      .string()
      .optional()
      .describe("Filter tasks with updated date less than (YYYY-MM-DD)."),
    includeSubtasks: z
      .boolean()
      .optional()
      .describe("Include subtasks in the results."),
    includeClosed: z
      .boolean()
      .optional()
      .describe("Include closed tasks in the results."),
    sortBy: z
      .string()
      .optional()
      .describe(
        "Field to sort tasks by (e.g., 'dueDate', 'createdDate', 'priority')."
      ),
    sortOrder: z
      .enum(["asc", "desc"])
      .optional()
      .describe("Sort order ('asc' or 'desc')."),
    page: z.number().optional().describe("Page number for pagination."),
  },
  async (params) => {
    return (await handleGetWorkspaceTasks(params)) as Tool;
  }
);

server.tool(
  getTaskTimeEntriesTool.name,
  getTaskTimeEntriesTool.description,
  {
    taskId: z.string().describe("ID of the task to get time entries for."),
    startDate: z
      .string()
      .optional()
      .describe("Filter time entries starting after this date (YYYY-MM-DD)."),
    endDate: z
      .string()
      .optional()
      .describe("Filter time entries ending before this date (YYYY-MM-DD)."),
    assignee: z.string().optional().describe("Filter time entries by user ID."),
  },
  async (params) => {
    return (await handleGetTaskTimeEntries(params)) as Tool;
  }
);

server.tool(
  startTimeTrackingTool.name,
  startTimeTrackingTool.description,
  {
    taskId: z.string().describe("ID of the task to start time tracking for."),
    assignee: z
      .string()
      .optional()
      .describe(
        "User ID to start time tracking for. Defaults to the authenticated user."
      ),
  },
  async (params) => {
    return (await handleStartTimeTracking(params)) as Tool;
  }
);

server.tool(
  stopTimeTrackingTool.name,
  stopTimeTrackingTool.description,
  {
    assignee: z
      .string()
      .optional()
      .describe(
        "User ID to stop time tracking for. Defaults to the authenticated user."
      ),
  },
  async (params) => {
    return (await handleStopTimeTracking(params)) as Tool;
  }
);

server.tool(
  addTimeEntryTool.name,
  addTimeEntryTool.description,
  {
    taskId: z.string().describe("ID of the task to add time entry to."),
    duration: z
      .number()
      .describe("Duration of the time entry in milliseconds."),
    description: z
      .string()
      .optional()
      .describe("Description of the time entry."),
    start: z
      .string()
      .optional()
      .describe("Start time of the entry (Unix timestamp in milliseconds)."),
    end: z
      .string()
      .optional()
      .describe("End time of the entry (Unix timestamp in milliseconds)."),
    assignee: z
      .string()
      .optional()
      .describe(
        "User ID for the time entry. Defaults to the authenticated user."
      ),
    billable: z
      .boolean()
      .optional()
      .describe("Whether the time entry is billable."),
  },
  async (params) => {
    return (await handleAddTimeEntry(params)) as Tool;
  }
);

server.tool(
  deleteTimeEntryTool.name,
  deleteTimeEntryTool.description,
  {
    timeEntryId: z.string().describe("ID of the time entry to delete."),
  },
  async (params) => {
    return (await handleDeleteTimeEntry(params)) as Tool;
  }
);

server.tool(
  getCurrentTimeEntryTool.name,
  getCurrentTimeEntryTool.description,
  {
    assignee: z
      .string()
      .optional()
      .describe(
        "User ID to get current time entry for. Defaults to the authenticated user."
      ),
  },
  async (params) => {
    return (await handleGetCurrentTimeEntry(params)) as Tool;
  }
);

server.tool(
  createListTool.name,
  createListTool.description,
  {
    spaceId: z.string().describe("ID of the space to create the list in."),
    listName: z.string().describe("Name of the list to create."),
    status: z.string().optional().describe("Status for the list."),
    priority: z.number().optional().describe("Priority for the list."),
    dueDate: z
      .string()
      .optional()
      .describe("Due date for the list (YYYY-MM-DD)."),
  },
  async (params) => {
    return (await handleCreateList(params)) as Tool;
  }
);

server.tool(
  createListInFolderTool.name,
  createListInFolderTool.description,
  {
    folderId: z.string().describe("ID of the folder to create the list in."),
    listName: z.string().describe("Name of the list to create."),
    status: z.string().optional().describe("Status for the list."),
    priority: z.number().optional().describe("Priority for the list."),
    dueDate: z
      .string()
      .optional()
      .describe("Due date for the list (YYYY-MM-DD)."),
  },
  async (params) => {
    return (await handleCreateListInFolder(params)) as Tool;
  }
);

server.tool(
  getListTool.name,
  getListTool.description,
  {
    listId: z.string().describe("ID of the list to retrieve."),
  },
  async (params) => {
    return (await handleGetList(params)) as Tool;
  }
);

server.tool(
  updateListTool.name,
  updateListTool.description,
  {
    listId: z.string().describe("ID of the list to update."),
    listName: z.string().optional().describe("New name for the list."),
    status: z.string().optional().describe("New status for the list."),
    priority: z.number().optional().describe("New priority for the list."),
    dueDate: z
      .string()
      .optional()
      .describe("New due date for the list (YYYY-MM-DD)."),
    unsetStatus: z
      .boolean()
      .optional()
      .describe("Set to true to remove the status from the list."),
  },
  async (params) => {
    return (await handleUpdateList(params)) as Tool;
  }
);

server.tool(
  deleteListTool.name,
  deleteListTool.description,
  {
    listId: z.string().describe("ID of the list to delete."),
  },
  async (params) => {
    return (await handleDeleteList(params)) as Tool;
  }
);

server.tool(
  createFolderTool.name,
  createFolderTool.description,
  {
    spaceId: z.string().describe("ID of the space to create the folder in."),
    folderName: z.string().describe("Name of the folder to create."),
  },
  async (params) => {
    return (await handleCreateFolder(params)) as Tool;
  }
);

server.tool(
  getFolderTool.name,
  getFolderTool.description,
  {
    folderId: z.string().describe("ID of the folder to retrieve."),
  },
  async (params) => {
    return (await handleGetFolder(params)) as Tool;
  }
);

server.tool(
  updateFolderTool.name,
  updateFolderTool.description,
  {
    folderId: z.string().describe("ID of the folder to update."),
    folderName: z.string().optional().describe("New name for the folder."),
  },
  async (params) => {
    return (await handleUpdateFolder(params)) as Tool;
  }
);

server.tool(
  deleteFolderTool.name,
  deleteFolderTool.description,
  {
    folderId: z.string().describe("ID of the folder to delete."),
  },
  async (params) => {
    return (await handleDeleteFolder(params)) as Tool;
  }
);

server.tool(
  getSpaceTagsTool.name,
  getSpaceTagsTool.description,
  {
    spaceId: z.string().describe("ID of the space to get tags from."),
  },
  async (params) => {
    return (await handleGetSpaceTags(params)) as Tool;
  }
);

server.tool(
  addTagToTaskTool.name,
  addTagToTaskTool.description,
  {
    taskId: z.string().describe("ID of the task to add the tag to."),
    tagName: z.string().describe("Name of the tag to add."),
  },
  async (params) => {
    return (await handleAddTagToTask(params)) as Tool;
  }
);

server.tool(
  removeTagFromTaskTool.name,
  removeTagFromTaskTool.description,
  {
    taskId: z.string().describe("ID of the task to remove the tag from."),
    tagName: z.string().describe("Name of the tag to remove."),
  },
  async (params) => {
    return (await handleRemoveTagFromTask(params)) as Tool;
  }
);

server.tool(
  createDocumentTool.name,
  createDocumentTool.description,
  {
    spaceId: z.string().describe("ID of the space to create the document in."),
    name: z.string().describe("Name of the document."),
    content: z.string().optional().describe("Initial content of the document."),
    parentType: z
      .enum(["list", "folder", "space"])
      .optional()
      .describe("Type of the parent entity."),
    parentId: z.string().optional().describe("ID of the parent entity."),
  },
  async (params) => {
    return (await handleCreateDocument(params)) as Tool;
  }
);

server.tool(
  getDocumentTool.name,
  getDocumentTool.description,
  {
    documentId: z.string().describe("ID of the document to retrieve."),
  },
  async (params) => {
    return (await handleGetDocument(params)) as Tool;
  }
);

server.tool(
  listDocumentsTool.name,
  listDocumentsTool.description,
  {
    spaceId: z
      .string()
      .optional()
      .describe(
        "ID of the space to list documents from. Defaults to all accessible documents."
      ),
    includeArchived: z
      .boolean()
      .optional()
      .describe("Include archived documents."),
  },
  async (params) => {
    return (await handleListDocuments(params)) as Tool;
  }
);

server.tool(
  listDocumentPagesTool.name,
  listDocumentPagesTool.description,
  {
    documentId: z.string().describe("ID of the document to list pages from."),
  },
  async (params) => {
    return (await handleListDocumentPages(params)) as Tool;
  }
);

server.tool(
  getDocumentPagesTool.name,
  getDocumentPagesTool.description,
  {
    documentId: z.string().describe("ID of the document to get pages from."),
    pageIds: z
      .array(z.string())
      .optional()
      .describe(
        "Array of page IDs to retrieve. If not provided, all pages are retrieved."
      ),
  },
  async (params) => {
    return (await handleGetDocumentPages(params)) as Tool;
  }
);

server.tool(
  createDocumentPageTool.name,
  createDocumentPageTool.description,
  {
    documentId: z.string().describe("ID of the document to add the page to."),
    title: z.string().describe("Title of the new page."),
    content: z.string().optional().describe("Content of the new page."),
    orderIndex: z
      .number()
      .optional()
      .describe("Order index of the page within the document."),
  },
  async (params) => {
    return (await handleCreateDocumentPage(params)) as Tool;
  }
);

server.tool(
  updateDocumentPageTool.name,
  updateDocumentPageTool.description,
  {
    pageId: z.string().describe("ID of the page to update."),
    title: z.string().optional().describe("New title for the page."),
    content: z.string().optional().describe("New content for the page."),
    orderIndex: z.number().optional().describe("New order index for the page."),
  },
  async (params) => {
    return (await handleUpdateDocumentPage(params)) as Tool;
  }
);

export function startSSEServer() {
  const transports = {
    streamable: {} as Record<string, StreamableHTTPServerTransport>,
    sse: {} as Record<string, SSEServerTransport>,
  };

  app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport("/messages", res);
    transports.sse[transport.sessionId] = transport;

    res.on("close", () => {
      delete transports.sse[transport.sessionId];
    });

    await server.connect(transport);
  });

  app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.sse[sessionId];
    if (transport) {
      await transport.handlePostMessage(req, res, req.body);
    } else {
      res.status(400).send("No transport found for sessionId");
    }
  });

  app.listen(configuration.port);
}
