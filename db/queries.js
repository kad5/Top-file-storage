const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//////////////////////////////////////// CREATE ////////////////////////////////////////
const create = {
  user: async (username, hashedPassword) => {
    return prisma.user.create({
      data: {
        username,
        hashed_password: hashedPassword,
      },
    });
  },
  folder: async (name, ownerId, parentId) => {
    return prisma.folder.create({
      data: {
        name,
        ownerId,
        parentId,
      },
    });
  },
  file: async (name, ownerId, size, fileType, cloudId, parentId) => {
    return prisma.file.create({
      data: {
        name,
        ownerId,
        parentId,
        size,
        fileType,
        cloudId,
      },
    });
  },
  shareLink: async (ownerId, expiresAt, type, itemId) => {
    if (type === "folder")
      return prisma.shareLink.create({
        data: { ownerId, expiresAt, folderId: itemId },
      });
    if (type === "file")
      return prisma.shareLink.create({
        data: { ownerId, expiresAt, fileId: itemId },
      });
    return null;
  },
};
//////////////////////////////////////// READ ////////////////////////////////////////
const get = {
  userByUsername: async (username) => {
    return prisma.user.findUnique({
      where: { username },
    });
  },
  userById: async (id) => {
    return prisma.user.findUnique({
      where: { id },
    });
  },
  folderById: async (id) => {
    return prisma.folder.findUnique({
      where: { id },
    });
  },
  fileById: async (id) => {
    return prisma.file.findUnique({
      where: { id },
    });
  },
  dirContents: async (ownerId, parentId) => {
    try {
      const [folders, files] = await Promise.all([
        prisma.folder.findMany({
          where: {
            ownerId,
            parentId,
            isTrash: false,
          },
          orderBy: { createdAt: "asc" },
        }),
        prisma.file.findMany({
          where: {
            ownerId,
            parentId,
            isTrash: false,
          },
          orderBy: { createdAt: "asc" },
        }),
      ]);
      return { folders, files };
    } catch (error) {
      console.error("Error fetching directory contents:", error);
      throw new Error("Unable to fetch directory contents");
    }
  },
  trash: async (ownerId) => {
    try {
      const [folders, files] = await Promise.all([
        prisma.folder.findMany({
          where: {
            ownerId,
            isTrash: true,
          },
          orderBy: { createdAt: "asc" },
        }),
        prisma.file.findMany({
          where: {
            ownerId,
            isTrash: true,
          },
          orderBy: { createdAt: "asc" },
        }),
      ]);
      return { folders, files };
    } catch (error) {
      console.error("Error fetching trash:", error);
      throw new Error("Unable to fetch trash contents");
    }
  },
  allSharedByUser: async (ownerId) => {
    const [files, folders] = await Promise.all([
      prisma.shareLink.findMany({
        where: {
          file: {
            ownerId,
          },
        },
        include: {
          file: true,
        },
      }),
      prisma.shareLink.findMany({
        where: {
          folder: {
            ownerId,
          },
        },
        include: {
          folder: true,
        },
      }),
    ]);

    return { folders, files };
  },
  parent: async (type, itemId) => {
    if (type === "folder") {
      const folder = await prisma.folder.findUnique({
        where: {
          id: itemId,
        },
        include: {
          parent: true,
        },
      });
      return folder?.parent;
    }
    if (type === "file") {
      const file = await prisma.file.findUnique({
        where: {
          id: itemId,
        },
        include: {
          parent: true,
        },
      });
      return file?.parent;
    }
    return null;
  },
  shareDetails: async (id) => {
    return prisma.shareLink.findUnique({
      where: {
        id,
      },
    });
  },
};

//////////////////////////////////////// UPDATE ////////////////////////////////////////
const update = {
  fileName: async (id, newName) => {
    return prisma.file.update({
      where: { id },
      data: { name: newName },
    });
  },
  folderName: async (id, newName) => {
    return prisma.folder.update({
      where: { id },
      data: { name: newName },
    });
  },
  moveFolderToTrash: async (id) => {
    return prisma.folder.update({
      where: { id },
      data: { isTrash: true },
      select: { parentId: true },
    });
  },

  moveFileToTrash: async (id) => {
    return prisma.file.update({ where: { id }, data: { isTrash: true } });
  },

  restorFolderFromTrash: async (id) => {
    return prisma.folder.update({ where: { id }, data: { isTrash: false } });
  },

  restoreFileFromTrash: async (id) => {
    return prisma.file.update({ where: { id }, data: { isTrash: false } });
  },
  updateItemParent: async (type, itemId, newParentId) => {
    const parent = await get.parent(type, itemId);
    if (parent?.id === newParentId) return null;
    if (type === "folder") {
      return prisma.folder.update({
        where: { id: itemId },
        data: { parentId: newParentId },
      });
    }

    if (type === "file") {
      return prisma.file.update({
        where: { id: itemId },
        data: { parentId: newParentId },
      });
    }
    return null;
  },
};
//////////////////////////////////////// DELETE ////////////////////////////////////////
const dlt = {
  shareLink: async (id) => {
    return prisma.shareLink.delete({ where: { id } });
  },

  // used onDelete: Cascade in the shcema deletes related sharelinks
  file: async (id) => {
    return prisma.file.delete({ where: { id } });
  },

  folder: async (ownerId, folderId) => {
    try {
      // deleting the root clears the user' storage
      if (folderId === null) {
        await prisma.$transaction([
          prisma.folder.deleteMany({ where: { ownerId } }),
          prisma.file.deleteMany({ where: { ownerId } }),
        ]);
      } else {
        const { folderIds, fileIds } = await helpers.generateIdsArray(
          ownerId,
          folderId
        );
        const transaction = [];
        if (folderIds.length) {
          transaction.push(
            prisma.folder.deleteMany({ where: { id: { in: folderIds } } })
          );
        }
        if (fileIds.length) {
          transaction.push(
            prisma.file.deleteMany({ where: { id: { in: fileIds } } })
          );
        }

        if (transaction.length) {
          await prisma.$transaction(transaction);
        }
      }
      return { success: true };
    } catch (error) {
      console.error("Error deleting folder/files:", error);
      throw new Error("Deletion failed");
    }
  },
};
//////////////////////////////////////// HELPERS ////////////////////////////////////////
const helpers = {
  generateIdsArray: async (ownerId, folderId) => {
    const folderIds = [];
    const fileIds = [];
    const stack = [folderId];

    while (stack.length) {
      const currentFolderId = stack.pop();
      const { folders, files } = await get.dirContents(
        ownerId,
        currentFolderId
      );

      fileIds.push(...files.map((file) => file.id));
      folderIds.push(currentFolderId, ...folders.map((folder) => folder.id));
      stack.push(...folders.map((folder) => folder.id));
    }

    return { folderIds, fileIds };
  },

  generateDirTree: async (ownerId) => {
    const [folders, files] = await Promise.all([
      prisma.folder.findMany({
        where: {
          ownerId,
          isTrash: false,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.file.findMany({
        where: {
          ownerId,
          isTrash: false,
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const dirMap = new Map();
    folders.forEach((folder) => {
      dirMap.set(folder.id, { ...folder, children: [], files: [] });
    });

    folders.forEach((folder) => {
      if (folder.parentId) {
        const parentFolder = dirMap.get(folder.parentId);
        const mappedFolder = dirMap.get(folder.id);
        if (parentFolder && mappedFolder) {
          parentFolder.children.push(mappedFolder);
        }
      }
    });

    files.forEach((file) => {
      const parentFolder = dirMap.get(file.parentId);
      if (parentFolder) {
        parentFolder.files.push(file);
      }
    });

    return dirMap;
  },
};

module.exports = { create, get, update, dlt, helpers };
