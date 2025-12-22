import { Signin } from "./components/auth/Signin";
import { Signup } from "./components/auth/Signup";
import { Navbar } from "./components/Navabr";
function App() {
  return (
    <>
      <Navbar />
      {/* <Signup /> */}
      <Signin />
    </>
  )
}

export default App
