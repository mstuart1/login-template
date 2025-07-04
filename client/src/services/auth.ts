// inspired by https://www.positronx.io/react-file-upload-tutorial-with-node-express-and-multer/

import http from './http-common';


class AuthDataService {


    loginUser(data: {}) {
        // console.log('contacting api to login')
        return http.post(`/authenticate/login`, data, {
            // withCredentials: true
        })
    }
    authenticateUser(data: { email: string, emailToken: string }) {
        console.log('contacting api to authenticate', data)
        return http.post(`/authenticate`, data, {
            withCredentials: true
        })
    }

    refreshToken(){
        console.log('contacting api to refresh token')
        return http.get(`/authenticate/refresh`, {
            withCredentials: true
        })
    }
}

export default new AuthDataService();
