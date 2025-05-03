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
  body('images').isArray().withMessage('Images must be an array'),
  body('tags').isArray().withMessage('Tags must be an array'),
];

// Routes
router.post('/', auth, listingValidation, createListing);
router.put('/:id', auth, listingValidation, updateListing);
router.delete('/:id', auth, deleteListing);

export default router; 