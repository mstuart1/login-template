// inspired by https://www.positronx.io/react-file-upload-tutorial-with-node-express-and-multer/

import http from './http-common';


class MetricsDataService {

    getMetrics() {
        // console.log('contacting api to get metrics')
        return http.get(`/metrics`, {
            withCredentials: true
        });
    }

    postMetric(data: {}) {
        // console.log('contacting api to post metric', data)
        return http.post(`/metrics`, data, {
            withCredentials: true
        });
    }
   
}

export default new MetricsDataService();
