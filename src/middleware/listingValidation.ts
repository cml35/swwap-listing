import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';

export const listingValidation = [
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