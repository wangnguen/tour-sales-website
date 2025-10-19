# Travel & Tour Web Application

A modern Node.js web application for travel agencies, supporting both admin and client interfaces. The system allows management of tours, news, users, cart, and payments, with a clean UI and robust backend.

## Main Features

### For Clients

- Browse, search, and filter tours by location, date, price, and more
- View detailed tour information, schedules, and promotions
- Add tours to cart and manage cart items
- Checkout and pay for tours via bank transfer (internet banking)
- Read travel news and articles in the news/blog section
- Contact form for customer support
- Responsive design with pagination and sorting

### For Admins

- Secure admin login and permission management
- Manage tours: add, edit, delete, set promotions, upload images
- Manage categories, cities, and website settings
- Manage news/articles: create, edit, delete, upload images, auto-generate slugs, author info
- Manage orders, customer contacts, and view cart details
- Dashboard with statistics and quick actions
- Pagination and search for all management lists

### Technical Stack

- Node.js, Express.js, MongoDB (Mongoose)
- Pug template engine for server-side rendering
- Multer for file uploads, Cloudinary for image storage
- Session, flash messages, and role-based access control
- RESTful routing, modular code structure
- Yarn for dependency management

## Getting Started

### Prerequisites

- Node.js >= 16
- MongoDB
- Yarn

### Installation

```bash
yarn install
```

### Configuration

- Copy `configs/database.example.js` to `configs/database.js` and update your MongoDB URI and credentials.
- Adjust other settings in `configs/variable.js` as needed.

### Running the Application

```bash
yarn start
```

- Client site: `http://localhost:3000`
- Admin dashboard: `http://localhost:3000/admin`

## Project Structure

- `controllers/` — Business logic for admin and client
- `models/` — Mongoose models
- `routes/` — Express routes for admin and client
- `views/` — Pug templates for all pages
- `public/` — Static assets (CSS, JS, images)
- `helpers/` — Utility functions (mail, cloudinary, etc.)
- `middlewares/` — Auth, validation, and other middleware
- `configs/` — Configuration files
