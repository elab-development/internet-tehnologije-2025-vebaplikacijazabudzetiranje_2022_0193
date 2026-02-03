'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/components/ui';

/**
 * Demo stranica za testiranje UI komponenti
 * Pristup: http://localhost:3000/components-demo
 */
export default function ComponentsDemoPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!email || !password) {
      setError('All fields are required');
    } else {
      setError('');
      alert(`Email: ${email}\nPassword: ${password}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            UI Components Demo
          </h1>
          <p className="text-gray-600">
            Testiranje reusable komponenti: Button, Input, Card
          </p>
        </div>

        {/* Button Component */}
        <Card title="Button Component" variant="elevated">
          <div className="space-y-6">
            {/* Variants */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Variants
              </h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Sizes</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">States</h4>
              <div className="flex flex-wrap gap-3">
                <Button isLoading>Loading...</Button>
                <Button disabled>Disabled</Button>
                <Button
                  leftIcon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  }
                >
                  With Icon
                </Button>
                <Button fullWidth>Full Width</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Input Component */}
        <Card title="Input Component" variant="elevated">
          <div className="space-y-6">
            {/* Basic Input */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Basic Input
              </h4>
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Input with Helper Text */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                With Helper Text
              </h4>
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="Must be at least 8 characters"
                required
              />
            </div>

            {/* Input with Error */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                With Error
              </h4>
              <Input
                label="Username"
                type="text"
                placeholder="Enter username"
                error="Username already taken"
              />
            </div>

            {/* Input with Icons */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                With Icons
              </h4>
              <Input
                label="Search"
                type="text"
                placeholder="Search..."
                leftIcon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
              />
            </div>

            {/* Submit Button */}
            <div>
              <Button onClick={handleSubmit} fullWidth>
                Submit Form
              </Button>
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Card Component */}
        <Card title="Card Component" variant="elevated">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Default Card */}
            <Card title="Default Card" subtitle="With subtitle">
              <p className="text-gray-600">
                This is a default card with title and subtitle.
              </p>
            </Card>

            {/* Bordered Card */}
            <Card
              title="Bordered Card"
              variant="bordered"
              headerActions={
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              }
            >
              <p className="text-gray-600">
                This card has a thicker border and header actions.
              </p>
            </Card>

            {/* Clickable Card */}
            <Card
              title="Clickable Card"
              subtitle="Click me!"
              clickable
              onClick={() => alert('Card clicked!')}
            >
              <p className="text-gray-600">
                This card is clickable and has hover effects.
              </p>
            </Card>

            {/* Card with Footer */}
            <Card
              title="Card with Footer"
              footer={
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">3 members</span>
                  <Button size="sm" variant="primary">
                    View Details
                  </Button>
                </div>
              }
            >
              <p className="text-gray-600">
                This card has a footer section with actions.
              </p>
            </Card>
          </div>
        </Card>

        {/* Real-world Example */}
        <Card
          title="Real-world Example"
          subtitle="Login Form"
          variant="elevated"
        >
          <div className="max-w-md mx-auto space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              }
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              helperText="At least 8 characters"
              leftIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
              required
            />
            <Button variant="primary" fullWidth>
              Sign In
            </Button>
            <Button variant="ghost" fullWidth>
              Forgot Password?
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}