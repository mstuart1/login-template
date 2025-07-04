import { Link } from "react-router-dom"


const Unauthorized = () => {
  return (
    <div>Unauthorized
        <Link to="/publicHome">Login</Link>
    </div>
  )
}

export default Unauthorized