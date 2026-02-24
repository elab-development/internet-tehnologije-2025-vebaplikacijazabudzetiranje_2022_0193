/**
 * OpenAPI Schema Definitions
 * Definicije svih modela koji se koriste u API-ju
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *           example: clh1234567890abcdef
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         name:
 *           type: string
 *           example: John Doe
 *         role:
 *           type: string
 *           enum: [USER, EDITOR, ADMIN]
 *           example: USER
 *         emailVerified:
 *           type: boolean
 *           example: true
 *         avatarUrl:
 *           type: string
 *           format: uri
 *           nullable: true
 *           example: https://example.com/avatar.jpg
 *         bio:
 *           type: string
 *           nullable: true
 *           maxLength: 500
 *           example: I love traveling and sharing expenses!
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-20T12:00:00Z
 *
 *     Group:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *           example: clh1234567890abcdef
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: Apartment Expenses
 *         description:
 *           type: string
 *           nullable: true
 *           maxLength: 500
 *           example: Shared costs for our apartment
 *         ownerId:
 *           type: string
 *           format: cuid
 *           example: clh1234567890abcdef
 *         isArchived:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-20T12:00:00Z
 *         owner:
 *           $ref: '#/components/schemas/User'
 *         members:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GroupMember'
 *         _count:
 *           type: object
 *           properties:
 *             members:
 *               type: integer
 *               example: 3
 *             expenses:
 *               type: integer
 *               example: 15
 *
 *     GroupMember:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *           example: clh1234567890abcdef
 *         groupId:
 *           type: string
 *           format: cuid
 *           example: clh1234567890abcdef
 *         userId:
 *           type: string
 *           format: cuid
 *           example: clh1234567890abcdef
 *         isPending:
 *           type: boolean
 *           example: false
 *         joinedAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-20T12:00:00Z
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     Expense:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *           example: clh1234567890abcdef
 *         groupId:
 *           type: string
 *           format: cuid
 *           example: clh1234567890abcdef
 *         payerId:
 *           type: string
 *           format: cuid
 *           example: clh1234567890abcdef
 *         description:
 *           type: string
 *           minLength: 2
 *           maxLength: 200
 *           example: Dinner at restaurant
 *         amount:
 *           type: number
 *           format: decimal
 *           minimum: 0.01
 *           example: 150.00
 *         category:
 *           type: string
 *           enum: [FOOD, TRANSPORT, ACCOMMODATION, ENTERTAINMENT, BILLS, OTHER]
 *           example: FOOD
 *         date:
 *           type: string
 *           format: date-time
 *           example: 2024-01-20T18:00:00Z
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-20T12:00:00Z
 *         payer:
 *           $ref: '#/components/schemas/User'
 *         splits:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ExpenseSplit'
 *
 *     ExpenseSplit:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *           example: clh1234567890abcdef
 *         expenseId:
 *           type: string
 *           format: cuid
 *           example: clh1234567890abcdef
 *         userId:
 *           type: string
 *           format: cuid
 *           example: clh1234567890abcdef
 *         amount:
 *           type: number
 *           format: decimal
 *           minimum: 0.01
 *           example: 50.00
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     RegisterInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: SecurePass123!
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: John Doe
 *         bio:
 *           type: string
 *           maxLength: 500
 *           nullable: true
 *           example: I love traveling!
 *
 *     CreateGroupInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: Weekend Trip
 *         description:
 *           type: string
 *           maxLength: 500
 *           nullable: true
 *           example: Expenses for our weekend getaway
 *
 *     CreateExpenseInput:
 *       type: object
 *       required:
 *         - groupId
 *         - description
 *         - amount
 *         - category
 *         - date
 *         - splits
 *       properties:
 *         groupId:
 *           type: string
 *           format: cuid
 *           example: clh1234567890abcdef
 *         description:
 *           type: string
 *           minLength: 2
 *           maxLength: 200
 *           example: Dinner at Italian restaurant
 *         amount:
 *           type: number
 *           format: decimal
 *           minimum: 0.01
 *           example: 120.00
 *         category:
 *           type: string
 *           enum: [FOOD, TRANSPORT, ACCOMMODATION, ENTERTAINMENT, BILLS, OTHER]
 *           example: FOOD
 *         date:
 *           type: string
 *           format: date-time
 *           example: 2024-01-20T18:00:00Z
 *         splits:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: object
 *             required:
 *               - userId
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *                 format: cuid
 *                 example: clh1234567890abcdef
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0.01
 *                 example: 40.00
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: An error occurred
 *         details:
 *           type: object
 *           nullable: true
 *         code:
 *           type: string
 *           nullable: true
 *           example: VALIDATION_ERROR
 */

// This file only contains JSDoc comments for Swagger
export {};
