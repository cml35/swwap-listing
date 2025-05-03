import express from 'express';
import { createListing, updateListing, deleteListing, removeListing, getListings, getListing } from '../controllers/listingController';
import { auth } from '../middleware/auth';
import { listingValidation } from '../middleware/listingValidation';

const router = express.Router();

// Add logging middleware
router.use((req, res, next) => {
  console.log('Backend - Incoming request:', {
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    headers: {
      authorization: req.headers.authorization ? 'Bearer [HIDDEN]' : 'No token',
    }
  });
  next();
});

router.post('/', auth, listingValidation, createListing);
router.get('/', auth, getListings);
router.get('/:id', auth, getListing);
router.put('/:id', auth, listingValidation, updateListing);
router.delete('/:id', auth, deleteListing);
router.delete('/remove/:id', auth, removeListing);

export default router; 