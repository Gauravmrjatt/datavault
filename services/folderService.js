const Folder = require('../models/Folder');
const HttpError = require('../utils/httpError');

function sanitizeName(name) {
  return String(name || '').trim();
}

async function computeFolderPath(ownerId, name, parentId) {
  const cleanedName = sanitizeName(name);
  if (!cleanedName) {
    throw new HttpError(400, 'Folder name is required');
  }

  if (!parentId) {
    return `/${cleanedName}`;
  }

  const parent = await Folder.findOne({ _id: parentId, ownerId, isTrashed: false }).lean();
  if (!parent) {
    throw new HttpError(404, 'Parent folder not found');
  }

  return `${parent.path}/${cleanedName}`;
}

async function buildBreadcrumbs(ownerId, folderId) {
  const breadcrumbs = [{ id: null, name: 'My Drive', path: '/' }];
  if (!folderId) {
    return breadcrumbs;
  }

  const chain = [];
  let current = await Folder.findOne({ _id: folderId, ownerId }).lean();
  while (current) {
    chain.push({ id: current._id, name: current.name, path: current.path });
    if (!current.parentId) break;
    current = await Folder.findOne({ _id: current.parentId, ownerId }).lean();
  }

  return breadcrumbs.concat(chain.reverse());
}

module.exports = {
  sanitizeName,
  computeFolderPath,
  buildBreadcrumbs
};
