/**
 * Kompletna OpenAPI 3.0 specifikacija za SplitBill API.
 *
 * Spec je definisan direktno kao JS objekat (ne koristi swagger-jsdoc skeniranje
 * fajlova) kako bi radio pouzdano i u development i u Docker/production okruženju.
 */

const spec = {
  openapi: '3.0.0',
  info: {
    title: 'SplitBill API',
    version: '1.0.0',
    description:
      'REST API dokumentacija za SplitBill — aplikaciju za deljenje troškova. ' +
      'Autentifikacija se vrši putem session cookie-ja (NextAuth.js). ' +
      'Za state-changing operacije potreban je X-CSRF-Token header.',
    contact: {
      name: 'SplitBill Support',
      email: 'support@splitbill.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Development server' },
    { url: 'https://splitbill.vercel.app', description: 'Production server' },
  ],
  tags: [
    { name: 'Authentication', description: 'Registracija, prijava i verifikacija emaila' },
    { name: 'Groups', description: 'Upravljanje grupama — kreiranje, članstvo, arhiviranje' },
    { name: 'Expenses', description: 'Troškovi — kreiranje, pretraga, splitovanje' },
    { name: 'Profile', description: 'Korisnički profil i podešavanja' },
    { name: 'Currency', description: 'Kursevi valuta i konverzija' },
    { name: 'Reports', description: 'Analitika i izveštaji troškova' },
    { name: 'Dashboard', description: 'Statistike dashboarda' },
    { name: 'Admin', description: 'Admin endpoint-i (zahteva ADMIN rolu)' },
    { name: 'Utility', description: 'Health check, CSRF token' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'next-auth.session-token',
        description: 'Session cookie od NextAuth.js (automatski se setuje pri prijavi)',
      },
      csrfToken: {
        type: 'apiKey',
        in: 'header',
        name: 'X-CSRF-Token',
        description: 'CSRF token za POST/PUT/PATCH/DELETE operacije (dobija se sa GET /api/csrf)',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clh1234567890abcdef' },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          name: { type: 'string', example: 'Marko Marković' },
          role: { type: 'string', enum: ['USER', 'EDITOR', 'ADMIN'], example: 'USER' },
          emailVerified: { type: 'boolean', example: true },
          avatarUrl: { type: 'string', nullable: true, example: 'https://example.com/avatar.jpg' },
          bio: { type: 'string', nullable: true, maxLength: 500, example: 'Volim putovanja!' },
          preferredCurrency: {
            type: 'string',
            enum: ['USD', 'EUR', 'GBP', 'RSD', 'JPY', 'CAD', 'AUD', 'CHF'],
            example: 'USD',
          },
          createdAt: { type: 'string', format: 'date-time', example: '2024-01-20T12:00:00Z' },
        },
      },
      Group: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clh1234567890abcdef' },
          name: { type: 'string', example: 'Stan Beograd' },
          description: { type: 'string', nullable: true, example: 'Zajednički troškovi stana' },
          ownerId: { type: 'string', example: 'clh1234567890abcdef' },
          inviteCode: { type: 'string', example: 'clhxyz987abc' },
          isArchived: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time', example: '2024-01-20T12:00:00Z' },
          owner: { $ref: '#/components/schemas/User' },
          members: { type: 'array', items: { $ref: '#/components/schemas/GroupMember' } },
          _count: {
            type: 'object',
            properties: {
              members: { type: 'integer', example: 3 },
              expenses: { type: 'integer', example: 15 },
            },
          },
        },
      },
      GroupMember: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clh1234567890abcdef' },
          groupId: { type: 'string', example: 'clh1234567890abcdef' },
          userId: { type: 'string', example: 'clh1234567890abcdef' },
          isPending: { type: 'boolean', example: false },
          joinedAt: { type: 'string', format: 'date-time', example: '2024-01-20T12:00:00Z' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      Expense: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clh1234567890abcdef' },
          groupId: { type: 'string', example: 'clh1234567890abcdef' },
          payerId: { type: 'string', example: 'clh1234567890abcdef' },
          description: { type: 'string', example: 'Večera u restoranu' },
          amount: { type: 'number', format: 'decimal', minimum: 0.01, example: 3600 },
          category: {
            type: 'string',
            enum: ['FOOD', 'TRANSPORT', 'ACCOMMODATION', 'ENTERTAINMENT', 'BILLS', 'OTHER'],
            example: 'FOOD',
          },
          splitMethod: {
            type: 'string',
            enum: ['EQUAL', 'PERCENTAGE', 'EXACT'],
            example: 'EQUAL',
          },
          date: { type: 'string', format: 'date-time', example: '2024-01-20T18:00:00Z' },
          createdAt: { type: 'string', format: 'date-time', example: '2024-01-20T12:00:00Z' },
          payer: { $ref: '#/components/schemas/User' },
          splits: { type: 'array', items: { $ref: '#/components/schemas/ExpenseSplit' } },
        },
      },
      ExpenseSplit: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clh1234567890abcdef' },
          expenseId: { type: 'string', example: 'clh1234567890abcdef' },
          userId: { type: 'string', example: 'clh1234567890abcdef' },
          amount: { type: 'number', format: 'decimal', minimum: 0.01, example: 1200 },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      Settlement: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clh1234567890abcdef' },
          groupId: { type: 'string', example: 'clh1234567890abcdef' },
          fromUserId: { type: 'string', example: 'clh1234567890abcdef' },
          toUserId: { type: 'string', example: 'clh1234567890abcdef' },
          amount: { type: 'number', example: 1500 },
          date: { type: 'string', format: 'date-time', example: '2024-01-20T12:00:00Z' },
          comment: { type: 'string', nullable: true, example: 'Vraćam dug za večeru' },
          createdAt: { type: 'string', format: 'date-time', example: '2024-01-20T12:00:00Z' },
          fromUser: { $ref: '#/components/schemas/User' },
          toUser: { $ref: '#/components/schemas/User' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'An error occurred' },
          details: { type: 'object', nullable: true },
          code: { type: 'string', nullable: true, example: 'VALIDATION_ERROR' },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Nije autentifikovan',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { error: { type: 'string', example: 'Unauthorized' } },
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Nema dovoljno permisija',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Forbidden - Insufficient permissions' },
              },
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resurs nije pronađen',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { error: { type: 'string', example: 'Not found' } },
            },
          },
        },
      },
      ValidationError: {
        description: 'Greška u validaciji inputa',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Validation failed' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      RateLimitError: {
        description: 'Previše zahteva',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string', example: 'Too many requests, please try again later.' },
                retryAfter: { type: 'number', example: 900 },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    // =============================================
    // AUTHENTICATION
    // =============================================
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Registracija novog korisnika',
        description:
          'Kreira novi korisnički nalog. Nakon registracije, šalje se verifikacioni email. ' +
          'Prijava nije moguća dok se email ne verifikuje.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'marko@example.com' },
                  password: {
                    type: 'string',
                    format: 'password',
                    minLength: 8,
                    description: 'Minimum 8 karaktera, 1 veliko slovo, 1 malo slovo, 1 broj',
                    example: 'SecurePass123',
                  },
                  name: { type: 'string', minLength: 2, maxLength: 50, example: 'Marko Marković' },
                  bio: {
                    type: 'string',
                    maxLength: 500,
                    nullable: true,
                    example: 'Student FTN-a',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Korisnik uspešno registrovan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'User registered successfully. Please verify your email.',
                    },
                    userId: { type: 'string', example: 'clh1234567890abcdef' },
                    user: {
                      type: 'object',
                      properties: {
                        email: { type: 'string', example: 'marko@example.com' },
                        name: { type: 'string', example: 'Marko Marković' },
                        role: { type: 'string', example: 'USER' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          409: {
            description: 'Email je već registrovan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { error: { type: 'string', example: 'Email already registered' } },
                },
              },
            },
          },
          429: { $ref: '#/components/responses/RateLimitError' },
        },
      },
    },
    '/api/auth/verify-email': {
      get: {
        tags: ['Authentication'],
        summary: 'Verifikacija email adrese',
        description:
          'Verifikuje email adresu korisnika. Link sa userId-om se dobija u verifikacionom emailu.',
        parameters: [
          {
            in: 'query',
            name: 'userId',
            required: true,
            schema: { type: 'string' },
            description: 'ID korisnika iz verifikacionog emaila',
            example: 'clh1234567890abcdef',
          },
        ],
        responses: {
          200: {
            description: 'Email uspešno verifikovan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Email verified successfully. You can now log in.',
                    },
                  },
                },
              },
            },
          },
          400: { description: 'userId parametar nedostaje' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
      post: {
        tags: ['Authentication'],
        summary: 'Ponovo pošalji verifikacioni email',
        description: 'Šalje novi verifikacioni email na zadatu adresu.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'marko@example.com' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Email poslat (ili ignorisan ako ne postoji, radi sigurnosti)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'If the email exists, a verification link has been sent.',
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Email već verifikovan ili nedostaje parametar' },
        },
      },
    },

    // =============================================
    // GROUPS
    // =============================================
    '/api/groups': {
      get: {
        tags: ['Groups'],
        summary: 'Lista svih grupa korisnika',
        description: 'Vraća sve grupe u kojima je prijavljeni korisnik aktivan član.',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Lista grupa',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    groups: { type: 'array', items: { $ref: '#/components/schemas/Group' } },
                    total: { type: 'integer', example: 3 },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
      post: {
        tags: ['Groups'],
        summary: 'Kreiranje nove grupe',
        description: 'Kreira novu grupu. Zahteva EDITOR ili ADMIN rolu.',
        security: [{ cookieAuth: [] }, { csrfToken: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', minLength: 2, maxLength: 100, example: 'Stan Novi Sad' },
                  description: {
                    type: 'string',
                    maxLength: 500,
                    nullable: true,
                    example: 'Zajednički troškovi stana',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Grupa uspešno kreirana',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Group created successfully' },
                    group: { $ref: '#/components/schemas/Group' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { $ref: '#/components/responses/ForbiddenError' },
        },
      },
    },
    '/api/groups/join': {
      post: {
        tags: ['Groups'],
        summary: 'Pridruži se grupi putem invite koda',
        description: 'Korisnik se pridružuje grupi koristeći jedinstveni inviteCode grupe.',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['inviteCode'],
                properties: {
                  inviteCode: { type: 'string', example: 'clhxyz987abc123def' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Uspešno pridruživanje grupi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Successfully joined group' },
                    groupId: { type: 'string', example: 'clh1234567890abcdef' },
                    groupName: { type: 'string', example: 'Stan Novi Sad' },
                  },
                },
              },
            },
          },
          400: { description: 'Već si član grupe' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          404: { description: 'Pogrešan invite kod' },
        },
      },
    },
    '/api/groups/{id}': {
      get: {
        tags: ['Groups'],
        summary: 'Detalji grupe',
        description: 'Vraća detalje grupe sa svim članovima i troškovima. Korisnik mora biti član.',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID grupe',
          },
        ],
        responses: {
          200: {
            description: 'Detalji grupe',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { group: { $ref: '#/components/schemas/Group' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { description: 'Nisi član ove grupe' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
      put: {
        tags: ['Groups'],
        summary: 'Izmena grupe',
        description: 'Menja naziv i/ili opis grupe. Samo vlasnik grupe može izmeniti.',
        security: [{ cookieAuth: [] }, { csrfToken: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID grupe',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 2, maxLength: 100, example: 'Novo ime grupe' },
                  description: {
                    type: 'string',
                    maxLength: 500,
                    nullable: true,
                    example: 'Novi opis',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Grupa uspešno izmenjena',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Group updated successfully' },
                    group: { $ref: '#/components/schemas/Group' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { description: 'Samo vlasnik grupe može menjati grupu' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
      delete: {
        tags: ['Groups'],
        summary: 'Brisanje grupe',
        description:
          'Briše grupu i sve njene troškove (CASCADE). Samo vlasnik grupe može brisati.',
        security: [{ cookieAuth: [] }, { csrfToken: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID grupe',
          },
        ],
        responses: {
          200: {
            description: 'Grupa uspešno obrisana',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Group deleted successfully' },
                    deletedExpenses: { type: 'integer', example: 12 },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { description: 'Samo vlasnik grupe može brisati grupu' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/api/groups/{id}/balances': {
      get: {
        tags: ['Groups'],
        summary: 'Balanse i optimizovani dugovi grupe',
        description:
          'Vraća balanse svakog člana i optimizovan spisak dugova — minimalan broj transakcija ' +
          'za potpuno poravnanje svih dugova u grupi (greedy algoritam).',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID grupe',
          },
        ],
        responses: {
          200: {
            description: 'Balanse i dugovi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    balances: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          userId: { type: 'string' },
                          userName: { type: 'string' },
                          balance: {
                            type: 'number',
                            description: 'Pozitivno = duguju mu, negativno = duguje',
                          },
                        },
                      },
                    },
                    optimizedDebts: {
                      type: 'array',
                      description: 'Minimalan broj transakcija za poravnanje svih dugova',
                      items: {
                        type: 'object',
                        properties: {
                          from: { type: 'string', description: 'ID korisnika koji duguje' },
                          fromName: { type: 'string', example: 'Ana Anić' },
                          to: { type: 'string', description: 'ID korisnika kome se duguje' },
                          toName: { type: 'string', example: 'Marko Marković' },
                          amount: { type: 'number', example: 1500 },
                        },
                      },
                    },
                    summary: {
                      type: 'object',
                      properties: {
                        totalDebts: { type: 'number', example: 3600 },
                        totalSettled: { type: 'number', example: 1200 },
                        unsettledAmount: { type: 'number', example: 2400 },
                        transactionsNeeded: { type: 'integer', example: 2 },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { description: 'Nisi član ove grupe' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/api/groups/{id}/archive': {
      patch: {
        tags: ['Groups'],
        summary: 'Arhiviranje/razarhiviranje grupe',
        description: 'Toggle arhiviranog statusa grupe. Samo vlasnik grupe može arhivirati.',
        security: [{ cookieAuth: [] }, { csrfToken: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID grupe',
          },
        ],
        responses: {
          200: {
            description: 'Status arhiviranja promenjen',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Group archived successfully' },
                    group: { $ref: '#/components/schemas/Group' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { description: 'Samo vlasnik grupe može arhivirati' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/api/groups/{id}/transfer': {
      post: {
        tags: ['Groups'],
        summary: 'Prenos vlasništva grupe',
        description:
          'Prenosi vlasništvo grupe na drugog člana. Samo trenutni vlasnik može preneti.',
        security: [{ cookieAuth: [] }, { csrfToken: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID grupe',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['newOwnerId'],
                properties: {
                  newOwnerId: {
                    type: 'string',
                    description: 'ID korisnika koji postaje novi vlasnik (mora biti član grupe)',
                    example: 'clh9876543210fedcba',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Vlasništvo uspešno preneto',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Ownership transferred successfully' },
                    group: { $ref: '#/components/schemas/Group' },
                  },
                },
              },
            },
          },
          400: { description: 'Novi vlasnik mora biti član grupe' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { description: 'Samo trenutni vlasnik može preneti vlasništvo' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/api/groups/{id}/settlements': {
      post: {
        tags: ['Groups'],
        summary: 'Evidentiraj poravnanje duga',
        description:
          'Evidentira uplatu dugovanog iznosa drugom članu grupe. ' +
          'Šalje email obaveštenje primaocu. Balanse se ažuriraju automatski.',
        security: [{ cookieAuth: [] }, { csrfToken: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID grupe',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['toUserId', 'amount', 'date'],
                properties: {
                  toUserId: {
                    type: 'string',
                    description: 'ID korisnika kome se plaća (mora biti član grupe)',
                    example: 'clh9876543210fedcba',
                  },
                  amount: { type: 'number', minimum: 0.01, maximum: 999999.99, example: 1500 },
                  date: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-20T12:00:00Z',
                  },
                  comment: {
                    type: 'string',
                    maxLength: 500,
                    nullable: true,
                    example: 'Vraćam dug za januar',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Poravnanje evidentirano',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Settlement recorded successfully' },
                    settlement: { $ref: '#/components/schemas/Settlement' },
                  },
                },
              },
            },
          },
          400: { description: 'Ne možeš platiti samom sebi ili korisnik nije član' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { description: 'Nisi član ove grupe' },
        },
      },
    },

    // =============================================
    // EXPENSES
    // =============================================
    '/api/expenses': {
      get: {
        tags: ['Expenses'],
        summary: 'Lista troškova u grupi',
        description: 'Vraća sve troškove u određenoj grupi. Korisnik mora biti član grupe.',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'groupId',
            required: true,
            schema: { type: 'string' },
            description: 'ID grupe čiji se troškovi traže',
            example: 'clh1234567890abcdef',
          },
        ],
        responses: {
          200: {
            description: 'Lista troškova',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    expenses: { type: 'array', items: { $ref: '#/components/schemas/Expense' } },
                    total: { type: 'integer', example: 15 },
                  },
                },
              },
            },
          },
          400: { description: 'groupId parametar je obavezan' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { description: 'Nisi član ove grupe' },
        },
      },
      post: {
        tags: ['Expenses'],
        summary: 'Kreiranje novog troška',
        description:
          'Kreira novi trošak sa raspodjelom (splits). ' +
          'Suma splitova mora tačno odgovarati ukupnom iznosu (tolerancija ±0.01). ' +
          'Šalje email obaveštenja svim učesnicima.',
        security: [{ cookieAuth: [] }, { csrfToken: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['groupId', 'description', 'amount', 'category', 'date', 'splits'],
                properties: {
                  groupId: { type: 'string', example: 'clh1234567890abcdef' },
                  description: {
                    type: 'string',
                    minLength: 2,
                    maxLength: 200,
                    example: 'Večera u restoranu',
                  },
                  amount: { type: 'number', minimum: 0.01, example: 3600 },
                  category: {
                    type: 'string',
                    enum: ['FOOD', 'TRANSPORT', 'ACCOMMODATION', 'ENTERTAINMENT', 'BILLS', 'OTHER'],
                    example: 'FOOD',
                  },
                  date: { type: 'string', format: 'date-time', example: '2024-01-20T18:00:00Z' },
                  splits: {
                    type: 'array',
                    minItems: 1,
                    description: 'Raspodela troška — suma mora biti jednaka amount',
                    items: {
                      type: 'object',
                      required: ['userId', 'amount'],
                      properties: {
                        userId: { type: 'string', example: 'clh1234567890abcdef' },
                        amount: { type: 'number', minimum: 0.01, example: 1200 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Trošak uspešno kreiran',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Expense created successfully' },
                    expense: { $ref: '#/components/schemas/Expense' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Greška validacije ili suma splitova ne odgovara ukupnom iznosu',
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { description: 'Nisi član ove grupe' },
        },
      },
    },
    '/api/expenses/search': {
      get: {
        tags: ['Expenses'],
        summary: 'Pretraga i filtriranje troškova',
        description:
          'Pretražuje troškove korisnika po opisu, kategoriji, grupi, datumu i iznosu. Podržava paginaciju.',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'q',
            schema: { type: 'string' },
            description: 'Tekst pretrage (opis troška, case-insensitive)',
          },
          {
            in: 'query',
            name: 'category',
            schema: {
              type: 'string',
              enum: ['FOOD', 'TRANSPORT', 'ACCOMMODATION', 'ENTERTAINMENT', 'BILLS', 'OTHER'],
            },
            description: 'Filter po kategoriji',
          },
          {
            in: 'query',
            name: 'groupId',
            schema: { type: 'string' },
            description: 'Filter po grupi',
          },
          {
            in: 'query',
            name: 'from',
            schema: { type: 'string', format: 'date' },
            description: 'Datum od (YYYY-MM-DD)',
          },
          {
            in: 'query',
            name: 'to',
            schema: { type: 'string', format: 'date' },
            description: 'Datum do (YYYY-MM-DD)',
          },
          {
            in: 'query',
            name: 'minAmount',
            schema: { type: 'number' },
            description: 'Minimalni iznos',
          },
          {
            in: 'query',
            name: 'maxAmount',
            schema: { type: 'number' },
            description: 'Maksimalni iznos',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 50, maximum: 100 },
            description: 'Broj rezultata po stranici (max 100)',
          },
          {
            in: 'query',
            name: 'offset',
            schema: { type: 'integer', default: 0 },
            description: 'Pomeraj za paginaciju',
          },
        ],
        responses: {
          200: {
            description: 'Rezultati pretrage',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    expenses: { type: 'array', items: { $ref: '#/components/schemas/Expense' } },
                    total: { type: 'integer', example: 42 },
                    limit: { type: 'integer', example: 50 },
                    offset: { type: 'integer', example: 0 },
                    hasMore: { type: 'boolean', example: false },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/expenses/{id}': {
      get: {
        tags: ['Expenses'],
        summary: 'Detalji troška',
        description: 'Vraća detalje troška sa splitovima. Korisnik mora biti član grupe.',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID troška',
          },
        ],
        responses: {
          200: {
            description: 'Detalji troška',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { expense: { $ref: '#/components/schemas/Expense' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { description: 'Nisi član grupe kojoj trošak pripada' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
      put: {
        tags: ['Expenses'],
        summary: 'Izmena troška',
        description:
          'Menja opis, kategoriju ili datum troška. Samo kreator troška ili vlasnik grupe može izmeniti.',
        security: [{ cookieAuth: [] }, { csrfToken: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID troška',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  description: {
                    type: 'string',
                    minLength: 2,
                    maxLength: 200,
                    example: 'Izmenjen opis',
                  },
                  category: {
                    type: 'string',
                    enum: ['FOOD', 'TRANSPORT', 'ACCOMMODATION', 'ENTERTAINMENT', 'BILLS', 'OTHER'],
                  },
                  date: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Trošak uspešno izmenjen',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Expense updated successfully' },
                    expense: { $ref: '#/components/schemas/Expense' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { description: 'Samo kreator ili vlasnik grupe mogu menjati trošak' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
      delete: {
        tags: ['Expenses'],
        summary: 'Brisanje troška',
        description:
          'Briše trošak i sve splitove (CASCADE). Samo kreator ili vlasnik grupe može brisati.',
        security: [{ cookieAuth: [] }, { csrfToken: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID troška',
          },
        ],
        responses: {
          200: {
            description: 'Trošak uspešno obrisan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Expense deleted successfully' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { description: 'Samo kreator ili vlasnik grupe mogu brisati trošak' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },

    // =============================================
    // PROFILE
    // =============================================
    '/api/profile': {
      get: {
        tags: ['Profile'],
        summary: 'Pregled profila korisnika',
        description: 'Vraća kompletan profil prijavljenog korisnika sa statistikama.',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Profil korisnika',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
      patch: {
        tags: ['Profile'],
        summary: 'Izmena profila',
        description: 'Menja ime, bio i/ili avatar URL korisnika.',
        security: [{ cookieAuth: [] }, { csrfToken: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 2, maxLength: 50, example: 'Novo Ime' },
                  bio: {
                    type: 'string',
                    maxLength: 500,
                    nullable: true,
                    example: 'Nova biografija',
                  },
                  avatarUrl: {
                    type: 'string',
                    format: 'uri',
                    nullable: true,
                    example: 'https://example.com/avatar.jpg',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Profil uspešno izmenjen',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Profile updated successfully' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
      delete: {
        tags: ['Profile'],
        summary: 'Brisanje naloga',
        description: 'Trajno briše korisnički nalog i sve povezane podatke.',
        security: [{ cookieAuth: [] }, { csrfToken: [] }],
        responses: {
          200: {
            description: 'Nalog uspešno obrisan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Account deleted successfully' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/profile/password': {
      post: {
        tags: ['Profile'],
        summary: 'Promena lozinke',
        description: 'Menja lozinku korisnika. Zahteva ispravnu trenutnu lozinku.',
        security: [{ cookieAuth: [] }, { csrfToken: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: {
                    type: 'string',
                    format: 'password',
                    example: 'StaLozinka123',
                  },
                  newPassword: {
                    type: 'string',
                    format: 'password',
                    minLength: 8,
                    description: 'Minimum 8 karaktera, 1 veliko slovo, 1 malo slovo, 1 broj',
                    example: 'NovaLozinka456',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Lozinka uspešno promenjena',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Password changed successfully' },
                  },
                },
              },
            },
          },
          400: { description: 'Pogrešna trenutna lozinka ili nova ne zadovoljava zahteve' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },
    '/api/profile/currency': {
      get: {
        tags: ['Profile'],
        summary: 'Pregled preferovane valute',
        description: 'Vraća trenutno podešenu preferovanu valutu korisnika.',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Preferovana valuta',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    currency: {
                      type: 'string',
                      enum: ['USD', 'EUR', 'GBP', 'RSD', 'JPY', 'CAD', 'AUD', 'CHF'],
                      example: 'USD',
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
      put: {
        tags: ['Profile'],
        summary: 'Izmena preferovane valute',
        description: 'Menja preferovanu valutu korisnika. Dashboard prikazuje iznose u ovoj valuti.',
        security: [{ cookieAuth: [] }, { csrfToken: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currency'],
                properties: {
                  currency: {
                    type: 'string',
                    enum: ['USD', 'EUR', 'GBP', 'RSD', 'JPY', 'CAD', 'AUD', 'CHF'],
                    example: 'EUR',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Valuta uspešno ažurirana',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Currency preference updated successfully',
                    },
                    currency: { type: 'string', example: 'EUR' },
                  },
                },
              },
            },
          },
          400: { description: 'Neispravna šifra valute' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },

    // =============================================
    // CURRENCY
    // =============================================
    '/api/currency/rates': {
      get: {
        tags: ['Currency'],
        summary: 'Kursevi valuta',
        description:
          'Vraća trenutne kurseve valuta u odnosu na zadatu osnovnu valutu. Keširano 1 sat.',
        parameters: [
          {
            in: 'query',
            name: 'base',
            schema: {
              type: 'string',
              enum: ['USD', 'EUR', 'GBP', 'RSD', 'JPY', 'CAD', 'AUD', 'CHF'],
              default: 'USD',
            },
            description: 'Osnovna valuta za konverziju',
          },
        ],
        responses: {
          200: {
            description: 'Kursevi valuta',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    base: { type: 'string', example: 'USD' },
                    date: { type: 'string', format: 'date', example: '2024-01-20' },
                    rates: {
                      type: 'object',
                      additionalProperties: { type: 'number' },
                      example: { EUR: 0.92, GBP: 0.79, RSD: 107.5, JPY: 148.2 },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Neispravna šifra valute' },
          503: { description: 'ExchangeRate-API nije dostupan' },
        },
      },
    },
    '/api/currency/convert': {
      get: {
        tags: ['Currency'],
        summary: 'Konverzija iznosa između valuta',
        description: 'Konvertuje iznos iz jedne valute u drugu. Keširano 1 sat.',
        parameters: [
          {
            in: 'query',
            name: 'amount',
            required: true,
            schema: { type: 'number' },
            description: 'Iznos za konverziju',
            example: 100,
          },
          {
            in: 'query',
            name: 'from',
            required: true,
            schema: {
              type: 'string',
              enum: ['USD', 'EUR', 'GBP', 'RSD', 'JPY', 'CAD', 'AUD', 'CHF'],
            },
            description: 'Izlazna valuta',
            example: 'USD',
          },
          {
            in: 'query',
            name: 'to',
            required: true,
            schema: {
              type: 'string',
              enum: ['USD', 'EUR', 'GBP', 'RSD', 'JPY', 'CAD', 'AUD', 'CHF'],
            },
            description: 'Ciljna valuta',
            example: 'EUR',
          },
        ],
        responses: {
          200: {
            description: 'Rezultat konverzije',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    amount: { type: 'number', example: 100 },
                    from: { type: 'string', example: 'USD' },
                    to: { type: 'string', example: 'EUR' },
                    converted: { type: 'number', example: 92.0 },
                    rate: { type: 'number', example: 0.92 },
                  },
                },
              },
            },
          },
          400: { description: 'Nedostaju parametri ili neispravna šifra valute' },
        },
      },
    },

    // =============================================
    // REPORTS
    // =============================================
    '/api/reports': {
      get: {
        tags: ['Reports'],
        summary: 'Analitika i izveštaji troškova',
        description:
          'Vraća statistiku troškova: po kategoriji, po mesecu, top troškove i po platiocu. ' +
          'Može se filtrirati po grupi, datumu i kategoriji. Keširano 10 minuta.',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'groupId',
            schema: { type: 'string' },
            description: 'Filter po grupi (opciono — ako se izostavi, prikazuju se svi troškovi)',
          },
          {
            in: 'query',
            name: 'from',
            schema: { type: 'string', format: 'date' },
            description: 'Datum od (YYYY-MM-DD)',
          },
          {
            in: 'query',
            name: 'to',
            schema: { type: 'string', format: 'date' },
            description: 'Datum do (YYYY-MM-DD)',
          },
          {
            in: 'query',
            name: 'category',
            schema: {
              type: 'string',
              enum: ['FOOD', 'TRANSPORT', 'ACCOMMODATION', 'ENTERTAINMENT', 'BILLS', 'OTHER', 'ALL'],
            },
            description: 'Filter po kategoriji',
          },
        ],
        responses: {
          200: {
            description: 'Podaci za izveštaj',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalExpenses: {
                      type: 'number',
                      description: 'Ukupan iznos troškova',
                      example: 45000,
                    },
                    count: { type: 'integer', description: 'Broj troškova', example: 23 },
                    byCategory: {
                      type: 'object',
                      description: 'Iznos po kategoriji',
                      additionalProperties: { type: 'number' },
                      example: { FOOD: 15000, TRANSPORT: 8000, BILLS: 22000 },
                    },
                    byMonth: {
                      type: 'object',
                      description: 'Iznos po mesecu (YYYY-MM format)',
                      additionalProperties: { type: 'number' },
                      example: { '2024-01': 12000, '2024-02': 18000 },
                    },
                    topExpenses: {
                      type: 'array',
                      description: 'Top 10 troškova po iznosu',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          description: { type: 'string' },
                          amount: { type: 'number' },
                          category: { type: 'string' },
                          date: { type: 'string', format: 'date-time' },
                          payer: { type: 'string' },
                          group: { type: 'string' },
                        },
                      },
                    },
                    byUser: {
                      type: 'object',
                      description: 'Iznos po platiocu',
                      additionalProperties: { type: 'number' },
                      example: { 'Marko Marković': 25000, 'Ana Anić': 20000 },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          404: { description: 'Grupa nije pronađena ili nisi član' },
        },
      },
    },

    // =============================================
    // DASHBOARD
    // =============================================
    '/api/dashboard/stats': {
      get: {
        tags: ['Dashboard'],
        summary: 'Statistike za dashboard',
        description:
          'Vraća zbirne finansijske statistike za prijavljenog korisnika. Keširano 5 minuta.',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard statistike',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalBalance: {
                      type: 'number',
                      description: 'Neto balans (totalOwed - totalOwing)',
                      example: 2400,
                    },
                    totalOwed: {
                      type: 'number',
                      description: 'Ukupno što su drugi dužni korisniku (korisnik platio)',
                      example: 12000,
                    },
                    totalOwing: {
                      type: 'number',
                      description: 'Ukupno što korisnik duguje drugima',
                      example: 9600,
                    },
                    groupsCount: {
                      type: 'integer',
                      description: 'Broj aktivnih grupa',
                      example: 3,
                    },
                    expensesCount: {
                      type: 'integer',
                      description: 'Ukupan broj troškova',
                      example: 47,
                    },
                    membersCount: {
                      type: 'integer',
                      description: 'Ukupan broj članova u svim grupama',
                      example: 12,
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
        },
      },
    },

    // =============================================
    // ADMIN
    // =============================================
    '/api/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Lista svih korisnika (samo ADMIN)',
        description:
          'Vraća kompletnu listu svih korisnika u sistemu. Zahteva ADMIN rolu. ' +
          'Pristup je moguć putem Admin stranice u navigaciji (vidljiva samo ADMIN korisnicima).',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Lista korisnika',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                    total: { type: 'integer', example: 42 },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: {
            description: 'Samo ADMIN korisnici mogu pristupiti ovom endpoint-u',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Forbidden - Admin access required' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // =============================================
    // UTILITY
    // =============================================
    '/api/health': {
      get: {
        tags: ['Utility'],
        summary: 'Health check',
        description:
          'Proverava status aplikacije i konekcije sa bazom podataka. ' +
          'Koristi se za Docker healthcheck i monitoring.',
        responses: {
          200: {
            description: 'Aplikacija radi ispravno',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-01-20T12:00:00Z',
                    },
                    version: { type: 'string', example: '1.0.0' },
                    environment: { type: 'string', example: 'production' },
                    database: { type: 'string', example: 'connected' },
                  },
                },
              },
            },
          },
          503: {
            description: 'Baza podataka nije dostupna',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'error' },
                    timestamp: { type: 'string', format: 'date-time' },
                    database: { type: 'string', example: 'disconnected' },
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/csrf': {
      get: {
        tags: ['Utility'],
        summary: 'Generiši CSRF token',
        description:
          'Generiše CSRF token potreban za POST/PUT/PATCH/DELETE operacije. ' +
          'Token se vraća u body-u i setuje u HttpOnly kolačić. ' +
          'Prosledi ga kao X-CSRF-Token header u state-changing zahtevima.',
        responses: {
          200: {
            description: 'CSRF token generisan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    csrfToken: {
                      type: 'string',
                      example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

/**
 * Vraća kompletnu OpenAPI specifikaciju kao objekat.
 */
export function generateSwaggerSpec() {
  return spec;
}

/**
 * Vraća kompletnu OpenAPI specifikaciju kao JSON string.
 */
export function getSwaggerSpec() {
  return JSON.stringify(spec, null, 2);
}
