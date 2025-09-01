# Memory Assistant

Memory Assistant is a program that helps you save and find your notes, links, and pictures. It has a website part for you to use and a server part that does the work.

## What it Does

*   **Group Your Notes:** Make different sections to keep your saved items organized.
*   **Save Different Things:** You can save text, pictures, and website links.
*   **See a Timeline:** Look at your saved items in the order you added them.
*   **Find Your Stuff:** A search bar helps you find any item you have saved.
*   **Smart Processing:** The server uses computer intelligence to understand the text you save.

## How It's Built

The project has two parts: the `frontend` (the website you see) and the `backend` (the server that handles data).

### Frontend

The website is built using current web technologies.

*   **Framework:** It uses [React](https://react.dev/) with [Vite](https://vitejs.dev/), which helps make development faster.
*   **Language:** It's written in [TypeScript](https://www.typescriptlang.org/), which helps prevent errors by checking types.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) is used for styling the website.
*   **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) is used to manage the application's data and state.
*   **Routing:** [React Router](https://reactrouter.com/) is used to move between different pages of the website.
*   **Icons:** [Lucide React](https://lucide.dev/guide/packages/lucide-react) is used for the icons you see on the site.

### Backend

The backend is a server program written in Python. It manages data and does the heavy lifting.

*   **Framework:** It uses [FastAPI](https://fastapi.tiangolo.com/) to build the API, which makes it run fast.
*   **Language:** It's written in [Python](https://www.python.org/).
*   **Database:** It uses [PostgreSQL](https://www.postgresql.org/) to store information.
*   **AI and Machine Learning:**
    *   `sentence-transformers`: This is used to turn your text into number lists (vectors) so the computer can understand what it means.
    *   `torch`: A library for machine learning tasks.
    *   `llama_cpp_python`: A tool that helps the program use certain language models.
*   **Vector Store:** It uses [ChromaDB](https://www.trychroma.com/) to store the number lists (vectors) from your text. This makes the search function able to find things based on meaning, not just exact words.

## How to Get Started

### Things You Need

*   [Node.js](https://nodejs.org/en) (version 18 or newer)
*   [Python](https://www.python.org/downloads/) (version 3.10 or newer)
*   [PostgreSQL](https://www.postgresql.org/download/)

### Installation

**Frontend:**

1.  Go to the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install the needed packages:
    ```bash
    npm install
    ```

**Backend:**

1.  Go to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Make a new virtual environment:
    ```bash
    python -m venv venv
    ```
3.  Activate the environment:
    *   On Windows:
        ```bash
        venv\Scripts\activate
        ```
    *   On macOS/Linux:
        ```bash
        source venv/bin/activate
        ```
4.  Install the needed packages:
    ```bash
    pip install -r requirements.txt
    ```

### Running the Application

**Frontend:**

1.  Go to the `frontend` folder.
2.  Start the development server:
    ```bash
    npm run dev
    ```
    The website will be running at `http://localhost:5173`.

**Backend:**

1.  Go to the `backend` folder.
2.  Start the server:
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will be running at `http://localhost:8000`.

## Project Folders

The project is split into two main folders: `frontend` and `backend`.

*   `frontend/`: Holds the React website code.
    *   `src/`: The main source code.
        *   `components/`: Parts of the website that can be reused.
        *   `pages/`: The different pages of the site.
        *   `services/`: Code for talking to the backend.
        *   `store/`: Code for managing the website's state.
*   `backend/`: Holds the FastAPI server code.
    *   `app/`: The main source code.
        *   `api/`: The API routes.
        *   `core/`: The main logic, including the AI parts.
        *   `database/`: Code for connecting to the database.
        *   `models/`: Defines the shape of the data.

## API Routes

The backend has several API routes for the frontend to use.

*   `POST /api/v1/memories/`: Add a new item.
*   `GET /api/v1/memories/`: Get a list of all items.
*   `GET /api/v1/memories/{memory_id}`: Get one specific item.
*   `POST /api/v1/categories/`: Add a new category.
*   `GET /api/v1/categories/`: Get a list of all categories.
*   `GET /api/v1/search/`: Search for items.