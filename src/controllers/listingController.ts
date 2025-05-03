import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    iat: number;
    exp: number;
  };
  body: {
    title?: string;
    description?: string;
    condition?: string;
    images?: string[];
    tags?: string[];
  };
  params: {
    id?: string;
  };
}

export const createListing = async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== CREATE LISTING REQUEST ===');
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('Raw tags type:', typeof req.body.tags);
    console.log('Raw tags value:', req.body.tags);

    const { title, description, condition } = req.body;
    
    if (!title || !description || !condition) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const images = Array.isArray(req.body.images) ? req.body.images : [];
    const tags = Array.isArray(req.body.tags) ? req.body.tags : [];

    console.log('Processed tags:', tags);
    console.log('Processed tags type:', typeof tags);
    console.log('Is tags array?', Array.isArray(tags));

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('Data being sent to Prisma:', {
      title,
      description,
      condition,
      images,
      tags,
      userId
    });

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        condition,
        images,
        tags,
        userId,
      },
    });

    console.log('Prisma response:', JSON.stringify(listing, null, 2));
    console.log('Response tags type:', typeof listing.tags);
    console.log('Response tags value:', listing.tags);
    console.log('=== END CREATE LISTING ===\n');

    res.status(201).json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(400).json({ error: 'Error creating listing' });
  }
};

export const updateListing = async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== UPDATE LISTING REQUEST ===');
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('Raw tags type:', typeof req.body.tags);
    console.log('Raw tags value:', req.body.tags);

    const { id } = req.params;
    const { title, description, condition } = req.body;
    
    if (!id || !title || !description || !condition) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const images = Array.isArray(req.body.images) ? req.body.images : [];
    const tags = Array.isArray(req.body.tags) ? req.body.tags : [];

    console.log('Processed tags:', tags);
    console.log('Processed tags type:', typeof tags);
    console.log('Is tags array?', Array.isArray(tags));

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if listing exists and belongs to user
    const existingListing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existingListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (existingListing.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    console.log('Data being sent to Prisma:', {
      id,
      title,
      description,
      condition,
      images,
      tags
    });

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        title,
        description,
        condition,
        images,
        tags,
      },
    });

    console.log('Prisma response:', JSON.stringify(updatedListing, null, 2));
    console.log('Response tags type:', typeof updatedListing.tags);
    console.log('Response tags value:', updatedListing.tags);
    console.log('=== END UPDATE LISTING ===\n');

    res.json(updatedListing);
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(400).json({ error: 'Error updating listing' });
  }
};

export const deleteListing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if listing exists and belongs to user
    const existingListing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existingListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (existingListing.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    await prisma.listing.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(400).json({ error: 'Error deleting listing' });
  }
};

export const getListings = async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== GET LISTINGS REQUEST ===');
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const listings = await prisma.listing.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Found listings:', listings.length);
    console.log('=== END GET LISTINGS ===\n');

    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Error fetching listings' });
  }
};

export const removeListing = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Backend - Starting removeListing');
    console.log('Backend - Request params:', req.params);
    console.log('Backend - User from request:', req.user);

    const { id } = req.params;
    const userId = req.user?.userId;

    console.log('Backend - Listing ID:', id);
    console.log('Backend - User ID:', userId);

    if (!userId) {
      console.log('Backend - No user ID found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find the listing and check ownership
    console.log('Backend - Finding listing in database');
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    console.log('Backend - Found listing:', listing);

    if (!listing) {
      console.log('Backend - Listing not found');
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.userId !== userId) {
      console.log('Backend - User not authorized. Listing userId:', listing.userId, 'Request userId:', userId);
      return res.status(403).json({ message: 'Not authorized to remove this listing' });
    }

    // Delete the listing
    console.log('Backend - Deleting listing');
    await prisma.listing.delete({
      where: { id },
    });

    console.log('Backend - Successfully deleted listing');
    res.status(200).json({ message: 'Listing removed successfully' });
  } catch (error) {
    console.error('Backend - Error in removeListing:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ message: 'Error removing listing' });
  }
};

export const getListing = async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== GET LISTING REQUEST ===');
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      console.log('No user ID found in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('Fetching listing with ID:', id);
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      console.log('Listing not found');
      return res.status(404).json({ error: 'Listing not found' });
    }

    console.log('Found listing:', listing);
    console.log('=== END GET LISTING ===\n');

    res.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ error: 'Error fetching listing' });
  }
}; 