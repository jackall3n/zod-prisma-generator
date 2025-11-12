# Zod Prisma Generator

A Prisma generator that automatically creates [Zod](https://github.com/colinhacks/zod) schemas from your Prisma schema models.

## Features

- Generates Zod schemas from Prisma enums
- TypeScript type inference support
- Configurable output directory
- Built with Bun for fast generation

## Installation

```bash
bun add zod-prisma-generator zod
bun add -d prisma @prisma/client
```

## Usage

Add the generator to your `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

generator zod {
  provider = "bun ./src/index.ts"
  output   = "../generated/schemas"
  enums    = true
}

enum Role {
  USER
  ADMIN
}
```

Generate the schemas:

```bash
bun run db:generate
# or
prisma generate
```

This will create Zod schemas in your specified output directory:

```typescript
// generated/schemas/enums.ts
import { z } from "zod";

export const RoleSchema = z.enum(["USER", "ADMIN"]);
export type Role = z.infer<typeof RoleSchema>;
```

## Configuration

### Generator Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `output` | string | `"./"` | Directory where generated files will be created |
| `enums` | boolean | `false` | Generate Zod schemas for Prisma enums |

## Example

```typescript
import { RoleSchema } from "./generated/schemas";

// Validate data
const result = RoleSchema.safeParse("USER");

if (result.success) {
  console.log("Valid role:", result.data);
} else {
  console.error("Invalid role:", result.error);
}
```

## Development

This project uses [Bun](https://bun.sh) as its runtime and package manager.

```bash
# Install dependencies
bun install

# Generate Prisma client and Zod schemas
bun run db:generate
```

## Requirements

- TypeScript ^5
- Prisma ^6.19.0
- Zod ^4.1.12

## License

MIT
