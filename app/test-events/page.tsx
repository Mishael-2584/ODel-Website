'use client';

import { useEffect, useState } from 'react';

export default function TestEventsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/events/published')
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Events Test</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
      
      {data?.data && data.data.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Events Found:</h2>
          <div className="space-y-2">
            {data.data.map((event: any) => (
              <div key={event.id} className="border p-4 rounded">
                <h3 className="font-bold">{event.title}</h3>
                <p>Start Date: {event.start_date}</p>
                <p>Type: {event.event_type}</p>
                <p>Location: {event.location}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

