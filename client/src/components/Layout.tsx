// import Header from './Header'
import { Outlet } from 'react-router-dom'
// import Footer from './Footer'
// import { usePerformanceMetrics } from '../utils/usePerformanceMetrics'



const Layout = () => {

  // usePerformanceMetrics();

    return (
      
        <main className={`bg-gray-100`}>
        {/* <Header/> */}
          <Outlet/>    
        {/* <Footer/> */}
        </main>
      
      )
}

export default Layout
