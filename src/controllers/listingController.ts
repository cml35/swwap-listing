import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const createListing = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, condition, images, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

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

    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({ error: 'Error creating listing' });
  }
};

export const updateListing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, condition, images, tags } = req.body;
    const userId = req.user?.id;

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

    res.json(updatedListing);
  } catch (error) {
    res.status(400).json({ error: 'Error updating listing' });
  }
};

export const deleteListing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

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
    res.status(400).json({ error: 'Error deleting listing' });
  }
}; 