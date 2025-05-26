/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * Space management tools for ClickUp MCP Server
 */

import { McpError, Tool } from "@modelcontextprotocol/sdk/types.js";
import { sponsorService } from "../utils/sponsor-service.js";
import { WorkspaceService } from "../services/clickup/workspace.js";
import { ClickUpServiceError } from "../services/clickup/base.js";
import { Logger } from "../logger.js";

const logger = new Logger("SpaceTools");

// Tool definitions
export const createSpaceTool: Tool = {
  name: "create_space",
  description: "Create a new space in the ClickUp workspace",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the space to create",
      },
      multiple_assignees: {
        type: "boolean",
        description: "Allow multiple assignees on tasks within this space",
      },
      features: {
        type: "object",
        description: "Optional features configuration for the space",
        properties: {
          due_dates: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
              start_date: { type: "boolean" },
              remap_due_dates: { type: "boolean" },
              remap_closed_due_date: { type: "boolean" },
            },
          },
          time_tracking: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
            },
          },
          tags: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
            },
          },
          time_estimates: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
            },
          },
          checklists: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
            },
          },
          custom_fields: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
            },
          },
          remap_dependencies: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
            },
          },
          dependency_warning: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
            },
          },
          portfolios: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
            },
          },
        },
      },
    },
    required: ["name"],
  },
};

export const updateSpaceTool: Tool = {
  name: "update_space",
  description: "Update an existing space in the ClickUp workspace",
  inputSchema: {
    type: "object",
    properties: {
      space_id: {
        type: "string",
        description: "ID of the space to update",
      },
      space_name: {
        type: "string",
        description: "Name of the space to update (alternative to space_id)",
      },
      name: {
        type: "string",
        description: "New name for the space",
      },
      multiple_assignees: {
        type: "boolean",
        description: "Allow multiple assignees on tasks within this space",
      },
      features: {
        type: "object",
        description: "Features configuration to update",
        properties: {
          due_dates: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
              start_date: { type: "boolean" },
              remap_due_dates: { type: "boolean" },
              remap_closed_due_date: { type: "boolean" },
            },
          },
          time_tracking: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
            },
          },
          tags: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
            },
          },
          time_estimates: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
            },
          },
          checklists: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
            },
          },
          custom_fields: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
            },
          },
          remap_dependencies: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
            },
          },
          dependency_warning: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
            },
          },
          portfolios: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
            },
          },
        },
      },
    },
    required: [],
  },
};

export const deleteSpaceTool: Tool = {
  name: "delete_space",
  description: "Delete a space from the ClickUp workspace",
  inputSchema: {
    type: "object",
    properties: {
      space_id: {
        type: "string",
        description: "ID of the space to delete",
      },
      space_name: {
        type: "string",
        description: "Name of the space to delete (alternative to space_id)",
      },
    },
    required: [],
  },
};

// Handler functions
export async function handleCreateSpace(
  params: any,
  service: WorkspaceService
): Promise<{ content: any[] }> {
  try {
    // Validate parameters
    if (!params.name) {
      throw new McpError(1, "Space name is required");
    }

    logger.info(`Creating space: ${params.name}`);

    // Prepare space data
    const spaceData: any = {
      name: params.name,
    };

    if (params.multiple_assignees !== undefined) {
      spaceData.multiple_assignees = params.multiple_assignees;
    }

    if (params.features) {
      spaceData.features = params.features;
    }

    // Create the space
    const createdSpace = await service.createSpace(spaceData);

    logger.info(`Successfully created space: ${createdSpace.name} (ID: ${createdSpace.id})`);

    return sponsorService.createResponse({
      message: `✅ Successfully created space: ${createdSpace.name} (ID: ${createdSpace.id})`,
      space: createdSpace,
    }, true);
  } catch (error) {
    logger.error("Error creating space:", error);
    if (error instanceof ClickUpServiceError) {
      throw new McpError(1, error.message);
    }
    throw error;
  }
}

export async function handleUpdateSpace(
  params: any,
  service: WorkspaceService
): Promise<{ content: any[] }> {
  try {
    let spaceId = params.space_id;

    // If space_name is provided instead of space_id, resolve it
    if (!spaceId && params.space_name) {
      const space = await service.findSpaceByName(params.space_name);
      if (!space) {
        throw new McpError(1, `Space with name '${params.space_name}' not found`);
      }
      spaceId = space.id;
    }

    if (!spaceId) {
      throw new McpError(1, "Either space_id or space_name is required");
    }

    // Build update data
    const updateData: any = {};
    
    if (params.name) {
      updateData.name = params.name;
    }
    
    if (params.multiple_assignees !== undefined) {
      updateData.multiple_assignees = params.multiple_assignees;
    }
    
    if (params.features) {
      updateData.features = params.features;
    }

    if (Object.keys(updateData).length === 0) {
      throw new McpError(1, "No update data provided");
    }

    logger.info(`Updating space: ${spaceId}`);

    // Update the space
    const updatedSpace = await service.updateSpace(spaceId, updateData);

    logger.info(`Successfully updated space: ${updatedSpace.name} (ID: ${updatedSpace.id})`);

    return sponsorService.createResponse({
      message: `✅ Successfully updated space: ${updatedSpace.name} (ID: ${updatedSpace.id})`,
      space: updatedSpace,
    }, true);
  } catch (error) {
    logger.error("Error updating space:", error);
    if (error instanceof ClickUpServiceError) {
      throw new McpError(1, error.message);
    }
    throw error;
  }
}

export async function handleDeleteSpace(
  params: any,
  service: WorkspaceService
): Promise<{ content: any[] }> {
  try {
    let spaceId = params.space_id;

    // If space_name is provided instead of space_id, resolve it
    if (!spaceId && params.space_name) {
      const space = await service.findSpaceByName(params.space_name);
      if (!space) {
        throw new McpError(1, `Space with name '${params.space_name}' not found`);
      }
      spaceId = space.id;
    }

    if (!spaceId) {
      throw new McpError(1, "Either space_id or space_name is required");
    }

    logger.info(`Deleting space: ${spaceId}`);

    // Delete the space
    await service.deleteSpace(spaceId);

    logger.info(`Successfully deleted space: ${spaceId}`);

    return sponsorService.createResponse({
      message: `✅ Successfully deleted space: ${spaceId}`,
    }, true);
  } catch (error) {
    logger.error("Error deleting space:", error);
    if (error instanceof ClickUpServiceError) {
      throw new McpError(1, error.message);
    }
    throw error;
  }
}

// Export tools array
export const spaceTools = [createSpaceTool, updateSpaceTool, deleteSpaceTool];

// Export handlers map
export const spaceHandlers = {
  create_space: handleCreateSpace,
  update_space: handleUpdateSpace,
  delete_space: handleDeleteSpace,
};