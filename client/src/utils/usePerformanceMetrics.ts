import { onLCP, onFCP, onINP, onCLS, onTTFB, Metric } from 'web-vitals';
import { useEffect } from 'react';
import MetricsDataService from '../services/metrics';

export function usePerformanceMetrics(userId?: string) {
    useEffect(() => {
        const handleMetric = async (metric: Metric) => {
            const payload = {
                name: metric.name,
                value: metric.value,
                delta: metric.delta,
                metricId: metric.id,
                timestamp: new Date().toISOString(),
                userId: userId || 'anonymous',
            };

            const response = await MetricsDataService.postMetric(payload);
            if (response.status !== 200) {
                console.error('Failed to send metric', response);
            }
        };

        onLCP(handleMetric);
        onFCP(handleMetric);
        onINP(handleMetric);
         onCLS(handleMetric);
    onTTFB(handleMetric); // TTFB must be measured early
    }, [userId]);
}
