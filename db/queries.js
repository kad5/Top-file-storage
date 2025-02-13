const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//////////////////////////////////////// CREATE ////////////////////////////////////////
const createUser = async (username, hashedPassword) => {
  return prisma.user.create({
    data: {
      username,
      hashed_password: hashedPassword,
    },
  });
};

const createNewFolder = async (name, ownerId, parentId = null) => {
  return prisma.folder.create({
    data: {
      name,
      ownerId,
      parentId,
    },
  });
};

const createNewFile = async (
  name,
  ownerId,
  size,
  fileType,
  couldId,
  parentId = null
) => {
  return prisma.file.create({
    data: {
      name,
      ownerId,
      parentId,
      size,
      fileType,
      couldId,
    },
  });
};

const createShareLink = async (ownerId, expiresAt, type, itemId) => {
  if (type === "folder")
    return prisma.folder.create({
      data: { ownerId, expiresAt, folderId: itemId },
    });
  if (type === "file")
    return prisma.file.create({ data: { ownerId, expiresAt, fileId: itemId } });
  return null;
};

//////////////////////////////////////// READ ////////////////////////////////////////

const getUserByUsername = async (username) => {
  return prisma.user.findUnique({
    where: { username },
  });
};

const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

const getDirContents = async (ownerId, parentId = null) => {
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
};

const getTrash = async (ownerId) => {
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
};

const getAllSharedByUser = async (ownerId) => {
  const [sharedFiles, sharedFolders] = await Promise.all([
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

  return { sharedFiles, sharedFolders };
};

// extras
const getParent = async (type, itemId) => {
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
};

const getFolderById = async (id) => {
  return prisma.folder.findUnique({
    where: { id },
  });
};

const getFileById = async (id) => {
  return prisma.file.findUnique({
    where: { id },
  });
};

//////////////////////////////////////// UPDATE ////////////////////////////////////////

const updateFileName = async (id, newName) => {
  return prisma.file.update({
    where: { id },
    data: { name: newName },
  });
};

const updateFolderName = async (id, newName) => {
  return prisma.folder.update({
    where: { id },
    data: { name: newName },
  });
};

const moveFolderToTrash = async (id) => {
  return prisma.folder.update({ where: { id }, data: { isTrash: true } });
};

const moveFileToTrash = async (id) => {
  return prisma.file.update({ where: { id }, data: { isTrash: true } });
};

const restorFolderFromTrash = async (id) => {
  return prisma.folder.update({ where: { id }, data: { isTrash: false } });
};

const restorFileFromTrash = async (id) => {
  return prisma.file.update({ where: { id }, data: { isTrash: false } });
};

// change parent for cut and paste functionality
const updateItemParent = async (type, itemId, newParentId) => {
  const parent = await getParent(type, itemId);
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
};

//////////////////////////////////////// DELETE ////////////////////////////////////////

const deleteShareLink = async (id) => {
  return prisma.shareLink.delete({ where: { id } });
};

// used onDelete: Cascade in the shcema deletes related sharelinks
const deleteFile = async (id) => {
  return prisma.file.delete({ where: { id } });
};

const deleteFolder = async (ownerId, folderId) => {
  try {
    // deleting the root clears the user' storage
    if (folderId === null) {
      await prisma.$transaction([
        prisma.folder.deleteMany({ where: { ownerId } }),
        prisma.file.deleteMany({ where: { ownerId } }),
      ]);
    } else {
      const { folderIds, fileIds } = await generateIdsArray(ownerId, folderId);
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
};

//////////////////////////////////////// HELPERS ////////////////////////////////////////

// creates ids arrays to pass to the delete func
const generateIdsArray = async (ownerId, folderId) => {
  const folderIds = [];
  const fileIds = [];
  const stack = [folderId];

  while (stack.length) {
    const currentFolderId = stack.pop();
    const { folders, files } = await getDirContents(ownerId, currentFolderId);

    fileIds.push(...files.map((file) => file.id));
    folderIds.push(currentFolderId, ...folders.map((folder) => folder.id));
    stack.push(...folders.map((folder) => folder.id));
  }

  return { folderIds, fileIds };
};

// map holding directory trees
const generateDirTree = async (ownerId) => {
  const folders = await prisma.folder.findMany({
    where: { ownerId },
  });
  const files = await prisma.file.findMany({
    where: { ownerId },
  });

  const dirMap = new Map();
  folders.forEach((folder) => {
    dirMap.set(folder.id, { ...folder, children: [], files: [] });
  });

  folders.forEach((folder) => {
    if (folder.parentId) {
      const parentFolder = dirMap.get(folder.parentId);
      if (parentFolder) {
        parentFolder.children.push(folder);
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
};

module.exports = {
  createUser,
  createNewFolder,
  createNewFile,
  createShareLink,
  getUserByUsername,
  getUserById,
  getDirContents,
  getTrash,
  getAllSharedByUser,
  updateFileName,
  updateFolderName,
  moveFolderToTrash,
  moveFileToTrash,
  restorFolderFromTrash,
  restorFileFromTrash,
  updateItemParent,
  deleteShareLink,
  deleteFile,
  deleteFolder,
  generateDirTree,
};
