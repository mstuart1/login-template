import { useEffect } from 'react';
import httpPrivate from '../services/http-private';
import useAuth from './useAuth';
import useRefreshToken from './useRefreshToken';

const useAxiosPrivate = () => {
  
    const refresh = useRefreshToken();
    const {auth} = useAuth();

    // the access token has a short expiration time, the refresh token has a longer expiration time

    useEffect(() => {
        const requestIntercept = httpPrivate.interceptors.request.use(
            config => {
                // not a retry, this is the initial request
                if (!config.headers['Authorization']) {
                    // set header on initial request
                    config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
                }
                // console.log('useAxiosPrivate request config', config);
                // config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
                return config;
            },
            error => Promise.reject(error)
        );

        const responseIntercept = httpPrivate.interceptors.response.use(
            response => response,
            async error => {
                const originalConfig = error.config;
                // todo make sure backend sends 403 if accessToken is expired
                if (error.response?.status === 403 && !originalConfig.sent) {
                    originalConfig.sent = true; // Prevent infinite loop
                    try {
                        const newAccessToken = await refresh();
                        originalConfig.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        // httpPrivate.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return httpPrivate(originalConfig);
                    } catch (refreshError) {
                        return Promise.reject(refreshError);
                    }
                }
                console.log('useAxiosPrivate response error', error.response.status, error.response.data.message);
                // if (error.response.status === 401 && !originalConfig._retry) {
                //     originalConfig._retry = true;
                //     const newAccessToken = await refresh();
                //     httpPrivate.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;
                //     return httpPrivate(originalConfig);
                // }
                return Promise.reject(error);
            }
        );

        // these will pile on if you don't clean them up
        return () => {
            httpPrivate.interceptors.request.eject(requestIntercept);
            httpPrivate.interceptors.response.eject(responseIntercept);
        };
    }, [auth, refresh]);

    return httpPrivate;

};

export default useAxiosPrivate;
