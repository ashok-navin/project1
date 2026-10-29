import Package from '../models/Package.js';
import { uploadBufferToGridFS, deleteGridFSFile } from '../services/gridfsService.js';

// GET /api/packages
export const getPackages = async (req, res) => {
  try {
    const filter = {};
    if (!req.user || req.user.role !== 'ADMIN') {
      filter.isActive = true;
    }

    const packages = await Package.find(filter).sort({ order: 1, price: 1 });
    return res.status(200).json({ success: true, count: packages.length, packages });
  } catch (error) {
    console.error('[Get Packages Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch packages.' });
  }
};

// GET /api/packages/:id
export const getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }
    return res.status(200).json({ success: true, package: pkg });
  } catch (error) {
    console.error('[Get Package Detail Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch package details.' });
  }
};

// POST /api/admin/packages
export const createPackage = async (req, res) => {
  try {
    const { name, description, price, features, addOns, isActive, isFeatured, order, coverImageUrl } = req.body;

    if (!name || !description || price === undefined) {
      return res.status(400).json({ success: false, message: 'Name, description, and price are required.' });
    }

    let parsedFeatures = [];
    if (features) {
      parsedFeatures = Array.isArray(features) ? features : JSON.parse(features);
    }

    let parsedAddOns = [];
    if (addOns) {
      parsedAddOns = Array.isArray(addOns) ? addOns : JSON.parse(addOns);
    }

    let coverImageFileId = null;
    if (req.file) {
      const uploadResult = await uploadBufferToGridFS(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        { context: 'package_cover', packageName: name }
      );
      coverImageFileId = uploadResult.fileId;
    }

    const newPackage = await Package.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      features: parsedFeatures,
      addOns: parsedAddOns,
      coverImageFileId,
      coverImageUrl: coverImageUrl || '',
      isActive: isActive !== undefined ? isActive === 'true' || isActive === true : true,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' || isFeatured === true : false,
      order: order ? Number(order) : 0
    });

    return res.status(201).json({
      success: true,
      message: 'Package created successfully.',
      package: newPackage
    });
  } catch (error) {
    console.error('[Create Package Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create package: ' + error.message });
  }
};

// PUT /api/admin/packages/:id
export const updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    const { name, description, price, features, addOns, isActive, isFeatured, order, coverImageUrl } = req.body;

    if (name) pkg.name = name.trim();
    if (description) pkg.description = description.trim();
    if (price !== undefined) pkg.price = Number(price);

    if (features !== undefined) {
      pkg.features = Array.isArray(features) ? features : JSON.parse(features);
    }

    if (addOns !== undefined) {
      pkg.addOns = Array.isArray(addOns) ? addOns : JSON.parse(addOns);
    }

    if (isActive !== undefined) {
      pkg.isActive = isActive === 'true' || isActive === true;
    }

    if (isFeatured !== undefined) {
      pkg.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    if (order !== undefined) {
      pkg.order = Number(order);
    }

    if (coverImageUrl !== undefined) {
      pkg.coverImageUrl = coverImageUrl;
    }

    if (req.file) {
      // Clean up previous image if exists in GridFS
      if (pkg.coverImageFileId) {
        await deleteGridFSFile(pkg.coverImageFileId);
      }
      const uploadResult = await uploadBufferToGridFS(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        { context: 'package_cover', packageName: pkg.name }
      );
      pkg.coverImageFileId = uploadResult.fileId;
    }

    await pkg.save();

    return res.status(200).json({
      success: true,
      message: 'Package updated successfully.',
      package: pkg
    });
  } catch (error) {
    console.error('[Update Package Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update package: ' + error.message });
  }
};

// DELETE /api/admin/packages/:id
export const deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found.' });
    }

    if (pkg.coverImageFileId) {
      await deleteGridFSFile(pkg.coverImageFileId);
    }

    await Package.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Package deleted successfully.'
    });
  } catch (error) {
    console.error('[Delete Package Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete package.' });
  }
};
