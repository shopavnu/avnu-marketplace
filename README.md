# Avnu Marketplace

A modern, sustainable e-commerce marketplace focusing on eco-friendly and locally sourced products.

## 🌟 Features

- Modern, responsive UI built with Next.js and TailwindCSS
- Product search and filtering
- Sustainable product categorization
- Local vendor support
- Cause-based shopping
- Real-time product updates

## 🛠️ Tech Stack

### Frontend
- Next.js
- TypeScript
- TailwindCSS
- Framer Motion

### Backend
- Go
- Docker

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Go (v1.16 or higher)
- Docker and Docker Compose

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shopavnu/avnu-marketplace.git
cd avnu-marketplace
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Start the development environment:
```bash
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## 📁 Project Structure

```
avnu-marketplace/
├── frontend/           # Next.js frontend application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Next.js pages
│   │   ├── styles/     # Global styles
│   │   └── types/      # TypeScript types
│   └── public/         # Static assets
├── backend/            # Go backend service
│   ├── api/           # API endpoints
│   └── integrations/  # Third-party integrations
└── docker-compose.yml # Docker configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

