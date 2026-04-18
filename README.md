# 🚀 AppIdea Blueprint

AppIdea Blueprint is a premium, AI-powered platform designed to help entrepreneurs and developers transform vague concepts into actionable application blueprints. Using Google's Gemini AI, it generates tailored app ideas complete with feature sets, tool recommendations, and detailed cost estimates (Setup vs. Monthly).

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

### **Backend**
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **AI Engine:** [Google Gemini API](https://ai.google.dev/)
- **Data Validation:** Pydantic

---

## ⚙️ Local Setup & Execution

Follow these steps to get the project running on your local machine.

### **1. Navigate to the Project**
Open your terminal (Command Prompt, PowerShell, or Terminal) and enter the project folder:
```bash
cd "c:\college\projects\ai idea generator\appidea-blueprint"
```

### **2. Backend Setup**
The backend handles the AI logic and cost estimations.
1. Enter the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure Environment:
   - Create a `.env` file in the `backend` folder.
   - Add your Gemini API Key: `GOOGLE_API_KEY=your_key_here`
4. Start the server:
   ```bash
   python -m uvicorn main:app --reload
   ```
   *The API will be available at `http://localhost:8000`*

### **3. Frontend Setup**
The frontend provides the interactive user interface.
1. Open a **new terminal window** and navigate to the project root:
   ```bash
   cd "c:\college\projects\ai idea generator\appidea-blueprint"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:3000`*

---

## 📁 Folder Structure

| Folder/File | Purpose |
| :--- | :--- |
| `app/` | Contains the Next.js App Router pages and global layout styling. |
| `components/` | Reusable UI elements (e.g., `BlueprintCard`, `IdeaDetailPanel`, `FilterForm`). |
| `backend/` | Python FastAPI application containing AI prompts and logic. |
| `backend/main.py` | The entry point for the FastAPI server and route definitions. |
| `backend/gemini.py` | Integration with Google Gemini for idea generation and chat. |
| `lib/` | Shared utility functions and configuration constants. |
| `public/` | Static assets like images and fonts. |
| `.env.local` | Frontend environment variables (e.g., API URLs). |

---

## ✨ Features Inside the App

1.  **Smart Generator**: Input your niche, budget, and target platform to receive 3 distinct, high-quality app ideas.
2.  **Cost Blueprinting**: Every idea includes a breakdown of "Path A" (Lean/Bootstrap) and "Path B" (Professional/Scale) with setup and monthly costs.
3.  **Interactive AI Chat**: Click on any idea to open a dedicated chat pane. Ask specific questions about implementation, tech stack, or marketing for that specific idea.
4.  **Premium UI**: A sleek, modern dashboard with responsive layouts and smooth transitions.

---

## 📦 Requirements to Install

- **Node.js**: Version 20 or higher.
- **Python**: Version 3.10 or higher.
- **npm**: Included with Node.js.
- **pip**: Included with Python.
- **Google Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/).
