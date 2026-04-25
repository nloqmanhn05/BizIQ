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

Follow these steps to get the project running on your local machine:

### 1. Clone the Repository
Open your terminal and run:
```bash
git clone https://github.com/nloqmanhn05/BizIQ.git
cd BizIQ
```

### 2. Install Dependencies
This project has a root folder and a main application folder. You can install both at once using:
```bash
npm install
npm run install-all
```

### 3. Configure Environment Variables
1. Navigate into the `biziq` folder:
   ```bash
   cd biziq
   ```
2. Create a `.env` file (you can copy `.env.example`):
   ```bash
   cp .env.example .env
   ```
3. Open the `.env` file and add your API Key:
   ```env
   AI_API_KEY="YOUR API KEY"
   AI_MODEL="YOUR AI MODEL" # e.g., ilmu-glm-5.1
   FIREBASE : "YOUR GEMINI API KEY " 
   PORT=3000
   ```

### 4. Run the Application
From the root directory or the `biziq` directory, run:
```bash
npm run dev
```

The app will start at **http://localhost:3000**.

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
