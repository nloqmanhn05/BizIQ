# BizIQ - AI-Powered Business Intelligence Dashboard

BizIQ is a premium, state-of-the-art business intelligence platform designed to help business owners transform raw data into actionable insights. Using advanced AI models (Gemini/OpenAI), BizIQ provides real-time chat assistance, financial simulations, and automated decision-making support.

## ✨ Key Features

- **📊 Advanced Dashboard**: Visualize your business health with high-fidelity charts and real-time KPIs (Revenue, Gross Margin, YoY Growth).
- **🤖 AI Business Assistant**: A streaming AI chat interface that understands your specific business context and provides expert advice.
- **📈 Financial Simulator**: Run "What If" scenarios to see how changes in pricing, COGS, or marketing spend affect your bottom line.
- **💡 Smart Decisions**: Automated analysis of your business data to identify anomalies and provide strategic recommendations.
- **📁 Universal Data Ingestion**: Drag and drop Excel (`.xlsx`) or CSV files for instant processing and analysis.
- **✨ Premium UI/UX**: Built with a "Modern Dark" aesthetic using Framer Motion for smooth transitions and Tailwind CSS for responsive design.

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion (Motion), Lucide React, Recharts.
- **Backend**: Node.js, Express, Multer (file handling).
- **AI Integration**: OpenAI SDK (compatible with Gemini API), Server-Sent Events (SSE) for streaming responses.
- **Data Processing**: XLSX, PapaParse, CSV-parse.
- **Development**: TSX for seamless TypeScript execution.

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- An API Key from Google AI Studio (Gemini) or OpenAI.

### Installation

1. **Clone the repository** (if applicable) or navigate to the project root.
2. **Install dependencies** for both the root and the application:
   ```bash
   npm run install-all
   ```

### Configuration

Create a `.env` file in the `biziq` directory (or copy from `.env.example`):

```env
GEMINI_API_KEY=your_api_key_here
AI_MODEL=gemini-1.5-flash # or gpt-4o-mini
PORT=3000
```

### Running the App

Start the development server (runs both backend and frontend via Vite middleware):

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## 📂 Project Structure

```text
UM Z.AI/
├── biziq/              # Main application directory
│   ├── src/            # React frontend source code
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Application screens (Chat, Dashboard, etc.)
│   │   └── lib/        # Logic, parsers, and engines
│   ├── server.ts       # Express server & AI integration
│   ├── uploads/        # Temporary storage for uploaded business data
│   └── vite.config.ts  # Vite configuration
├── package.json        # Root scripts to manage the project
└── README.md           # This documentation
```

## 📝 Scripts

- `npm run dev`: Starts the BizIQ development server.
- `npm run build`: Builds the frontend for production.
- `npm run start`: Runs the production server.
- `npm run install-all`: Installs dependencies in the `biziq` sub-folder.

---

Built with ❤️ by Antigravity AI
