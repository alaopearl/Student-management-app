import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-slate-700">404</h1>
        
        <div className="relative my-6">
          <div className="h-1 w-24 bg-blue-500 mx-auto"></div>
        </div>
        
        <h2 className="text-3xl font-semibold text-white mb-4">Page Not Found</h2>
        
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg 
                     font-medium transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          Back to Home
        </Link>
      </div>
      
      <p className="mt-16 text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} GiftCard Checker. All rights reserved.
      </p>
    </div>
  );
}