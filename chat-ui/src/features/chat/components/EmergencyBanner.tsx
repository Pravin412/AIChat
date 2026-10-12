import { TriangleAlert } from 'lucide-react';

export function EmergencyBanner() {
  return (
    <div role="alert" className="emergency-banner">
      <TriangleAlert size={22} aria-hidden="true" />
      <div>
        <strong>Seek emergency help now</strong>
        <p>
          Contact your local emergency services. Do not wait for the assistant.
        </p>
      </div>
    </div>
  );
}
