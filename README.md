# MessAround Backend

Simple and clean Express.js backend built with Node.js and JavaScript.

## Features

- ✅ Express.js server
- ✅ CORS enabled
- ✅ JSON body parsing
- ✅ Environment variables with dotenv
- ✅ Nodemon for development
- ✅ Clean error handling
- ✅ Sample routes

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation & Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Modify values if needed (default PORT is 3000)

3. **Start development server:**

   ```bash
   npm run dev
   ```

4. **Start production server:**
   ```bash
   npm start
   ```

## Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server with nodemon (auto-restart on changes)

## Project Structure

```
MessAround/
├── src/
│   └── index.js          # Main application entry point
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment template
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies and scripts
└── README.md            # This file
```

## API Endpoints

### GET /

Root endpoint - health check

**Response:**

```json
{
  "message": "Welcome to MessAround Backend API",
  "status": "Server is running",
  "timestamp": "2026-02-15T10:30:00.000Z"
}
```

### POST /api/test

Sample POST endpoint for testing

**Request Body:**

```json
{
  "name": "John Doe",
  "message": "Hello World"
}
```

**Response:**

```json
{
  "success": true,
  "message": "POST request received successfully",
  "data": {
    "name": "John Doe",
    "message": "Hello World",
    "receivedAt": "2026-02-15T10:30:00.000Z"
  }
}
```

## Testing the API

### Using curl:

**GET request:**

```bash
curl http://localhost:3000/
```

**POST request:**

```bash
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John\",\"message\":\"Hello\"}"
```

### Using PowerShell:

**GET request:**

```powershell
Invoke-RestMethod -Uri http://localhost:3000/ -Method Get
```

**POST request:**

```powershell
$body = @{
    name = "John"
    message = "Hello"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/test -Method Post -Body $body -ContentType "application/json"
```

## Environment Variables

| Variable | Description      | Default     |
| -------- | ---------------- | ----------- |
| PORT     | Server port      | 3000        |
| NODE_ENV | Environment mode | development |

## Next Steps

1. Add more routes in `src/index.js`
2. Create separate route files (e.g., `src/routes/`)
3. Add controllers for business logic
4. Add validation middleware
5. Integrate database if needed
6. Add authentication if needed

## License

ISC
