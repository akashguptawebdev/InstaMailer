
import './App.css'
import CreateNewTemplate from './component/CreateNewTemplate';
import NavBar from './component/NavBar';
import SendEmail from './component/SendEmail';
import HomePage from './pages/HomePage'
import { BrowserRouter as Router, Routes, Route, Link, Outlet } from 'react-router-dom';
import { BASEURL } from './utils';
import axios from 'axios';
function App() {
const callHomeApi = async () => {
  try {
    const res = await axios.get(BASEURL);
    console.log(res.data); 
  } catch (error) {
    console.error("API call error:", error.message);
  }
};

setInterval(() => {
  callHomeApi();
}, 40000);

  const Layout = () => {
  return (
    <>
      <NavBar />
      <div style={{ padding: '20px' }}>
        <Outlet />
      </div>
    </>
  );
};

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="send-email" element={<SendEmail />} />
          <Route path="create-template" element={<CreateNewTemplate />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
