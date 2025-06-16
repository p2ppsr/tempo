import { Request, Response, NextFunction } from 'express'

export interface RouteDefinition {
  type: 'get' | 'post' | 'put' | 'delete' | 'patch'
  path: string
  func: (req: Request, res: Response, next: NextFunction) => any

  // Optional documentation-related metadata
  summary?: string
  parameters?: Record<string, any>
  exampleResponse?: any
  hidden?: boolean // If true, this route won't be included in the documentation
}
