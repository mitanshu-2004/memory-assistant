import { Routes, Route } from "react-router-dom"
import { Layout } from "./components/layout/Layout"
import { Home } from "./pages/Home"
import { CreateMemory } from "./pages/CreateMemory"
import { Timeline } from "./pages/Timeline"
import { CategoryDetail } from "./pages/CategoryDetail"
import { Categories } from "./pages/Categories"
import { Upload } from "./pages/Upload"
import { Notification } from "./components/ui/Notification"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="create" element={<CreateMemory />} />
          <Route path="upload" element={<Upload />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="categories" element={<Categories />} />
          <Route path="category/:id" element={<CategoryDetail />} />
        </Route>
      </Routes>
      <Notification />
    </>
  )
}

export default App
