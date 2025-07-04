import { useNavigate } from "react-router-dom"
import { Button } from "../components/Button"


const PublicHome = () => {
  const navigate = useNavigate()  
  return (
    <div>PublicHome
      <Button
        onClick={() => {
          navigate("/login")
        }}
      >
        Login
      </Button>
    </div>
  )
}

export default PublicHome