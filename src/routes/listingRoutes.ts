import { Router } from 'express';
import { body } from 'express-validator';
import { createListing, updateListing, deleteListing } from '../controllers/listingController';
import { auth } from '../middleware/auth';

const router = Router();

// Validation middleware
const listingValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('condition').trim().notEmpty().withMessage('Condition is required'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
    .custom((value) => {
      if (!value) return true; // Allow null/undefined
      return value.every((item: any) => typeof item === 'string');
    })
    .withMessage('All images must be strings'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((value) => {
      if (!value) return true; // Allow null/undefined
      return value.every((item: any) => typeof item === 'string');
    })
    .withMessage('All tags must be strings'),
];

// Routes
router.post('/', auth, listingValidation, createListing);
router.put('/:id', auth, listingValidation, updateListing);
router.delete('/:id', auth, deleteListing);

export default router; 