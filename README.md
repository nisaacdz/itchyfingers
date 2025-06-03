# ItchyFingers

A collaborative typing tournament web application.

## Features

- Real-time typing tournaments
- User authentication (JWT-based)
- Live participant updates
- Modern UI with React and TypeScript

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd itchyfingers
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```

### Environment Variables

Create a `.env` file in the root directory and set the following (adjust as needed):

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_SOCKET_BASE_URL=http://localhost:8000
```

### Running Locally

Start the development server:

```sh
npm run dev
# or
yarn dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

---

For backend setup and API documentation, see the backend repository.
