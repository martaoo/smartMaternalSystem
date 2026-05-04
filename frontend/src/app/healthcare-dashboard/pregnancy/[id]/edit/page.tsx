'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Redirect /pregnancy/:id/edit → /pregnancy/:id
// The edit functionality is built into the detail page (click "Edit Visit" button)
export default function PregnancyEditRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/healthcare-dashboard/pregnancy/${params.id}`);
  }, [params.id, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Redirecting...</p>
      </div>
    </div>
  );
}
