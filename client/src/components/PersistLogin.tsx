import { useEffect, useState } from 'react'
import useRefreshToken from '../utils/useRefreshToken';
import useAuth from '../utils/useAuth';
import { Outlet } from 'react-router-dom';

const PersistLogin = () => {

    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const {auth} = useAuth();

    console.log('PersistLogin auth:', auth);
    console.log('Access token does not exist:', !auth?.accessToken);

    useEffect(() => {
        const verifyRefreshToken = async () => {
            try {
                await refresh();
            } catch (error) {
                console.error('Error during token refresh:', error);
            } finally {
                setIsLoading(false);
            }
        }
        !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

    }, [])

    // todo production remove
    useEffect(() => {
        console.log('PersistLogin isLoading:', isLoading);
        console.log('PersistLogin aT:', JSON.stringify(auth?.accessToken));
    }, [isLoading]);

    return (
        <>
            {isLoading 
            ? <p>Loading...</p> // todo replace with a skeleton
            : <Outlet />
        }
        </>
    )
}

export default PersistLogin