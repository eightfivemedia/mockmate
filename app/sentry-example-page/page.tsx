'use client';

export default function SentryExamplePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Sentry Test Page</h1>
        <p className="text-muted-foreground">Click the button to send a test error to Sentry.</p>
        <button
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
          onClick={() => {
            throw new Error('Sentry test error from MockMate');
          }}
        >
          Trigger Test Error
        </button>
      </div>
    </div>
  );
}
