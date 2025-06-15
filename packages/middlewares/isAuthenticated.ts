import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { UnauthorizedError } from '@packages/error-handler';
import prismaClient from '@packages/libs/prisma/prismadb';

const isAuthenticated = async (
  req: Request & { user?: any },
  _res: Response,
  next: NextFunction
) => {
  try {
    const accessToken =
      req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedError('Unauthorized! Access token not found');
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as {
      id: string;
      role: 'user' | 'seller';
    };
    if (!decoded || !decoded.id || !decoded.role) {
      throw new UnauthorizedError('Unauthorized! Invalid access token');
    }

    const account = await prismaClient.users.findUnique({
      where: { id: decoded.id },
    });

    if (!account) {
      throw new UnauthorizedError('Unauthorized! User not found');
    }
    req.user = account;

    return next();
  } catch (error) {
    return next(error);
  }
};
export default isAuthenticated;
