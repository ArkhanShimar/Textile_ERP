import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  next();
};

export const validateLogin = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

export const validateUser = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('role').isIn(['ADMIN', 'OFFICE_STAFF']).withMessage('Invalid role'),
  handleValidationErrors
];

export const validateProduct = [
  body('code').trim().notEmpty().withMessage('Product code is required'),
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('storeId').notEmpty().withMessage('Store is required'),
  body('unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be positive'),
  handleValidationErrors
];

export const validateCategory = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  handleValidationErrors
];

export const validateStore = [
  body('name').trim().notEmpty().withMessage('Store name is required'),
  body('code').trim().notEmpty().withMessage('Store code is required'),
  handleValidationErrors
];

export const validateCustomer = [
  body('name').trim().notEmpty().withMessage('Customer name is required'),
  handleValidationErrors
];

export const validatePurchaseOrder = [
  body('customerId').notEmpty().withMessage('Customer is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be positive'),
  handleValidationErrors
];
