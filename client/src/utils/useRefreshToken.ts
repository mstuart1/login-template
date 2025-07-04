import AuthDataService from "../services/auth"
import useAuth from "./useAuth"
import { useLocation, useNavigate } from "react-router-dom"

const useRefreshToken = () => {
  const { setAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation();

  
  const refresh = async () => {
    try {
      console.log("🔄 Attempting to refresh token...")
      const response = await AuthDataService.refreshToken()
      
      let { accessToken, userId, role, org } = response.data;
      console.log("🔄 Token refresh response:", response.data)
      if (!accessToken || !userId || !role || !org) {
        console.error('❌ Error: Missing accessToken, userId, role, or org in response data')
        throw new Error('Authentication failed: Missing required data')
      }     
      
      const newAuth = { role, accessToken, userId, org }
      setAuth((prev: any) => ({ ...prev, ...newAuth }))
      console.log("✅ Token refreshed successfully")
      
      return response.data.accessToken
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error)
      
      // Clear any existing auth state
      setAuth({})
      
      // Navigate to login page
      navigate('/login', { 
        replace: true,
        state: { 
          from: location,
          message: 'Your session has expired. Please log in again.' 
        }
      })
      
      // Re-throw the error for any calling code to handle
      throw error
    }
  }
  
  return refresh;
}

export default useRefreshToken