import { BrowserRouter, Route, Routes } from "react-router-dom"
import { WebsiteLayout } from "./layouts/WebsiteLayout"
import { Header } from "./components/websiteComponents/Header"
import "./App.css"
function App() {

  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<WebsiteLayout/>}>
            <Route index element={<Header/>}/>
          </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
