import { z } from "zod";

export const validateBody = (schema: z.ZodSchema) => {
  return async (req: any, res: any, next: any) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors.reduce((acc, curr) => {
            acc[curr.path.join(".")] = curr.message;
            return acc;
          }, {} as Record<string, string>),
        });
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return async (req: any, res: any, next: any) => {
    try {
      await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors.reduce((acc, curr) => {
            acc[curr.path.join(".")] = curr.message;
            return acc;
          }, {} as Record<string, string>),
        });
      }
      next(error);
    }
  };
};
