'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

/**
 * API Documentation page
 * Displays Swagger UI with OpenAPI specification
 */
export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/swagger', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setSpec(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(`Failed to load API documentation: ${err.message}`);
        setIsLoading(false);
        console.error(err);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-primary-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">SplitBill API Documentation</h1>
          <p className="text-primary-100">
            REST API documentation for SplitBill - Expense Sharing Application
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <a
              href="/"
              className="text-white hover:text-primary-100 underline"
            >
              ← Back to App
            </a>
            <a
              href="/api/swagger"
              className="text-white hover:text-primary-100 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download OpenAPI JSON
            </a>
          </div>
        </div>
      </header>

      {/* Swagger UI */}
      <div className="max-w-7xl mx-auto">
        {spec && <SwaggerUI spec={spec} />}
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-600">
          <p>
            Built with{' '}
            <a
              href="https://swagger.io/"
              className="text-primary-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Swagger UI
            </a>{' '}
            and{' '}
            <a
              href="https://nextjs.org/"
              className="text-primary-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
